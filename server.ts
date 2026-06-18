import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Set up CORS manually so it accepts traffic cleanly
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Lazy initialization of Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("AI Warning: GEMINI_API_KEY is not defined in environments. AI responses will fail.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for content rephrasing
app.post("/api/rephrase", async (req, res) => {
  try {
    const { text, mode, length } = req.body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "Tamil text input is required and must be a non-empty string." });
    }

    const selectedMode = mode || "formal";
    const selectedLength = length || "same";

    const ai = getGeminiClient();

    const systemInstruction = `
You are MozhiMaatram AI, an expert Tamil linguist and content editor. Your job is to correct spelling, grammar, convert Tanglish (Tamil words written in English letters, like "eppadi irukeenga", "sapaadu saptacha", "romba nandri") to proper Tamil script, and then rephrase/style the Tamil text according to the selected style mode and length.

Style Modes description:
- 'formal': Standard, respectful, grammatically formal Tamil (e.g., using respectful endings like 'நன்றாக இருக்கிறீர்களா', 'செய்து தாருங்கள்').
- 'simple': Plain, everyday easy conversational Tamil that is highly readable.
- 'professional': corporate, business-polite, elegant corporate/technical Tamil.
- 'academic': Literary Tamil, using scholarly terms, compound sandhi rules, and rich vocabulary.
- 'creative': Poetic, descriptive, dynamic, and imaginative Tamil.
- 'social_media': Engage-optimized casual Tamil, warm, current style, conversational.
- 'news_style': Crisp, reporter-like, objective journalistic news reporting prose.

Length Modulations description:
- 'shorten': Summarize or compact the sentence structure without changing core intent.
- 'expand': Elaborate the text, incorporating polite elements or additional descriptive phrases.
- 'same': Maintain practically the same word count as the original translated Tamil script.

Linguistic checks:
1. Watch out for phonological and orthographical differences common in Tamil, such as:
   - Retroflex vs alveolar sounds (ல / ள / ழ)
   - Trill vs flap (ர / ற)
   - Dental, alveolar, retroflex nasals (ந / ன / ண)
   Ensure proper usage based on meaning.
2. In the 'explanations' array, generate a useful step-by-step breakdown of word substitutions, spelling fixes, sandhi corrections, or Tanglish script conversions. Explain clearly in both Tamil and plain English.
3. Classify readability score: 'Easy' (Simple conversational), 'Medium' (Standard school level), or 'Advanced' (High-literary/sophisticated vocabulary).
4. Provide a confidence score (from 0 to 100) representing how grammatically and stylistically accurate your output is.
`;

    const generateParams = (modelName: string) => ({
      model: modelName,
      contents: `Original Text to analyse & rephrase: "${text}"\nMode: "${selectedMode}"\nLength requirement: "${selectedLength}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rephrased_text: {
              type: Type.STRING,
              description: "The fully corrected and elegant rephrased Tamil text, respecting the chosen styling mode and length requirement."
            },
            readability_score: {
              type: Type.STRING,
              description: "Level of text difficulty. Must be one of: 'Easy' (எளிதானது), 'Medium' (நடுத்தரமானது), or 'Advanced' (உயர்தரமானது)."
            },
            confidence_score: {
              type: Type.INTEGER,
              description: "Linguistic and stylistic confidence score between 0 and 100 representing certainty."
            },
            explanations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: {
                    type: Type.STRING,
                    description: "The original typo, Roman script (Tanglish), or word segment targeted for replacement."
                  },
                  replaced_with: {
                    type: Type.STRING,
                    description: "The corrected, polished Tamil word or phrase translation."
                  },
                  reason: {
                    type: Type.STRING,
                    description: "The explanation statement (in English and Tamil description context) clarifying why this change occurred."
                  }
                },
                required: ["original", "replaced_with", "reason"]
              },
              description: "Tabular overview list documenting all spelling corrections, Tanglish translations, stylistic replacements, etc."
            }
          },
          required: ["rephrased_text", "readability_score", "confidence_score", "explanations"]
        }
      }
    });

    let response;
    let fallbackUsed = false;
    
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-1.5-flash"
    ];

    let lastError: any = null;
    for (let i = 0; i < modelsToTry.length; i++) {
      const currentModelName = modelsToTry[i];
      try {
        console.log(`[Attempt ${i + 1}/${modelsToTry.length}] Calling Gemini API with model: ${currentModelName}`);
        response = await ai.models.generateContent(generateParams(currentModelName));
        if (response && response.text) {
          console.log(`Successfully generated content using: ${currentModelName}`);
          fallbackUsed = i > 0;
          break;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err.message || err.toString();
        console.warn(`Model ${currentModelName} invocation failed: ${errMsg}`);
        
        if (i < modelsToTry.length - 1) {
          const delay = 1500;
          console.log(`Waiting ${delay}ms before trying fallback model: ${modelsToTry[i + 1]}`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (!response) {
      throw lastError || new Error("All candidate Gemini models failed to generate content.");
    }

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini.");
    }

    const data = JSON.parse(responseText.trim());
    return res.json(data);
  } catch (err: any) {
    console.error("AI Rephrase Error: ", err);
    return res.status(500).json({
      error: "நேர்ந்த பிழை: rephrase request failed",
      details: err.message || err.toString()
    });
  }
});

// Configure Vite or Static server
async function handleServerLaunch() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MozhiMaatram AI Backend & Frontend dev server streaming on http://localhost:${PORT}`);
  });
}

handleServerLaunch().catch((err) => {
  console.error("Critical server launch error:", err);
});

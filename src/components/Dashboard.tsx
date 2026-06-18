import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Layout,
  RefreshCw,
  Sun,
  Moon,
  TrendingUp,
  Sliders,
  Award,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { StyleMode, LengthModulation, RephraseResponse } from "../types";
import { ComparisonView } from "./ComparisonView";
import { Explanations } from "./Explanations";

const PRESET_EXAMPLES = [
  {
    label: "டங்கிலிஷ் மாற்றம் / Tanglish input",
    text: "hi bro epdi irukinga? romba nalaachu namma pesி. nalaiki work mudinjadhum call panrenga, thanks!",
    desc: "Mixed English-Tamil Roman characters to Tamil script translation.",
  },
  {
    label: "இலக்கணப்பிழை / Spelling Errors",
    text: "எனக்கு ஒடம்பு சாறி இல்ல, அதனால நாளைக்கு லீவு வேணும்னு மேனேஜர்ட கேக்க போறேன்.",
    desc: "Corrects spelling ('ஒடம்பு' ➔ 'உடம்பு') and converts colloquial to polished Tamil.",
  },
  {
    label: "அலுவலக நடை / Simple Text to Formal",
    text: "நேத்து ஒரு போன் வாங்கினேன். அது நல்லா இல்ல. காசு திரும்ப தர முடியுமா?",
    desc: "Direct conversational phrasing suitable for upgrading to higher style registers.",
  }
];

export const Dashboard: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [selectedMode, setSelectedMode] = useState<StyleMode>("formal");
  const [selectedLength, setSelectedLength] = useState<LengthModulation>("same");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RephraseResponse | null>(null);

  // Theme support (light / dark)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Web Speech API states
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Set up theme on load and observe change class
  useEffect(() => {
    // Sync theme with document element
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Instantiating Web Speech API Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "ta-IN"; // Target Tamil (India)

        rec.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          if (transcript) {
            setInputText((prev) => (prev ? prev + " " + transcript : transcript));
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech Recognition Error", event);
          setSpeechError(`பிழை: ${event.error || "குரல் பதிவு செய்யப்படவில்லை"}`);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      setSpeechError("Speech recognition is not fully supported on this browser browser. Try Chrome.");
      return;
    }

    setSpeechError(null);
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        console.error("Speech start error:", err);
        setIsListening(false);
      }
    }
  };

  // Web Speech Text-to-Speech
  const handleTtsPlayback = (textToSpeak: string, isPlaying: boolean) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("Speech synthesis is not supported on this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsTtsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Clears trailing audio queues

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "ta-IN"; // Tamil India

    // Find custom Tamil voice if possible
    const voices = window.speechSynthesis.getVoices();
    const tamilVoice = voices.find((v) => v.lang.startsWith("ta"));
    if (tamilVoice) {
      utterance.voice = tamilVoice;
    }

    utterance.onend = () => {
      setIsTtsPlaying(false);
    };

    utterance.onerror = (err) => {
      console.error("TTS playback issue:", err);
      setIsTtsPlaying(false);
    };

    setIsTtsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleRephraseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setError("மறுவடிவமைக்க வேண்டிய உரையை முதலில் உள்ளிடவும்! / Enter Tamil text to rephrase first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    // Cancel any running TTS
    if (isTtsPlaying) {
      window.speechSynthesis.cancel();
      setIsTtsPlaying(false);
    }

    try {
      const response = await fetch("/api/rephrase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          mode: selectedMode,
          length: selectedLength,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err: any) {
      console.error("Failed to rephrase text:", err);
      setError(
        err.message ||
          "AI மறுவடிவமைப்பதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stylesConfig = [
    {
      id: "formal" as StyleMode,
      tamil: "முறையான நடை",
      english: "Formal",
      desc: "இலக்கணப்படியான, மரியாதையான அலுவலக மொழி.",
      color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
    },
    {
      id: "simple" as StyleMode,
      tamil: "எளிமையான நடை",
      english: "Simple",
      desc: "யாவரும் எளிதில் புரிந்து கொள்ளும் எளிய தமிழ்.",
      color: "border-blue-500/30 text-blue-400 bg-blue-500/5"
    },
    {
      id: "professional" as StyleMode,
      tamil: "தொழில்முறை நடை",
      english: "Professional",
      desc: "வணிக அல்லது தொழில்நுட்ப தகவல்தொடர்புகளுக்கு ஏற்றது.",
      color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/5"
    },
    {
      id: "academic" as StyleMode,
      tamil: "கல்வித்துறை நடை",
      english: "Academic",
      desc: "உயர்தர கலைச்சொற்கள் அடங்கிய இலக்கியத் தமிழ்.",
      color: "border-purple-500/30 text-purple-400 bg-purple-500/5"
    },
    {
      id: "creative" as StyleMode,
      tamil: "கற்பனை நடை",
      english: "Creative",
      desc: "வர்ணனைகள், கதைகள், உவமைகளுடன் கூடிய கலை நடை.",
      color: "border-pink-500/30 text-pink-400 bg-pink-500/5"
    },
    {
      id: "social_media" as StyleMode,
      tamil: "சமூக ஊடக நடை",
      english: "Social Media",
      desc: "கலகலப்பான, ட்ரெண்டியான, ஈர்க்கக்கூடிய நடை.",
      color: "border-amber-500/30 text-amber-400 bg-amber-500/5"
    },
    {
      id: "news_style" as StyleMode,
      tamil: "செய்தி ஊடக நடை",
      english: "News Style",
      desc: "சுருக்கமான, நடுநிலையான, நேரடியான செய்தி நடை.",
      color: "border-rose-500/30 text-rose-400 bg-rose-500/5"
    },
  ];

  const lengthsConfig = [
    { id: "shorten" as LengthModulation, label: "சுருக்குக", english: "Shorten" },
    { id: "same" as LengthModulation, label: "அதே அளவு", english: "Keep Same" },
    { id: "expand" as LengthModulation, label: "விரிவாக்குக", english: "Expand" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] select-none font-sans pb-16">
      {/* Top Banner / Navigation */}
      <header id="app-nav" className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-[#1A1A1A] backdrop-blur/85 transition-colors duration-150">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/10">M</div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                MozhiMaatram <span className="text-emerald-500 font-light">AI</span>
                <span className="text-[10px] sm:text-xs font-normal text-[#10B981] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-sans">
                  தமிழ் உரை மாற்றி
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-[#888] mt-0.5">
                Spelling correction, Tanglish-to-Tamil conversion, and Stylistic Rephrasing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#151515] rounded-full border border-[#222]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#888]">gemini-2.5-flash Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8 select-text">
        {/* Intro Banner */}
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
              தமிழ் உள்ளடக்க மறுவடிவமைப்பு / Intelligent Tamil Content Rephraser
            </h2>
            <p className="text-xs text-[#999] mt-1.5 leading-relaxed">
              எங்கள் <strong>MozhiMaatram AI</strong> உங்களை டங்கிலிஷ் எழுத்துக்களைத் தமிழ் மொழி வடிவாக மாற்றவும், சொற்பிழை மற்றும் இலக்கணப்பிழைகளைக் களையவும், வெவ்வேறு 7 வகையான பேச்சு மற்றும் எழுத்து நடைகளில் மாற்றி அமைக்கவும் அனுமதிக்கிறது.
            </p>
          </div>
          <div className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1.5 rounded font-mono uppercase tracking-wider whitespace-nowrap">
            Linguistic Processing Active
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (left/full) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleRephraseSubmit} className="bg-[#0A0A0A] p-6 rounded-xl border border-[#1A1A1A] shadow-sm space-y-5">
              
              {/* Input section Header and Speech controls */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#888] uppercase tracking-wider block">
                  உங்கள் உரை அல்லது டங்கிலிஷ் உரை / Input Tamil or Tanglish text
                </label>
                
                <button
                  type="button"
                  id="mic-record-btn"
                  onClick={handleVoiceInput}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-[#151515] border border-[#222] text-[#888] hover:text-white"
                  }`}
                  title={isListening ? "குரல் பதிவை நிறுத்து / Stop voice" : "குரல் வழி பதிவுசெய் / Speak in Tamil"}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>பதிவாகிறது... / Listening...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-emerald-500" />
                      <span>பேசிப் பதிவு செய்க / Voice Input</span>
                    </>
                  )}
                </button>
              </div>

              {/* Text Input Block */}
              <div className="relative">
                <textarea
                  id="input-text-area"
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="உதாரணம்: sapaadu saptia? nalaiki park va... அல்லது தமிழ் எழுத்துப் பிழைகளுடன் உள்ள உரை"
                  className="w-full bg-[#111] hover:bg-[#151515] border border-[#222] focus:border-emerald-500 text-white rounded-xl p-5 text-base font-sans placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all duration-150 resize-y leading-relaxed"
                />
                
                {inputText && (
                  <button
                    type="button"
                    onClick={() => setInputText("")}
                    className="absolute top-4 right-4 text-xs text-neutral-500 hover:text-white transition-colors"
                  >
                    அழி / Clear
                  </button>
                )}
              </div>

              {speechError && (
                <div className="flex items-start gap-2 bg-red-955/15 text-red-400 p-3 rounded-lg border border-red-900/40 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{speechError}</span>
                </div>
              )}

              {/* Presets and Samples */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#555] uppercase tracking-wider block">
                  பயிற்சி செய்யத் தேர்ந்தெடுங்கள் / Sample Presets (Click to Load):
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_EXAMPLES.map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInputText(ex.text);
                        setSpeechError(null);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-left bg-[#151515] border border-[#222] hover:border-emerald-500/40 text-[#ccc] hover:bg-[#1C1C1C] transition-all duration-150 cursor-pointer max-w-full truncate block"
                      title={ex.desc}
                    >
                      💡 <span className="font-semibold text-white">{ex.label.split('/')[0]}</span> <span className="text-neutral-500 text-[11px] font-normal">{ex.label.includes('/') ? '/' + ex.label.split('/')[1] : ''}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Selections */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-[#888] block">
                  உரையின் அளவு / Length modulation:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {lengthsConfig.map((len) => (
                    <button
                      key={len.id}
                      type="button"
                      onClick={() => setSelectedLength(len.id)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all duration-150 cursor-pointer ${
                        selectedLength === len.id
                          ? "bg-emerald-600 border-emerald-600 text-black font-semibold"
                          : "bg-[#151515] border border-[#222] hover:border-[#333] text-[#ccc]"
                      }`}
                    >
                      {len.label} <span className="text-[10px] opacity-75 font-normal ml-0.5">({len.english})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Styling Modes Grid (7 Modes) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#888] block">
                    உரை நடையினைத் தேர்வு செய்க / Choose style mode (7 options):
                  </span>
                  <Sliders className="w-3.5 h-3.5 text-neutral-500" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {stylesConfig.map((style) => {
                    const isSelected = selectedMode === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedMode(style.id)}
                        className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer group ${
                          isSelected
                            ? `${style.color} border-2 border-emerald-500 ring-2 ring-emerald-500/15`
                            : "border-[#222] hover:border-[#333] bg-[#111]"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-[#ccc]"}`}>
                            {style.tamil}
                          </span>
                          <span className="text-[9px] text-[#666] uppercase font-mono tracking-wider">
                            {style.english}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#888] mt-1 leading-normal">
                          {style.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rephrase Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="submit-rephrase-btn"
                  disabled={isLoading || !inputText.trim()}
                  className={`w-full py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-150 shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                    isLoading
                      ? "bg-[#1A1A1A] text-[#444] border border-[#222] cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-black hover:shadow-lg hover:shadow-emerald-500/5"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                      <span>உரை மாற்றியமைக்கப்படுகிறது... / Analyzing & Rephrasing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>உரையை மாற்றியமை / REPHRASE CONTENT</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2.5 bg-red-955/15 text-red-400 p-4 rounded-xl border border-red-900/40 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">நெருக்கடி: </span>
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: AI Metrics Panel and Help Tips */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Conditional Result Metrics Dashboard */}
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="metrics-dashboard"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#0A0A0A] p-6 rounded-xl border border-[#1A1A1A] shadow-sm space-y-6"
                >
                  <h3 className="text-xs font-bold text-[#555] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#1A1A1A] pb-3">
                    <Layout className="w-3.5 h-3.5" />
                    AI மொழியியல் குறியீடுகள் / AI Metrics Dashboard
                  </h3>

                  {/* Meter Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Gauge 1: Confidence Score */}
                    <div className="bg-[#111] p-4 rounded-xl border border-[#1A1A1A] text-center flex flex-col items-center justify-center">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        {/* Circular ring indicator */}
                        <svg className="absolute w-full h-full transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            className="stroke-[#222]"
                            strokeWidth="4"
                            fill="transparent"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            className="stroke-emerald-500"
                            strokeWidth="4.5"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 28}
                            strokeDashoffset={2 * Math.PI * 28 * (1 - result.confidence_score / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-sm font-bold text-white">
                          {result.confidence_score}%
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#ccc] mt-3 block">
                        நம்பிக்கை குறியீடு
                      </span>
                      <span className="text-[9px] text-[#555] font-mono tracking-wide">
                        Confidence Score
                      </span>
                    </div>

                    {/* Gauge 2: Readability Badge */}
                    <div className="bg-[#111] p-4 rounded-xl border border-[#1A1A1A] text-center flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                        {result.readability_score === "Easy" ? "எளிது" : result.readability_score === "Medium" ? "நடுத்தரம்" : "உயர்தரம்"}
                      </div>
                      <span className="text-[11px] font-semibold text-[#ccc] mt-3 block">
                        வாசிப்புத் தரம்: {result.readability_score}
                      </span>
                      <span className="text-[9px] text-[#555] font-mono tracking-wide">
                        Readability Index
                      </span>
                    </div>

                  </div>

                  {/* Micro Info bar */}
                  <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-[#888] leading-relaxed flex gap-2">
                    <TrendingUp className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span>
                      டங்கிலிஷ் உரையை அசல் தமிழிற்குத் திருத்தப்பட்ட வரியடைவுகளில் மாற்றுவதுடன், உங்கள் சொற்பிழைகளையும் மாற்றி அமைத்துள்ளது தமிழ்AI.
                    </span>
                  </div>

                </motion.div>
              ) : (
                <motion.div
                  key="no-analysis"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[#0A0A0A]/30 border border-dashed border-[#222] p-6 rounded-xl flex flex-col items-center justify-center text-center text-neutral-500 py-12"
                >
                  <Award className="w-10 h-10 text-[#222] mb-3" />
                  <span className="text-xs font-semibold text-[#555]">
                    மொழியியல் குறியீடு பகுப்பு / Dashboard Metrics
                  </span>
                  <p className="text-[11px] text-[#444] mt-1.5 max-w-[280px]">
                    உரையை மாற்றியமைத்தவுடன், AI-இன் வாசிப்புத்தகு மற்றும் நம்பிக்கை மதிப்பெண்கள் இங்கு காட்டப்படும்.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tamil Linguistic Helper Info Block */}
            <div className="bg-[#0A0A0A] p-6 rounded-xl border border-[#1A1A1A] shadow-sm space-y-4">
              <span className="text-xs font-bold text-[#888] uppercase tracking-wider flex items-center gap-2 border-b border-[#1A1A1A] pb-3">
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                விளக்கம் & பயன்பாடு / Help Guide
              </span>
              
              <ul className="space-y-3.5 text-xs text-[#999] leading-relaxed list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 font-bold select-none">▶</span>
                  <span>
                    <strong>டங்கிலிஷ் மாற்றம் (Tanglish Converter):</strong> "epdi iruka" அல்லது "work mudinjidha" என ஆங்கில எழுத்துக்களில் உள்ளீடாகக் கொடுப்பினும் அசல் தமிழ் எழுத்துக்களாக மாற்றப்பெறும்.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 font-bold select-none">▶</span>
                  <span>
                    <strong>7 பாணிகள் (7 Styles):</strong> பள்ளி வினாக்கள், அலுவலக ஈமெயில், நண்பர்களின் ட்விட்டர் சாட்டிங் என அனைத்து தேவைகளுக்கும் ஏற்றவாறு உரையைத் தேர்ந்தெடுக்கலாம்.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 font-bold select-none">▶</span>
                  <span>
                    <strong>குரல் வழி உள்ளீடு (Live Dictation):</strong> மைக் பொத்தானை அமுக்கி தமிழில் நேரடியாகப் பேசி எழுதலாம்.
                  </span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Output Results Compartments */}
        <AnimatePresence>
          {result && (
            <motion.div
              id="results-wrapper"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-8 pt-4 border-t border-[#1A1A1A]"
            >
              {/* Comparative Split Text Box */}
              <ComparisonView
                originalText={inputText}
                rephrasedText={result.rephrased_text}
                onTtsPlay={handleTtsPlayback}
                isTtsPlaying={isTtsPlaying}
              />

              {/* Explainable AI Linguistic table */}
              <Explanations explanations={result.explanations} />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="pt-8 text-center text-[10px] text-[#444] font-medium flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1A1A1A] select-none font-mono">
          <div className="flex gap-6">
            <span>SYSTEM: v1.0.4-STABLE</span>
            <span>REGION: ta-IN</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white transition-colors uppercase tracking-widest cursor-default">Documentation</span>
            <span className="hover:text-white transition-colors uppercase tracking-widest cursor-default">Privacy</span>
            <span className="hover:text-white transition-colors uppercase tracking-widest cursor-default">© 2026 MOZHIMAATRAM</span>
          </div>
        </footer>

      </main>
    </div>
  );
};

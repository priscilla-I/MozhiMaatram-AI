import React, { useState } from "react";
import { Copy, Check, Volume2, VolumeX, FileText, Sparkles, RefreshCw } from "lucide-react";

interface ComparisonViewProps {
  originalText: string;
  rephrasedText: string;
  onTtsPlay: (text: string, isPlaying: boolean) => void;
  isTtsPlaying: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  originalText,
  rephrasedText,
  onTtsPlay,
  isTtsPlaying,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rephrasedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const getWordCount = (text: string) => {
    return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  };

  const getCharCount = (text: string) => {
    return text ? text.length : 0;
  };

  const origWordCount = getWordCount(originalText);
  const rephrWordCount = getWordCount(rephrasedText);
  const origCharCount = getCharCount(originalText);
  const rephrCharCount = getCharCount(rephrasedText);

  // Simple script detection helper
  const containsEnglish = /[a-zA-Z]/.test(originalText);

  return (
    <div id="comparison-section" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0A0A0A] p-4 rounded-xl border border-[#1A1A1A]">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
            மறுவடிவமைப்பின் முடிவுகள் / Rephrase Results
          </h2>
          <p className="text-xs text-[#888] mt-1">
            இரு பகுதி ஒப்பீடு மற்றும் ஒலி வடிவமைப்பு / Side-by-side comparative analysis of the output.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {rephrasedText && (
            <>
              <button
                type="button"
                id="btn-tts"
                title={isTtsPlaying ? "நிறுத்து / Stop" : "ஒலிவடிவம் கொடு / Play"}
                onClick={() => onTtsPlay(rephrasedText, isTtsPlaying)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-205 ${
                  isTtsPlaying
                    ? "bg-red-600 hover:bg-red-550 text-white shadow-sm animate-pulse"
                    : "bg-[#151515] hover:bg-[#1C1C1C] text-emerald-400 border border-[#222] hover:border-emerald-500/20"
                }`}
              >
                {isTtsPlaying ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 animate-bounce" />
                    <span>நிறுத்து / Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>ஒலிவடிவம் / Read aloud</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-copy"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold cursor-pointer transition-all duration-150 shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>நகலெடுக்கப்பட்டது / Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>நகலெடு / Copy</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left pane: Original Text */}
        <div className="flex flex-col rounded-xl border border-[#1A1A1A] overflow-hidden bg-[#0A0A0A] shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 bg-[#0F0F0F] border-b border-[#1A1A1A]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-semibold text-[#888]">
                அசல் உரை / Original Content
              </span>
            </div>
            {containsEnglish && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Tanglish Detected
              </span>
            )}
          </div>

          <div className="p-5 flex-1 min-h-[220px] max-h-[350px] overflow-y-auto text-sm text-[#ccc] leading-relaxed font-sans whitespace-pre-wrap">
            {originalText ? (
              originalText
            ) : (
              <span className="text-neutral-600 italic">
                உள்ளீட்டு உரை இங்கு தோன்றும்... / Original input text will appear here.
              </span>
            )}
          </div>

          <div className="px-5 py-2.5 bg-[#0F0F0F] border-t border-[#1A1A1A] flex justify-between text-[11px] text-[#666] font-mono">
            <span>வார்த்தைகள்: {origWordCount}</span>
            <span>எழுத்துக்கள்: {origCharCount}</span>
          </div>
        </div>

        {/* Right pane: Rephrased output */}
        <div className="flex flex-col rounded-xl border border-emerald-500/30 overflow-hidden bg-[#0A0A0A] shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/5 border-b border-emerald-500/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-400">
                மறுபதிப்பு உரை / Rephrased AI Output
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
              Proper Tamil
            </span>
          </div>

          <div className="p-5 flex-1 min-h-[220px] max-h-[350px] overflow-y-auto text-base text-white font-sans leading-relaxed whitespace-pre-wrap select-text">
            {rephrasedText ? (
              rephrasedText
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <p className="text-neutral-600 italic text-sm">
                  மறுவடிவமைக்கப்பட்ட உரை இங்கு வரும். / AI rephrased output is generated on click.
                </p>
              </div>
            )}
          </div>

          <div className="px-5 py-2.5 bg-[#0F0F0F] border-t border-[#1A1A1A] flex justify-between text-[11px] text-[#666] font-mono">
            <span>வார்த்தைகள்: {rephrWordCount}</span>
            <span>எழுத்துக்கள்: {rephrCharCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

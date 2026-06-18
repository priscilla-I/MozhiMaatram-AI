import React from "react";
import { ExplanationItem } from "../types";
import { Info, HelpCircle, FileCheck, HelpCircle as HelpIcon } from "lucide-react";

interface ExplanationsProps {
  explanations: ExplanationItem[];
}

export const Explanations: React.FC<ExplanationsProps> = ({ explanations }) => {
  return (
    <div id="explanations-section" className="bg-[#0A0A0A] rounded-xl border border-[#1A1A1A] p-6 shadow-sm transition-all duration-205">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-500" />
            விளக்க உரை மற்றும் பகுப்பாய்வு / Linguistic Explanations (XAI)
          </h2>
          <p className="text-xs text-[#888] mt-1">
            சொற்பிறப்பியல் திருத்தங்கள் மற்றும் நடைத் தேர்வுகளுக்கான நியாயமான விளக்கம்.
          </p>
        </div>
        <div className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-100 border border-emerald-500/20 font-mono uppercase tracking-wider">
          Explainable AI Integration
        </div>
      </div>

      {!explanations || explanations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-[#111]/30 rounded-xl border border-dashed border-[#222] text-center">
          <FileCheck className="w-8 h-8 text-neutral-800 mb-2" />
          <p className="text-xs text-[#888] font-medium">
            இங்கு விளக்கங்கள் எதுவும் இல்லை. புதிய உரையை மறுவடிவமைப்பதன் மூலம் உங்கள் மாற்றங்களின் பகுப்பாய்வுகளை அறியலாம்.
          </p>
          <p className="text-[11px] text-neutral-600 mt-1">
            No transformations/corrections documented for this request yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#1A1A1A]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0F0F0F] border-b border-[#1A1A1A] text-[11px] font-semibold tracking-wider text-[#888] uppercase select-none">
                  <th className="py-3 px-4 w-1/3">அசல் வார்த்தை / Original Segment</th>
                  <th className="py-3 px-4 w-1/3">மாற்றப்பட்ட வடிவம் / Replacement</th>
                  <th className="py-3 px-4">திருந்திய காரணம் / Linguistic Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A] text-sm">
                {explanations.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-neutral-900/40 transition-colors duration-150"
                  >
                    <td className="py-3.5 px-4 font-mono text-xs font-medium text-red-400">
                      <span className="line-through block whitespace-pre-wrap">{item.original || "-"}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-emerald-400">
                      <span className="block whitespace-pre-wrap">{item.replaced_with || "-"}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#ccc] leading-relaxed font-sans">
                      {item.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grammar Help Card */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-[#1A1A1A] text-xs">
        <div className="bg-[#111] p-3.5 rounded-lg border border-[#222]">
          <span className="font-semibold text-white block mb-1">
            ல / ள / ழ வேறுபாடுகள் (L / Lll / Llll)
          </span>
          <p className="text-[#888] text-[11px] leading-relaxed">
            'ல' மெல்லிய ஒலி (Dental), 'ள' தடித்த ஒலி (Retroflex), 'ழ' சிறப்பு ழகரம் (Retroflex approximant - தமிழ் மொழிக்கே உரியது). இந்த எழுத்துப் பிழைகளைக் கண்டறிந்து தமிழ் உரைத்திருத்தி சரிசெய்யும்.
          </p>
        </div>

        <div className="bg-[#111] p-3.5 rounded-lg border border-[#222]">
          <span className="font-semibold text-white block mb-1">
            ர / ற வேறுபாடுகள் (R / Rr)
          </span>
          <p className="text-[#888] text-[11px] leading-relaxed">
            'ர' இடையின ரகரம் (Alveolar flap), 'ற' வல்லின றகரம் (Alveolar trill). இரண்டிற்கும் உள்ள பொருள் வேறுபாட்டை உணர்ந்து, சொற்கள் மாறும் போது பிழையின்றி அமைக்கப்படும்.
          </p>
        </div>
      </div>
    </div>
  );
};

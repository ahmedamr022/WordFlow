"use client";

import React, { useState } from "react";
import { AudioService } from "@/lib/audio/kokoroTTS";
import { Volume2, Mic, Settings } from "lucide-react";

interface AudioControlsProps {
  lineId: number;
}

const AVAILABLE_VOICES = [
  // American Voices
  { id: "voice_laura", name: "Laura 🇺🇸", desc: "أمريكي تعليمي هادئ" },
  { id: "voice_sarah", name: "Sarah 🇺🇸", desc: "أمريكي طبيعي سريع" },
  { id: "voice_alice", name: "Alice 🇺🇸", desc: "أمريكي أنثوي واضح" },
  { id: "voice_jessica", name: "Jessica 🇺🇸", desc: "أمريكي أنثوي ناعم" },
  { id: "voice_chris", name: "Chris 🇺🇸", desc: "أمريكي ذكوري حاد" },
  { id: "voice_daniel", name: "Daniel 🇺🇸", desc: "أمريكي ذكوري عميق" },
  // British Voices
  { id: "voice_george", name: "George 🇬🇧", desc: "بريطاني ذكوري رسمي" },
  { id: "voice_charlotte", name: "Charlotte 🇬🇧", desc: "بريطاني أنثوي أنيق" },
  { id: "voice_lily", name: "Lily 🇬🇧", desc: "بريطاني أنثوي هادئ" },
];

export const AudioControls: React.FC<AudioControlsProps> = ({ lineId }) => {
  const [speed, setSpeedState] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<string>("voice_laura");
  const [showVoiceMenu, setShowVoiceMenu] = useState<boolean>(false);

  const handleSpeedToggle = (newSpeed: number) => {
    setSpeedState(newSpeed);
    AudioService.setSpeed(newSpeed);
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    AudioService.setVoiceFolder(voiceId);
    AudioService.playSentence(lineId, speed);
    setShowVoiceMenu(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 my-6 dir-rtl font-arabic relative">
      {/* Play ElevenLabs Sentence Audio Button */}
      <button
        onClick={() => AudioService.playSentence(lineId, speed)}
        className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-extrabold text-sm shadow-lg shadow-sky-500/20 transition-all active:scale-95"
      >
        <Volume2 className="w-5 h-5 fill-current" />
        <span>إعادة نطق الجملة</span>
      </button>

      {/* Speed Controls: 1.0x, 0.7x, 0.5x */}
      <div className="flex items-center gap-1.5 p-1 rounded-full glass-card border border-slate-800 text-xs font-mono font-bold">
        {[
          { label: "1.0x (عادي)", rate: 1.0 },
          { label: "0.7x (بطيء)", rate: 0.7 },
          { label: "0.5x (بطيء جداً)", rate: 0.5 },
        ].map((s) => (
          <button
            key={s.rate}
            onClick={() => handleSpeedToggle(s.rate)}
            className={`px-3 py-1.5 rounded-full transition-all ${
              speed === s.rate
                ? "bg-sky-500 text-slate-950 font-extrabold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Select ElevenLabs Voice Menu Button */}
      <div className="relative">
        <button
          onClick={() => setShowVoiceMenu(!showVoiceMenu)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full glass-card hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700/60 transition-all"
        >
          <Mic className="w-4 h-4 text-sky-400" />
          <span>الراوي: {AVAILABLE_VOICES.find(v => v.id === selectedVoice)?.name}</span>
          <Settings className="w-3.5 h-3.5 text-slate-500" />
        </button>

        {/* Dropdown Voices Selector Menu */}
        {showVoiceMenu && (
          <div className="absolute left-0 mt-2 w-64 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 text-right space-y-1 max-h-64 overflow-y-auto">
            <span className="text-[10px] text-sky-400 font-bold block px-3 py-1 uppercase tracking-wider">
              أصوات ElevenLabs (أمريكي 🇺🇸 / بريطاني 🇬🇧)
            </span>
            {AVAILABLE_VOICES.map((v) => (
              <button
                key={v.id}
                onClick={() => handleVoiceSelect(v.id)}
                className={`w-full text-right px-3 py-2 rounded-xl text-xs font-sans font-medium transition-colors flex items-center justify-between ${
                  selectedVoice === v.id
                    ? "bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="font-bold">{v.name}</span>
                <span className="text-[10px] text-slate-400 font-arabic">{v.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

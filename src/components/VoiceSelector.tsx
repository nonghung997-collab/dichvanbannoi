import React, { useState } from "react";
import { Search, Play, Volume2, Sparkles, Filter, CheckCircle2, User } from "lucide-react";
import { VoiceCategory, VoiceCharacter } from "../types";
import { VIETNAMESE_VOICES } from "../data/voices";
import { playVoicePreview } from "../utils/audioEngine";

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onSelectVoice: (voice: VoiceCharacter) => void;
}

const CATEGORY_TABS: { id: VoiceCategory; label: string; count: number }[] = [
  { id: "all", label: "Tất Cả", count: VIETNAMESE_VOICES.length },
  { id: "trending", label: "🔥 Thịnh Hành", count: VIETNAMESE_VOICES.filter((v) => v.category.includes("trending")).length },
  { id: "bac", label: "Miền Bắc", count: VIETNAMESE_VOICES.filter((v) => v.category.includes("bac")).length },
  { id: "nam", label: "Miền Nam", count: VIETNAMESE_VOICES.filter((v) => v.category.includes("nam")).length },
  { id: "trung", label: "Miền Trung", count: VIETNAMESE_VOICES.filter((v) => v.category.includes("trung")).length },
  { id: "character", label: "🎭 Nhân Vật & Anime", count: VIETNAMESE_VOICES.filter((v) => v.category.includes("character")).length },
  { id: "special", label: "✨ Giọng Đặc Biệt / ASMR", count: VIETNAMESE_VOICES.filter((v) => v.category.includes("special")).length },
];

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoiceId,
  onSelectVoice,
}) => {
  const [activeTab, setActiveTab] = useState<VoiceCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);

  const filteredVoices = VIETNAMESE_VOICES.filter((voice) => {
    const matchesCategory = activeTab === "all" || voice.category.includes(activeTab);
    const matchesSearch =
      searchQuery === "" ||
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePreview = (e: React.MouseEvent, voice: VoiceCharacter) => {
    e.stopPropagation();
    setPlayingPreviewId(voice.id);
    playVoicePreview(voice);
    setTimeout(() => {
      setPlayingPreviewId(null);
    }, 4500);
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl flex flex-col gap-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            Chọn Giọng Đọc Nhân Vật ({filteredVoices.length}/{VIETNAMESE_VOICES.length})
          </h2>
          <p className="text-xs text-slate-400">
            Hơn 36 giọng đọc tiếng Việt đa vùng miền, nhân vật hoạt hình và hiệu ứng studio
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-voice"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, vùng miền, vai diễn..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/90 text-slate-100 text-xs sm:text-sm rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-voice-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-slate-900 text-slate-400"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Voices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
        {filteredVoices.map((voice) => {
          const isSelected = selectedVoiceId === voice.id;
          const isPreviewing = playingPreviewId === voice.id;

          return (
            <div
              key={voice.id}
              id={`voice-card-${voice.id}`}
              onClick={() => onSelectVoice(voice)}
              className={`group relative rounded-xl p-3.5 cursor-pointer transition-all border flex flex-col justify-between ${
                isSelected
                  ? "bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/15"
                  : "bg-slate-800/60 hover:bg-slate-800/90 border-slate-700/70 hover:border-slate-600"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${voice.color} shadow-md`}
                  >
                    {voice.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-slate-100 group-hover:text-white">
                        {voice.name}
                      </h3>
                      {voice.popularBadge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {voice.popularBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-indigo-300 font-medium line-clamp-1">
                      {voice.title}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                )}
              </div>

              {/* Tag & Description */}
              <div className="my-2.5">
                <p className="text-[11px] text-emerald-400 font-medium tracking-wide">
                  {voice.tag}
                </p>
                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                  {voice.description}
                </p>
              </div>

              {/* Card Footer with Preview button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 mt-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      voice.gender === "female"
                        ? "bg-pink-400"
                        : voice.gender === "male"
                        ? "bg-blue-400"
                        : "bg-purple-400"
                    }`}
                  ></span>
                  {voice.gender === "female"
                    ? "Giọng Nữ"
                    : voice.gender === "male"
                    ? "Giọng Nam"
                    : "Giọng Unisex / Anime"}
                </span>

                <button
                  id={`btn-preview-${voice.id}`}
                  onClick={(e) => handlePreview(e, voice)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                    isPreviewing
                      ? "bg-emerald-500 text-white animate-pulse"
                      : "bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white"
                  }`}
                  title="Nghe thử giọng đọc này"
                >
                  {isPreviewing ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Đang phát...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Nghe thử</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

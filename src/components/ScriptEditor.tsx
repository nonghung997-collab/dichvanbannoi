import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Wand2,
  Copy,
  Trash2,
  Clock,
  Flame,
  ShoppingBag,
  Loader2,
  Check,
  Download,
  CheckCircle2,
  Play,
  Pause,
} from "lucide-react";
import { SAMPLE_SCRIPTS, SampleScript } from "../data/sampleScripts";
import { GeneratedAudioItem } from "../types";
import { downloadAudioItem } from "../utils/downloadHelper";

interface ScriptEditorProps {
  text: string;
  onChangeText: (text: string) => void;
  onApplyVoice: (voiceId: string) => void;
  speed: number;
  onGenerate?: () => void;
  isGenerating?: boolean;
  canGenerate?: boolean;
  currentAudio?: GeneratedAudioItem | null;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  text,
  onChangeText,
  onApplyVoice,
  speed,
  onGenerate,
  isGenerating = false,
  canGenerate = true,
  currentAudio = null,
  isPlaying = false,
  onTogglePlay,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementType, setEnhancementType] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    voiceId: string;
    genre: string;
    reason: string;
  } | null>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  // Calculate estimated reading time in seconds (average 3.5 words/sec in VN)
  const estimatedSeconds = Math.max(1, Math.round(wordCount / (3.5 * speed)));
  const minutes = Math.floor(estimatedSeconds / 60);
  const seconds = estimatedSeconds % 60;
  const timeFormatted =
    minutes > 0 ? `${minutes} phút ${seconds} giây` : `${seconds} giây`;

  const handleSelectSample = (sample: SampleScript) => {
    onChangeText(sample.text);
    if (sample.suggestedVoiceId) {
      onApplyVoice(sample.suggestedVoiceId);
    }
  };

  const handleEnhanceScript = async (mode: string) => {
    if (!text.trim()) return;
    setIsEnhancing(true);
    setEnhancementType(mode);

    try {
      const res = await fetch("/api/ai/enhance-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: text, mode }),
      });
      const data = await res.json();
      if (data.enhancedScript) {
        onChangeText(data.enhancedScript);
      }
    } catch (e) {
      console.error("Lỗi cải thiện kịch bản:", e);
    } finally {
      setIsEnhancing(false);
      setEnhancementType(null);
    }
  };

  const handleSuggestVoice = async () => {
    if (!text.trim()) return;
    setIsEnhancing(true);
    setEnhancementType("suggest");

    try {
      const res = await fetch("/api/ai/suggest-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: text }),
      });
      const data = await res.json();
      if (data.suggestedVoiceId) {
        onApplyVoice(data.suggestedVoiceId);
        setAiSuggestion({
          voiceId: data.suggestedVoiceId,
          genre: data.genre || "Nội dung số",
          reason: data.reason || "Giọng đọc rất phù hợp với ngữ cảnh kịch bản này.",
        });
      }
    } catch (e) {
      console.error("Lỗi gợi ý giọng đọc:", e);
    } finally {
      setIsEnhancing(false);
      setEnhancementType(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayPauseClick = () => {
    if (onTogglePlay) {
      onTogglePlay();
    } else if (onGenerate && canGenerate) {
      onGenerate();
    }
  };

  const handleDownloadClick = async (format: "mp3" | "wav" = "mp3") => {
    if (currentAudio) {
      await downloadAudioItem(currentAudio, format);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } else if (onGenerate && canGenerate) {
      onGenerate();
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl flex flex-col gap-4">
      {/* Header & Quick Sample Templates */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-base text-white">Nội Dung Văn Bản / Kịch Bản</h2>
        </div>

        {/* Sample Templates Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <span className="text-xs text-slate-400 shrink-0 mr-1 font-medium">Mẫu:</span>
          {SAMPLE_SCRIPTS.slice(0, 5).map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0 whitespace-nowrap cursor-pointer"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* AI Script Toolbar */}
      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold px-1">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Trợ Lý AI Kịch Bản:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="btn-ai-punctuation"
            disabled={isEnhancing || !text.trim()}
            onClick={() => handleEnhanceScript("punctuations")}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-indigo-600 disabled:opacity-50 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            title="Thêm dấu phẩy, chấm, ngắt nghỉ mượt mà và sửa lỗi viết tắt"
          >
            {isEnhancing && enhancementType === "punctuations" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            )}
            <span>Thêm Dấu Ngắt Nghỉ TTS</span>
          </button>

          <button
            id="btn-ai-tiktok"
            disabled={isEnhancing || !text.trim()}
            onClick={() => handleEnhanceScript("tiktok")}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-pink-600 disabled:opacity-50 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            title="Viết lại theo phong cách TikTok Shorts giật tít 3s đầu"
          >
            {isEnhancing && enhancementType === "tiktok" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Flame className="w-3.5 h-3.5 text-pink-400" />
            )}
            <span>Phong Cách TikTok/Shorts</span>
          </button>

          <button
            id="btn-ai-sales"
            disabled={isEnhancing || !text.trim()}
            onClick={() => handleEnhanceScript("sales")}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-amber-600 disabled:opacity-50 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            title="Biến đổi thành kịch bản bán hàng chốt đơn cuốn hút"
          >
            {isEnhancing && enhancementType === "sales" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Bán Hàng / Chốt Đơn</span>
          </button>

          <button
            id="btn-ai-suggest-voice"
            disabled={isEnhancing || !text.trim()}
            onClick={handleSuggestVoice}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white shadow-sm transition-all flex items-center gap-1 cursor-pointer"
            title="AI tự động phân tích và chọn giọng nhân vật phù hợp nhất"
          >
            {isEnhancing && enhancementType === "suggest" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            )}
            <span>AI Chọn Giọng Chuẩn</span>
          </button>
        </div>
      </div>

      {/* AI Suggestion Alert Banner */}
      {aiSuggestion && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>AI Đề Xuất:</strong> Thể loại {aiSuggestion.genre} — {aiSuggestion.reason}
            </span>
          </div>
          <button
            onClick={() => setAiSuggestion(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Textarea Input */}
      <div className="relative">
        <textarea
          id="textarea-script-input"
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Nhập hoặc dán đoạn văn bản tiếng Việt bạn muốn chuyển đổi thành giọng nói tại đây... (Ví dụ: Kịch bản video, lời thoại tóm tắt phim, bài thuyết trình, truyện audio, lời chào quảng cáo...)"
          className="w-full h-44 sm:h-52 p-4 bg-slate-950/80 text-slate-100 text-sm sm:text-base rounded-xl border border-slate-700/80 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-500 resize-y leading-relaxed font-normal"
        />

        {/* Text Actions Floating */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          <button
            id="btn-copy-script"
            onClick={handleCopy}
            disabled={!text.trim()}
            className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shadow-md transition-colors cursor-pointer disabled:opacity-50"
            title="Sao chép văn bản"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            id="btn-clear-script"
            onClick={() => onChangeText("")}
            disabled={!text.trim()}
            className="p-2 rounded-lg bg-slate-800/90 hover:bg-rose-900/80 text-slate-300 hover:text-rose-200 border border-slate-700 shadow-md transition-colors cursor-pointer disabled:opacity-50"
            title="Xóa nội dung"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statistics Bar & Direct Action Buttons (Placed right next to Ước tính thời lượng đọc) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>
            Số từ: <strong className="text-slate-200">{wordCount}</strong>
          </span>
          <span>
            Ký tự: <strong className="text-slate-200">{charCount}</strong>
          </span>
        </div>

        {/* Action Controls Group: Ước tính thời lượng đọc + Bắt Đầu Tạo + Tạm Dừng / Phát + Tải File */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Estimated Reading Time Display */}
          <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-indigo-500/30 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Ước tính thời lượng đọc:</span>
            <strong className="text-white font-bold text-xs bg-indigo-900/70 px-2 py-0.5 rounded border border-indigo-700/50">
              {timeFormatted}
            </strong>
          </div>

          {/* Nút Bắt Đầu Tạo */}
          <button
            id="btn-script-start-create"
            disabled={isGenerating || !text.trim()}
            onClick={onGenerate}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 disabled:opacity-50 text-white shadow-md shadow-purple-600/25 hover:shadow-purple-600/40 transition-all flex items-center gap-1.5 cursor-pointer transform active:scale-95 whitespace-nowrap"
            title="Bắt đầu tạo giọng nói từ văn bản này"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang Tạo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span>Bắt Đầu Tạo</span>
              </>
            )}
          </button>

          {/* Nút Tạm Dừng Khi Đang Phát / Phát Tiếp */}
          <button
            id="btn-script-pause-play"
            disabled={isGenerating || (!currentAudio && !text.trim())}
            onClick={handlePlayPauseClick}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md transform active:scale-95 disabled:opacity-50 whitespace-nowrap ${
              isPlaying
                ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/30 ring-2 ring-amber-400/50 animate-pulse"
                : currentAudio
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
            }`}
            title={
              isPlaying
                ? "Tạm dừng phát âm thanh"
                : currentAudio
                ? "Tiếp tục phát âm thanh"
                : "Tạo và phát thử"
            }
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Tạm Dừng</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{currentAudio ? "Phát Tiếp" : "Phát Thử"}</span>
              </>
            )}
          </button>

          {/* Nút Tải File Về Máy */}
          <button
            id="btn-script-download-file"
            disabled={isGenerating || (!currentAudio && !text.trim())}
            onClick={() => handleDownloadClick("mp3")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md transform active:scale-95 disabled:opacity-50 whitespace-nowrap ${
              currentAudio
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25 hover:shadow-emerald-600/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
            }`}
            title={
              currentAudio
                ? `Tải file ${currentAudio.format.toUpperCase()} về máy (${currentAudio.fileSizeKB} KB)`
                : "Tạo và tải file về máy"
            }
          >
            {downloadSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
            ) : (
              <Download className="w-3.5 h-3.5 text-emerald-300" />
            )}
            <span>
              {downloadSuccess
                ? "Đã Tải Về!"
                : currentAudio
                ? `Tải File Về Máy (${currentAudio.format.toUpperCase()})`
                : "Tải File Về Máy"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

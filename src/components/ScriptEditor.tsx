import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Wand2,
  Copy,
  Trash2,
  Clock,
  Flame,
  Radio,
  ShoppingBag,
  Moon,
  Tv,
  HelpCircle,
  Loader2,
  Check,
} from "lucide-react";
import { SAMPLE_SCRIPTS, SampleScript } from "../data/sampleScripts";
import { VoiceCharacter } from "../types";

interface ScriptEditorProps {
  text: string;
  onChangeText: (text: string) => void;
  onApplyVoice: (voiceId: string) => void;
  speed: number;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  text,
  onChangeText,
  onApplyVoice,
  speed,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementType, setEnhancementType] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    voiceId: string;
    genre: string;
    reason: string;
  } | null>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  // Calculate estimated reading time in seconds (average 3.5 words/sec in VN)
  const estimatedSeconds = Math.max(1, Math.round((wordCount / (3.5 * speed))));
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
      const response = await fetch("/api/ai/enhance-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
      });
      const data = await response.json();
      if (data.enhancedText) {
        onChangeText(data.enhancedText);
      }
    } catch (error) {
      console.error("Lỗi enhance script:", error);
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
      const response = await fetch("/api/ai/suggest-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (data.voiceId) {
        setAiSuggestion({
          voiceId: data.voiceId,
          genre: data.genre || "Phù hợp nội dung",
          reason: data.reason || "Giọng đọc tối ưu cho văn bản này",
        });
        onApplyVoice(data.voiceId);
      }
    } catch (error) {
      console.error("Lỗi suggest voice:", error);
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

  return (
    <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl flex flex-col gap-4">
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Văn Bản Cần Đọc</h2>
          <span className="text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
            Không giới hạn từ
          </span>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs text-slate-400 shrink-0 font-medium">
            Kịch bản mẫu:
          </span>
          {SAMPLE_SCRIPTS.slice(0, 4).map((sample) => (
            <button
              key={sample.id}
              id={`btn-sample-${sample.id}`}
              onClick={() => handleSelectSample(sample)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors shrink-0 flex items-center gap-1"
            >
              <span>{sample.icon}</span>
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Assistance Action Bar */}
      <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
          <span>Trợ Lý AI Kịch Bản:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="btn-ai-punctuation"
            disabled={isEnhancing || !text.trim()}
            onClick={() => handleEnhanceScript("punctuations")}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-indigo-600 disabled:opacity-50 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1"
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
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-pink-600 disabled:opacity-50 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1"
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
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-amber-600 disabled:opacity-50 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1"
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
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white shadow-sm transition-all flex items-center gap-1"
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
            className="text-emerald-400 hover:text-emerald-200 text-xs underline"
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
            className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shadow-md transition-colors"
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
            className="p-2 rounded-lg bg-slate-800/90 hover:bg-rose-900/80 text-slate-300 hover:text-rose-200 border border-slate-700 shadow-md transition-colors"
            title="Xóa nội dung"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-4">
          <span>
            Số từ: <strong className="text-slate-200">{wordCount}</strong>
          </span>
          <span>
            Ký tự: <strong className="text-slate-200">{charCount}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ước tính thời lượng đọc: </span>
          <strong className="text-white bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50">
            {timeFormatted}
          </strong>
        </div>
      </div>
    </div>
  );
};

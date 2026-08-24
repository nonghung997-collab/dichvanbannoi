import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Play,
  Sparkles,
  Users,
  Download,
  Loader2,
  Volume2,
} from "lucide-react";
import { DialogueLine, VoiceCharacter, AudioSettings } from "../types";
import { VIETNAMESE_VOICES } from "../data/voices";
import { playVoicePreview, renderAndExportAudio } from "../utils/audioEngine";

interface DialogueModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioCreated: (item: any) => void;
}

export const DialogueModeModal: React.FC<DialogueModeModalProps> = ({
  isOpen,
  onClose,
  onAudioCreated,
}) => {
  const [lines, setLines] = useState<DialogueLine[]>([
    {
      id: "1",
      speaker: "MC Nam (Minh Quân)",
      voiceId: "hn_mc_male_quan",
      text: "Chào Quỳnh Chi, hôm nay bạn có tin tức gì hấp dẫn gửi đến khán giả không?",
    },
    {
      id: "2",
      speaker: "MC Nữ (Quỳnh Chi)",
      voiceId: "hn_story_female_chi",
      text: "Chào anh Quân, hôm nay chúng ta sẽ cùng khám phá công cụ tạo giọng nói AI siêu xịn xò này nhé!",
    },
    {
      id: "3",
      speaker: "Robot AI Cyber",
      voiceId: "robot_cyber_3000",
      text: "Hệ thống VietVoice AI đã sẵn sàng phục vụ quý khán giả với hơn ba mươi sáu giọng đọc tiếng Việt miễn phí.",
    },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");

  if (!isOpen) return null;

  const handleAddLine = () => {
    const nextVoice = VIETNAMESE_VOICES[lines.length % VIETNAMESE_VOICES.length];
    setLines([
      ...lines,
      {
        id: Date.now().toString(),
        speaker: `Nhân vật ${lines.length + 1}`,
        voiceId: nextVoice.id,
        text: "",
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    setLines(lines.filter((l) => l.id !== id));
  };

  const handleUpdateLine = (id: string, field: keyof DialogueLine, value: any) => {
    setLines(
      lines.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const handlePreviewLine = (voiceId: string, text: string) => {
    const character = VIETNAMESE_VOICES.find((v) => v.id === voiceId);
    if (character && text) {
      const customChar = { ...character, sampleText: text };
      playVoicePreview(customChar);
    }
  };

  const handleExportFullDialogue = async () => {
    const validLines = lines.filter((l) => l.text.trim().length > 0);
    if (validLines.length === 0) return;

    setIsProcessing(true);
    setProgressMsg("Đang ghép nối các đoạn thoại nhân vật...");

    try {
      // Concatenate full script with line indicators
      const fullScript = validLines.map((l) => l.text).join(". ");
      const firstVoice =
        VIETNAMESE_VOICES.find((v) => v.id === validLines[0].voiceId) ||
        VIETNAMESE_VOICES[0];

      const defaultSettings: AudioSettings = {
        voiceId: firstVoice.id,
        speed: 1.0,
        pitch: 1.0,
        volume: 100,
        effect: "none",
        bgmId: "chill_lofi",
        bgmVolume: 15,
        exportFormat: "mp3",
      };

      const result = await renderAndExportAudio(
        fullScript,
        firstVoice,
        defaultSettings,
        (_pct, step) => setProgressMsg(step)
      );

      const newItem = {
        id: Date.now().toString(),
        title: `Kịch Bản Đối Thoại (${validLines.length} câu thoại)`,
        text: fullScript,
        voiceId: firstVoice.id,
        voiceName: "Đối Thoại Đa Nhân Vật",
        voiceAvatar: "🎭",
        voiceTitle: `${validLines.length} Nhân vật lồng tiếng`,
        duration: result.duration,
        audioBlobUrl: result.blobUrl,
        format: result.format,
        fileSizeKB: result.fileSizeKB,
        createdAt: Date.now(),
        settings: defaultSettings,
      };

      onAudioCreated(newItem);
      onClose();
    } catch (error) {
      console.error("Lỗi tạo audio đối thoại:", error);
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Chế Độ Lồng Tiếng Đối Thoại Đa Nhân Vật
              </h3>
              <p className="text-xs text-slate-400">
                Chỉ định từng giọng đọc nhân vật cho từng câu thoại trong kịch bản
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Dialogue Lines */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-3.5 scrollbar-thin scrollbar-thumb-slate-700">
          {lines.map((line, index) => {
            const selectedVoice =
              VIETNAMESE_VOICES.find((v) => v.id === line.voiceId) ||
              VIETNAMESE_VOICES[0];

            return (
              <div
                key={line.id}
                className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={line.speaker}
                      onChange={(e) =>
                        handleUpdateLine(line.id, "speaker", e.target.value)
                      }
                      placeholder="Tên nhân vật..."
                      className="bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-200 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 w-36"
                    />
                  </div>

                  {/* Character Voice Dropdown */}
                  <div className="flex items-center gap-2">
                    <select
                      value={line.voiceId}
                      onChange={(e) =>
                        handleUpdateLine(line.id, "voiceId", e.target.value)
                      }
                      className="bg-slate-900 text-slate-200 text-xs py-1.5 px-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {VIETNAMESE_VOICES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.avatar} {v.name} ({v.title})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handlePreviewLine(line.voiceId, line.text)}
                      disabled={!line.text.trim()}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 disabled:opacity-40 text-slate-300 hover:text-white transition-colors"
                      title="Nghe thử câu này"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    {lines.length > 1 && (
                      <button
                        onClick={() => handleRemoveLine(line.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/80 text-slate-400 hover:text-rose-200 transition-colors"
                        title="Xóa câu thoại"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Line Text */}
                <textarea
                  value={line.text}
                  onChange={(e) =>
                    handleUpdateLine(line.id, "text", e.target.value)
                  }
                  rows={2}
                  placeholder={`Nhập lời thoại của ${line.speaker}...`}
                  className="w-full p-2.5 bg-slate-900/90 text-slate-100 text-xs sm:text-sm rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 resize-y"
                />
              </div>
            );
          })}

          <button
            onClick={handleAddLine}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors bg-slate-950/30"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Câu Thoại Mới</span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {progressMsg || `Tổng cộng: ${lines.length} câu thoại trong kịch bản`}
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Hủy
            </button>
            <button
              disabled={isProcessing || lines.every((l) => !l.text.trim())}
              onClick={handleExportFullDialogue}
              className="w-1/2 sm:w-auto px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white shadow-lg flex items-center justify-center gap-1.5"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Xuất...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Tạo & Xuất MP3 Đối Thoại</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

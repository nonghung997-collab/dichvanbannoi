import React from "react";
import {
  X,
  Play,
  Download,
  Trash2,
  Clock,
  FileAudio,
  History,
  Sparkles,
} from "lucide-react";
import { GeneratedAudioItem } from "../types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedAudioItem[];
  onSelectHistoryItem: (item: GeneratedAudioItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getHours()}:${d.getMinutes() < 10 ? "0" : ""}${d.getMinutes()} - ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">
              Lịch Sử Tạo Giọng ({history.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded bg-rose-950/40 border border-rose-800/40"
              >
                Xóa tất cả
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-slate-700">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500 gap-2">
              <FileAudio className="w-12 h-12 text-slate-600" />
              <p className="text-sm">Chưa có bản ghi âm nào</p>
              <p className="text-xs text-slate-600">
                Các file âm thanh bạn tạo sẽ được lưu tự động tại đây
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{item.voiceAvatar}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200 line-clamp-1">
                        {item.voiceName}
                      </h4>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                    {item.format.toUpperCase()} • {item.duration}s
                  </span>
                </div>

                <p className="text-xs text-slate-300 italic line-clamp-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                  "{item.text}"
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {item.fileSizeKB} KB
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectHistoryItem(item)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-colors"
                      title="Mở & nghe lại bản này"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Nghe</span>
                    </button>

                    <a
                      href={item.audioBlobUrl}
                      download={`VietVoice_${item.voiceName}_${item.id}.${item.format}`}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Tải xuống"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/80 text-slate-400 hover:text-rose-200 transition-colors"
                      title="Xóa mục này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

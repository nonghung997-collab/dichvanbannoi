import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Share2,
  Check,
  FileAudio,
  CheckCircle,
} from "lucide-react";
import { GeneratedAudioItem } from "../types";
import { downloadAudioItem } from "../utils/downloadHelper";

interface AudioPlayerSectionProps {
  item: GeneratedAudioItem | null;
  isGenerating: boolean;
  progressPercent: number;
  progressStep: string;
  onGenerate: () => void;
  canGenerate: boolean;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
}

export const AudioPlayerSection: React.FC<AudioPlayerSectionProps> = ({
  item,
  isGenerating,
  progressPercent,
  progressStep,
  onGenerate,
  canGenerate,
  isPlaying = false,
  onTogglePlay,
  audioRef,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccessFormat, setDownloadSuccessFormat] = useState<string | null>(null);

  useEffect(() => {
    if (item && audioRef?.current) {
      setCurrentTime(0);
      setDuration(item.duration || 0);
    }
  }, [item, audioRef]);

  const togglePlay = () => {
    if (onTogglePlay) {
      onTogglePlay();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef?.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || item?.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef?.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleDownload = async (targetFormat: "mp3" | "wav") => {
    if (!item) {
      if (canGenerate) {
        onGenerate();
      }
      return;
    }

    setIsDownloading(true);
    try {
      await downloadAudioItem(item, targetFormat);
      setDownloadSuccessFormat(targetFormat);
      setTimeout(() => setDownloadSuccessFormat(null), 2500);
    } catch (err) {
      console.error("Lỗi khi tải file:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 rounded-2xl p-4 sm:p-6 border border-indigo-500/30 shadow-2xl flex flex-col gap-5">
      {/* Hidden audio element event listeners if attached */}
      {audioRef?.current && (
        <div className="hidden" aria-hidden="true">
          {/* Audio listeners handled via ref callbacks & events */}
        </div>
      )}

      {/* Generation Bar / CTA Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/25">
            {item ? item.voiceAvatar : "🎙️"}
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              {item ? `${item.voiceName} • ${item.voiceTitle}` : "Sẵn Sàng Tạo Giọng Đọc"}
            </h3>
            <p className="text-xs text-slate-400">
              {item
                ? `Thời lượng: ${item.duration}s • Kích thước: ${item.fileSizeKB} KB • Định dạng: ${item.format.toUpperCase()}`
                : "Nhấn nút bên dưới để chuyển văn bản thành file âm thanh chất lượng cao"}
            </p>
          </div>
        </div>

        {/* Master Generate Button */}
        <button
          id="btn-generate-speech"
          disabled={isGenerating || !canGenerate}
          onClick={onGenerate}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 disabled:opacity-50 text-white shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang Xử Lý Âm Thanh...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>TẠO GIỌNG NÓI NGAY (MIỄN PHÍ)</span>
            </>
          )}
        </button>
      </div>

      {/* Generating Progress Indicator */}
      {isGenerating && (
        <div className="bg-slate-950/80 p-4 rounded-xl border border-purple-500/40 flex flex-col gap-2 animate-pulse">
          <div className="flex items-center justify-between text-xs text-purple-300 font-medium">
            <span>{progressStep || "Đang chuyển đổi giọng đọc..."}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Active Audio Player Waveform & Controls */}
      {item && (
        <div className="bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col gap-4">
          {/* Animated Waveform Bars */}
          <div className="h-16 flex items-center justify-center gap-1 sm:gap-1.5 px-2 bg-slate-900/80 rounded-xl border border-slate-800/80 overflow-hidden">
            {Array.from({ length: 48 }).map((_, idx) => {
              const heightMultiplier = isPlaying
                ? Math.abs(Math.sin(idx * 0.4 + (currentTime || 0) * 5)) * 80 + 15
                : 15 + Math.sin(idx * 0.3) * 12;
              const isPlayed = idx / 48 <= (currentTime || 0) / (duration || 1);

              return (
                <div
                  key={idx}
                  className={`w-1 sm:w-1.5 rounded-full transition-all duration-150 ${
                    isPlayed
                      ? "bg-gradient-to-t from-pink-500 to-indigo-400"
                      : "bg-slate-700/60"
                  }`}
                  style={{ height: `${heightMultiplier}%` }}
                ></div>
              );
            })}
          </div>

          {/* Time & Seek Bar */}
          <div className="flex flex-col gap-1">
            <input
              id="slider-audio-seek"
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || item.duration)}</span>
            </div>
          </div>

          {/* Main Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Play/Pause & Loop */}
            <div className="flex items-center gap-3">
              <button
                id="btn-player-play-pause"
                onClick={togglePlay}
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${
                  isPlaying
                    ? "bg-gradient-to-tr from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/30"
                    : "bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-600/30"
                }`}
                title={isPlaying ? "Tạm dừng" : "Phát âm thanh"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                id="btn-player-loop"
                onClick={() => {
                  if (audioRef?.current) {
                    audioRef.current.loop = !isLooping;
                    setIsLooping(!isLooping);
                  }
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isLooping
                    ? "bg-purple-950/80 border-purple-500 text-purple-300"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400"
                }`}
                title="Lặp lại âm thanh"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Lặp lại</span>
              </button>

              {/* Volume Toggle */}
              <div className="hidden sm:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    if (audioRef?.current) {
                      audioRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-slate-300" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    if (audioRef?.current) {
                      audioRef.current.volume = val;
                      audioRef.current.muted = false;
                      setIsMuted(false);
                    }
                  }}
                  className="w-16 accent-indigo-500 h-1 bg-slate-700 cursor-pointer"
                />
              </div>
            </div>

            {/* Fast Download Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Download MP3 Button */}
              <button
                id="btn-download-mp3"
                disabled={isDownloading}
                onClick={() => handleDownload("mp3")}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Tải file âm thanh định dạng MP3"
              >
                {downloadSuccessFormat === "mp3" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-200" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>
                  {downloadSuccessFormat === "mp3"
                    ? "Đã tải MP3!"
                    : `Tải MP3 (${item.fileSizeKB} KB)`}
                </span>
              </button>

              {/* Download WAV Button */}
              <button
                id="btn-download-wav"
                disabled={isDownloading}
                onClick={() => handleDownload("wav")}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Tải file âm thanh định dạng WAV lossless"
              >
                {downloadSuccessFormat === "wav" ? (
                  <CheckCircle className="w-4 h-4 text-blue-300" />
                ) : (
                  <FileAudio className="w-4 h-4 text-blue-400" />
                )}
                <span>{downloadSuccessFormat === "wav" ? "Đã tải WAV!" : "Tải WAV"}</span>
              </button>

              {/* Share button */}
              <button
                id="btn-share-audio"
                onClick={handleCopyShare}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Sao chép link chia sẻ"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Karaoke Text Highlight Box */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-28 overflow-y-auto">
            <span className="text-slate-400 block mb-1 font-semibold text-[11px]">
              Lời đọc văn bản:
            </span>
            <p className="italic text-slate-200">"{item.text}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

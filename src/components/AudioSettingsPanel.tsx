import React from "react";
import {
  Sliders,
  Gauge,
  Music,
  Volume2,
  Sparkles,
  Radio,
  FileAudio,
  RotateCcw,
} from "lucide-react";
import { AudioEffectType, AudioSettings, BgmTrack } from "../types";
import { BGM_TRACKS } from "../data/voices";

interface AudioSettingsPanelProps {
  settings: AudioSettings;
  onChangeSettings: (settings: AudioSettings) => void;
  defaultPitch?: number;
  defaultSpeed?: number;
}

const EFFECT_OPTIONS: { id: AudioEffectType; label: string; icon: string; desc: string }[] = [
  { id: "none", label: "Gốc (Tự Nhiên)", icon: "✨", desc: "Không áp dụng hiệu ứng" },
  { id: "studio", label: "Phòng Thu Studio", icon: "🎙️", desc: "Nén âm ấm áp, trong trẻo" },
  { id: "reverb", label: "Tiếng Vang Reverb", icon: "🏛️", desc: "Không gian thánh đường vang xa" },
  { id: "radio", label: "Radio Cổ Điển", icon: "📻", desc: "Băng tần hoài cổ thập niên 80" },
  { id: "robot", label: "Robot AI Cyber", icon: "🤖", desc: "Bộ lọc kim loại điện tử" },
  { id: "bassboost", label: "Bass Boost Trầm", icon: "🔊", desc: "Tăng cường âm trầm ấm áp" },
  { id: "asmr", label: "Thì Thầm ASMR", icon: "🌙", desc: "Âm hơi thì thầm sát tai" },
  { id: "horror", label: "Kinh Dị U Ám", icon: "👻", desc: "Echo trễ vọng âm rợn người" },
  { id: "telephone", label: "Điện Thoại / Loa", icon: "📞", desc: "Bộ lọc thoại băng thông hẹp" },
];

export const AudioSettingsPanel: React.FC<AudioSettingsPanelProps> = ({
  settings,
  onChangeSettings,
  defaultPitch = 1.0,
  defaultSpeed = 1.0,
}) => {
  const handleReset = () => {
    onChangeSettings({
      ...settings,
      speed: defaultSpeed,
      pitch: defaultPitch,
      volume: 100,
      effect: "none",
      bgmId: "none",
      bgmVolume: 20,
    });
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          Tùy Chỉnh Âm Thanh & Nhạc Nền
        </h2>
        <button
          id="btn-reset-audio-settings"
          onClick={handleReset}
          className="text-xs font-medium text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          title="Khôi phục mặc định"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Speed Slider */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Tốc độ đọc
            </span>
            <span className="font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
              {settings.speed.toFixed(2)}x
            </span>
          </div>
          <input
            id="slider-speed"
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={settings.speed}
            onChange={(e) =>
              onChangeSettings({ ...settings, speed: parseFloat(e.target.value) })
            }
            className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>0.5x (Chậm)</span>
            <button
              onClick={() => onChangeSettings({ ...settings, speed: 1.0 })}
              className="text-slate-400 hover:text-white"
            >
              1.0x (Chuẩn)
            </button>
            <span>2.0x (Nhanh)</span>
          </div>
        </div>

        {/* Pitch Slider */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Cao độ (Pitch)
            </span>
            <span className="font-bold text-purple-400 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-800/40">
              {settings.pitch.toFixed(2)}
            </span>
          </div>
          <input
            id="slider-pitch"
            type="range"
            min="0.5"
            max="1.8"
            step="0.05"
            value={settings.pitch}
            onChange={(e) =>
              onChangeSettings({ ...settings, pitch: parseFloat(e.target.value) })
            }
            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>Trầm ấm</span>
            <button
              onClick={() => onChangeSettings({ ...settings, pitch: 1.0 })}
              className="text-slate-400 hover:text-white"
            >
              Cân bằng
            </button>
            <span>Trong / Cao</span>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Âm lượng giọng
            </span>
            <span className="font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/40">
              {settings.volume}%
            </span>
          </div>
          <input
            id="slider-volume"
            type="range"
            min="10"
            max="100"
            step="5"
            value={settings.volume}
            onChange={(e) =>
              onChangeSettings({ ...settings, volume: parseInt(e.target.value) })
            }
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>10%</span>
            <span>Mặc định: 100%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* DSP Audio Effects Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-indigo-400" />
          Hiệu Ứng Âm Thanh Studio (DSP FX):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {EFFECT_OPTIONS.map((eff) => (
            <button
              key={eff.id}
              id={`btn-effect-${eff.id}`}
              onClick={() => onChangeSettings({ ...settings, effect: eff.id })}
              className={`p-2.5 rounded-xl text-left border transition-all flex flex-col gap-0.5 ${
                settings.effect === eff.id
                  ? "bg-indigo-950/80 border-indigo-500 text-white shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500"
                  : "bg-slate-950/40 hover:bg-slate-800/70 border-slate-800 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span>{eff.icon}</span>
                <span className="truncate">{eff.label}</span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                {eff.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Background Music (BGM) Selection & BGM Volume */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Music className="w-4 h-4 text-purple-400" />
            Nhạc Nền Hòa Trộn (Background Music BGM):
          </label>

          {/* BGM Volume Slider (Only visible when BGM is active) */}
          {settings.bgmId !== "none" && (
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-300 whitespace-nowrap">
                Âm lượng BGM: <strong>{settings.bgmVolume}%</strong>
              </span>
              <input
                id="slider-bgm-volume"
                type="range"
                min="5"
                max="50"
                step="5"
                value={settings.bgmVolume}
                onChange={(e) =>
                  onChangeSettings({
                    ...settings,
                    bgmVolume: parseInt(e.target.value),
                  })
                }
                className="w-20 accent-purple-500 h-1 bg-slate-700 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* BGM Track Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BGM_TRACKS.map((bgm) => (
            <button
              key={bgm.id}
              id={`btn-bgm-${bgm.id}`}
              onClick={() => onChangeSettings({ ...settings, bgmId: bgm.id })}
              className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2 ${
                settings.bgmId === bgm.id
                  ? "bg-purple-950/80 border-purple-500 text-white ring-1 ring-purple-500 shadow-sm"
                  : "bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300"
              }`}
            >
              <span className="text-lg">{bgm.icon}</span>
              <div className="truncate">
                <p className="text-xs font-bold truncate">{bgm.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{bgm.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Format Selector (MP3 vs WAV) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <FileAudio className="w-4 h-4 text-emerald-400" />
          Định Dạng Xuất File Âm Thanh:
        </span>

        <div className="flex items-center gap-2">
          <button
            id="btn-format-mp3"
            onClick={() => onChangeSettings({ ...settings, exportFormat: "mp3" })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              settings.exportFormat === "mp3"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
          >
            <span>MP3 (Khuyên Dùng • Nhẹ & Nét)</span>
          </button>

          <button
            id="btn-format-wav"
            onClick={() => onChangeSettings({ ...settings, exportFormat: "wav" })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              settings.exportFormat === "wav"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
          >
            <span>WAV (Lossless • Chuẩn Studio)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

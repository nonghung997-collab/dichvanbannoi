import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Navbar } from "./components/Navbar";
import { PartnerBanner } from "./components/PartnerBanner";
import { VoiceSelector } from "./components/VoiceSelector";
import { ScriptEditor } from "./components/ScriptEditor";
import { AudioSettingsPanel } from "./components/AudioSettingsPanel";
import { AudioPlayerSection } from "./components/AudioPlayerSection";
import { DialogueModeModal } from "./components/DialogueModeModal";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { VIETNAMESE_VOICES } from "./data/voices";
import { AudioSettings, GeneratedAudioItem, VoiceCharacter } from "./types";
import { renderAndExportAudio } from "./utils/audioEngine";
import { SAMPLE_SCRIPTS } from "./data/sampleScripts";
import {
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Headphones,
  FileCheck,
} from "lucide-react";

export default function App() {
  // Current Selected Voice
  const [selectedVoice, setSelectedVoice] = useState<VoiceCharacter>(
    VIETNAMESE_VOICES[0]
  );

  // Script text
  const [scriptText, setScriptText] = useState<string>(
    SAMPLE_SCRIPTS[0].text
  );

  // Audio Settings
  const [settings, setSettings] = useState<AudioSettings>({
    voiceId: VIETNAMESE_VOICES[0].id,
    speed: VIETNAMESE_VOICES[0].defaultSpeed || 1.0,
    pitch: VIETNAMESE_VOICES[0].defaultPitch || 1.0,
    volume: 100,
    effect: VIETNAMESE_VOICES[0].effect || "none",
    bgmId: "none",
    bgmVolume: 20,
    exportFormat: "mp3",
  });

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStep, setProgressStep] = useState("");

  // Generated Audio Item & Shared Playback State
  const [currentAudio, setCurrentAudio] = useState<GeneratedAudioItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // History
  const [history, setHistory] = useState<GeneratedAudioItem[]>(() => {
    try {
      const saved = localStorage.getItem("vietvoice_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("vietvoice_history", JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.warn("Không thể lưu localStorage:", e);
    }
  }, [history]);

  // Load and autoplay new audio when currentAudio changes
  useEffect(() => {
    if (currentAudio && audioRef.current) {
      audioRef.current.src = currentAudio.audioBlobUrl;
      audioRef.current.load();
      setIsPlaying(false);
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay fallback
        });
    }
  }, [currentAudio]);

  // Toggle Play / Pause centrally
  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (!currentAudio) {
      if (scriptText.trim()) {
        handleGenerateAudio();
      }
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.log("Playback interaction:", e));
    }
  };

  // When voice selection changes, adjust default pitch/speed/effects
  const handleSelectVoice = (voice: VoiceCharacter) => {
    setSelectedVoice(voice);
    setSettings((prev) => ({
      ...prev,
      voiceId: voice.id,
      speed: voice.defaultSpeed,
      pitch: voice.defaultPitch,
      effect: voice.effect || prev.effect,
    }));
  };

  // Trigger Master Audio Generation
  const handleGenerateAudio = async () => {
    if (!scriptText.trim()) return;

    // Pause current playing audio before generating new
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    setIsGenerating(true);
    setProgressPercent(10);
    setProgressStep("Đang chuẩn bị dữ liệu ngữ âm...");

    try {
      const result = await renderAndExportAudio(
        scriptText,
        selectedVoice,
        settings,
        (pct, step) => {
          setProgressPercent(pct);
          setProgressStep(step);
        }
      );

      const newItem: GeneratedAudioItem = {
        id: Date.now().toString(),
        title: scriptText.substring(0, 35) + (scriptText.length > 35 ? "..." : ""),
        text: scriptText,
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        voiceAvatar: selectedVoice.avatar,
        voiceTitle: selectedVoice.title,
        duration: result.duration,
        audioBlobUrl: result.blobUrl,
        format: result.format,
        fileSizeKB: result.fileSizeKB,
        createdAt: Date.now(),
        settings: { ...settings },
      };

      setCurrentAudio(newItem);
      setHistory((prev) => [newItem, ...prev]);

      // Confetti celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {
        // Safe fallback
      }
    } catch (error) {
      console.error("Lỗi tạo giọng nói:", error);
      alert("Đã xảy ra sự cố khi tạo giọng nói. Vui lòng thử lại!");
    } finally {
      setIsGenerating(false);
      setProgressPercent(0);
      setProgressStep("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Hidden Master Audio Element */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Sticky Navigation */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenDialogue={() => setIsDialogueOpen(true)}
        historyCount={history.length}
      />

      {/* Mandatory Partner Links Top Banner */}
      <PartnerBanner />

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>36+ Giọng Bắc - Trung - Nam</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Miễn Phí, Không Giới Hạn</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Headphones className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Xuất MP3 320k & WAV Lossless</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <FileCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Nhạc Nền & Hiệu Ứng Phòng Thu</span>
          </div>
        </div>

        {/* Studio 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Voice Selector (5 Cols on Large) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <VoiceSelector
              selectedVoice={selectedVoice}
              onSelectVoice={handleSelectVoice}
            />

            {/* Quick Tips Box */}
            <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800/80 text-xs text-slate-400 flex flex-col gap-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Mẹo Tạo Giọng Đọc Tự Nhiên & Chuyên Nghiệp:
              </span>
              <ul className="space-y-1 text-[11px] leading-relaxed">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  Nút <strong>Tạm Dừng / Phát Tiếp</strong> ngay cạnh ô thời lượng đọc
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Nút <strong>Tải File Về Máy</strong> 1-chạm không cần chờ đợi
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Trợ lý AI thêm dấu ngắt nghỉ mượt mà và sửa lỗi viết tắt
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Tải file MP3 320kbps & WAV Studio chất lượng cao
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Script Editor, Settings & Player (7 Cols on Large) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* 1. Script Text Editor with AI assistants, Pause/Play, Start & Fast Download Buttons */}
            <ScriptEditor
              text={scriptText}
              onChangeText={setScriptText}
              onApplyVoice={(voiceId) => {
                const found = VIETNAMESE_VOICES.find((v) => v.id === voiceId);
                if (found) handleSelectVoice(found);
              }}
              speed={settings.speed}
              onGenerate={handleGenerateAudio}
              isGenerating={isGenerating}
              canGenerate={Boolean(scriptText.trim())}
              currentAudio={currentAudio}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
            />

            {/* 2. Audio Settings (Speed, Pitch, Volume, DSP Effects, BGM, Format) */}
            <AudioSettingsPanel
              settings={settings}
              onChangeSettings={setSettings}
              defaultPitch={selectedVoice.defaultPitch}
              defaultSpeed={selectedVoice.defaultSpeed}
            />

            {/* 3. Master Audio Player & Waveform Section */}
            <AudioPlayerSection
              item={currentAudio}
              isGenerating={isGenerating}
              progressPercent={progressPercent}
              progressStep={progressStep}
              onGenerate={handleGenerateAudio}
              canGenerate={Boolean(scriptText.trim())}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              audioRef={audioRef}
            />
          </div>
        </div>

        {/* Dialogue Mode Modal */}
        <DialogueModeModal
          isOpen={isDialogueOpen}
          onClose={() => setIsDialogueOpen(false)}
          onAudioCreated={(item) => {
            setCurrentAudio(item);
            setHistory((prev) => [item, ...prev]);
          }}
        />

        {/* History Drawer */}
        <HistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={history}
          onSelectHistoryItem={(item) => {
            setCurrentAudio(item);
            setScriptText(item.text);
            const foundVoice = VIETNAMESE_VOICES.find((v) => v.id === item.voiceId);
            if (foundVoice) setSelectedVoice(foundVoice);
            setIsHistoryOpen(false);
          }}
          onDeleteHistoryItem={(id) => {
            setHistory((prev) => prev.filter((i) => i.id !== id));
          }}
          onClearHistory={() => setHistory([])}
        />
      </main>

      {/* Application Footer with Partner Links */}
      <footer className="mt-12 bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <span className="font-bold text-white text-base">VietVoice AI Studio</span>
            <p className="text-xs text-slate-400 max-w-md">
              Hệ thống chuyển đổi văn bản thành giọng nói hơn 36 phong cách nhân vật tiếng Việt miễn phí 100%, phục vụ cộng đồng làm nội dung số, TikTok, YouTube, Podcast và Video AI.
            </p>
          </div>

          {/* Direct Partner Buttons in Footer */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              id="footer-partner-hungnv"
              href="https://hungnv.click"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all"
            >
              <Flame className="w-3.5 h-3.5 fill-slate-950" />
              <span>Xem hệ thống kinh doanh tại đây: hungnv.click</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>

            <a
              id="footer-partner-aitoolmmo"
              href="https://aitoolmmo.top"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sử dụng các AI khác tại đây: aitoolmmo.top</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

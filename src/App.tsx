import React, { useState, useEffect } from "react";
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

  // Generated Audio Item
  const [currentAudio, setCurrentAudio] = useState<GeneratedAudioItem | null>(null);

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
      {/* Top Sticky Navigation */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenDialogue={() => setIsDialogueOpen(true)}
        historyCount={history.length}
      />

      {/* Mandatory Partner Links Top Banner */}
      <PartnerBanner />

      {/* Main Application Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Intro Highlight Pill */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg text-white">
                Tạo Giọng Nói Từ Văn Bản Tiếng Việt (Miễn Phí 100%)
              </h1>
              <p className="text-xs text-slate-400">
                Lồng tiếng video AI, TikTok Shorts, Review Phim, Kể chuyện, Podcast, Giảng dạy và Trò chơi
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Không giới hạn lượt tạo
            </span>
            <span className="inline-flex items-center gap-1 bg-blue-950/60 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg">
              <FileCheck className="w-3.5 h-3.5 text-blue-400" /> Xuất MP3 & WAV
            </span>
          </div>
        </div>

        {/* Workspace 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Voice Picker (5 Cols on Large) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <VoiceSelector
              selectedVoiceId={selectedVoice.id}
              onSelectVoice={handleSelectVoice}
            />

            {/* Feature Highlights Card */}
            <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-800/80 flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400" /> Điểm Nổi Bật Của VietVoice AI
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Hơn 36 giọng đọc Bắc, Trung, Nam
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  Nhân vật Anime, Game & Thiếu Nhi
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Hiệu ứng DSP Reverb, ASMR & Robot
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                  Hòa trộn nhạc nền BGM tự động
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Trợ lý AI thêm dấu ngắt nghỉ mượt mà
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Tải file MP3 320kbps & WAV Studio
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Script Editor, Settings & Player (7 Cols on Large) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* 1. Script Text Editor with AI assistants */}
            <ScriptEditor
              text={scriptText}
              onChangeText={setScriptText}
              onApplyVoice={(voiceId) => {
                const found = VIETNAMESE_VOICES.find((v) => v.id === voiceId);
                if (found) handleSelectVoice(found);
              }}
              speed={settings.speed}
            />

            {/* 2. Audio Settings (Speed, Pitch, Volume, DSP Effects, BGM, Format) */}
            <AudioSettingsPanel
              settings={settings}
              onChangeSettings={setSettings}
              defaultPitch={selectedVoice.defaultPitch}
              defaultSpeed={selectedVoice.defaultSpeed}
            />

            {/* 3. Master Audio Player & 1-Click Fast Download Section */}
            <AudioPlayerSection
              item={currentAudio}
              isGenerating={isGenerating}
              progressPercent={progressPercent}
              progressStep={progressStep}
              onGenerate={handleGenerateAudio}
              canGenerate={Boolean(scriptText.trim())}
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all border border-indigo-400/30"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span>Xem các công cụ AI tool khác: aitoolmmo.top</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} VietVoice AI. Hoàn toàn miễn phí, không giới hạn lượt dùng.</span>
          <span>Hỗ trợ xuất định dạng MP3 (320kbps) & WAV Studio Lossless</span>
        </div>
      </footer>
    </div>
  );
}

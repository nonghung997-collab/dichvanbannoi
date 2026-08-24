import React from "react";
import { Mic, Sparkles, ExternalLink, History, Users, Flame } from "lucide-react";

interface NavbarProps {
  onOpenHistory: () => void;
  onOpenDialogue: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  onOpenDialogue,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/30">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                VietVoice AI
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                <Sparkles className="w-3 h-3" /> 36+ Giọng Miễn Phí
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Chuyển văn bản thành giọng nói nhân vật chuẩn tiếng Việt
            </p>
          </div>
        </div>

        {/* User-Requested Direct Partner Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Affiliate Link 1 */}
          <a
            id="partner-hungnv-nav"
            href="https://hungnv.click"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-md hover:shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            title="Xem hệ thống kinh doanh tại hungnv.click"
          >
            <Flame className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>Hệ thống kinh doanh</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          {/* Affiliate Link 2 */}
          <a
            id="partner-aitoolmmo-nav"
            href="https://aitoolmmo.top"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md hover:shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap border border-indigo-400/30"
            title="Xem các công cụ AI tool khác tại aitoolmmo.top"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Công cụ AI Tool</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          {/* Dialogue Mode Button */}
          <button
            id="btn-open-dialogue"
            onClick={onOpenDialogue}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors whitespace-nowrap"
            title="Chế độ lồng tiếng đối thoại nhiều nhân vật"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Lồng tiếng</span> Đối Thoại
          </button>

          {/* History Drawer Toggle */}
          <button
            id="btn-open-history"
            onClick={onOpenHistory}
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors"
            title="Lịch sử âm thanh đã tạo"
          >
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Lịch sử</span>
            {historyCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {historyCount > 9 ? "9+" : historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

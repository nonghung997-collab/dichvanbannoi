import React from "react";
import { ExternalLink, Flame, Sparkles, TrendingUp, Zap } from "lucide-react";

export const PartnerBanner: React.FC = () => {
  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-y border-indigo-500/20 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm text-center md:text-left">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-200">
            Tạo giọng AI không giới hạn • Chuẩn 36+ phong cách tiếng Việt • Tải MP3/WAV miễn phí
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {/* Link 1: Hungnv.click */}
          <a
            id="partner-banner-hungnv"
            href="https://hungnv.click"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all transform hover:-translate-y-0.5"
          >
            <Flame className="w-3.5 h-3.5 fill-slate-950 text-slate-950 group-hover:scale-110 transition-transform" />
            <span>Xem hệ thống kinh doanh tại đây: hungnv.click</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70 group-hover:opacity-100" />
          </a>

          {/* Link 2: Aitoolmmo.top */}
          <a
            id="partner-banner-aitoolmmo"
            href="https://aitoolmmo.top"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all transform hover:-translate-y-0.5 border border-purple-400/30"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300 group-hover:scale-110 transition-transform" />
            <span>Xem các công cụ AI tool khác: aitoolmmo.top</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70 group-hover:opacity-100" />
          </a>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  GitMerge,
  Database,
  Activity,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab = 'Dashboard' | 'Materials' | 'Review' | 'Registry';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  backendOnline: boolean | null;
  pendingReviewsCount?: number;
}

const navItems: { label: NavTab; icon: React.ComponentType<{ className?: string }>; badgeKey?: string }[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Materials', icon: Boxes },
  { label: 'Review', icon: GitMerge, badgeKey: 'review' },
  { label: 'Registry', icon: Database },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  backendOnline,
  pendingReviewsCount = 0,
}) => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800 bg-slate-950/60">
        <div className="h-9 w-9 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold">
          <Layers className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-wide text-white">NUMM</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              CPSE
            </span>
          </div>
          <span className="text-[11px] text-slate-400 truncate max-w-[160px]">
            National Material Master
          </span>
        </div>
      </div>

      {/* Scope Badge */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="uppercase tracking-wider font-medium text-[10px] text-slate-300">
            Govt. of India Enterprise Network
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Master Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.label;
          const badgeValue = item.badgeKey === 'review' && pendingReviewsCount > 0 ? pendingReviewsCount : null;

          return (
            <button
              key={item.label}
              onClick={() => onSelectTab(item.label)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors group text-left",
                isActive
                  ? "bg-slate-800 text-white border-l-2 border-amber-500 shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {badgeValue !== null && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {badgeValue}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Hardcoded Demo Admin User in Sidebar Bottom */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-xs">
          DA
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-slate-200 truncate">Demo Admin</span>
          <span className="text-[10px] text-slate-400 truncate">demo.admin@numm.gov.in</span>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-slate-400" />
            <span>FastAPI (:8000)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                backendOnline === true
                  ? "bg-emerald-500 animate-pulse"
                  : backendOnline === false
                  ? "bg-rose-500"
                  : "bg-amber-400 animate-pulse"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium",
                backendOnline === true ? "text-emerald-400" : backendOnline === false ? "text-rose-400" : "text-amber-400"
              )}
            >
              {backendOnline === true ? "Connected" : backendOnline === false ? "Offline" : "Polling..."}
            </span>
          </span>
        </div>
      </div>
    </aside>
  );
};

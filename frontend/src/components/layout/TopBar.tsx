import React from 'react';
import {
  Building2,
  ChevronDown,
  UserCheck,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  currentTab: string;
  selectedCpse: string;
  onSelectCpse: (cpse: string) => void;
  onRefreshHealth: () => void;
  isCheckingHealth: boolean;
  onResetDemoData?: () => void;
  isResettingDemo?: boolean;
}

const cpseList = [
  { code: 'ALL', name: 'All CPSEs (Consolidated View)' },
  { code: 'ONGC', name: 'ONGC (Oil and Natural Gas Corp)' },
  { code: 'BHEL', name: 'BHEL (Bharat Heavy Electricals)' },
  { code: 'NTPC', name: 'NTPC Limited' },
  { code: 'SAIL', name: 'SAIL (Steel Authority of India)' },
  { code: 'CIL', name: 'Coal India Limited' },
];

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  selectedCpse,
  onSelectCpse,
  onRefreshHealth,
  isCheckingHealth,
  onResetDemoData,
  isResettingDemo = false,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm flex-shrink-0 z-10">
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>NUMM Portal</span>
            <span>/</span>
            <span className="font-medium text-slate-700">{currentTab}</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
            {currentTab}
          </h1>
        </div>
      </div>

      {/* Right: Reset Demo Data, CPSE selector, Health ping, Demo Admin User */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Data Button */}
        {onResetDemoData && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetDemoData}
            disabled={isResettingDemo}
            className="border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-900 text-xs font-semibold"
            title="Reset dataset, re-run RapidFuzz, regenerate CNMCs, and repopulate review queue"
          >
            <RotateCcw className={`h-3.5 w-3.5 mr-1 text-amber-600 ${isResettingDemo ? 'animate-spin' : ''}`} />
            {isResettingDemo ? 'Resetting Demo...' : 'Reset Demo Data'}
          </Button>
        )}

        {/* CPSE Selector Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-2.5 py-1.5 rounded-md">
          <Building2 className="h-3.5 w-3.5 text-slate-600" />
          <select
            value={selectedCpse}
            onChange={(e) => onSelectCpse(e.target.value)}
            aria-label="Filter CPSE Master"
            className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer pr-1"
          >
            {cpseList.map((cpse) => (
              <option key={cpse.code} value={cpse.code}>
                {cpse.code} - {cpse.name}
              </option>
            ))}
          </select>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Refresh API Health Button */}
        <button
          onClick={onRefreshHealth}
          disabled={isCheckingHealth}
          title="Verify Core API health (:8000/health)"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isCheckingHealth ? 'animate-spin text-amber-600' : ''}`} />
        </button>

        <div className="h-5 w-px bg-slate-200" />

        {/* Hardcoded Demo Admin User */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="h-8 w-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-semibold text-xs border border-slate-700">
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">Demo Admin</span>
            <span className="text-[10px] text-slate-500 font-mono">DPE / CPSE-GATEWAY</span>
          </div>
        </div>
      </div>
    </header>
  );
};

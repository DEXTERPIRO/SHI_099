import { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import {
  Boxes,
  GitMerge,
  Database,
  Layers,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';

interface HealthResponse {
  status: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('Dashboard');
  const [selectedCpse, setSelectedCpse] = useState<string>('ALL');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthTimestamp, setHealthTimestamp] = useState<string>('');

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('http://localhost:8000/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data: HealthResponse = await res.json();
        if (data.status === 'ok') {
          setBackendOnline(true);
          setHealthTimestamp(new Date().toLocaleTimeString());
        } else {
          setBackendOnline(false);
        }
      } else {
        setBackendOnline(false);
      }
    } catch {
      setBackendOnline(false);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        backendOnline={backendOnline}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          currentTab={activeTab}
          selectedCpse={selectedCpse}
          onSelectCpse={setSelectedCpse}
          onRefreshHealth={checkHealth}
          isCheckingHealth={isCheckingHealth}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Service Banner */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-md ${
                  backendOnline
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {backendOnline ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    National Material Master Harmonization Engine
                  </h2>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                      backendOnline
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {backendOnline ? 'Backend Online (:8000)' : 'Connecting to Core API...'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connected to FastAPI backend with SQLAlchemy session and RapidFuzz deduplication pipeline.
                  {healthTimestamp && ` Last ping: ${healthTimestamp}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium px-3 py-1.5 rounded bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1.5"
              >
                <span>API Swagger Docs</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Key CPSE Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-medium">Total Raw Catalog Items</span>
                <Boxes className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">1,428,950</span>
                <span className="text-[11px] font-medium text-emerald-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +12.4k
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Ingested from 14 CPSE ERP instances</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-medium">Harmonized Common Codes</span>
                <Database className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">894,120</span>
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  NUMM Standard
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">62.6% deduplication compression</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-medium">Matching Queue</span>
                <GitMerge className="h-4 w-4 text-amber-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">42</span>
                <span className="text-[11px] font-medium text-amber-600">Pending Review</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Fuzzy confidence threshold &gt; 85%</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-medium">Participating CPSEs</span>
                <Layers className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">14 / 24</span>
                <span className="text-[11px] font-medium text-slate-600">Active Nodes</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">ONGC, BHEL, NTPC, IOCL, SAIL</p>
            </div>
          </div>

          {/* Detailed Section Placeholder based on Active Tab */}
          {activeTab === 'Dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Ingestion & Harmonization status */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Cross-CPSE Ingestion Streams
                    </h3>
                    <p className="text-xs text-slate-500">
                      Active data harmonization pipelines from enterprise SAP, Oracle, and legacy ERPs
                    </p>
                  </div>
                  <button className="text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded px-2.5 py-1">
                    Manage Connectors
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {[
                    {
                      cpse: 'ONGC',
                      system: 'SAP ECC 6.0 (Upstream Ops)',
                      items: '421,500 items',
                      status: 'Synchronized',
                      rate: '99.4% mapped',
                    },
                    {
                      cpse: 'BHEL',
                      system: 'SAP S/4HANA (Turbine & Heavy Eng)',
                      items: '310,240 items',
                      status: 'Processing Stream',
                      rate: '92.1% mapped',
                    },
                    {
                      cpse: 'NTPC',
                      system: 'Oracle ERP Cloud (Power Plants)',
                      items: '284,100 items',
                      status: 'Synchronized',
                      rate: '97.8% mapped',
                    },
                    {
                      cpse: 'SAIL',
                      system: 'Custom SAP R/3 (Steel Units)',
                      items: '189,450 items',
                      status: 'Pending Batch',
                      rate: '88.3% mapped',
                    },
                  ].map((stream) => (
                    <div key={stream.cpse} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                          {stream.cpse.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-2">
                            <span>{stream.cpse}</span>
                            <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {stream.system}
                            </span>
                          </div>
                          <span className="text-slate-500 text-[11px]">{stream.items}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-700 block">{stream.rate}</span>
                        <span className="text-[11px] text-emerald-600 font-medium">{stream.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Col: Recent Audit & Deduplication Actions */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
                <div className="px-5 py-4 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">Audit & Harmonization Activity</h3>
                  <p className="text-xs text-slate-500">Immutable ledger events</p>
                </div>
                <div className="p-4 space-y-4 flex-1 text-xs">
                  {[
                    {
                      title: 'Common Code Assigned',
                      desc: 'NUMM-0082-9921 linked for Seamless Carbon Steel Pipe 4" Sch 40 across ONGC & IOCL',
                      time: '12m ago',
                      user: 'AI Pipeline (98% conf)',
                    },
                    {
                      title: 'Duplicate Merged',
                      desc: 'Ball Bearing 6205-2RS merged across BHEL & NTPC inventories',
                      time: '45m ago',
                      user: 'Nodal Officer (BHEL)',
                    },
                    {
                      title: 'UNSPSC Taxonomy Mapped',
                      desc: 'Class 40141600 (Valves) mapped to 124 legacy CPSE internal codings',
                      time: '2h ago',
                      user: 'Master Admin',
                    },
                  ].map((act, i) => (
                    <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-b-0">
                      <Clock className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800">{act.title}</div>
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{act.desc}</p>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {act.time} • <span className="font-medium text-slate-600">{act.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'Dashboard' && (
            <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{activeTab} Module</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    National Unified Material Master enterprise interface for {activeTab.toLowerCase()}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md bg-white hover:bg-slate-50 text-slate-700">
                    <Filter className="h-3.5 w-3.5 text-slate-500" />
                    <span>Filter</span>
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md">
                    <span>Export Ledger</span>
                  </button>
                </div>
              </div>

              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 mb-3">
                  <FileCheck className="h-6 w-6 text-slate-500" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">
                  {activeTab} Workspace Active
                </h4>
                <p className="text-xs text-slate-500 max-w-md mt-1">
                  Ready to ingest CPSE records, trigger RapidFuzz + Sentence Transformers deduplication jobs, and assign unified NUMM identifiers.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

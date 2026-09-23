import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Boxes,
  GitMerge,
  Database,
  Clock,
  Play,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  Layers,
  BarChart3,
  PieChart as PieChartIcon,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DuplicateSummary {
  total_materials: number;
  duplicate_groups: number;
  estimated_savings: number;
}

interface ClusterItem {
  cluster_id: number;
  match_type: string;
  primary_material: {
    id: number;
    cpse_material_code: string;
    description: string;
    cpse_id: number;
  };
  materials: Array<{
    id: number;
    cpse_material_code: string;
    description: string;
    cpse_id: number;
    score?: number;
    duplicate_type?: string;
  }>;
  count: number;
}

interface DashboardPageProps {
  onNavigateTab: (tab: 'Materials' | 'Review' | 'Registry') => void;
  onResetDemoData?: () => void;
  isResettingDemo?: boolean;
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onResetDemoData,
  isResettingDemo = false,
}) => {
  const [summary, setSummary] = useState<DuplicateSummary | null>(null);
  const [clusters, setClusters] = useState<ClusterItem[]>([]);
  const [cnmcCount, setCnmcCount] = useState<number>(10);
  const [pendingReviews, setPendingReviews] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [runningEngine, setRunningEngine] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Materials by CPSE chart data
  const [cpseData, setCpseData] = useState([
    { cpse: 'ONGC', materials: 20, activeCodes: 18 },
    { cpse: 'SAIL', materials: 20, activeCodes: 19 },
    { cpse: 'NTPC', materials: 20, activeCodes: 17 },
    { cpse: 'CIL', materials: 20, activeCodes: 19 },
    { cpse: 'BHEL', materials: 20, activeCodes: 18 },
  ]);

  // Duplicate Groups by Category chart data
  const [categoryData, setCategoryData] = useState([
    { name: 'Bearings', groups: 2, items: 6 },
    { name: 'Valves', groups: 3, items: 9 },
    { name: 'Pipes', groups: 2, items: 6 },
    { name: 'Motors', groups: 1, items: 3 },
    { name: 'Fasteners', groups: 2, items: 6 },
  ]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, clusRes, revRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/duplicates/summary`),
        fetch(`${API_BASE_URL}/api/duplicates/clusters`),
        fetch(`${API_BASE_URL}/api/review`),
      ]);

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }
      if (clusRes.ok) {
        const clusData: ClusterItem[] = await clusRes.json();
        setClusters(clusData);

        // Derive dynamic category distribution if clusters available
        if (clusData.length > 0) {
          const catCount: Record<string, { groups: number; items: number }> = {
            Bearings: { groups: 0, items: 0 },
            Valves: { groups: 0, items: 0 },
            Pipes: { groups: 0, items: 0 },
            Motors: { groups: 0, items: 0 },
            Fasteners: { groups: 0, items: 0 },
          };

          clusData.forEach((c) => {
            const desc = c.primary_material.description.toLowerCase();
            let cat = 'Fasteners';
            if (desc.includes('bearing') || desc.includes('brg')) cat = 'Bearings';
            else if (desc.includes('valve') || desc.includes('vlv')) cat = 'Valves';
            else if (desc.includes('pipe')) cat = 'Pipes';
            else if (desc.includes('motor')) cat = 'Motors';

            catCount[cat] = catCount[cat] || { groups: 0, items: 0 };
            catCount[cat].groups += 1;
            catCount[cat].items += c.count;
          });

          setCategoryData(
            Object.entries(catCount)
              .filter(([_, v]) => v.groups > 0)
              .map(([name, v]) => ({ name, groups: v.groups, items: v.items }))
          );
        }
      }
      if (revRes.ok) {
        const revData = await revRes.json();
        if (Array.isArray(revData)) {
          const pending = revData.filter((r) => r.status === 'pending').length;
          setPendingReviews(pending);
          const uniqueCnmc = new Set(revData.map((r) => r.cnmc_code).filter(Boolean));
          setCnmcCount(uniqueCnmc.size > 0 ? uniqueCnmc.size : 10);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRunMatching = async () => {
    setRunningEngine(true);
    setActionMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/matching/run`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(
          `RapidFuzz engine ran successfully: ${data.materials_processed} materials compared, ${data.candidates_stored} candidate pairs stored.`
        );
        fetchDashboardData();
      } else {
        setActionMessage('Matching engine run failed. Check backend service.');
      }
    } catch {
      setActionMessage('Failed to communicate with matching engine backend.');
    } finally {
      setRunningEngine(false);
    }
  };

  const totalMaterials = summary ? summary.total_materials : 100;
  const duplicateGroups = summary ? summary.duplicate_groups : 6;

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl shadow-md border border-slate-700">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold tracking-tight">Executive Harmonization Dashboard</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Consolidated enterprise overview of material standardization, cross-CPSE duplicate detection, and unified catalog governance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onResetDemoData && (
            <Button
              onClick={onResetDemoData}
              disabled={isResettingDemo}
              variant="outline"
              className="border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-medium text-xs shadow-sm"
              title="Reset dataset, re-run RapidFuzz, regenerate CNMCs, and repopulate review queue"
            >
              <RotateCcw className={`h-3.5 w-3.5 mr-1 text-amber-400 ${isResettingDemo ? 'animate-spin' : ''}`} />
              {isResettingDemo ? 'Resetting Demo...' : 'Reset Demo Data'}
            </Button>
          )}
          <Button
            onClick={handleRunMatching}
            disabled={runningEngine}
            variant="default"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-sm"
          >
            <Play className={`h-4 w-4 fill-current ${runningEngine ? 'animate-spin' : ''}`} />
            {runningEngine ? 'Running RapidFuzz...' : 'Run Matching Engine'}
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Materials */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Materials
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Boxes className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalMaterials.toLocaleString()}
            </div>
            <CardDescription className="text-[11px] text-slate-500 mt-1">
              Ingested across 5 CPSE ERP masters
            </CardDescription>
          </CardContent>
        </Card>

        {/* Card 2: Duplicate Groups */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Duplicate Groups
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <GitMerge className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {duplicateGroups}
            </div>
            <CardDescription className="text-[11px] text-slate-500 mt-1">
              Identified clusters (&gt; 75 token sort)
            </CardDescription>
          </CardContent>
        </Card>

        {/* Card 3: CNMC Created */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              CNMC Created
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Database className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {cnmcCount}
            </div>
            <CardDescription className="text-[11px] text-slate-500 mt-1">
              Unified national codes registered
            </CardDescription>
          </CardContent>
        </Card>

        {/* Card 4: Pending Reviews */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Reviews
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {pendingReviews}
            </div>
            <CardDescription className="text-[11px] text-slate-500 mt-1">
              Awaiting master nodal validation
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* 2 Recharts Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Materials by CPSE */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Materials by CPSE
              </CardTitle>
              <CardDescription>
                Catalog volume ingested per Central Public Sector Enterprise
              </CardDescription>
            </div>
            <Badge variant="outline">5 Enterprises</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cpseData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="cpse" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#475569' }} domain={[0, 25]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar
                    dataKey="materials"
                    name="Ingested Materials"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="activeCodes"
                    name="Standardized Codes"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Duplicate Groups by Category */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-amber-600" />
                Duplicate Groups by Category
              </CardTitle>
              <CardDescription>
                Distribution of identified duplicate clusters across material categories
              </CardDescription>
            </div>
            <Badge variant="outline">{duplicateGroups} Clusters Total</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#475569' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar
                    dataKey="groups"
                    name="Duplicate Groups"
                    fill="#f59e0b"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="items"
                    name="Redundant Material Items"
                    fill="#8b5cf6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Duplicate Groups Overview Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Active Duplicate Clusters</CardTitle>
            <CardDescription>
              Groups identified across ONGC, BHEL, NTPC, SAIL, and CIL records
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab('Review')}
          >
            Go to Review Queue
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Cluster</TableHead>
                <TableHead className="w-28">Match Type</TableHead>
                <TableHead>Primary ERP Description</TableHead>
                <TableHead className="w-28">Enterprise Code</TableHead>
                <TableHead className="w-24 text-center">Items</TableHead>
                <TableHead className="w-36 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    Loading duplicate clusters...
                  </TableCell>
                </TableRow>
              ) : clusters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    No duplicate clusters found. Click &quot;Run Matching Engine&quot; to detect duplicates.
                  </TableCell>
                </TableRow>
              ) : (
                clusters.map((c) => (
                  <TableRow key={c.cluster_id}>
                    <TableCell className="font-mono font-medium">#{c.cluster_id}</TableCell>
                    <TableCell>
                      <Badge variant={c.match_type === 'exact' ? 'success' : 'warning'}>
                        {c.match_type === 'exact' ? 'Exact (>90)' : 'Near (>75)'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {c.primary_material.description}
                    </TableCell>
                    <TableCell className="font-mono text-slate-600 text-[11px]">
                      {c.primary_material.cpse_material_code}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                        {c.count} items
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onNavigateTab('Registry')}
                      >
                        Harmonize
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

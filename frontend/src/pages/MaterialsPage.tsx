import React, { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
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
  Search,
  Filter,
  Sparkles,
  X,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface MaterialItem {
  id: number;
  cpse_id: number;
  cpse_material_code: string;
  description: string;
  unit_of_measure?: string;
  status?: string;
  cpse?: {
    id: number;
    code: string;
    name: string;
  };
}

interface MatchCandidate {
  candidate_id: number;
  description: string;
  score: number;
}

export const MaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCpse, setSelectedCpse] = useState('ALL');

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvedSuccess, setApprovedSuccess] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/materials?limit=100`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      if (selectedCpse !== 'ALL') {
        url += `&cpse=${encodeURIComponent(selectedCpse)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMaterials(data);
      }
    } catch (err) {
      console.error('Failed to load materials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [selectedCpse]);

  const handleRowClick = async (mat: MaterialItem) => {
    setSelectedMaterial(mat);
    setDrawerOpen(true);
    setApprovedSuccess(false);
    setLoadingCandidates(true);
    try {
      const res = await fetch(`${API_URL}/api/matching/candidates/${mat.id}`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      console.error('Failed to fetch candidates', err);
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedMaterial) return;
    setApproving(true);
    try {
      const res = await fetch(`${API_URL}/api/materials/${selectedMaterial.id}/approve`, {
        method: 'POST',
      });
      if (res.ok) {
        setApprovedSuccess(true);
        // Update local state
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === selectedMaterial.id ? { ...m, status: 'Approved' } : m
          )
        );
        setSelectedMaterial((prev) => (prev ? { ...prev, status: 'Approved' } : null));
      }
    } catch (err) {
      console.error('Failed to approve match', err);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Search and Filter Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by description or material code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMaterials()}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-md">
                <Filter className="h-3.5 w-3.5 text-slate-500" />
                <select
                  aria-label="Filter by CPSE"
                  value={selectedCpse}
                  onChange={(e) => setSelectedCpse(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All CPSEs</option>
                  <option value="ONGC">ONGC</option>
                  <option value="SAIL">SAIL</option>
                  <option value="NTPC">NTPC</option>
                  <option value="CIL">CIL</option>
                  <option value="BHEL">BHEL</option>
                </select>
              </div>
              <Button onClick={fetchMaterials} size="sm">
                Apply Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Searchable Material Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">Materials Catalog</CardTitle>
            <CardDescription>
              Click any row to open the inspection drawer, view suggested RapidFuzz matches, and approve.
            </CardDescription>
          </div>
          <Badge variant="outline">{materials.length} records</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">CPSE</TableHead>
                <TableHead className="w-40">Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-28 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-400">
                    Loading materials...
                  </TableCell>
                </TableRow>
              ) : materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-400">
                    No materials found.
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((mat) => {
                  const isSelected = selectedMaterial?.id === mat.id && drawerOpen;
                  const isApproved = mat.status?.toLowerCase() === 'approved';

                  return (
                    <TableRow
                      key={mat.id}
                      onClick={() => handleRowClick(mat)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-50/80 hover:bg-amber-100/70 border-l-4 border-l-amber-500'
                          : 'hover:bg-slate-50/90'
                      }`}
                    >
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-[10px] font-semibold">
                          {mat.cpse?.code || `CPSE #${mat.cpse_id}`}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-medium text-slate-800 text-[11px]">
                        {mat.cpse_material_code}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 text-xs">
                        {mat.description}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={isApproved ? 'success' : 'warning'}
                          className="capitalize"
                        >
                          {mat.status || 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Drawer Overlay / Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Slide-in Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedMaterial && (
          <>
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h3 className="font-semibold text-slate-900 text-sm">Material Match Details</h3>
              </div>
              <button
                aria-label="Close drawer"
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Description Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Source Material
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {selectedMaterial.cpse_material_code}
                  </Badge>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Description:</label>
                  <p className="text-xs font-medium text-slate-900 mt-0.5 leading-relaxed">
                    {selectedMaterial.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>CPSE: {selectedMaterial.cpse?.code || selectedMaterial.cpse_id}</span>
                  <Badge
                    variant={selectedMaterial.status?.toLowerCase() === 'approved' ? 'success' : 'warning'}
                  >
                    {selectedMaterial.status || 'Pending'}
                  </Badge>
                </div>
              </div>

              {approvedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Material match approved successfully!</span>
                </div>
              )}

              {/* Suggested Matches Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Suggested Matches
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {candidates.length} candidates
                  </span>
                </div>

                {loadingCandidates ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Loading suggested matches...
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs border border-dashed rounded-lg">
                    No matching candidates found. Run matching engine from Dashboard.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {candidates.map((cand, idx) => {
                      const isExact = cand.score >= 90;
                      const isNear = cand.score >= 75;

                      return (
                        <div
                          key={cand.candidate_id || idx}
                          className="p-3.5 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-500 font-semibold">
                              Item #{cand.candidate_id}
                            </span>
                            {/* Confidence Score */}
                            <Badge
                              variant={isExact ? 'success' : isNear ? 'warning' : 'secondary'}
                              className="font-semibold text-[11px]"
                            >
                              Confidence: {cand.score.toFixed(1)}%
                            </Badge>
                          </div>

                          <p className="text-xs font-medium text-slate-800 leading-snug">
                            {cand.description}
                          </p>

                          {/* Confidence Progress Bar */}
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isExact
                                  ? 'bg-emerald-500'
                                  : isNear
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              }`}
                              style={{ width: `${Math.min(cand.score, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer with Approve Button */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDrawerOpen(false)}
                className="w-1/3"
              >
                Close
              </Button>
              <Button
                variant="success"
                size="sm"
                disabled={approving || selectedMaterial.status?.toLowerCase() === 'approved'}
                onClick={handleApprove}
                className="flex-1 font-semibold"
              >
                {approving ? (
                  'Approving...'
                ) : selectedMaterial.status?.toLowerCase() === 'approved' ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Approved
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve Match
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

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
  Database,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  Tag,
  ArrowRight,
  Layers,
} from 'lucide-react';

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
  }>;
  count: number;
}

interface CNMCRecord {
  id: number;
  cnmc_code: string;
  standardized_description: string;
  category?: string;
  uom?: string;
}

export const CNMCRegistryPage: React.FC = () => {
  const [clusters, setClusters] = useState<ClusterItem[]>([]);
  const [generatedCodes, setGeneratedCodes] = useState<CNMCRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingClusterId, setGeneratingClusterId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchClustersAndCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/duplicates/clusters`);
      if (res.ok) {
        const data = await res.json();
        setClusters(data);
      }
    } catch (err) {
      console.error('Failed to load clusters', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClustersAndCodes();
  }, []);

  const handleGenerateCNMC = async (clusterId: number) => {
    setGeneratingClusterId(clusterId);
    setNotification(null);
    try {
      const res = await fetch(`${API_URL}/api/cnmc/generate/${clusterId}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data: CNMCRecord = await res.json();
        setGeneratedCodes((prev) => [data, ...prev.filter((c) => c.cnmc_code !== data.cnmc_code)]);
        setNotification(
          `Generated CNMC code: ${data.cnmc_code} for Cluster #${clusterId} (${data.category || 'Standard'}). Added to Review Queue!`
        );
      } else {
        setNotification(`Failed to generate CNMC code for Cluster #${clusterId}.`);
      }
    } catch (err) {
      console.error('Generate CNMC error', err);
      setNotification('Server error while generating CNMC code.');
    } finally {
      setGeneratingClusterId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-slate-900 font-bold text-base">
            <Database className="h-5 w-5 text-amber-600" />
            <span>Common National Material Code (CNMC) Registry</span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Harmonized registry standardizing cross-CPSE items with standardized format:
            <code className="mx-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">
              NUM-BRG-001
            </code>
            ,
            <code className="mx-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">
              NUM-VLV-001
            </code>
            ,
            <code className="mx-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">
              NUM-PIP-001
            </code>
            ,
            <code className="mx-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">
              NUM-MTR-001
            </code>
            .
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Section 1: Standardized / Generated CNMC Codes */}
      {generatedCodes.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-amber-900">
                  Newly Created CNMC Records
                </CardTitle>
                <CardDescription>
                  Recently registered standardized master codes linked to duplicate groups
                </CardDescription>
              </div>
              <Badge variant="warning">{generatedCodes.length} Registered</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">CNMC Code</TableHead>
                  <TableHead className="w-28">Category</TableHead>
                  <TableHead>Standardized Description</TableHead>
                  <TableHead className="w-20 text-center">UOM</TableHead>
                  <TableHead className="w-24 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedCodes.map((rec) => (
                  <TableRow key={rec.cnmc_code}>
                    <TableCell className="font-mono font-bold text-amber-600 text-xs">
                      {rec.cnmc_code}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {rec.category || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 text-xs">
                      {rec.standardized_description}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">
                      {rec.uom || 'NOS'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="success">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Section 2: Duplicate Clusters Available for CNMC Generation */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">
              Clusters Eligible for CNMC Standardization
            </CardTitle>
            <CardDescription>
              Select longest ERP description, calculate common UOM, and assign category prefix automatically
            </CardDescription>
          </div>
          <Badge variant="outline">{clusters.length} Candidate Clusters</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Cluster</TableHead>
                <TableHead className="w-24">Type</TableHead>
                <TableHead>Primary ERP Description</TableHead>
                <TableHead className="w-24 text-center">Duplicates</TableHead>
                <TableHead className="w-48 text-right">Standardize</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                    Loading candidate clusters...
                  </TableCell>
                </TableRow>
              ) : clusters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                    No duplicate clusters found. Run matching engine from Dashboard.
                  </TableCell>
                </TableRow>
              ) : (
                clusters.map((c) => {
                  const isGenerating = generatingClusterId === c.cluster_id;
                  const isAlreadyGenerated = generatedCodes.some(
                    (g) => g.standardized_description.toLowerCase().includes(c.primary_material.description.slice(0, 15).toLowerCase())
                  );

                  return (
                    <TableRow key={c.cluster_id}>
                      <TableCell className="font-mono font-medium">#{c.cluster_id}</TableCell>
                      <TableCell>
                        <Badge variant={c.match_type === 'exact' ? 'success' : 'warning'}>
                          {c.match_type === 'exact' ? 'Exact' : 'Near'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-900 text-xs">
                            {c.primary_material.description}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {c.primary_material.cpse_material_code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-slate-700">
                        {c.count} items
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={isAlreadyGenerated ? 'outline' : 'default'}
                          size="sm"
                          disabled={isGenerating}
                          onClick={() => handleGenerateCNMC(c.cluster_id)}
                          className={
                            isAlreadyGenerated
                              ? 'text-emerald-700 border-emerald-300 bg-emerald-50'
                              : 'bg-slate-900 hover:bg-slate-800'
                          }
                        >
                          <Sparkles className={`h-3.5 w-3.5 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                          {isGenerating
                            ? 'Generating...'
                            : isAlreadyGenerated
                            ? 'Regenerate CNMC'
                            : 'Generate CNMC'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

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
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  GitMerge,
  ArrowRight,
} from 'lucide-react';

interface ReviewItem {
  id: number;
  material_id: number;
  material_code?: string;
  material_description?: string;
  cnmc_id: number;
  cnmc_code?: string;
  standardized_description?: string;
  confidence_score?: number;
  match_method: string;
  status: 'pending' | 'approved' | 'rejected' | string;
}

export const ReviewQueuePage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:8000/api/review';
      if (activeFilter !== 'all') {
        url += `?status=${activeFilter}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [activeFilter]);

  const handleApprove = async (id: number) => {
    setActionInProgress(id);
    try {
      const res = await fetch(`http://localhost:8000/api/review/${id}/approve`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: updated.status } : item))
        );
      }
    } catch (err) {
      console.error('Approve failed', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionInProgress(id);
    try {
      const res = await fetch(`http://localhost:8000/api/review/${id}/reject`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: updated.status } : item))
        );
      }
    } catch (err) {
      console.error('Reject failed', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Top Filter and Stats Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('all')}
              >
                All ({reviews.length})
              </Button>
              <Button
                variant={activeFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('pending')}
                className={activeFilter === 'pending' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                <Clock className="h-3.5 w-3.5 mr-1" />
                Pending ({pendingCount})
              </Button>
              <Button
                variant={activeFilter === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('approved')}
                className={activeFilter === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Approved ({approvedCount})
              </Button>
              <Button
                variant={activeFilter === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('rejected')}
                className={activeFilter === 'rejected' ? 'bg-rose-600 hover:bg-rose-700' : ''}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Rejected ({rejectedCount})
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchReviews}
              disabled={loading}
              title="Refresh Review Queue"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review Queue Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Harmonization Review Queue</CardTitle>
            <CardDescription>
              Validate proposed legacy ERP mappings into standard National Unified Material Codes
            </CardDescription>
          </div>
          <Badge variant="outline">{reviews.length} items</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead className="w-1/3">Source Enterprise Record</TableHead>
                <TableHead className="w-1/3">Target Standardized CNMC</TableHead>
                <TableHead className="w-24 text-center">Score</TableHead>
                <TableHead className="w-24 text-center">Status</TableHead>
                <TableHead className="w-36 text-right">Review Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    Loading review queue mappings...
                  </TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    No mappings found in review queue. Generate CNMC codes from Registry to populate mappings.
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((item) => {
                  const isPending = item.status === 'pending';
                  const isProcessing = actionInProgress === item.id;

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-slate-500 font-medium">
                        #{item.id}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] text-slate-500 font-semibold">
                            {item.material_code || `MAT #${item.material_id}`}
                          </span>
                          <p className="font-medium text-slate-900 text-xs">
                            {item.material_description || 'No description'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                            {item.cnmc_code || `CNMC #${item.cnmc_id}`}
                          </span>
                          <p className="text-slate-800 text-xs font-medium">
                            {item.standardized_description || 'Standard code'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            (item.confidence_score ?? 100) >= 90
                              ? 'success'
                              : (item.confidence_score ?? 100) >= 75
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {item.confidence_score != null
                            ? `${item.confidence_score.toFixed(0)}%`
                            : '100%'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            item.status === 'approved'
                              ? 'success'
                              : item.status === 'rejected'
                              ? 'destructive'
                              : 'warning'
                          }
                          className="capitalize"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="success"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleApprove(item.id)}
                              className="h-7 text-[11px] px-2.5"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleReject(item.id)}
                              className="h-7 text-[11px] px-2.5"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 capitalize font-medium">
                            {item.status}
                          </span>
                        )}
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

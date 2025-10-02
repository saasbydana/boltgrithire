"use client";

import { useEffect, useState } from "react";
import { supabase, type Assessment } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader as Loader2, Plus, Download, Eye, Filter } from "lucide-react";
import { CreateAssessmentDialog } from "@/components/admin/create-assessment-dialog";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [recommendationFilter, setRecommendationFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, []);

  useEffect(() => {
    filterAssessments();
  }, [assessments, searchTerm, statusFilter, recommendationFilter]);

  const loadAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (err) {
      console.error('Error loading assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAssessments = () => {
    let filtered = [...assessments];

    if (searchTerm) {
      filtered = filtered.filter(
        a =>
          a.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.candidate_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    if (recommendationFilter !== "all") {
      filtered = filtered.filter(a => a.recommendation === recommendationFilter);
    }

    setFilteredAssessments(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", label: "Pending" },
      in_progress: { variant: "default", label: "In Progress" },
      completed: { variant: "default", label: "Completed" }
    };

    const config = variants[status] || variants.pending;

    return (
      <Badge variant={config.variant} className={
        status === 'completed' ? 'bg-green-100 text-green-800' :
        status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
        'bg-gray-100 text-gray-800'
      }>
        {config.label}
      </Badge>
    );
  };

  const getRecommendationBadge = (recommendation: string | null) => {
    if (!recommendation) return <span className="text-gray-400">-</span>;

    const config = {
      green: { bg: 'bg-green-100', text: 'text-green-800', label: 'Proceed' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Interview' },
      red: { bg: 'bg-red-100', text: 'text-red-800', label: 'Reject' }
    }[recommendation];

    if (!config) return null;

    return (
      <Badge className={`${config.bg} ${config.text}`}>
        {config.label}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Status',
      'Composite Score',
      'SJT Score',
      'Grit Score',
      'Self-Learning Score',
      'Loyalty Score',
      'Recommendation',
      'Created At',
      'Completed At'
    ];

    const rows = filteredAssessments.map(a => [
      a.candidate_name,
      a.candidate_email,
      a.status,
      a.composite_score?.toFixed(2) || '-',
      a.sjt_score?.toFixed(2) || '-',
      a.grit_score?.toFixed(2) || '-',
      a.self_learning_score?.toFixed(2) || '-',
      a.loyalty_score?.toFixed(2) || '-',
      a.recommendation || '-',
      format(new Date(a.created_at), 'yyyy-MM-dd HH:mm'),
      a.completed_at ? format(new Date(a.completed_at), 'yyyy-MM-dd HH:mm') : '-'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grithire-assessments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GritHire Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage candidate assessments and review results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total Assessments</p>
            <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {assessments.filter(a => a.status === 'completed').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {assessments.filter(a => a.status === 'in_progress').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-gray-600">
              {assessments.filter(a => a.status === 'pending').length}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={recommendationFilter} onValueChange={setRecommendationFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by recommendation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recommendations</SelectItem>
                <SelectItem value="green">Green (Proceed)</SelectItem>
                <SelectItem value="yellow">Yellow (Interview)</SelectItem>
                <SelectItem value="red">Red (Reject)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 mb-6">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      No assessments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{assessment.candidate_name}</p>
                          <p className="text-sm text-gray-500">{assessment.candidate_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                      <TableCell>
                        {assessment.composite_score ? (
                          <span className="font-mono font-semibold">
                            {assessment.composite_score.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getRecommendationBadge(assessment.recommendation)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {format(new Date(assessment.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/results/${assessment.invite_token}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {showCreateDialog && (
        <CreateAssessmentDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            loadAssessments();
          }}
        />
      )}
    </div>
  );
}

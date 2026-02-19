import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import StatusBadge from "@/components/StatusBadge";
import { FileText, Eye } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function AdminSubmissions() {
  const [filter, setFilter] = useState("all");

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ["agentChecklists"],
    queryFn: () => base44.entities.AgentChecklist.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.ChecklistTemplate.list(),
  });

  const getAgentName = (agentId) => {
    const u = users.find((u) => u.id === agentId);
    return u ? u.full_name || u.email : "—";
  };

  const getTemplateName = (templateId) => {
    const t = templates.find((t) => t.id === templateId);
    return t ? t.name : "—";
  };

  const filteredChecklists = checklists.filter(cl => {
    if (filter === "all") return true;
    if (filter === "pending") return cl.status === "submitted";
    if (filter === "approved") return cl.status === "approved";
    if (filter === "revision") return cl.status === "revision_requested";
    return true;
  });

  return (
    <div className="p-8 lg:p-10 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submissions</h1>
        <p className="text-sm text-slate-400 mt-1">Review agent checklist submissions</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="revision">Revision Requested</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !filteredChecklists.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No submissions found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100">
                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agent Name</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Template</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitted</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChecklists.map((cl) => (
                <TableRow key={cl.id} className="border-slate-50 hover:bg-slate-25 transition-colors">
                  <TableCell className="font-medium text-slate-900">{getAgentName(cl.agent)}</TableCell>
                  <TableCell className="text-slate-600 text-sm">{getTemplateName(cl.source_template)}</TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {cl.submitted_at ? format(new Date(cl.submitted_at), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell><StatusBadge status={cl.status} /></TableCell>
                  <TableCell>
                    <Link to={createPageUrl(`SubmissionReview?id=${cl.id}`)}>
                      <Button variant="ghost" size="sm" className="gap-2 text-blue-600 hover:text-blue-700">
                        <Eye className="w-4 h-4" />
                        Review
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
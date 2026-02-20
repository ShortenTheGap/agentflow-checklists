import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatusBadge from "@/components/StatusBadge";
import ReviewSectionCard from "@/components/submissions/ReviewSectionCard";
import { format } from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function SubmissionReview() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const checklistId = urlParams.get("id");

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: checklist } = useQuery({
    queryKey: ["checklist", checklistId],
    queryFn: () => base44.entities.AgentChecklist.filter({ id: checklistId }).then(r => r[0]),
    enabled: !!checklistId,
  });

  const { data: agent } = useQuery({
    queryKey: ["agent", checklist?.agent],
    queryFn: () => base44.entities.User.filter({ id: checklist.agent }).then(r => r[0]),
    enabled: !!checklist?.agent,
  });

  const { data: template } = useQuery({
    queryKey: ["template", checklist?.source_template],
    queryFn: () => base44.entities.ChecklistTemplate.filter({ id: checklist.source_template }).then(r => r[0]),
    enabled: !!checklist?.source_template,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["agentSections", checklistId],
    queryFn: () => base44.entities.AgentSection.filter({ agent_checklist: checklistId }),
    enabled: !!checklistId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["agentTasks", checklistId],
    queryFn: async () => {
      const secs = await base44.entities.AgentSection.filter({ agent_checklist: checklistId });
      const sectionIds = secs.map(s => s.id);
      if (sectionIds.length === 0) return [];
      const allTasks = await base44.entities.AgentTask.list();
      return allTasks.filter(t => sectionIds.includes(t.agent_section));
    },
    enabled: !!checklistId,
  });

  const { data: originalTasks = [] } = useQuery({
    queryKey: ["originalTasks", template?.id],
    queryFn: async () => {
      if (!template?.id) return [];
      const allTasks = await base44.entities.TemplateTask.list();
      return allTasks;
    },
    enabled: !!template?.id,
  });

  const sortedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order);

  const getStats = () => {
    const allTasks = tasks.filter(t => sections.some(s => s.id === t.agent_section));
    const originalCount = allTasks.filter(t => t.source_task).length;
    return {
      total: originalCount,
      kept: allTasks.filter(t => !t.is_deleted && !t.is_modified && t.source_task).length,
      modified: allTasks.filter(t => !t.is_deleted && t.is_modified).length,
      deleted: allTasks.filter(t => t.is_deleted).length,
      added: allTasks.filter(t => !t.is_deleted && !t.source_task).length,
    };
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    await base44.entities.AgentChecklist.update(checklistId, {
      status: "approved",
      approved_at: new Date().toISOString()
    });
    await base44.entities.User.update(agent.id, { status: "approved" });
    queryClient.invalidateQueries();
    setApproveModalOpen(false);
    setIsProcessing(false);
  };

  const handleRequestRevision = async () => {
    setIsProcessing(true);
    await base44.entities.AgentChecklist.update(checklistId, {
      status: "revision_requested",
      revision_notes: revisionNotes
    });
    await base44.entities.User.update(agent.id, { status: "customizing" });
    queryClient.invalidateQueries();
    setRevisionModalOpen(false);
    setIsProcessing(false);
  };

  if (!checklist || !agent || !template) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4 mb-3">
            <Link to={createPageUrl("AdminSubmissions")}>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">
                {agent.full_name || agent.email}'s Checklist
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {template.name} • Submitted {checklist.submitted_at ? format(new Date(checklist.submitted_at), "MMM d, yyyy") : "—"}
              </p>
            </div>
            <StatusBadge status={checklist.status} />
          </div>

          {checklist.status === "submitted" && (
            <div className="flex items-center gap-3 ml-14">
              <Button 
                onClick={() => setApproveModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
              <Button 
                onClick={() => setRevisionModalOpen(true)}
                variant="outline"
                className="rounded-xl gap-2 border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <AlertCircle className="w-4 h-4" />
                Request Revision
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 mb-8">
          <h3 className="font-semibold text-slate-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-xs text-slate-500 mt-1">Original Tasks</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-slate-600">{stats.kept}</div>
              <div className="text-xs text-slate-500 mt-1">Kept Unchanged</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.modified}</div>
              <div className="text-xs text-slate-500 mt-1">Modified</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.deleted}</div>
              <div className="text-xs text-slate-500 mt-1">Deleted</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.added}</div>
              <div className="text-xs text-slate-500 mt-1">Added</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {sortedSections.map((section) => (
            <ReviewSectionCard
              key={section.id}
              section={section}
              tasks={tasks}
              originalTasks={originalTasks}
            />
          ))}
        </div>
      </div>

      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Approve Checklist
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              Are you sure you want to approve this checklist? The agent will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isProcessing ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={revisionModalOpen} onOpenChange={setRevisionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Request Revision
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              Provide feedback for the agent to review and make changes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
              Revision Notes
            </Label>
            <Textarea 
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Explain what needs to be changed..."
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevisionModalOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestRevision}
              disabled={isProcessing || !revisionNotes.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isProcessing ? "Requesting..." : "Request Revision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
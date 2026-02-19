import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import StatusBadge from "@/components/StatusBadge";
import { FileText } from "lucide-react";
import { format } from "date-fns";

export default function AdminSubmissions() {
  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ["agentChecklists"],
    queryFn: () => base44.entities.AgentChecklist.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const getAgentName = (agentId) => {
    const u = users.find((u) => u.id === agentId);
    return u ? u.full_name || u.email : "—";
  };

  return (
    <div className="p-8 lg:p-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submissions</h1>
        <p className="text-sm text-slate-400 mt-1">Review agent checklist submissions</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : !checklists.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 text-slate-400">
          <FileText className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">No submissions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {checklists.map((cl) => (
            <div key={cl.id} className="bg-white rounded-2xl border border-slate-100 px-6 py-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div>
                <p className="font-medium text-slate-900">{getAgentName(cl.agent)}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submitted: {cl.submitted_at ? format(new Date(cl.submitted_at), "MMM d, yyyy") : "—"}
                </p>
              </div>
              <StatusBadge status={cl.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
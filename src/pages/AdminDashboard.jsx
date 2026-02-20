import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/admin/StatsCard";
import AgentTable from "@/components/admin/AgentTable";
import { Button } from "@/components/ui/button";
import { Users, Clock, Pencil, Send, CheckCircle, Download } from "lucide-react";

export default function AdminDashboard() {
  const [isExporting, setIsExporting] = useState(false);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: userTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ["userTypes"],
    queryFn: () => base44.entities.UserType.list(),
  });

  const agents = users.filter((u) => u.role === "agent");
  const pendingSetup = agents.filter((a) => a.status === "pending_setup" || !a.status).length;
  const customizing = agents.filter((a) => a.status === "customizing").length;
  const submitted = agents.filter((a) => a.status === "submitted").length;
  const approved = agents.filter((a) => a.status === "approved").length;

  const downloadJSON = async (functionName, filename) => {
    setIsExporting(true);
    const response = await base44.functions.invoke(functionName);
    const blob = new Blob([JSON.stringify(response.data)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    setIsExporting(false);
  };

  const handleExportTemplates = () => downloadJSON('exportTemplates', 'templates_export.json');
  const handleExportUserTypes = () => downloadJSON('exportUserTypes', 'user_types_export.json');

  return (
    <div className="p-8 lg:p-10 max-w-7xl">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Overview of agent onboarding progress</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleExportUserTypes} 
            disabled={isExporting}
            className="gap-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export User Types'}
          </Button>
          <Button 
            onClick={handleExportTemplates} 
            disabled={isExporting}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export Templates'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatsCard label="Total Agents" value={agents.length} icon={Users} color="slate" />
        <StatsCard label="Pending Setup" value={pendingSetup} icon={Clock} color="amber" />
        <StatsCard label="Customizing" value={customizing} icon={Pencil} color="blue" />
        <StatsCard label="Submitted" value={submitted} icon={Send} color="purple" />
        <StatsCard label="Approved" value={approved} icon={CheckCircle} color="emerald" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">All Agents</h2>
        </div>
        <AgentTable agents={agents} userTypes={userTypes} isLoading={usersLoading || typesLoading} />
      </div>
    </div>
  );
}
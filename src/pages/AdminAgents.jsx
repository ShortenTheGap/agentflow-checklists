import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import AgentTable from "@/components/admin/AgentTable";

export default function AdminAgents() {
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: userTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ["userTypes"],
    queryFn: () => base44.entities.UserType.list(),
  });

  const agents = users.filter((u) => u.role === "agent");

  return (
    <div className="p-8 lg:p-10 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agents</h1>
        <p className="text-sm text-slate-400 mt-1">Manage all onboarding agents</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <AgentTable agents={agents} userTypes={userTypes} isLoading={usersLoading || typesLoading} />
      </div>
    </div>
  );
}
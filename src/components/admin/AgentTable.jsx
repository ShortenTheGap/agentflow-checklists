import React from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/StatusBadge";
import { format } from "date-fns";
import { User } from "lucide-react";

export default function AgentTable({ agents, userTypes, isLoading }) {
  const getUserTypeName = (userTypeId) => {
    const ut = userTypes.find((t) => t.id === userTypeId);
    return ut ? ut.name : "—";
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!agents.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <User className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">No agents found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-100">
          <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agent</TableHead>
          <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</TableHead>
          <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</TableHead>
          <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</TableHead>
          <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {agents.map((agent) => (
          <TableRow key={agent.id} className="border-slate-50 hover:bg-slate-25 transition-colors">
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-500">
                  {(agent.full_name || "?")[0].toUpperCase()}
                </div>
                <span className="font-medium text-slate-900">{agent.full_name || "—"}</span>
              </div>
            </TableCell>
            <TableCell className="text-slate-500 text-sm">{agent.email}</TableCell>
            <TableCell className="text-slate-600 text-sm">{getUserTypeName(agent.user_type)}</TableCell>
            <TableCell><StatusBadge status={agent.status || "pending_setup"} /></TableCell>
            <TableCell className="text-slate-400 text-sm">
              {agent.created_date ? format(new Date(agent.created_date), "MMM d, yyyy") : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
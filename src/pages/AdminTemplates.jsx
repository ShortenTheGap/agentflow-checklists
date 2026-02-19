import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ListChecks } from "lucide-react";

export default function AdminTemplates() {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.ChecklistTemplate.list(),
  });

  const { data: userTypes = [] } = useQuery({
    queryKey: ["userTypes"],
    queryFn: () => base44.entities.UserType.list(),
  });

  const getUserTypeName = (id) => {
    const ut = userTypes.find((t) => t.id === id);
    return ut ? ut.name : "—";
  };

  return (
    <div className="p-8 lg:p-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Templates</h1>
        <p className="text-sm text-slate-400 mt-1">Checklist templates for agent onboarding</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : !templates.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 text-slate-400">
          <ListChecks className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">No templates yet</p>
          <p className="text-xs text-slate-300 mt-1">Templates will be managed in a follow-up update</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-100 px-6 py-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div>
                <p className="font-medium text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">Type: {getUserTypeName(t.user_type)}</p>
              </div>
              <div className={`w-2 h-2 rounded-full ${t.is_active !== false ? "bg-emerald-400" : "bg-slate-300"}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
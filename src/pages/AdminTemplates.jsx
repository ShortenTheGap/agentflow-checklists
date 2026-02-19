import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CreateTemplateModal from "@/components/templates/CreateTemplateModal";

export default function AdminTemplates() {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.ChecklistTemplate.list(),
  });

  const { data: userTypes = [] } = useQuery({
    queryKey: ["userTypes"],
    queryFn: () => base44.entities.UserType.list(),
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: () => base44.entities.TemplateSection.list(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.TemplateTask.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ChecklistTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] }),
  });

  const getUserTypeName = (id) => {
    const ut = userTypes.find((t) => t.id === id);
    return ut ? ut.name : "—";
  };

  const getSectionCount = (templateId) => sections.filter(s => s.template === templateId).length;
  
  const getTaskCount = (templateId) => {
    const templateSections = sections.filter(s => s.template === templateId);
    return tasks.filter(t => templateSections.some(s => s.id === t.section)).length;
  };

  return (
    <div className="p-8 lg:p-10 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Templates</h1>
          <p className="text-sm text-slate-400 mt-1">Checklist templates for agent onboarding</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Create Template
        </Button>
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
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-slate-100 bg-slate-25">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Template Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">User Type</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sections</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasks</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Active</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-25 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={createPageUrl(`TemplateEditor?id=${t.id}`)} className="font-medium text-slate-900 hover:text-blue-600">
                      {t.name}
                    </Link>
                    {t.description && <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{getUserTypeName(t.user_type)}</td>
                  <td className="px-6 py-4 text-center text-slate-900 font-semibold">{getSectionCount(t.id)}</td>
                  <td className="px-6 py-4 text-center text-slate-900 font-semibold">{getTaskCount(t.id)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className={`w-2 h-2 rounded-full mx-auto ${t.is_active !== false ? "bg-emerald-400" : "bg-slate-300"}`} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={createPageUrl(`TemplateEditor?id=${t.id}`)}>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteMutation.mutate(t.id)} 
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateTemplateModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
        userTypes={userTypes.filter(ut => ut.is_active !== false)} 
      />
    </div>
  );
}
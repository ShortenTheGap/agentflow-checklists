import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, FolderKanban, Download } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminUserTypes() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", is_active: true });
  const [isExporting, setIsExporting] = useState(false);

  const { data: userTypes = [], isLoading } = useQuery({
    queryKey: ["userTypes"],
    queryFn: () => base44.entities.UserType.list(),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.ChecklistTemplate.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const getTemplateCount = (userTypeId) => templates.filter(t => t.user_type === userTypeId).length;
  const getAgentCount = (userTypeId) => users.filter(u => u.role === "agent" && u.user_type === userTypeId).length;

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.UserType.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["userTypes"] }); closeDialog(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserType.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["userTypes"] }); closeDialog(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UserType.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["userTypes"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (ut) => {
    setEditing(ut);
    setForm({ name: ut.name, description: ut.description || "", is_active: ut.is_active !== false });
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const handleSave = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="p-8 lg:p-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Types</h1>
          <p className="text-sm text-slate-400 mt-1">Define agent categories for checklist templates</p>
        </div>
        <Button onClick={openCreate} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Add Type
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : !userTypes.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 text-slate-400">
          <FolderKanban className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">No user types yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {userTypes.map((ut) => (
            <div key={ut.id} className="bg-white rounded-2xl border border-slate-100 px-6 py-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-6 flex-1">
                <div className={`w-2 h-2 rounded-full ${ut.is_active !== false ? "bg-emerald-400" : "bg-slate-300"}`} />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{ut.name}</p>
                  {ut.description && <p className="text-xs text-slate-400 mt-0.5">{ut.description}</p>}
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-slate-900">{getTemplateCount(ut.id)}</p>
                    <p className="text-xs text-slate-400">Templates</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900">{getAgentCount(ut.id)}</p>
                    <p className="text-xs text-slate-400">Agents</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="icon" onClick={() => openEdit(ut)} className="text-slate-400 hover:text-slate-600">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => updateMutation.mutate({ id: ut.id, data: { ...ut, is_active: !ut.is_active } })} 
                  className="text-slate-400 hover:text-amber-500"
                  title={ut.is_active !== false ? "Deactivate" : "Activate"}
                >
                  {ut.is_active !== false ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit User Type" : "New User Type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Buyer Attorney" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" className="mt-1.5" rows={3} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-slate-700">Active</Label>
              <Switch checked={form.is_active} onCheckedChange={(val) => setForm({ ...form, is_active: val })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name} className="bg-slate-900 hover:bg-slate-800 text-white">
              {editing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
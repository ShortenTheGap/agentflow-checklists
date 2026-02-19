import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ full_name: "", email: "", role: "agent", user_type: "" });
  const [isCreating, setIsCreating] = useState(false);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: userTypes = [] } = useQuery({
    queryKey: ["userTypes"],
    queryFn: () => base44.entities.UserType.list(),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.ChecklistTemplate.list(),
  });

  const activeUserTypes = userTypes.filter(ut => ut.is_active !== false);

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ full_name: "", email: "", role: "agent", user_type: "" });
    setDialogOpen(true);
  };

  const openEdit = async (user) => {
    setEditing(user);
    setForm({ 
      full_name: user.full_name || "", 
      email: user.email, 
      role: user.role || "agent", 
      user_type: user.user_type || "" 
    });
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditing(null); setIsCreating(false); };

  const duplicateTemplate = async (userId, userTypeId) => {
    const template = templates.find(t => t.user_type === userTypeId && t.is_active !== false);
    if (!template) {
      console.log("No template found for user type:", userTypeId);
      return null;
    }

    const agentChecklist = await base44.entities.AgentChecklist.create({
      agent: userId,
      source_template: template.id,
      status: "draft"
    });

    const [sections, allTasks] = await Promise.all([
      base44.entities.TemplateSection.filter({ template: template.id }),
      base44.entities.TemplateTask.list()
    ]);

    const sortedSections = sections.sort((a, b) => a.sort_order - b.sort_order);
    
    const sectionPromises = sortedSections.map(async (section) => {
      const agentSection = await base44.entities.AgentSection.create({
        agent_checklist: agentChecklist.id,
        source_section: section.id,
        name: section.name,
        sort_order: section.sort_order,
        is_deleted: false
      });

      const sectionTasks = allTasks
        .filter(t => t.section === section.id)
        .sort((a, b) => a.sort_order - b.sort_order);

      const taskData = sectionTasks.map(task => ({
        agent_section: agentSection.id,
        source_task: task.id,
        name: task.name,
        sort_order: task.sort_order,
        notes: task.notes || "",
        is_deleted: false,
        is_modified: false
      }));

      if (taskData.length > 0) {
        await base44.entities.AgentTask.bulkCreate(taskData);
      }

      return agentSection;
    });

    await Promise.all(sectionPromises);

    return agentChecklist.id;
  };

  const handleSave = async () => {
    setIsCreating(true);
    try {
      if (editing) {
        const updateData = {
          role: form.role,
          user_type: form.role === "agent" ? form.user_type : null,
        };

        if (form.role === "agent" && form.user_type && !editing.user_type) {
          const checklistId = await duplicateTemplate(editing.id, form.user_type);
          updateData.status = checklistId ? "customizing" : "pending_setup";
        }

        await base44.entities.User.update(editing.id, updateData);
        queryClient.invalidateQueries({ queryKey: ["users"] });
        closeDialog();
      } else {
        await base44.functions.invoke('createUser', {
          full_name: form.full_name,
          email: form.email,
          role: form.role,
          status: "pending_setup"
        });
        
        await queryClient.invalidateQueries({ queryKey: ["users"] });
        closeDialog();
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error: " + (error.message || "Failed to save user"));
      setIsCreating(false);
    }
  };

  const getUserTypeName = (userTypeId) => {
    const ut = userTypes.find(t => t.id === userTypeId);
    return ut ? ut.name : "—";
  };

  return (
    <div className="p-8 lg:p-10 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="text-sm text-slate-400 mt-1">Manage admin users and agents</p>
        </div>
        <Button onClick={openCreate} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {usersLoading ? (
          <div className="space-y-3 p-6">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : !users.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <UsersIcon className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100">
                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-slate-50 hover:bg-slate-25 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-500">
                        {(user.full_name || user.email || "?")[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-900">{user.full_name || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">{user.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                      user.role === "admin" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {user.role === "admin" ? "Admin" : "Agent"}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">{user.role === "agent" ? getUserTypeName(user.user_type) : "—"}</TableCell>
                  <TableCell>
                    {user.role === "agent" ? <StatusBadge status={user.status || "pending_setup"} /> : <span className="text-slate-400 text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {user.created_date ? format(new Date(user.created_date), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(user)} className="text-slate-400 hover:text-slate-600">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(user.id)} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!editing && (
              <>
                <div>
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name *</Label>
                  <Input 
                    value={form.full_name} 
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })} 
                    placeholder="John Doe" 
                    className="mt-1.5" 
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email *</Label>
                  <Input 
                    type="email"
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    placeholder="john@example.com" 
                    className="mt-1.5" 
                  />
                </div>
              </>
            )}
            <div>
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Role *</Label>
              <Select 
                value={form.role} 
                onValueChange={(val) => setForm({ ...form, role: val, user_type: val === "admin" ? "" : form.user_type })}
                disabled={!!editing}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editing && form.role === "agent" && (
              <div>
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">User Type {!editing.user_type && "*"}</Label>
                <Select value={form.user_type} onValueChange={(val) => setForm({ ...form, user_type: val })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeUserTypes.map(ut => (
                      <SelectItem key={ut.id} value={ut.id}>{ut.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!editing.user_type && form.user_type && (
                  <p className="text-xs text-slate-500 mt-1.5">Assigning a user type will create their checklist template</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isCreating}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={(!editing && (!form.full_name || !form.email)) || isCreating} 
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {isCreating ? (editing ? "Saving..." : "Inviting...") : editing ? "Save Changes" : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
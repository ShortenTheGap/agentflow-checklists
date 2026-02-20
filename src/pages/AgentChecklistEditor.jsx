import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import AgentSectionCard from "@/components/agent/AgentSectionCard";
import AgentTaskModal from "@/components/agent/AgentTaskModal";
import SubmitConfirmModal from "@/components/agent/SubmitConfirmModal";
import { format } from "date-fns";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AgentChecklistEditor() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [addingSectionName, setAddingSectionName] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingSectionId, setDeletingSectionId] = useState(null);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
    };
    load();
  }, []);

  const { data: checklist } = useQuery({
    queryKey: ["agentChecklist", user?.id],
    queryFn: async () => {
      const lists = await base44.entities.AgentChecklist.filter({ agent: user.id });
      return lists[0];
    },
    enabled: !!user?.id,
  });

  const { data: template } = useQuery({
    queryKey: ["template", checklist?.source_template],
    queryFn: () => base44.entities.ChecklistTemplate.filter({ id: checklist.source_template }).then(r => r[0]),
    enabled: !!checklist?.source_template,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["agentSections", checklist?.id],
    queryFn: () => base44.entities.AgentSection.filter({ agent_checklist: checklist.id }),
    enabled: !!checklist?.id,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["agentTasks", checklist?.id],
    queryFn: async () => {
      const secs = await base44.entities.AgentSection.filter({ agent_checklist: checklist.id });
      const sectionIds = secs.map(s => s.id);
      if (sectionIds.length === 0) return [];
      const allTasks = await base44.entities.AgentTask.list();
      return allTasks.filter(t => sectionIds.includes(t.agent_section));
    },
    enabled: !!checklist?.id,
  });

  const createSectionMutation = useMutation({
    mutationFn: (data) => base44.entities.AgentSection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentSections", checklist.id] });
      setShowAddSection(false);
      setAddingSectionName("");
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AgentSection.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agentSections", checklist.id] }),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.AgentTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentTasks", checklist.id] });
      setTaskModalOpen(false);
      setEditingTask(null);
      setCurrentSectionId(null);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AgentTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentTasks", checklist.id] });
      setTaskModalOpen(false);
      setEditingTask(null);
    },
  });

  const sortedSections = [...sections].filter(s => !s.is_deleted).sort((a, b) => a.sort_order - b.sort_order);
  const readOnly = checklist?.status === "submitted" || checklist?.status === "approved";

  const handleAddSection = () => {
    if (!addingSectionName.trim()) return;
    const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.sort_order)) : 0;
    createSectionMutation.mutate({
      agent_checklist: checklist.id,
      name: addingSectionName,
      sort_order: maxOrder + 1,
      is_deleted: false,
      source_section: null
    });
  };

  const handleDeleteSection = (sectionId) => {
    setDeletingSectionId(sectionId);
  };

  const confirmDeleteSection = () => {
    const sectionTasks = tasks.filter(t => t.agent_section === deletingSectionId);
    sectionTasks.forEach(task => {
      updateTaskMutation.mutate({ id: task.id, data: { is_deleted: true } });
    });
    updateSectionMutation.mutate({ id: deletingSectionId, data: { is_deleted: true } });
    setDeletingSectionId(null);
  };

  const handleAddTask = (sectionId) => {
    setCurrentSectionId(sectionId);
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = (formData) => {
    if (editingTask) {
      const isModified = editingTask.source_task && (
        formData.name !== editingTask.name ||
        formData.task_type !== editingTask.task_type ||
        formData.action_type !== editingTask.action_type ||
        formData.timing_trigger !== editingTask.timing_trigger ||
        formData.notes !== editingTask.notes
      );
      updateTaskMutation.mutate({ 
        id: editingTask.id, 
        data: { ...formData, is_modified: isModified } 
      });
    } else {
      const sectionTasks = tasks.filter(t => t.agent_section === currentSectionId);
      const maxOrder = sectionTasks.length > 0 ? Math.max(...sectionTasks.map(t => t.sort_order)) : 0;
      createTaskMutation.mutate({
        ...formData,
        agent_section: currentSectionId,
        sort_order: maxOrder + 1,
        source_task: null,
        is_deleted: false,
        is_modified: false,
        resource_tags: [],
        visibility: "internal"
      });
    }
  };

  const handleDeleteTask = (taskId) => {
    updateTaskMutation.mutate({ id: taskId, data: { is_deleted: true } });
  };

  const handleUndoTask = (taskId) => {
    updateTaskMutation.mutate({ id: taskId, data: { is_deleted: false } });
  };

  const handleUpdateTaskNotes = (taskId, notes) => {
    updateTaskMutation.mutate({ id: taskId, data: { notes } });
  };

  const onDragEnd = async (result) => {
    if (!result.destination || readOnly) return;

    const { source, destination, type } = result;

    if (type === "section") {
      const reordered = Array.from(sortedSections);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);

      reordered.forEach((section, index) => {
        if (section.sort_order !== index) {
          updateSectionMutation.mutate({ id: section.id, data: { sort_order: index } });
        }
      });
    } else if (type === "task") {
      const sectionId = source.droppableId;
      const sectionTasks = tasks.filter(t => t.agent_section === sectionId).sort((a, b) => a.sort_order - b.sort_order);
      const reordered = Array.from(sectionTasks);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);

      reordered.forEach((task, index) => {
        if (task.sort_order !== index) {
          updateTaskMutation.mutate({ id: task.id, data: { sort_order: index } });
        }
      });
    }
  };

  const getStats = () => {
    const allTasks = tasks.filter(t => sections.some(s => s.id === t.agent_section && !s.is_deleted));
    return {
      kept: allTasks.filter(t => !t.is_deleted && !t.is_modified && t.source_task).length,
      modified: allTasks.filter(t => !t.is_deleted && t.is_modified).length,
      deleted: allTasks.filter(t => t.is_deleted).length,
      added: allTasks.filter(t => !t.is_deleted && !t.source_task).length,
    };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await base44.entities.AgentChecklist.update(checklist.id, {
      status: "submitted",
      submitted_at: new Date().toISOString()
    });
    await base44.auth.updateMe({ status: "submitted" });
    queryClient.invalidateQueries();
    setSubmitModalOpen(false);
    setIsSubmitting(false);
  };

  const activeTasks = tasks.filter(t => !t.is_deleted && sections.some(s => s.id === t.agent_section && !s.is_deleted));
  const totalTasks = tasks.filter(t => sections.some(s => s.id === t.agent_section && !s.is_deleted)).length;

  if (!checklist || !template) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {checklist.status === "revision_requested" && checklist.revision_notes && (
        <div className="bg-orange-50 border-b border-orange-200 sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-900 text-sm">Revision Requested by Admin</p>
              <p className="text-sm text-orange-700 mt-1">{checklist.revision_notes}</p>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">
              {template.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {template.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!readOnly && (
              <Button 
                onClick={() => setSubmitModalOpen(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2"
              >
                <Send className="w-4 h-4" />
                Submit for Review
              </Button>
            )}
            {readOnly && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Submitted
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => base44.auth.logout()} className="text-slate-400 hover:text-slate-600">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections" type="section" isDropDisabled={readOnly}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                {sortedSections.map((section, index) => (
                  <AgentSectionCard
                    key={section.id}
                    section={section}
                    index={index}
                    tasks={tasks}
                    onDeleteSection={handleDeleteSection}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onUndoTask={handleUndoTask}
                    onUpdateTaskNotes={handleUpdateTaskNotes}
                    readOnly={readOnly}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {!readOnly && (
          <div className="mt-6">
            {showAddSection ? (
              <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Input 
                    value={addingSectionName}
                    onChange={(e) => setAddingSectionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddSection();
                      if (e.key === "Escape") { setShowAddSection(false); setAddingSectionName(""); }
                    }}
                    placeholder="Section name"
                    className="flex-1"
                    autoFocus
                  />
                  <Button onClick={handleAddSection} disabled={!addingSectionName.trim()}>
                    Add
                  </Button>
                  <Button variant="outline" onClick={() => { setShowAddSection(false); setAddingSectionName(""); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddSection(true)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            )}
          </div>
        )}
      </div>

      <AgentTaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        task={editingTask}
        onSave={handleSaveTask}
        readOnly={readOnly}
      />

      <SubmitConfirmModal
        open={submitModalOpen}
        onOpenChange={setSubmitModalOpen}
        stats={getStats()}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <AlertDialog open={!!deletingSectionId} onOpenChange={() => setDeletingSectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all tasks in this section. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSection} className="bg-red-600 hover:bg-red-700">
              Delete Section
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
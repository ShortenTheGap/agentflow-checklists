import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Pencil, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import SectionCard from "@/components/templates/SectionCard";
import TaskModal from "@/components/templates/TaskModal";

export default function TemplateEditor() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get("id");

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [addingSectionName, setAddingSectionName] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingTemplateName, setEditingTemplateName] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  const { data: template } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => base44.entities.ChecklistTemplate.filter({ id: templateId }).then(r => r[0]),
    enabled: !!templateId,
  });

  const { data: userTypes = [] } = useQuery({
    queryKey: ["userTypes"],
    queryFn: () => base44.entities.UserType.list(),
  });

  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ["sections", templateId],
    queryFn: () => base44.entities.TemplateSection.filter({ template: templateId }),
    enabled: !!templateId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", templateId],
    queryFn: async () => {
      const secs = await base44.entities.TemplateSection.filter({ template: templateId });
      const sectionIds = secs.map(s => s.id);
      if (sectionIds.length === 0) return [];
      const allTasks = await base44.entities.TemplateTask.list();
      return allTasks.filter(t => sectionIds.includes(t.section));
    },
    enabled: !!templateId,
  });

  const createSectionMutation = useMutation({
    mutationFn: (data) => base44.entities.TemplateSection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", templateId] });
      setShowAddSection(false);
      setAddingSectionName("");
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TemplateSection.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sections", templateId] }),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id) => base44.entities.TemplateSection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", templateId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", templateId] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.TemplateTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", templateId] });
      setTaskModalOpen(false);
      setEditingTask(null);
      setCurrentSectionId(null);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TemplateTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", templateId] });
      setTaskModalOpen(false);
      setEditingTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => base44.entities.TemplateTask.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", templateId] }),
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ChecklistTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template", templateId] });
      setEditingTemplateName(false);
    },
  });

  const sortedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order);

  const getUserTypeName = (id) => {
    const ut = userTypes.find(t => t.id === id);
    return ut ? ut.name : "—";
  };

  const handleAddSection = () => {
    if (!addingSectionName.trim()) return;
    const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.sort_order)) : 0;
    createSectionMutation.mutate({
      template: templateId,
      name: addingSectionName,
      sort_order: maxOrder + 1,
    });
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

  const handleUpdateTaskNotes = (taskId, notes) => {
    updateTaskMutation.mutate({ id: taskId, data: { notes } });
  };

  const handleSaveTask = (formData) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data: formData });
    } else {
      const sectionTasks = tasks.filter(t => t.section === currentSectionId);
      const maxOrder = sectionTasks.length > 0 ? Math.max(...sectionTasks.map(t => t.sort_order)) : 0;
      createTaskMutation.mutate({
        ...formData,
        section: currentSectionId,
        sort_order: maxOrder + 1,
      });
    }
  };

  const handleEditTemplateName = () => {
    setNewTemplateName(template.name);
    setEditingTemplateName(true);
  };

  const handleSaveTemplateName = () => {
    if (!newTemplateName.trim()) return;
    updateTemplateMutation.mutate({ id: templateId, data: { name: newTemplateName.trim() } });
  };

  const handleCancelEdit = () => {
    setEditingTemplateName(false);
    setNewTemplateName("");
  };

  const handleEditDescription = () => {
    setNewDescription(template.description || "");
    setEditingDescription(true);
  };

  const handleSaveDescription = () => {
    updateTemplateMutation.mutate({ id: templateId, data: { description: newDescription.trim() } });
  };

  const handleCancelDescriptionEdit = () => {
    setEditingDescription(false);
    setNewDescription("");
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

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
      const sectionTasks = tasks.filter(t => t.section === sectionId).sort((a, b) => a.sort_order - b.sort_order);
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

  if (!template) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4 mb-3">
            <Link to={createPageUrl("AdminTemplates")}>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex-1 flex items-center gap-2">
              {editingTemplateName ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTemplateName();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    className="text-xl font-bold max-w-lg"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveTemplateName} className="text-green-600 hover:text-green-700">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-slate-900">{template.name}</h1>
                  <Button size="icon" variant="ghost" onClick={handleEditTemplateName} className="text-slate-400 hover:text-slate-600">
                    <Pencil className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {getUserTypeName(template.user_type)}
            </Badge>
          </div>
          <div className="ml-14">
            {editingDescription ? (
              <div className="flex items-start gap-2">
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) handleSaveDescription();
                    if (e.key === "Escape") handleCancelDescriptionEdit();
                  }}
                  placeholder="Template description (optional)"
                  className="text-sm flex-1 max-w-2xl"
                  rows={2}
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={handleSaveDescription} className="text-green-600 hover:text-green-700">
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancelDescriptionEdit} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                {template.description ? (
                  <p className="text-sm text-slate-500">{template.description}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">No description</p>
                )}
                <Button size="icon" variant="ghost" onClick={handleEditDescription} className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections" type="section">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                {sectionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                  </div>
                ) : sortedSections.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 py-12 text-center">
                    <p className="text-slate-400 text-sm">No sections yet. Add your first section below.</p>
                  </div>
                ) : (
                  sortedSections.map((section, index) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      index={index}
                      tasks={tasks}
                      onEditSection={(id, data) => updateSectionMutation.mutate({ id, data })}
                      onDeleteSection={deleteSectionMutation.mutate}
                      onAddTask={handleAddTask}
                      onEditTask={handleEditTask}
                      onDeleteTask={deleteTaskMutation.mutate}
                      onUpdateTaskNotes={handleUpdateTaskNotes}
                    />
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

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
      </div>

      <TaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
}
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, GripVertical, Pencil, Trash2, Plus } from "lucide-react";
import TaskRow from "./TaskRow";
import { Draggable, Droppable } from "@hello-pangea/dnd";

export default function SectionCard({ 
  section, 
  index, 
  tasks, 
  onEditSection, 
  onDeleteSection, 
  onAddTask, 
  onEditTask, 
  onDeleteTask,
  onUpdateTaskNotes
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(section.name);

  const sectionTasks = tasks.filter(t => t.section === section.id).sort((a, b) => a.sort_order - b.sort_order);

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== section.name) {
      onEditSection(section.id, { name: editedName });
    }
    setIsEditingName(false);
  };

  return (
    <Draggable draggableId={section.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white rounded-xl border border-slate-200 overflow-hidden transition-shadow ${
            snapshot.isDragging ? "shadow-lg" : ""
          }`}
        >
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
              <GripVertical className="w-4 h-4" />
            </div>
            
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {isEditingName ? (
              <Input 
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") { setEditedName(section.name); setIsEditingName(false); }
                }}
                className="h-8 font-semibold text-slate-900 flex-1"
                autoFocus
              />
            ) : (
              <h3 className="font-semibold text-slate-900 flex-1">
                {section.name} ({sectionTasks.length})
              </h3>
            )}

            <div className="flex items-center gap-1">
              {!isEditingName && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsEditingName(true)}
                  className="h-8 w-8 text-slate-400 hover:text-slate-600"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDeleteSection(section.id)}
                className="h-8 w-8 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {isExpanded && (
            <Droppable droppableId={section.id} type="task">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {sectionTasks.map((task, taskIndex) => (
                    <TaskRow 
                      key={task.id}
                      task={task}
                      index={taskIndex}
                      onEdit={() => onEditTask(task)}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  ))}
                  {provided.placeholder}
                  
                  <div className="px-5 py-3 border-t border-slate-100">
                    <button
                      onClick={() => onAddTask(section.id)}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add new task
                    </button>
                  </div>
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
}
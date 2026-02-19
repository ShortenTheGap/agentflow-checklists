import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, GripVertical, Trash2, Plus } from "lucide-react";
import AgentTaskRow from "./AgentTaskRow";
import { Draggable, Droppable } from "@hello-pangea/dnd";

export default function AgentSectionCard({ 
  section, 
  index, 
  tasks, 
  onDeleteSection, 
  onAddTask, 
  onEditTask, 
  onDeleteTask,
  onUndoTask,
  onUpdateTaskName,
  readOnly
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const sectionTasks = tasks
    .filter(t => t.agent_section === section.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const activeTasks = sectionTasks.filter(t => !t.is_deleted);

  return (
    <Draggable draggableId={section.id} index={index} isDragDisabled={readOnly}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white rounded-xl border border-slate-200 overflow-hidden transition-shadow ${
            snapshot.isDragging ? "shadow-lg" : ""
          }`}
        >
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
            {!readOnly && (
              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                <GripVertical className="w-4 h-4" />
              </div>
            )}
            
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <h3 className="font-semibold text-slate-900 flex-1">
              {section.name} ({activeTasks.length})
            </h3>

            {!readOnly && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDeleteSection(section.id)}
                className="h-8 w-8 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {isExpanded && (
            <Droppable droppableId={section.id} type="task" isDropDisabled={readOnly}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {sectionTasks.map((task, taskIndex) => (
                    <AgentTaskRow 
                      key={task.id}
                      task={task}
                      index={taskIndex}
                      onEdit={() => onEditTask(task)}
                      onDelete={onDeleteTask}
                      onUndo={onUndoTask}
                      onUpdateName={onUpdateTaskName}
                      readOnly={readOnly}
                    />
                  ))}
                  {provided.placeholder}
                  
                  {!readOnly && (
                    <div className="px-5 py-3 border-t border-slate-100">
                      <button
                        onClick={() => onAddTask(section.id)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Add new task
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
}
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GripVertical, Calendar, Pencil, Trash2, RotateCcw } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";

const actionTypeConfig = {
  email: { label: "Email", className: "bg-blue-50 text-blue-700 border-blue-200" },
  follow_up: { label: "Follow-up", className: "bg-orange-50 text-orange-700 border-orange-200" },
  call: { label: "Call", className: "bg-slate-50 text-slate-600 border-slate-200" },
};

export default function AgentTaskRow({ task, index, onEdit, onDelete, onUndo, onUpdateName, readOnly }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(task.name);

  const isMilestone = task.task_type === "milestone";
  const actionConfig = task.action_type !== "none" ? actionTypeConfig[task.action_type] : null;
  const isCustom = !task.source_task;
  const isDeleted = task.is_deleted;
  const isModified = task.is_modified;

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== task.name) {
      onUpdateName(task.id, editedName);
    }
    setIsEditingName(false);
  };

  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={readOnly || isDeleted}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`px-5 py-3 border-b border-slate-100 flex items-start gap-3 transition-colors ${
            snapshot.isDragging ? "bg-slate-50 shadow-lg" : ""
          } ${isMilestone ? "border-l-4 border-l-blue-400" : ""} ${
            isDeleted ? "bg-slate-50 opacity-60" : "hover:bg-slate-25"
          }`}
        >
          {!readOnly && !isDeleted && (
            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 mt-1">
              <GripVertical className="w-4 h-4" />
            </div>
          )}

          <div className="flex items-start gap-2 mt-0.5">
            <div className="w-5 h-5 rounded-full bg-teal-50 border-2 border-teal-400 flex items-center justify-center flex-shrink-0">
              <svg className="w-2.5 h-2.5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {isMilestone && <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />}
              
              {!readOnly && isEditingName ? (
                <Input 
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") { setEditedName(task.name); setIsEditingName(false); }
                  }}
                  className="h-7 font-medium text-slate-900 max-w-md"
                  autoFocus
                />
              ) : (
                <span 
                  className={`font-medium text-slate-900 ${isDeleted ? "line-through" : ""} ${
                    !readOnly && !isDeleted ? "cursor-pointer hover:text-blue-600" : ""
                  }`}
                  onClick={() => !readOnly && !isDeleted && setIsEditingName(true)}
                >
                  {task.name}
                </span>
              )}

              {isCustom && (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2 py-0">
                  Custom
                </Badge>
              )}
              {isModified && !isDeleted && (
                <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-0">
                  Modified
                </Badge>
              )}
              {isDeleted && (
                <Badge className="bg-red-50 text-red-700 border-red-200 text-xs px-2 py-0">
                  Deleted
                </Badge>
              )}
              
              {task.resource_tags && task.resource_tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {task.resource_tags.map((tag, i) => (
                    <Badge 
                      key={i} 
                      variant="outline" 
                      className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2 py-0"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {task.timing_trigger && (
              <p className="text-xs text-slate-400 mt-1">{task.timing_trigger}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {task.visibility === "visible_to_clients" && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2 py-0.5">
                Visible to clients
              </Badge>
            )}
            {actionConfig && (
              <Badge variant="outline" className={`${actionConfig.className} text-xs px-2 py-0.5`}>
                {actionConfig.label}
              </Badge>
            )}

            {!readOnly && (
              <>
                {isDeleted ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onUndo(task.id)}
                    className="h-7 text-blue-600 hover:text-blue-700 gap-1 text-xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Undo
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(task)}
                      className="h-7 w-7 text-slate-400 hover:text-slate-600"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(task.id)}
                      className="h-7 w-7 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
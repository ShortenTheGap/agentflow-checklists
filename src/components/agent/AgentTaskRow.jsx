import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, MoreVertical, Pencil, Trash2, RotateCcw, ChevronDown, ChevronRight, Check, X } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AgentTaskRow({ task, index, onEdit, onDelete, onUndo, onUpdateNotes, readOnly }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(task.notes || "");
  const textareaRef = useRef(null);

  const isCustom = !task.source_task;
  const isDeleted = task.is_deleted;
  const isModified = task.is_modified;

  useEffect(() => {
    if (isEditingNotes && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [isEditingNotes, editedNotes]);

  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={readOnly || isDeleted}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`px-5 py-3 border-b border-slate-100 flex items-start gap-3 transition-colors ${
            snapshot.isDragging ? "bg-slate-50 shadow-lg" : ""
          } ${isDeleted ? "bg-slate-50 opacity-60" : "hover:bg-slate-25"}`}
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
              <span className={`font-medium text-slate-900 ${isDeleted ? "line-through" : ""}`}>
                {task.name}
              </span>

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
            </div>

            {(isExpanded || isEditingNotes) && (
              <div className="mt-2">
                {isEditingNotes ? (
                  <div className="space-y-2">
                    <Textarea
                      ref={textareaRef}
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      className="text-xs resize-none"
                      rows={1}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (editedNotes !== task.notes) {
                            onUpdateNotes(task.id, editedNotes);
                          }
                          setIsEditingNotes(false);
                        }}
                        className="h-6 text-green-600 hover:text-green-700 gap-1 text-xs"
                      >
                        <Check className="w-3 h-3" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditedNotes(task.notes || "");
                          setIsEditingNotes(false);
                        }}
                        className="h-6 text-slate-400 hover:text-slate-600 gap-1 text-xs"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-900 whitespace-pre-wrap">{task.notes}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {task.notes && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isEditingNotes && editedNotes !== task.notes) {
                    onUpdateNotes(task.id, editedNotes);
                  }
                  setIsEditingNotes(false);
                  setIsExpanded(!isExpanded);
                }}
                className="h-7 w-7 text-slate-400 hover:text-slate-600"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            )}

            {!readOnly && !isDeleted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditingNotes(true)} className="gap-2">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Notes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(task)} className="gap-2">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(task.id)} className="gap-2 text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!readOnly && isDeleted && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onUndo(task.id)}
                className="h-7 text-blue-600 hover:text-blue-700 gap-1 text-xs"
              >
                <RotateCcw className="w-3 h-3" />
                Undo
              </Button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
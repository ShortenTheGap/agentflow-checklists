import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, MoreVertical, Pencil, Trash2, ChevronDown, ChevronRight, Check, X } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TaskRow({ task, index, onEdit, onDelete, onUpdateNotes }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(task.notes || "");

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`px-5 py-3 border-b border-slate-100 flex items-start gap-3 hover:bg-slate-25 transition-colors ${
            snapshot.isDragging ? "bg-slate-50 shadow-lg" : ""
          }`}
        >
          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 mt-1">
            <GripVertical className="w-4 h-4" />
          </div>

          <div className="flex items-start gap-2 mt-0.5">
            <div className="w-5 h-5 rounded-full bg-teal-50 border-2 border-teal-400 flex items-center justify-center flex-shrink-0">
              <svg className="w-2.5 h-2.5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
           <span className="font-medium text-slate-900">{task.name}</span>
           {isExpanded && task.notes && (
             <div className="mt-2">
               {isEditingNotes ? (
                 <div className="space-y-2">
                   <Textarea
                     value={editedNotes}
                     onChange={(e) => setEditedNotes(e.target.value)}
                     className="text-xs resize-none"
                     rows={4}
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
                 <p className="text-xs text-slate-500 whitespace-pre-wrap">{task.notes}</p>
               )}
             </div>
           )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {task.notes && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 w-7 text-slate-400 hover:text-slate-600"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit} className="gap-2">
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="gap-2 text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </Draggable>
  );
}
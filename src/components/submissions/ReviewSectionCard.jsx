import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReviewTaskRow from "./ReviewTaskRow";

export default function ReviewSectionCard({ section, tasks, originalTasks }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const sectionTasks = tasks
    .filter(t => t.agent_section === section.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const isDeleted = section.is_deleted;

  return (
    <div className={`bg-white rounded-xl border overflow-hidden ${isDeleted ? "border-red-200" : "border-slate-200"}`}>
      <div className={`px-5 py-4 border-b flex items-center gap-3 ${isDeleted ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <h3 className={`font-semibold text-slate-900 flex-1 ${isDeleted ? "line-through" : ""}`}>
          {section.name} ({sectionTasks.filter(t => !t.is_deleted).length})
        </h3>

        {isDeleted && (
          <Badge className="bg-red-50 text-red-700 border-red-200 text-xs px-2 py-0">
            Section Deleted
          </Badge>
        )}
      </div>

      {isExpanded && (
        <div>
          {sectionTasks.map((task) => {
            const originalTask = task.source_task ? originalTasks.find(t => t.id === task.source_task) : null;
            return (
              <ReviewTaskRow 
                key={task.id}
                task={task}
                originalTask={originalTask}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
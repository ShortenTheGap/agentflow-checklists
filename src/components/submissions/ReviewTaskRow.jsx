import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReviewTaskRow({ task, originalTask }) {
  const [showComparison, setShowComparison] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isCustom = !task.source_task;
  const isDeleted = task.is_deleted;
  const isModified = task.is_modified && originalTask;

  const changes = [];
  if (isModified && originalTask) {
    if (task.name !== originalTask.name) changes.push({ field: "Name", from: originalTask.name, to: task.name });
    if (task.notes !== originalTask.notes) changes.push({ field: "Notes", from: originalTask.notes || "—", to: task.notes || "—" });
  }

  return (
    <div className={`px-5 py-3 border-b border-slate-100 ${isDeleted ? "bg-slate-50 opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
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
                Added by Agent
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

          {isExpanded && task.notes && (
            <p className="text-xs text-slate-500 mt-2 whitespace-pre-wrap">{task.notes}</p>
          )}

          {isModified && changes.length > 0 && (
            <div className="mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowComparison(!showComparison)}
                className="h-6 text-xs gap-1 text-slate-500 hover:text-slate-700 px-2"
              >
                {showComparison ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                {showComparison ? "Hide" : "Show"} changes
              </Button>
              
              {showComparison && (
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                  {changes.map((change, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-medium text-slate-700">{change.field}:</span>
                      <div className="ml-2 mt-1">
                        <div className="text-red-600 line-through">Original: {change.from}</div>
                        <div className="text-emerald-600">Modified: {change.to}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
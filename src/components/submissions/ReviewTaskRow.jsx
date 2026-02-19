import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const actionTypeConfig = {
  email: { label: "Email", className: "bg-blue-50 text-blue-700 border-blue-200" },
  follow_up: { label: "Follow-up", className: "bg-orange-50 text-orange-700 border-orange-200" },
  call: { label: "Call", className: "bg-slate-50 text-slate-600 border-slate-200" },
};

export default function ReviewTaskRow({ task, originalTask }) {
  const [showComparison, setShowComparison] = useState(false);

  const isMilestone = task.task_type === "milestone";
  const actionConfig = task.action_type !== "none" ? actionTypeConfig[task.action_type] : null;
  const isCustom = !task.source_task;
  const isDeleted = task.is_deleted;
  const isModified = task.is_modified && originalTask;

  const changes = [];
  if (isModified && originalTask) {
    if (task.name !== originalTask.name) changes.push({ field: "Name", from: originalTask.name, to: task.name });
    if (task.task_type !== originalTask.task_type) changes.push({ field: "Type", from: originalTask.task_type, to: task.task_type });
    if (task.action_type !== originalTask.action_type) changes.push({ field: "Action", from: originalTask.action_type, to: task.action_type });
    if (task.timing_trigger !== originalTask.timing_trigger) changes.push({ field: "Timing", from: originalTask.timing_trigger || "—", to: task.timing_trigger || "—" });
  }

  return (
    <div className={`px-5 py-3 border-b border-slate-100 ${isMilestone ? "border-l-4 border-l-blue-400" : ""} ${isDeleted ? "bg-slate-50 opacity-60" : ""}`}>
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
            {isMilestone && <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />}
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
        </div>
      </div>
    </div>
  );
}
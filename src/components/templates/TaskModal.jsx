import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function TaskModal({ task, open, onOpenChange, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    notes: ""
  });

  React.useEffect(() => {
    if (open && task) {
      setFormData({
        name: task.name || "",
        notes: task.notes || ""
      });
    } else if (open && !task) {
      setFormData({
        name: "",
        notes: ""
      });
    }
  }, [open, task]);

  const handleSave = () => {
    if (!formData.name.trim()) return;
    onSave(formData);
    setFormData({ name: "", notes: "" });
    setExpandedNotes(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({ name: "", notes: "" });
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Task Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter task name"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Task Details (optional)</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add task description, instructions, or links..."
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white">
              <Check className="w-4 h-4" />
              {task ? "Save Changes" : "Add Task"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
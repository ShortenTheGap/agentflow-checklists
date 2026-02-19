import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";

export default function TaskModal({ task, open, onOpenChange, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    notes: ""
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || "",
        notes: task.notes || ""
      });
    } else {
      setFormData({
        name: "",
        notes: ""
      });
    }
  }, [task, open]);

  const handleSave = () => {
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Task Name</Label>
            <Input
              id="task-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter task name"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-notes">Task Details (optional)</Label>
            <Textarea
              id="task-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add task description, instructions, or links..."
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white">
              <Check className="w-4 h-4" />
              {task ? "Save Changes" : "Add Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
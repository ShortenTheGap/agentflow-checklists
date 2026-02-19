import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
          <DialogDescription>
            Enter the task details below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Task Name</Label>
            <Input
              id="task-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter task name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-notes">Notes (optional)</Label>
            <Textarea
              id="task-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add task description, instructions, or links..."
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              {task ? "Save Changes" : "Add Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
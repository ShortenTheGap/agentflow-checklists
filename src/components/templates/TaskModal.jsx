import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const RESOURCE_OPTIONS = [
  "Email Template",
  "Training",
  "Scripts & Training",
  "Design Asset",
  "AI",
  "AI Super Prompt"
];

export default function TaskModal({ open, onOpenChange, task, onSave }) {
  const [form, setForm] = useState({
    name: "",
    task_type: "task",
    action_type: "none",
    resource_tags: [],
    visibility: "internal",
    timing_trigger: "",
    notes: ""
  });

  useEffect(() => {
    if (task) {
      setForm({
        name: task.name || "",
        task_type: task.task_type || "task",
        action_type: task.action_type || "none",
        resource_tags: task.resource_tags || [],
        visibility: task.visibility || "internal",
        timing_trigger: task.timing_trigger || "",
        notes: task.notes || ""
      });
    } else {
      setForm({
        name: "",
        task_type: "task",
        action_type: "none",
        resource_tags: [],
        visibility: "internal",
        timing_trigger: "",
        notes: ""
      });
    }
  }, [task, open]);

  const toggleResourceTag = (tag) => {
    setForm(prev => ({
      ...prev,
      resource_tags: prev.resource_tags.includes(tag)
        ? prev.resource_tags.filter(t => t !== tag)
        : [...prev.resource_tags, tag]
    }));
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Task Name *</Label>
            <Input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              placeholder="e.g. Pre-qualify buyer" 
              className="mt-1.5" 
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 block">Task Type</Label>
            <RadioGroup value={form.task_type} onValueChange={(val) => setForm({ ...form, task_type: val })}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="task" id="task" />
                <Label htmlFor="task" className="font-normal cursor-pointer">Task</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="milestone" id="milestone" />
                <Label htmlFor="milestone" className="font-normal cursor-pointer">Milestone</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="event" id="event" />
                <Label htmlFor="event" className="font-normal cursor-pointer">Event</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Action Type</Label>
            <Select value={form.action_type} onValueChange={(val) => setForm({ ...form, action_type: val })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
                <SelectItem value="call">Call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 block">Resource Tags</Label>
            <div className="space-y-2">
              {RESOURCE_OPTIONS.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox 
                    id={option}
                    checked={form.resource_tags.includes(option)}
                    onCheckedChange={() => toggleResourceTag(option)}
                  />
                  <Label htmlFor={option} className="font-normal cursor-pointer text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Timing Trigger</Label>
            <Input 
              value={form.timing_trigger} 
              onChange={(e) => setForm({ ...form, timing_trigger: e.target.value })} 
              placeholder="e.g. 3 days after Offer acceptance date" 
              className="mt-1.5" 
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="text-sm font-medium text-slate-700">Visible to Clients</Label>
              <p className="text-xs text-slate-400 mt-0.5">Show this task to clients in their view</p>
            </div>
            <Switch 
              checked={form.visibility === "visible_to_clients"} 
              onCheckedChange={(checked) => setForm({ ...form, visibility: checked ? "visible_to_clients" : "internal" })}
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Notes</Label>
            <Textarea 
              value={form.notes} 
              onChange={(e) => setForm({ ...form, notes: e.target.value })} 
              placeholder="Additional notes or instructions" 
              className="mt-1.5" 
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={!form.name}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            {task ? "Save Changes" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createPageUrl } from "@/utils";

export default function CreateTemplateModal({ open, onOpenChange, userTypes }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", user_type: "", description: "" });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ChecklistTemplate.create(data),
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      onOpenChange(false);
      window.location.href = createPageUrl(`TemplateEditor?id=${newTemplate.id}`);
    },
  });

  const handleSubmit = () => {
    createMutation.mutate({ ...form, is_active: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Template Name *</Label>
            <Input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              placeholder="e.g. The Buyer Experience Checklist (Attorney State)" 
              className="mt-1.5" 
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">User Type *</Label>
            <Select value={form.user_type} onValueChange={(val) => setForm({ ...form, user_type: val })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                {userTypes.map(ut => (
                  <SelectItem key={ut.id} value={ut.id}>{ut.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</Label>
            <Textarea 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              placeholder="Optional description" 
              className="mt-1.5" 
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!form.name || !form.user_type || createMutation.isPending}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            {createMutation.isPending ? "Creating..." : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function SubmitConfirmModal({ open, onOpenChange, stats, onConfirm, isSubmitting }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Submit Checklist for Review
          </DialogTitle>
          <DialogDescription className="text-slate-600 pt-2">
            Are you sure you want to submit your checklist? You will not be able to make changes after submission.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-slate-900 text-sm mb-3">Summary</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500">Tasks kept:</span>
              <span className="font-semibold text-slate-900 ml-2">{stats.kept}</span>
            </div>
            <div>
              <span className="text-slate-500">Tasks modified:</span>
              <span className="font-semibold text-orange-600 ml-2">{stats.modified}</span>
            </div>
            <div>
              <span className="text-slate-500">Tasks deleted:</span>
              <span className="font-semibold text-red-600 ml-2">{stats.deleted}</span>
            </div>
            <div>
              <span className="text-slate-500">Tasks added:</span>
              <span className="font-semibold text-emerald-600 ml-2">{stats.added}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit for Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
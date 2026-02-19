import React from "react";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  pending_setup: { label: "Pending Setup", className: "bg-amber-50 text-amber-700 border-amber-200" },
  customizing: { label: "Customizing", className: "bg-blue-50 text-blue-700 border-blue-200" },
  submitted: { label: "Submitted", className: "bg-purple-50 text-purple-700 border-purple-200" },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  draft: { label: "Draft", className: "bg-slate-50 text-slate-600 border-slate-200" },
  revision_requested: { label: "Revision Requested", className: "bg-orange-50 text-orange-700 border-orange-200" },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: "bg-gray-50 text-gray-600 border-gray-200" };
  return (
    <Badge variant="outline" className={`${config.className} font-medium text-xs px-2.5 py-0.5`}>
      {config.label}
    </Badge>
  );
}
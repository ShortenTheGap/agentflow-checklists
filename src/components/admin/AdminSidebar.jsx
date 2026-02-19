import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, Users, ListChecks, FileText, FolderKanban, LogOut,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const navItems = [
  { label: "Dashboard", page: "AdminDashboard", icon: LayoutDashboard },
  { label: "Users", page: "AdminUsers", icon: Users },
  { label: "User Types", page: "AdminUserTypes", icon: FolderKanban },
  { label: "Templates", page: "AdminTemplates", icon: ListChecks },
  { label: "Submissions", page: "AdminSubmissions", icon: FileText },
];

export default function AdminSidebar({ currentPage }) {
  return (
    <aside className="w-64 bg-slate-950 min-h-screen flex flex-col fixed left-0 top-0 z-30">
      <div className="px-6 py-7 border-b border-slate-800">
        <h1 className="text-lg font-bold text-white tracking-tight">Agent Checklist</h1>
        <p className="text-xs text-slate-500 mt-0.5">Builder</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-white hover:bg-white/5 transition-all w-full"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import StatusBadge from "@/components/StatusBadge";
import { Clock, Pencil, Send, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentChecklistEditor from "./AgentChecklistEditor";

export default function AgentDashboard() {
  const [user, setUser] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        
        // Fetch agent's checklist
        const checklists = await base44.entities.AgentChecklist.filter({ agent: me.id });
        if (checklists && checklists.length > 0) {
          setChecklist(checklists[0]);
        }
      } catch {
        base44.auth.redirectToLogin(createPageUrl("AgentDashboard"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  const status = checklist?.status || "pending_setup";

  if (status === "draft" || status === "revision_requested" || status === "submitted") {
    return <AgentChecklistEditor />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Agent Checklist Builder</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{user?.full_name}</span>
          <Button variant="ghost" size="sm" onClick={() => base44.auth.logout()} className="text-slate-400 hover:text-slate-600">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {!checklist && (
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Your checklist is being prepared</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Your admin is setting up a personalized checklist for you. You'll be notified once it's ready for customization.
            </p>
            <div className="mt-6">
              <StatusBadge status="pending_setup" />
            </div>
          </div>
        )}



        {status === "approved" && checklist && (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Checklist Approved</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Your checklist has been approved. You're all set to start your onboarding journey!
            </p>
            <div className="mt-6">
              <StatusBadge status="approved" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
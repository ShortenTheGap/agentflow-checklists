import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const route = async () => {
      try {
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (!isAuthenticated) {
          base44.auth.redirectToLogin(window.location.href);
          return;
        }
        const user = await base44.auth.me();
        if (user.role === "admin") {
          window.location.replace(createPageUrl("AdminDashboard"));
        } else {
          window.location.replace(createPageUrl("AgentDashboard"));
        }
      } catch {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    route();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Redirecting…</p>
      </div>
    </div>
  );
}
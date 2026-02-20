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
          setLoading(false);
          return;
        }
        const user = await base44.auth.me();
        if (user.role === "admin") {
          window.location.replace(createPageUrl("AdminDashboard"));
        } else {
          window.location.replace(createPageUrl("AgentDashboard"));
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setLoading(false);
      }
    };
    route();
  }, []);

  if (!loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <button onClick={() => base44.auth.redirectToLogin()} className="px-4 py-2 bg-blue-600 text-white rounded">
          Click here to log in
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Checking…</p>
      </div>
    </div>
  );
}
import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function Home() {
  useEffect(() => {
    const redirect = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        if (user?.role === "admin") {
          window.location.href = createPageUrl("AdminDashboard");
        } else {
          window.location.href = createPageUrl("AgentDashboard");
        }
      }
    };
    redirect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
    </div>
  );
}
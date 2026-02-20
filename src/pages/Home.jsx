import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function Home() {
  useEffect(() => {
    const redirect = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role === "admin") {
          window.location.href = createPageUrl("AdminDashboard");
        } else {
          window.location.href = createPageUrl("AgentDashboard");
        }
      } catch {
        base44.auth.redirectToLogin(createPageUrl("Home"));
      }
    };
    redirect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-600">Redirecting...</p>
    </div>
  );
}
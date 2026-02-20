import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function Home() {
  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.role === "admin") {
        window.location.href = createPageUrl("AdminDashboard");
      } else {
        window.location.href = createPageUrl("AgentDashboard");
      }
    });
  }, []);

  return null;
}
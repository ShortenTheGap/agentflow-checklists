import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminSidebar from "@/components/admin/AdminSidebar";

const adminPages = ["AdminDashboard", "AdminUsers", "AdminUserTypes", "AdminTemplates", "AdminSubmissions"];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  const isAdminPage = adminPages.includes(currentPageName);

  if (isAdmin && isAdminPage) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminSidebar currentPage={currentPageName} />
        <main className="ml-64 min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
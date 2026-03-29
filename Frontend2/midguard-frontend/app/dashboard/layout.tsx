"use client";

import { useState } from "react";
import Sidebar from "@/components/homepage/Navbars/sidebar/side";
import Topbar from "@/components/homepage/Navbars/topbar/top";



export default function DashboardLayout({ children }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex">
       {/* TopBAR */}
        <div className="flex flex-col w-full">
        <Topbar setOpen={setOpen} />
        <div className="p-6 z-10">
        {children}
        </div>
        </div>

      {/* SIDEBAR */}
      <Sidebar open={open} setOpen={setOpen} />


      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
    </div>

    
  );
}
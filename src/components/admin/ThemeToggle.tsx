"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // Đọc theme từ localStorage hoặc hệ thống
    const stored = localStorage.getItem("shopdev_admin_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (stored === "dark" || (!stored && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("shopdev_admin_theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("shopdev_admin_theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
      title={isDark ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-90" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600 transition-transform hover:-rotate-12" />
      )}
    </Button>
  );
}

export default ThemeToggle;

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Search,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import authService from "@/services/authService";
import { Button } from "@/components/ui/button";

export function Header() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const updateAuthState = () => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      setIsAdmin(authService.isAdmin());
      const user = authService.getCurrentUser();
      setUserEmail(user?.email || "");
    } else {
      setIsAdmin(false);
      setUserEmail("");
    }
  };

  useEffect(() => {
    updateAuthState();

    const handleAuthChange = () => {
      updateAuthState();
    };

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    updateAuthState();
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* LOGO */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              ShopDev
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold -mt-1">
              E-Commerce
            </span>
          </div>
        </Link>

        {/* SEARCH BAR (DESKTOP) */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center flex-1 max-w-md mx-8 relative"
        >
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-input bg-muted/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </form>

        {/* NAVIGATION ACTIONS (DESKTOP) */}
        <div className="hidden md:flex items-center space-x-3">
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground hover:text-indigo-600 rounded-full"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                2
              </span>
            </Button>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-2 pl-2 border-l">
              {isAdmin && (
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-medium flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Quản trị</span>
                  </Button>
                </Link>
              )}

              <div className="flex items-center space-x-2 px-2 py-1 rounded-md bg-muted/50 text-xs font-medium text-foreground max-w-[160px] truncate">
                <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                  {userEmail ? userEmail[0] : "U"}
                </div>
                <span className="truncate">{userEmail.split("@")[0]}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive flex items-center gap-1"
                title="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
                <span>Thoát</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium"
                >
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex md:hidden items-center space-x-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                2
              </span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t px-4 pt-3 pb-5 space-y-3 bg-background">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-input bg-muted/40"
            />
          </form>

          {isAuthenticated ? (
            <div className="space-y-2 pt-2 border-t">
              <div className="text-xs text-muted-foreground px-1">
                Tài khoản: <span className="font-semibold text-foreground">{userEmail}</span>
              </div>
              {isAdmin && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-50 text-indigo-700 text-sm font-medium"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Trang quản trị (Dashboard)
                </Link>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;

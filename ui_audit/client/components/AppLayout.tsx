import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  MessageCircle,
  Users,
  Compass,
  Heart,
  Menu,
  X,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PersonaSwitcher from "@/components/PersonaSwitcher";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Users, label: "Communities", path: "/communities" },
    { icon: Compass, label: "Explore", path: "/discover" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: Heart, label: "Likes", path: "/likes" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 hover:bg-muted rounded-lg"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative w-64 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col z-40",
          !sidebarOpen && "md:-translate-x-full",
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link
            to="/"
            className="flex items-center gap-3 font-bold text-xl"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
              🔒
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Incognito
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg transition-all",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="w-6 h-6 flex-shrink-0" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Persona Switcher */}
        <PersonaSwitcher />

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Link
            to="/messages"
            className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold transition-all hover:bg-primary/90 text-center block hidden lg:block"
            onClick={() => setMobileMenuOpen(false)}
          >
            New Message
          </Link>
          <div className="flex gap-2">
            <button className="flex-1 p-3 hover:bg-muted rounded-lg transition-colors flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </button>
            <button className="flex-1 p-3 hover:bg-muted rounded-lg transition-colors flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

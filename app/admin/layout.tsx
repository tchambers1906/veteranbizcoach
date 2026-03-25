'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  Mail,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Leads', href: '/admin/leads', icon: Users },
  { label: 'Quizzes', href: '/admin/quizzes', icon: ClipboardList },
  { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { label: 'Emails', href: '/admin/emails', icon: Mail },
];

function getPageTitle(pathname: string): string {
  const item = NAV_ITEMS.find((n) => n.href === pathname);
  return item?.label || 'Admin';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState('');
  const [isAuthed, setIsAuthed] = useState<boolean | null>(true); // Default to true, redirect only on 401

  // Load collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_sidebar_collapsed');
      if (saved === 'true') setCollapsed(true);
    } catch {}
  }, []);

  // Save collapsed state
  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem('admin_sidebar_collapsed', String(next));
    } catch {}
  };

  // Session check — non-blocking with timeout
  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthed(true);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      setIsAuthed(true); // Allow access on timeout — server middleware will catch unauthorized
    }, 5000);

    fetch('/api/admin/stats', { credentials: 'include', signal: controller.signal })
      .then((r) => {
        clearTimeout(timeout);
        if (r.status === 401) {
          window.location.href = '/admin/login';
          setIsAuthed(false);
        } else {
          setIsAuthed(true);
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        // On network error, still show content — server middleware handles security
        setIsAuthed(true);
      });

    return () => { clearTimeout(timeout); controller.abort(); };
  }, [pathname]);

  // Clock
  useEffect(() => {
    const tick = () => {
      setNow(
        new Date().toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const handleSignOut = useCallback(async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    router.replace('/admin/login');
  }, [router]);

  // Login page has no chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Loading state
  if (isAuthed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A1628' }}>
        <div className="space-y-4 w-60">
          <div className="h-4 rounded-full animate-pulse" style={{ backgroundColor: '#1A1A2E' }} />
          <div className="h-4 rounded-full animate-pulse w-3/4" style={{ backgroundColor: '#1A1A2E' }} />
          <div className="h-4 rounded-full animate-pulse w-1/2" style={{ backgroundColor: '#1A1A2E' }} />
        </div>
      </div>
    );
  }
  if (isAuthed === false) return null;

  const sidebarW = collapsed ? 56 : 240;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen" style={{ backgroundColor: '#0A1628' }}>
        {/* Desktop sidebar */}
        <aside
          className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-40 transition-all duration-200"
          style={{ width: sidebarW, backgroundColor: '#0A1628', borderRight: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Brand */}
          <div className="flex items-center justify-between px-4 py-5" style={{ minHeight: 64 }}>
            {!collapsed && (
              <span className="font-heading font-bold text-[18px] text-gold truncate">T.C. Chambers</span>
            )}
            <button
              onClick={toggleCollapsed}
              className="text-off-white/60 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 space-y-1 mt-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const navItem = (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[14px] font-body relative ${
                    active
                      ? 'text-gold font-medium'
                      : 'text-off-white/60 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  style={
                    active
                      ? {
                          backgroundColor: 'rgba(201,168,76,0.1)',
                          borderLeft: '2px solid #C9A84C',
                          paddingLeft: 10,
                        }
                      : {}
                  }
                >
                  <item.icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </a>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                    <div className="bg-charcoal text-off-white px-2 py-1 rounded text-[13px] font-body ml-2">{item.label}</div>
                  </Tooltip>
                );
              }
              return navItem;
            })}
          </nav>

          {/* Footer */}
          <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {!collapsed && (
              <div className="mb-3">
                <p className="font-body text-[13px] text-gold">T.C. Chambers</p>
                <p className="font-body text-[12px] text-off-white/40">Admin</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 font-body text-[13px] text-off-white/50 hover:text-red-400 transition-colors w-full"
            >
              <LogOut size={16} />
              {!collapsed && 'Sign Out'}
            </button>
          </div>
        </aside>

        {/* Mobile bottom tabs */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-2"
          style={{ backgroundColor: '#0A1628', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-body ${
                  active ? 'text-gold' : 'text-off-white/40'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Mobile header */}
        <header
          className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: '#0A1628', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h1 className="font-heading font-bold text-[16px] text-white">{getPageTitle(pathname)}</h1>
          <div className="flex items-center gap-3">
            <span className="font-body text-[11px] text-off-white/50">{now}</span>
            <button onClick={handleSignOut} className="text-off-white/40 hover:text-red-400 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Desktop header */}
        <header
          className="hidden lg:flex items-center justify-between fixed top-0 right-0 z-30 px-8 py-4"
          style={{
            left: sidebarW,
            backgroundColor: '#0A1628',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            transition: 'left 200ms',
          }}
        >
          <h1 className="font-heading font-bold text-[20px] text-white">{getPageTitle(pathname)}</h1>
          <span className="font-body text-[13px] text-off-white/50">{now}</span>
        </header>

        {/* Main content */}
        <main
          className="pt-14 pb-20 lg:pb-8 px-4 sm:px-6 lg:px-8"
          style={{ transition: 'margin-left 200ms' }}
        >
          <div style={{}}>{children}</div>
        </main>

        <style>{`
          @media (min-width: 1024px) {
            main { margin-left: ${sidebarW}px !important; padding-top: 80px !important; }
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
}

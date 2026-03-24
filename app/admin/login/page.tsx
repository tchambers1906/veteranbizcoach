'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  // Non-blocking session check — redirect if already logged in
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    fetch('/api/admin/stats', { credentials: 'include', signal: controller.signal })
      .then((r) => {
        clearTimeout(timeout);
        if (r.ok) router.replace('/admin');
      })
      .catch(() => clearTimeout(timeout));

    return () => { clearTimeout(timeout); controller.abort(); };
  }, [router]);

  // Check lockout from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_lockout');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.lockedUntil > Date.now()) {
          setLockedUntil(data.lockedUntil);
          setFailedAttempts(data.attempts);
        } else {
          localStorage.removeItem('admin_lockout');
        }
      }
    } catch {}
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      if (Date.now() >= lockedUntil) {
        setLockedUntil(null);
        setFailedAttempts(0);
        setError('');
        localStorage.removeItem('admin_lockout');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = lockedUntil !== null && lockedUntil > Date.now();

  const doLogin = async () => {
    if (!password.trim() || loading || isLocked) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (data.success) {
        setFailedAttempts(0);
        localStorage.removeItem('admin_lockout');
        window.location.href = '/admin';
      } else if (res.status === 429) {
        setError('Too many attempts. Try again in 15 minutes.');
        const lockTime = Date.now() + 15 * 60 * 1000;
        setLockedUntil(lockTime);
        localStorage.setItem('admin_lockout', JSON.stringify({ lockedUntil: lockTime, attempts: 5 }));
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        if (newAttempts >= 5) {
          const lockTime = Date.now() + 15 * 60 * 1000;
          setLockedUntil(lockTime);
          setError('Too many attempts. Try again in 15 minutes.');
          localStorage.setItem('admin_lockout', JSON.stringify({ lockedUntil: lockTime, attempts: newAttempts }));
        } else {
          setError('Incorrect password. Try again.');
        }
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doLogin();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0A1628' }}
    >
      <div
        className="w-full"
        style={{
          maxWidth: 400,
          backgroundColor: '#1A1A2E',
          borderRadius: 16,
          padding: 48,
          border: '1px solid rgba(201,168,76,0.15)',
        }}
      >
        {/* Brand */}
        <h1 className="font-heading font-bold text-[24px] text-gold text-center mb-2">
          T.C. Chambers
        </h1>
        <p className="font-body text-[13px] text-off-white/70 text-center">
          Admin Dashboard
        </p>

        {/* Divider */}
        <div className="my-6" style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }} />

        {/* Form */}
        <div>
          <div className="mb-5">
            <label
              htmlFor="admin-password"
              className="block font-body text-[13px] text-off-white/70 mb-1.5"
            >
              Admin Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter admin password"
                disabled={isLocked}
                className="w-full font-body text-[16px] text-off-white placeholder:text-white/30 rounded-lg px-4 py-4 pr-12 focus:outline-none transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#1A1A2E',
                  border: error
                    ? '1px solid #E53E3E'
                    : '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={(e) => {
                  if (!error) e.currentTarget.style.borderColor = '#C9A84C';
                }}
                onBlur={(e) => {
                  if (!error) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-off-white/40 hover:text-off-white/70 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={doLogin}
            disabled={loading || isLocked}
            className="w-full font-heading font-semibold text-[16px] bg-gold text-navy px-6 py-4 rounded-lg min-h-[44px] hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>

          {error && (
            <p className="font-body text-[14px] mt-4 text-center" style={{ color: '#E53E3E' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

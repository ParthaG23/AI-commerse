'use client';

import React from 'react';

interface ContentLayoutProps {
  children: React.ReactNode;
  /** Optional extra classes on the outer wrapper */
  className?: string;
  /** Remove default horizontal padding (e.g. for full-bleed pages) */
  noPadding?: boolean;
}

export default function ContentLayout({
  children,
  className = '',
  noPadding = false,
}: ContentLayoutProps) {
  return (
    <div
      className={`
        relative flex h-[calc(100vh-64px)] w-full overflow-hidden
        bg-slate-50/60 dark:bg-transparent
        transition-colors duration-300
        ${className}
      `}
    >
      {/* Subtle ambient background mesh — only visible in dark mode */}
      <div
        className="pointer-events-none absolute inset-0 dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.07),transparent)] opacity-0 dark:opacity-100 transition-opacity duration-500"
        aria-hidden
      />

      {/* Scrollable content area */}
      <main
        className={`
          relative z-10 flex-1 h-full overflow-y-auto
          [scrollbar-width:thin]
          [scrollbar-color:rgba(99,102,241,0.25)_transparent]
          ${noPadding ? '' : 'px-4 py-6 sm:px-6 lg:px-8'}
        `}
      >
        {children}
      </main>
    </div>
  );
}
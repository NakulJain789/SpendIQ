import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count });

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((_, i) => (
          <div key={i} className="glass-panel rounded-3xl p-6 space-y-4 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-white/10 rounded-full" />
              <div className="h-9 w-9 bg-white/10 rounded-xl" />
            </div>
            <div className="h-8 w-32 bg-white/10 rounded-xl" />
            <div className="h-3 w-24 bg-white/5 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'transaction') {
    return (
      <div className="space-y-3">
        {items.map((_, i) => (
          <div key={i} className="glass-panel-subtle rounded-2xl p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-white/10 rounded-full" />
                <div className="h-3 w-20 bg-white/5 rounded-full" />
              </div>
            </div>
            <div className="h-5 w-20 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-6 space-y-4 animate-pulse">
      <div className="h-4 w-28 bg-white/10 rounded-full" />
      <div className="h-32 w-full bg-white/5 rounded-2xl" />
    </div>
  );
}

import React from "react";

/**
 * A centred 3×3 “pulse” grid with a headline + subtitle.
 * Works with plain Tailwind 3.3+ (aspect‑square is core).
 */
const AuthImagePattern = ({ title, subtitle }) => (
  <div className="flex min-h-[60vh] items-center justify-center bg-slate-100 dark:bg-slate-800 p-6">
    <div className="max-w-sm text-center">
      <div className="grid grid-cols-3 gap-2 mb-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-2xl bg-blue-600/10 ${
              i % 2 === 0 ? "animate-pulse" : ""
            }`}
          />
        ))}
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
        {title}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
    </div>
  </div>
);

export default AuthImagePattern;

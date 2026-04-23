import React from "react";

export default function StoreMap({ pos, heading, isStep, walkablePaths }) {
  const mapWidth = 400;
  const mapHeight = 500;
  void walkablePaths;

  // Simple SVG grid renderer
  return (
    <div
      className="relative border-2 border-slate-700 rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 mx-auto w-full max-w-[460px] aspect-[4/5]"
      style={{
        touchAction: "none",
      }}
    >
      {/* Fallback Aisle drawing for demo structure */}
      <svg width="100%" height="100%" viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
        {/* Aisles */}
        <rect x="50" y="50" width="40" height="150" fill="#1e293b" rx="8" />
        <rect x="150" y="50" width="40" height="150" fill="#1e293b" rx="8" />
        <rect x="250" y="50" width="40" height="150" fill="#1e293b" rx="8" />

        {/* Walkable paths (Debug) */}
        {/* {walkablePaths.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="blue" />
         ))} */}

        {/* The live dot representing user */}
        <g
          transform={`translate(${pos.x || 50}, ${pos.y || 50}) rotate(${heading * (180 / Math.PI) || 0})`}
        >
          <circle
            cx="0"
            cy="0"
            r="8"
            fill="#3b82f6"
            className={`transition-all duration-300 ${isStep ? "scale-125 saturate-150" : "scale-100"}`}
          />
          {/* Direction arrow */}
          <path d="M-6 2 L0 -8 L6 2 Z" fill="#60a5fa" />
        </g>
      </svg>

      {/* Entrance label */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-800/90 text-slate-300 text-xs px-2 py-1 rounded-md border border-slate-700">
        Entrance
      </div>
    </div>
  );
}

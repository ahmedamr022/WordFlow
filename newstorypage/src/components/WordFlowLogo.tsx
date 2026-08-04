import React from 'react';

export function WordFlowLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        viewBox="0 0 48 44"
        className="h-9 w-9 drop-shadow-[0_0_18px_rgba(99,102,241,0.55)]"
        aria-hidden="true">
        
        <defs>
          <linearGradient id="wf-logo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="45%" stopColor="#4f7cf7" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path
          d="M4 4h8.6l5.4 21.5L23.4 4h5.4l5.4 21.5L39.6 4H48l-9.4 36h-8.2L26 21.4 21.6 40h-8.2L4 4z"
          fill="url(#wf-logo)"
          strokeLinejoin="round" />
        
      </svg>

      <span className="font-latin text-[1.7rem] font-extrabold leading-none tracking-tight">
        <span className="text-white">Word</span>
        <span
          style={{
            backgroundImage: 'linear-gradient(90deg,#f472b6,#fb7185)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
          
          Flow
        </span>
      </span>
    </div>);

}
import React from 'react';

export const CyberBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#f8fafc]">
      {/* Soft Ambient Radial Blooms in OKLCH Blue (74.6% 0.16 232.661) - Static, No Moving Dots */}
      <div 
        className="absolute top-[-10%] left-[5%] w-[650px] h-[650px] rounded-full blur-[140px] pointer-events-none"
        style={{ backgroundColor: 'oklch(74.6% 0.16 232.661 / 0.14)' }} 
      />
      <div 
        className="absolute bottom-[-10%] right-[5%] w-[700px] h-[700px] rounded-full blur-[160px] pointer-events-none" 
        style={{ backgroundColor: 'oklch(78% 0.14 225 / 0.10)' }} 
      />
      <div 
        className="absolute top-[35%] right-[20%] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none" 
        style={{ backgroundColor: 'oklch(74.6% 0.16 232.661 / 0.08)' }} 
      />

      {/* Subtle Static Precision Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(74.6% 0.16 232.661) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(74.6% 0.16 232.661) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
};

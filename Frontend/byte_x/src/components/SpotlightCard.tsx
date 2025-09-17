"use client";
import React, { useRef, useState } from "react";

export default function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({
    background: `radial-gradient(220px 80px at 50% 100%, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.12) 60%, transparent 100%)`,
    filter: "blur(0.5px)",
    transition: "background 0.2s, box-shadow 0.2s, transform 0.2s",
    boxShadow: "0 0 32px 8px rgba(59,130,246,0.25), 0 8px 32px 0 rgba(99,102,241,0.18), 0 1.5px 8px 0 rgba(255,255,255,0.10)",
    transform: "perspective(800px) rotateX(0deg) rotateY(0deg)",
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Spotlight follows mouse, but always keep a soft glow at the bottom
    const background = `radial-gradient(220px circle at ${x}px ${y}px, rgba(255,255,255,0.35) 0%, rgba(59,130,246,0.30) 30%, rgba(99,102,241,0.22) 60%, transparent 90%), radial-gradient(220px 80px at 50% 100%, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.12) 60%, transparent 100%)`;
    // 3D tilt
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;
    const rotateX = deltaY * 10;
    const rotateY = deltaX * -10;
    setStyle({
      background,
      filter: "blur(0.5px)",
      transition: "background 0.2s, box-shadow 0.2s, transform 0.2s",
  boxShadow: `0 0 32px 8px rgba(59,130,246,0.25), 0 8px 32px 0 rgba(99,102,241,0.18), 0 1.5px 8px 0 rgba(255,255,255,0.10)`,
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    });
  };
  const handleMouseLeave = () => {
    setStyle({
      background: `radial-gradient(220px 80px at 50% 100%, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.12) 60%, transparent 100%)`,
      filter: "blur(0.5px)",
      transition: "background 0.2s, box-shadow 0.2s, transform 0.2s",
      boxShadow: "0 0 32px 8px rgba(59,130,246,0.25), 0 8px 32px 0 rgba(99,102,241,0.18), 0 1.5px 8px 0 rgba(255,255,255,0.10)",
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg)",
    });
  };
  return (
    <div
      ref={cardRef}
      className={"relative overflow-hidden rounded-2xl " + className}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

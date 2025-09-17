"use client";
import React, { useEffect, useRef } from "react";

export default function MovingBlueBorder({ children }: { children: React.ReactNode }) {
  const borderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let rafId: number;
    function animate() {
      frame++;
      if (borderRef.current) {
        borderRef.current.style.backgroundPosition = `${frame * 2}px`;
      }
      rafId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={borderRef}
      style={{
        position: "relative",
        display: "inline-block",
  borderRadius: "0.5rem",
  background: "linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6)",
  backgroundSize: "200% 100%",
  backgroundPosition: "0px",
  padding: "2px",
  transition: "box-shadow 0.2s",
      }}
    >
      <div
        style={{
          borderRadius: "0.5rem",
          background: "white",
          display: "inline-block",
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}

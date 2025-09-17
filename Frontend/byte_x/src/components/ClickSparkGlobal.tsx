"use client";
import React, { useEffect } from "react";
import { useSparkContext } from '@/contexts/spark-context';

const SparkElement: React.FC<{ 
  x: number; 
  y: number; 
  color: string; 
  size: number; 
  duration: number; 
  shape: 'circle' | 'star' | 'plus';
}> = ({ x, y, color, size, duration, shape }) => {
  const getShapeContent = () => {
    switch (shape) {
      case 'star':
        return '★';
      case 'plus':
        return '✚';
      default:
        return '';
    }
  };

  const shapeStyles = shape === 'circle' ? {
    background: `radial-gradient(circle, ${color} 0%, ${color}80 50%, transparent 100%)`,
    borderRadius: '50%',
  } : {
    color: color,
    fontSize: `${size}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold' as const,
  };

  return (
    <div
      className="fixed pointer-events-none z-[9999] animate-spark"
      style={{
        left: x,
        top: y,
        width: shape === 'circle' ? size : size,
        height: shape === 'circle' ? size : size,
        transform: 'translate(-50%, -50%)',
        animationDuration: `${duration}ms`,
        ...shapeStyles,
      }}
    >
      {getShapeContent()}
    </div>
  );
};

export default function ClickSparkGlobal() {
  const { sparks, addSpark, config } = useSparkContext();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!config.enabled) return;
      addSpark(e.clientX, e.clientY);
    };

    // Add the CSS animation if it doesn't exist
    if (!document.querySelector('#spark-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'spark-animation-styles';
      style.textContent = `
        @keyframes spark {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
          }
          10% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2) rotate(30deg);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5) rotate(360deg);
          }
        }
        .animate-spark {
          animation: spark ease-out forwards;
        }
      `;
      document.head.appendChild(style);
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [addSpark, config.enabled]);

  return (
    <>
      {sparks.map((spark) => (
        <SparkElement
          key={spark.id}
          x={spark.x}
          y={spark.y}
          color={spark.color}
          size={spark.size}
          duration={spark.duration}
          shape={config.sparkShape}
        />
      ))}
    </>
  );
}
"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Spark {
  id: string;
  x: number;
  y: number;
  timestamp: number;
  color: string;
  size: number;
  duration: number;
}

interface SparkConfig {
  colors: string[];
  minSize: number;
  maxSize: number;
  minDuration: number;
  maxDuration: number;
  maxSparks: number;
  sparkShape: 'circle' | 'star' | 'plus';
  enabled: boolean;
}

interface SparkContextType {
  sparks: Spark[];
  config: SparkConfig;
  addSpark: (x: number, y: number) => void;
  updateConfig: (newConfig: Partial<SparkConfig>) => void;
  clearSparks: () => void;
}

const defaultConfig: SparkConfig = {
  colors: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
  minSize: 4,
  maxSize: 12,
  minDuration: 600,
  maxDuration: 1200,
  maxSparks: 50,
  sparkShape: 'circle',
  enabled: true,
};

const SparkContext = createContext<SparkContextType | undefined>(undefined);

export const SparkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [config, setConfig] = useState<SparkConfig>(defaultConfig);

  const addSpark = useCallback((x: number, y: number) => {
    if (!config.enabled) return;

    const id = `spark-${Date.now()}-${Math.random()}`;
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
    const duration = config.minDuration + Math.random() * (config.maxDuration - config.minDuration);

    const newSpark: Spark = {
      id,
      x,
      y,
      timestamp: Date.now(),
      color,
      size,
      duration,
    };

    setSparks(prev => {
      const updated = [...prev, newSpark];
      // Limit the number of sparks
      if (updated.length > config.maxSparks) {
        return updated.slice(-config.maxSparks);
      }
      return updated;
    });

    // Remove spark after its duration
    setTimeout(() => {
      setSparks(prev => prev.filter(spark => spark.id !== id));
    }, duration);
  }, [config]);

  const updateConfig = useCallback((newConfig: Partial<SparkConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const clearSparks = useCallback(() => {
    setSparks([]);
  }, []);

  return (
    <SparkContext.Provider value={{ sparks, config, addSpark, updateConfig, clearSparks }}>
      {children}
    </SparkContext.Provider>
  );
};

export const useSparkContext = () => {
  const context = useContext(SparkContext);
  if (context === undefined) {
    throw new Error('useSparkContext must be used within a SparkProvider');
  }
  return context;
};
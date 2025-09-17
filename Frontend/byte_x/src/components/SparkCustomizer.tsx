"use client";
import React from 'react';
import { useSparkContext } from '@/contexts/spark-context';

export default function SparkCustomizer() {
  const { config, updateConfig, clearSparks } = useSparkContext();

  return (
    <div className="fixed top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-w-xs">
      <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">✨ Spark Effects</h3>
      
      <div className="space-y-3">
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => updateConfig({ enabled: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">Enable Sparks</span>
          </label>
        </div>

        <div>
          <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Size Range</label>
          <div className="flex space-x-1">
            <input
              type="range"
              min="2"
              max="8"
              value={config.minSize}
              onChange={(e) => updateConfig({ minSize: parseInt(e.target.value) })}
              className="flex-1"
            />
            <input
              type="range"
              min="8"
              max="20"
              value={config.maxSize}
              onChange={(e) => updateConfig({ maxSize: parseInt(e.target.value) })}
              className="flex-1"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">{config.minSize}px - {config.maxSize}px</div>
        </div>

        <div>
          <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Duration</label>
          <input
            type="range"
            min="300"
            max="2000"
            value={config.maxDuration}
            onChange={(e) => updateConfig({ 
              minDuration: Math.floor(parseInt(e.target.value) * 0.5),
              maxDuration: parseInt(e.target.value) 
            })}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">{config.maxDuration}ms</div>
        </div>

        <div>
          <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Shape</label>
          <select
            value={config.sparkShape}
            onChange={(e) => updateConfig({ sparkShape: e.target.value as 'circle' | 'star' | 'plus' })}
            className="w-full text-xs p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="circle">● Circle</option>
            <option value="star">★ Star</option>
            <option value="plus">✚ Plus</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Colors</label>
          <div className="flex flex-wrap gap-1">
            {config.colors.map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer"
                style={{ backgroundColor: color }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = color;
                  input.onchange = (e) => {
                    const newColors = [...config.colors];
                    newColors[index] = (e.target as HTMLInputElement).value;
                    updateConfig({ colors: newColors });
                  };
                  input.click();
                }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={clearSparks}
          className="w-full text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
        >
          Clear All Sparks
        </button>
      </div>
    </div>
  );
}
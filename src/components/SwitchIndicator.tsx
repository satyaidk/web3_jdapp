'use client';

import { useState, useEffect } from 'react';

interface SwitchIndicatorProps {
  isEventsPage: boolean;
}

export default function SwitchIndicator({ isEventsPage }: SwitchIndicatorProps) {
  const [currentText, setCurrentText] = useState(0);
  
  const texts = [
    isEventsPage ? 'Click to switch to Job Network' : 'Click to switch to Events',
    isEventsPage ? 'Switch to Job Network' : 'Switch to Events',
    isEventsPage ? 'Go to Job Network' : 'Go to Events',
    isEventsPage ? 'Find Jobs' : 'Find Events'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % texts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div className="ml-3 text-xs text-gray-500 dark:text-gray-400 animate-pulse transition-all duration-500">
      {texts[currentText]}
    </div>
  );
}

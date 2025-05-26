import { useState, useEffect } from 'react';

export default function AnimatedTitle({ text, className = '' }) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        const cursorInterval = setInterval(() => {
          setShowCursor(prev => !prev);
        }, 500);
        return () => clearInterval(cursorInterval);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [text]);
  return (
    <h1 className={`font-bold relative ${className}`}>
      <span>{displayText}</span>
      <span className={`absolute ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>|</span>
    </h1>
  );
} 
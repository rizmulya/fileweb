import { useEffect, useState } from 'react';

export default function ProgressBar({ progress, simulate = false, onComplete }) {
  const [internalProgress, setInternalProgress] = useState(progress || 0);

  // simulate
  useEffect(() => {
    if (!simulate) return;

    const interval = setInterval(() => {
      setInternalProgress(prev => {
        const next = Math.min(prev + Math.random() * 10, 100);
        if (next >= 100) {
          clearInterval(interval);
          onComplete?.();
        }
        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [simulate]);

  // real
  useEffect(() => {
    if (!simulate && typeof progress === 'number') {
      setInternalProgress(progress);
      if (progress >= 100) {
        onComplete?.();
      }
    }
  }, [progress, simulate]);

  return (
    <div className="w-full flex items-center gap-3">
      <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-700 rounded overflow-hidden">
        <div
          className="h-full bg-violet-600 transition-all duration-300"
          style={{ width: `${internalProgress}%` }}
        />
      </div>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[25px] text-right">
        {Math.round(internalProgress)}%
      </div>
    </div>
  );
}

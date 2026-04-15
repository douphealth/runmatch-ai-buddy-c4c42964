import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const stages = [
  { label: 'Analyzing your runner profile...', icon: '🦶', pct: 15 },
  { label: 'Matching foot type & pronation...', icon: '🔬', pct: 30 },
  { label: 'Scoring 29+ shoes against your data...', icon: '👟', pct: 50 },
  { label: 'Building rotation strategy...', icon: '🔄', pct: 70 },
  { label: 'Generating training emphasis...', icon: '📊', pct: 85 },
  { label: 'Finalizing your match report...', icon: '✨', pct: 100 },
];

interface ResultsLoadingScreenProps {
  onComplete: () => void;
}

const ResultsLoadingScreen = ({ onComplete }: ResultsLoadingScreenProps) => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    stages.forEach((_, i) => {
      timers.push(setTimeout(() => setStageIndex(i), i * 450));
    });
    timers.push(setTimeout(onComplete, stages.length * 450 + 300));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const stage = stages[stageIndex];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-dark">
      <div className="text-center max-w-md w-full space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={stageIndex}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              className="text-4xl"
            >
              {stage.icon}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        <div>
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-2">
            Analyzing Your Profile
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={stageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-muted-foreground"
            >
              {stage.label}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="space-y-3">
          <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-primary rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${stage.pct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
            <span>Processing</span>
            <span className="text-primary font-bold">{stage.pct}%</span>
          </div>
        </div>

        <div className="flex justify-center gap-6 text-[10px] text-muted-foreground">
          <span>📊 9 data points</span>
          <span>👟 29+ shoes</span>
          <span>🔬 Sports science</span>
        </div>
      </div>
    </div>
  );
};

export default ResultsLoadingScreen;

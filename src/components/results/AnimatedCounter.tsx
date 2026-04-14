import { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  label: string;
  icon: string;
}

const AnimatedCounter = ({ end, suffix = '', prefix = '', duration = 1.5, label, icon }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.round(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-5 text-center group hover:border-primary/30 transition-all"
    >
      <span className="text-2xl mb-2 block">{icon}</span>
      <div className="text-2xl md:text-3xl font-bold text-gradient tabular-nums">
        {prefix}{count}{suffix}
      </div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">{label}</div>
    </motion.div>
  );
};

export default AnimatedCounter;

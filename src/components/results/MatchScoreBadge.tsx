import { motion } from 'framer-motion';

interface MatchScoreBadgeProps {
  percent: number;
  size?: 'sm' | 'md' | 'lg';
}

const MatchScoreBadge = ({ percent, size = 'md' }: MatchScoreBadgeProps) => {
  const dims = { sm: 48, md: 72, lg: 100 };
  const dim = dims[size];
  const r = (dim - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: dim, height: dim }}>
      <svg width={dim} height={dim} className="rotate-[-90deg]">
        <circle cx={dim/2} cy={dim/2} r={r} fill="none" stroke="hsl(220 15% 18%)" strokeWidth={4} />
        <motion.circle
          cx={dim/2} cy={dim/2} r={r} fill="none"
          stroke="hsl(1 76% 56%)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <span className={`absolute font-bold ${size === 'lg' ? 'text-xl' : size === 'md' ? 'text-sm' : 'text-xs'}`}>
        {percent}%
      </span>
    </div>
  );
};

export default MatchScoreBadge;

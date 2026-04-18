import { TrendingUp } from 'lucide-react';
import colors from '../../theme/color';
import '../../styles/stats-card.css';

export default function StatsCard({ label, value, change, color = 'navy' }) {
  const colorMap = {
    navy: colors.navy,
    red: colors.red,
    gold: colors.gold,
  };

  const selectedColor = colorMap[color] || colorMap.navy;

  return (
    <div
      className='stats-card'
      style={{
        borderLeftColor: selectedColor.main,
        backgroundColor: colors.neutral.bgCard,
      }}
    >
      <div className='stats-header'>
        <h3
          style={{
            color: colors.neutral.textPrimary,
          }}
        >
          {label}
        </h3>
        <span
          className='trend-badge'
          style={{
            backgroundColor: selectedColor.pale,
            color: selectedColor.main,
          }}
        >
          <TrendingUp size={16} />
          {change}
        </span>
      </div>

      <div className='stats-value' style={{ color: selectedColor.main }}>
        {value}
      </div>

      <p className='stats-subtitle' style={{ color: colors.neutral.textMuted }}>
        This month
      </p>
    </div>
  );
}

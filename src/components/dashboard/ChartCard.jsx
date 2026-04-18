import colors from '../../theme/color';
import '../../styles/chart-card.css';

export default function ChartCard({ title, type = 'line', data }) {
  return (
    <div
      className='chart-card'
      style={{ backgroundColor: colors.neutral.bgCard }}
    >
      <div className='chart-header'>
        <h3 style={{ color: colors.neutral.textPrimary }}>{title}</h3>
        <button
          className='chart-menu'
          style={{ color: colors.neutral.textMuted }}
        >
          ⋮
        </button>
      </div>

      <div className='chart-container'>
        {type === 'line' && (
          <svg viewBox='0 0 400 200' className='chart-svg'>
            {/* Simplified Line Chart */}
            <polyline
              points='20,150 80,120 140,90 200,70 260,45 320,20 380,35'
              fill='none'
              stroke={colors.navy.main}
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <polyline
              points='20,150 80,120 140,90 200,70 260,45 320,20 380,35'
              fill={colors.navy.lightest}
              opacity='0.3'
              stroke='none'
            />
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line
                key={i}
                x1='20'
                y1={40 + i * 30}
                x2='380'
                y2={40 + i * 30}
                stroke={colors.neutral.divider}
                strokeWidth='1'
              />
            ))}
          </svg>
        )}

        {type === 'bar' && (
          <svg viewBox='0 0 400 200' className='chart-svg'>
            {/* Simplified Bar Chart */}
            {[
              { x: 50, height: 120, color: colors.navy.main },
              { x: 130, height: 140, color: colors.red.main },
              { x: 210, height: 100, color: colors.gold.main },
              { x: 290, height: 130, color: colors.navy.light },
            ].map((bar, i) => (
              <rect
                key={i}
                x={bar.x}
                y={180 - bar.height}
                width='50'
                height={bar.height}
                fill={bar.color}
                rx='4'
              />
            ))}
          </svg>
        )}

        {type === 'pie' && (
          <svg viewBox='0 0 200 200' className='chart-svg-pie'>
            <circle
              cx='100'
              cy='100'
              r='80'
              fill='none'
              stroke={colors.navy.main}
              strokeWidth='40'
              strokeDasharray='178 448'
              transform='rotate(-90 100 100)'
            />
            <circle
              cx='100'
              cy='100'
              r='80'
              fill='none'
              stroke={colors.red.main}
              strokeWidth='40'
              strokeDasharray='112 448'
              strokeDashoffset='-178'
              transform='rotate(-90 100 100)'
            />
            <circle
              cx='100'
              cy='100'
              r='80'
              fill='none'
              stroke={colors.gold.main}
              strokeWidth='40'
              strokeDasharray='89 448'
              strokeDashoffset='-290'
              transform='rotate(-90 100 100)'
            />
            <circle
              cx='100'
              cy='100'
              r='80'
              fill='none'
              stroke={colors.navy.light}
              strokeWidth='40'
              strokeDasharray='89 448'
              strokeDashoffset='-379'
              transform='rotate(-90 100 100)'
            />
          </svg>
        )}
      </div>

      <div className='chart-legend'>
        {data?.datasets && (
          <div className='legend-items'>
            {data.datasets.map((dataset, idx) => (
              <div key={idx} className='legend-item'>
                <span
                  className='legend-dot'
                  style={{
                    backgroundColor:
                      dataset.backgroundColor || dataset.borderColor,
                  }}
                ></span>
                <span style={{ color: colors.neutral.textMuted }}>
                  {dataset.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

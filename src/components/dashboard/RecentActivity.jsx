import colors from '../../theme/color';
import '../../styles/recent-activity.css';

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      action: 'Project Approval',
      description: 'Q4 Initiative approved by leadership',
      time: '2 hours ago',
      type: 'success',
    },
    {
      id: 2,
      action: 'Team Update',
      description: 'New member added to Development team',
      time: '4 hours ago',
      type: 'info',
    },
    {
      id: 3,
      action: 'Milestone Achieved',
      description: 'Phase 2 Development completed',
      time: '1 day ago',
      type: 'success',
    },
    {
      id: 4,
      action: 'Report Generated',
      description: 'Monthly performance report ready',
      time: '2 days ago',
      type: 'info',
    },
  ];

  const getTypeColor = (type) => {
    return type === 'success' ? colors.gold.main : colors.navy.main;
  };

  return (
    <div
      className='recent-activity'
      style={{ backgroundColor: colors.neutral.bgCard }}
    >
      <div className='activity-header'>
        <h3 style={{ color: colors.neutral.textPrimary }}>Recent Activity</h3>
        <a href='#' style={{ color: colors.navy.main, fontSize: '14px' }}>
          View All
        </a>
      </div>

      <div className='activity-list'>
        {activities.map((activity) => (
          <div
            key={activity.id}
            className='activity-item'
            style={{
              borderBottomColor: colors.neutral.divider,
            }}
          >
            <div className='activity-dot' style={{ color: getTypeColor(activity.type) }}>
              ●
            </div>
            <div className='activity-content'>
              <h4 style={{ color: colors.neutral.textDark }}>
                {activity.action}
              </h4>
              <p style={{ color: colors.neutral.textMuted }}>
                {activity.description}
              </p>
            </div>
            <span
              className='activity-time'
              style={{ color: colors.neutral.textMuted }}
            >
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

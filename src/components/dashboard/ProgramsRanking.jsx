import { useState, useEffect } from 'react';
import colors from '../../theme/color';
import '../../styles/programs-ranking.css';

export default function ProgramsRanking() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/programs', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data && Array.isArray(json.data)) {
          // Sort programs by participants count in descending order and limit to top 6
          const sorted = [...json.data]
            .sort((a, b) => (b.participantsCount || 0) - (a.participantsCount || 0))
            .slice(0, 6);
          setPrograms(sorted);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch programs:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div
        className='programs-ranking'
        style={{ backgroundColor: colors.neutral.bgCard }}
      >
        <div className='ranking-header'>
          <h3 style={{ color: colors.neutral.textPrimary }}>Program Rankings</h3>
        </div>
        <div style={{ padding: '20px', textAlign: 'center', color: colors.neutral.textMuted }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className='programs-ranking'
      style={{ backgroundColor: colors.neutral.bgCard }}
    >
      <div className='ranking-header'>
        <h3 style={{ color: colors.neutral.textPrimary }}>Program Rankings</h3>
      </div>

      <div className='ranking-list'>
        {programs.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: colors.neutral.textMuted }}>
            No programs available
          </div>
        ) : (
          programs.map((program, index) => (
            <div
              key={program.id}
              className='ranking-item'
              style={{
                borderBottomColor: index < programs.length - 1 ? colors.neutral.divider : 'transparent',
              }}
              title={`#${index + 1} - ${program.title || program.name || 'Unnamed'}: ${program.participantsCount || 0} participants`}
            >
              <div className='ranking-position'>
                <span
                  className='position-badge'
                  style={{
                    backgroundColor:
                      index === 0
                        ? colors.gold.main
                        : index === 1
                        ? colors.navy.main
                        : colors.neutral.divider,
                    color:
                      index === 0 || index === 1 ? '#fff' : colors.neutral.textMuted,
                  }}
                >
                  #{index + 1}
                </span>
              </div>

              <div className='ranking-content'>
                <h4
                  className='program-name'
                  style={{ color: colors.neutral.textPrimary }}
                  title={program.title || program.name || 'Unnamed Program'}
                >
                  {program.title || program.name || 'Unnamed Program'}
                </h4>
                <p
                  className='participant-count'
                  style={{ color: colors.neutral.textMuted }}
                >
                  {program.participantsCount || 0} participants
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

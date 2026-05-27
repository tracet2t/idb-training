import { LogOut, Menu, X, TrendingUp } from 'lucide-react';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import useAuthStore from '../store/authStore';
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import colors from '../theme/color';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/dashboard/StatsCard';
import ProgramsRanking from '../components/dashboard/ProgramsRanking';
import { getUserInitial } from '../utils/userDisplay';
import '../styles/dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const displayName = user?.displayName ?? 'User';

  const [stats, setStats] = useState([
    { label: 'Active Programs', value: '...', color: 'navy' },
    { label: 'Active Participants', value: '...', color: 'red' },
    { label: 'Programs Completed', value: '...', color: 'gold' },
    { label: 'Success Rate', value: '...', color: 'navy' },
  ]);

  const [lineChartData, setLineChartData] = useState({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Participants Enrolled',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: colors.navy.main,
        backgroundColor: `${colors.navy.main}15`,
        borderWidth: 3,
        fill: true,
        pointBackgroundColor: colors.navy.main,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
      },
    ],
  });

  const [pieChartData, setPieChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          colors.navy.main,
          colors.red.main,
          colors.gold.main,
          colors.navy.light,
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  });

  useEffect(() => {
    fetch('http://localhost:3000/dashboard/summary', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((json) => {
        const d = json.data;
        setStats([
          { label: 'Active Programs', value: String(d.activePrograms), color: 'navy' },
          { label: 'Active Participants', value: String(d.activeParticipants), color: 'red' },
          { label: 'Programs Completed', value: String(d.completedPrograms), color: 'gold' },
          { label: 'Success Rate', value: `${d.successRate}%`, color: 'navy' },
        ]);
      })
      .catch((err) => console.error('Failed to fetch dashboard summary:', err));
  }, []);

  // Fetch enrollment progression data
  useEffect(() => {
    fetch('http://localhost:3000/dashboard/enrollment-progression', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((json) => {
        const weeklyData = json.data;
        setLineChartData({
          labels: weeklyData.map((item) => item.date),
          datasets: [
            {
              label: 'Participants Enrolled',
              data: weeklyData.map((item) => item.count),
              borderColor: colors.navy.main,
              backgroundColor: `${colors.navy.main}15`,
              borderWidth: 3,
              fill: true,
              pointBackgroundColor: colors.navy.main,
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              tension: 0.4,
            },
          ],
        });
      })
      .catch((err) => console.error('Failed to fetch enrollment progression:', err));
  }, []);

  // Fetch participants by sector data
  useEffect(() => {
    fetch('http://localhost:3000/dashboard/participants-by-sector', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((json) => {
        const sectorData = json.data;
        
        // Ensure we have exactly 4 sectors, with defaults if fewer
        const sectors = [
          { sector: 'Technology', count: 0, percentage: 0 },
          { sector: 'Business', count: 0, percentage: 0 },
          { sector: 'Healthcare', count: 0, percentage: 0 },
          { sector: 'Finance', count: 0, percentage: 0 },
        ];

        // Update sectors with actual data from API
        sectorData.forEach((item) => {
          const existing = sectors.find((s) => s.sector === item.sector);
          if (existing) {
            existing.count = item.count;
            existing.percentage = item.percentage;
          }
        });

        setPieChartData({
          labels: sectors.map((s) => s.sector),
          datasets: [
            {
              data: sectors.map((s) => s.count),
              backgroundColor: [
                colors.navy.main,
                colors.red.main,
                colors.gold.main,
                colors.navy.light,
              ],
              borderColor: '#fff',
              borderWidth: 2,
            },
          ],
        });
      })
      .catch((err) => console.error('Failed to fetch participants by sector:', err));
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearAuth();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className='dashboard-container'>
      <Sidebar handleLogout={handleLogout} />

      {/* Main Content */}
      <div className='main-content'>
        {/* Header */}
        <header className='dashboard-header'>
          <div className='header-left'>
            <h1>DASHBOARD</h1>
            <p className='header-subtitle'>Welcome back, {displayName}</p>
          </div>

          <div className='header-right'>
            <div className='user-menu'>
              <button
                className='user-btn'
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <div
                  className='avatar'
                  style={{ backgroundColor: colors.navy.main }}
                >
                  {getUserInitial(displayName)}
                </div>
                <span>{displayName}</span>
              </button>

              {menuOpen && (
                <div className='dropdown-menu'>
                  <a href='#'>Profile</a>
                  <a href='#'>Preferences</a>
                  <hr />
                  <button onClick={handleLogout} className='logout-btn'>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <section className='stats-section'>
          <div className='stats-grid'>
            {stats.map((stat, idx) => (
              <StatsCard
                key={idx}
                label={stat.label}
                value={stat.value}
                color={stat.color}
              />
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <section className='charts-section'>
          {/* Pie chart and Ranking side by side - Row 1 */}
          <div className='charts-row'>
            <div className='chart-card-wrapper half-width'>
              <div className='chart-header'>
                <div>
                  <h3 style={{ color: colors.neutral.textPrimary }}>Participants by Sector</h3>
                </div>
                <button
                  className='chart-menu'
                  style={{ color: colors.neutral.textMuted }}
                >
                  ⋮
                </button>
              </div>
              <div className='chart-container-chartjs-pie'>
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </div>

            <div className='chart-card-wrapper half-width'>
              <ProgramsRanking />
            </div>
          </div>

          {/* Full width line chart - Row 2 */}
          <div className='chart-card-wrapper full-width'>
            <div className='chart-header'>
              <div>
                <h3 style={{ color: colors.neutral.textPrimary }}>Participants Enrolled</h3>
              </div>
              <button
                className='chart-menu'
                style={{ color: colors.neutral.textMuted }}
              >
                ⋮
              </button>
            </div>
            <div className='chart-container-chartjs'>
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Chart.js configuration and data
const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        font: { size: 12, weight: 500 },
        padding: 15,
        usePointStyle: true,
        color: colors.neutral.textMuted,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 13, weight: 600 },
      bodyFont: { size: 12 },
      borderColor: colors.navy.light,
      borderWidth: 1,
      cornerRadius: 6,
      callbacks: {
        title: function (context) {
          return context[0].label;
        },
        label: function (context) {
          return `${context.dataset.label}: ${context.parsed.y} participants`;
        },
      },
    },
  },
  scales: {
    y: {
      ticks: {
        color: colors.neutral.textMuted,
        font: { size: 11 },
      },
      grid: {
        color: 'rgba(220, 230, 240, 0.3)',
        drawBorder: false,
      },
    },
    x: {
      ticks: {
        color: colors.neutral.textMuted,
        font: { size: 11 },
      },
      grid: {
        display: false,
      },
    },
  },
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        font: { size: 12, weight: 500 },
        padding: 15,
        usePointStyle: true,
        color: colors.neutral.textMuted,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 13, weight: 600 },
      bodyFont: { size: 12 },
      borderColor: colors.navy.light,
      borderWidth: 1,
      cornerRadius: 6,
      callbacks: {
        label: function (context) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
};

// Chart.js configuration and data (options only - data now comes from API)

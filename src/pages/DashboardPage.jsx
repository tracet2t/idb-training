import { useState } from 'react';
import { Bell, Settings, LogOut, Menu, X, TrendingUp } from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import useAuthStore from '../store/authStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import colors from '../theme/color';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/dashboard/StatsCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import { getUserInitial } from '../utils/userDisplay';
import '../styles/dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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

  const stats = [
    { label: 'Active Projects', value: '24', change: '+12%', color: 'navy' },
    { label: 'Team Members', value: '156', change: '+8%', color: 'red' },
    { label: 'Tasks Completed', value: '892', change: '+23%', color: 'gold' },
    { label: 'Success Rate', value: '94%', change: '+5%', color: 'navy' },
  ];

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
            <button className='icon-btn' title='Notifications'>
              <Bell size={20} style={{ color: '#ffffff' }} />
            </button>
            <button className='icon-btn' title='Settings' onClick={() => navigate('/settings')}>
              <Settings size={20} style={{ color: '#ffffff' }} />
            </button>

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
                change={stat.change}
                color={stat.color}
              />
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <section className='charts-section'>
          <div className='charts-row'>
            <div className='chart-card-wrapper'>
              <div className='chart-header'>
                <div>
                  <h3 style={{ color: colors.neutral.textPrimary }}>Project Progress</h3>
                  <p className='chart-subtitle'>Over the last 6 weeks</p>
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

            <div className='chart-card-wrapper'>
              <div className='chart-header'>
                <div>
                  <h3 style={{ color: colors.neutral.textPrimary }}>Team Performance</h3>
                  <p className='chart-subtitle'>Tasks completed per team</p>
                </div>
                <button
                  className='chart-menu'
                  style={{ color: colors.neutral.textMuted }}
                >
                  ⋮
                </button>
              </div>
              <div className='chart-container-chartjs'>
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className='charts-row'>
            <div className='chart-card-wrapper'>
              <div className='chart-header'>
                <div>
                  <h3 style={{ color: colors.neutral.textPrimary }}>Resource Allocation</h3>
                  <p className='chart-subtitle'>Team distribution across departments</p>
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
            <RecentActivity />
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
    },
  },
};

const lineChartData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
  datasets: [
    {
      label: 'Progress %',
      data: [30, 45, 60, 70, 85, 95],
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
};

const barChartData = {
  labels: ['Team A', 'Team B', 'Team C', 'Team D'],
  datasets: [
    {
      label: 'Tasks Completed',
      data: [250, 320, 280, 310],
      backgroundColor: [
        colors.navy.main,
        colors.red.main,
        colors.gold.main,
        colors.navy.light,
      ],
      borderRadius: 6,
      borderSkipped: false,
    },
  ],
};

const pieChartData = {
  labels: ['Development', 'Design', 'Management', 'QA'],
  datasets: [
    {
      data: [35, 25, 20, 20],
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
};

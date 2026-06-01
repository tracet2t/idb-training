import { Bell } from "lucide-react";
import Sidebar from "../components/Sidebar";
import QueryBuilder from "@/components/analytics/QueryBuilder";

const BASE_URL = "http://localhost:3000/api";

const colors = {
  navyMain: '#1a3a5c',
  navyPale: '#B0D4F1',
  idbRed: '#8B1A1A',
  idbGold: '#C8960C',
  pageBg: '#f0f4f8',
  cardBg: '#ffffff',
};

export default function Analytics() {
  const handleLogout = () => { window.location.href = '/login'; };

  return (
    <div className="dashboard-container">
      <Sidebar handleLogout={handleLogout} />

      <div className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>ANALYTICS</h1>
            <p className="header-subtitle">Build queries to segment and analyze data.</p>
          </div>
          <div className="header-right">
            <button className="icon-btn" title="Notifications"><Bell size={20} /></button>
          </div>
        </header>

        <main style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <QueryBuilder />
        </main>
      </div>
    </div>
  );
}
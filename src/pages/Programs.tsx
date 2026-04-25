import { useState } from "react";
import { Search, Bell, LayoutDashboard, Users, BarChart2, BookOpen, Settings, LogOut, Plus, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const colors = {
  navyMain: '#1a3a5c',
  navyPale: '#B0D4F1',
  idbRed: '#8B1A1A',
  idbGold: '#C8960C',
  pageBg: '#f0f4f8',
  cardBg: '#ffffff',
};

interface Program {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: "Ongoing" | "Completed" | "Upcoming";
  enrolled: number;
}

const mockPrograms: Program[] = [
  { id: 1, name: "SME Digital Literacy", startDate: "Apr 2", endDate: "Apr 17, 2026", location: "Colombo", status: "Ongoing", enrolled: 10 },
  { id: 2, name: "Export Readiness 2024", startDate: "Mar 3", endDate: "Apr 2, 2026", location: "Kandy", status: "Completed", enrolled: 10 },
  { id: 3, name: "Agri-Tech Innovations", startDate: "Apr 27", endDate: "May 12, 2026", location: "Anuradhapura", status: "Upcoming", enrolled: 10 },
  { id: 4, name: "Women in Business Bootcamp", startDate: "Apr 7", endDate: "May 2, 2026", location: "Galle", status: "Ongoing", enrolled: 10 },
  { id: 5, name: "Financial Management Mastery", startDate: "Jan 2", endDate: "Jan 22, 2026", location: "Colombo", status: "Completed", enrolled: 10 },
  { id: 6, name: "Tourism Service Excellence", startDate: "May 27", endDate: "Jun 11, 2026", location: "Matara", status: "Upcoming", enrolled: 10 },
];

function getStatusStyle(status: string) {
  switch (status) {
    case "Ongoing": return { backgroundColor: '#dcfce7', color: '#16a34a' };
    case "Completed": return { backgroundColor: '#e0f2fe', color: '#0369a1' };
    case "Upcoming": return { backgroundColor: '#ede9fe', color: '#7c3aed' };
    default: return {};
  }
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ icon, label, active }: NavItemProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors"
      style={active ? { backgroundColor: colors.idbRed, color: '#ffffff' } : { color: colors.navyPale }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(176,212,241,0.1)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export default function Programs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const colStyle = "2fr 200px 170px 130px 100px 100px";
  const minTableWidth = "900px";

  const filtered = mockPrograms.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen" style={{ backgroundColor: colors.pageBg }}>

      {/* Sidebar */}
      <aside className="w-64 flex flex-col justify-between py-6 px-3" style={{ backgroundColor: colors.navyMain }}>
        <div>
          <div className="flex items-center gap-3 px-4 mb-8">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: colors.idbRed }}>
              IDB
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">IDB Platform</p>
              <p className="text-xs" style={{ color: colors.navyPale }}>TRAINING & DEV</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            <NavItem icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
            <NavItem icon={<BookOpen className="w-4 h-4" />} label="Programs" active />
            <NavItem icon={<Users className="w-4 h-4" />} label="Participants" />
            <NavItem icon={<BarChart2 className="w-4 h-4" />} label="Analytics" />
            <NavItem icon={<BookOpen className="w-4 h-4" />} label="Digital Diary" />
            <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" />
          </nav>
        </div>
        <div className="px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: colors.idbRed }}>I</div>
            <div>
              <p className="text-white text-sm font-medium">IDB Admin</p>
              <p className="text-xs" style={{ color: colors.navyPale }}>Administrator</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: colors.navyPale }}>
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <header className="border-b px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
          <h1 className="participants-title" style={{ color: colors.navyMain }}>Programs</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-9 w-64" placeholder="Search..." />
            </div>
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5" style={{ color: colors.idbGold }} />
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-hidden p-6 pt-4 flex flex-col gap-4">

          {/* Title Row */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: colors.navyMain }}>Training Programs</h2>
              <p className="text-gray-500 text-sm mt-1">Manage all SME training initiatives and bootcamps.</p>
            </div>
            <Button className="text-white gap-2 hover:opacity-90" style={{ backgroundColor: colors.idbRed }}>
              <Plus className="w-4 h-4" />
              Add Program
            </Button>
          </div>

          {/* Filters */}
          <div className="rounded-xl border p-4 flex gap-3" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-9" placeholder="Search programs..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table Card */}
          <div className="rounded-xl border flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>

            {/* Single scroll container for BOTH header and rows */}
            <div className="flex-1 overflow-auto">

              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: colStyle,
                minWidth: minTableWidth,
                backgroundColor: colors.pageBg,
                borderBottom: `1px solid #e2e8f0`,
                padding: '12px 16px',
                position: 'sticky',
                top: 0,
                zIndex: 5,
              }}>
                {['Program Name', 'Dates', 'Location', 'Status', 'Enrolled', 'Actions'].map((col) => (
                  <div key={col} className="text-sm font-semibold" style={{ color: colors.navyMain, textAlign: col === 'Enrolled' ? 'center' : 'left' }}>
                    {col}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {filtered.map((program, index) => (
                <div
                  key={program.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: colStyle,
                    minWidth: minTableWidth,
                    padding: '12px 16px',
                    borderBottom: index < filtered.length - 1 ? `1px solid #e2e8f0` : 'none',
                    alignItems: 'center',
                  }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm font-medium" style={{ color: colors.navyMain }}>{program.name}</div>
                  <div className="text-sm text-gray-600">{program.startDate} - {program.endDate}</div>
                  <div className="text-sm text-gray-600">{program.location}</div>
                  <div>
                    <Badge className="hover:opacity-90" style={getStatusStyle(program.status)}>
                      {program.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 text-center">{program.enrolled}</div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 rounded hover:bg-gray-100">
                      <Eye className="w-4 h-4" style={{ color: colors.idbGold }} />
                    </button>
                    <button className="p-1 rounded hover:bg-red-50">
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}

            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-end gap-4 px-4 py-3 border-t shrink-0" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Rows per page:</span>
                <select className="border border-gray-300 rounded px-2 py-1 text-sm" value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <span className="text-sm text-gray-600">1–{filtered.length} of {filtered.length}</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-40" disabled>
                  <svg className="w-5 h-5" style={{ color: colors.navyMain }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-40" disabled>
                  <svg className="w-5 h-5" style={{ color: colors.navyMain }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
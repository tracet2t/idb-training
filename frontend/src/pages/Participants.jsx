import { useState } from "react";
import { Search, Bell, LayoutDashboard, Users, BarChart2, BookOpen, Settings, LogOut, Plus, Pencil } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const colors = {
  navyMain: '#1a3a5c',
  navyPale: '#B0D4F1',
  idbRed: '#8B1A1A',
  idbGold: '#C8960C',
  pageBg: '#f0f4f8',
  cardBg: '#ffffff',
};

const mockParticipants = [
  { id: 1, nic: "198235232321V", fullName: "Aisha Mohamed Farook", phone: "0771234501", gender: "Female", status: "Active", programs: 3 },
  { id: 2, nic: "198245242322V", fullName: "Kasun Perera Silva", phone: "0771234502", gender: "Male", status: "Active", programs: 2 },
  { id: 3, nic: "198255252323V", fullName: "Fathima Rizna Hashim", phone: "0771234503", gender: "Female", status: "Active", programs: 1 },
  { id: 4, nic: "198265262324V", fullName: "Nuwan Bandara Jayasinghe", phone: "0771234504", gender: "Male", status: "Active", programs: 3 },
  { id: 5, nic: "198275272325V", fullName: "Sanduni Dilhara Wickrama", phone: "0771234505", gender: "Female", status: "Inactive", programs: 0 },
  { id: 6, nic: "198285282326V", fullName: "Mohamed Rizwan Nizar", phone: "0771234506", gender: "Male", status: "Active", programs: 2 },
  { id: 7, nic: "198295292327V", fullName: "Priya Kumari Dissanayake", phone: "0771234507", gender: "Female", status: "Active", programs: 1 },
  { id: 8, nic: "198305302328V", fullName: "Chaminda Lakmal Fernando", phone: "0771234508", gender: "Male", status: "Active", programs: 4 },
  { id: 9, nic: "198315312329V", fullName: "Nadia Fathima Saleem", phone: "0771234509", gender: "Female", status: "Inactive", programs: 0 },
  { id: 10, nic: "198325322330V", fullName: "Ruwan Prasad Gunawardena", phone: "0771234510", gender: "Male", status: "Active", programs: 2 },
  { id: 11, nic: "198335332331V", fullName: "Amara Sewwandi Rajapaksa", phone: "0771234511", gender: "Female", status: "Active", programs: 3 },
  { id: 12, nic: "198345342332V", fullName: "Hassan Ibrahim Marzook", phone: "0771234512", gender: "Male", status: "Active", programs: 1 },
  { id: 13, nic: "198355352333V", fullName: "Tharushi Madara Liyanage", phone: "0771234513", gender: "Female", status: "Inactive", programs: 0 },
  { id: 14, nic: "198365362334V", fullName: "Dinesh Kumar Wijeratne", phone: "0771234514", gender: "Male", status: "Active", programs: 2 },
  { id: 15, nic: "198375372335V", fullName: "Shamila Dilrukshi Mendis", phone: "0771234515", gender: "Female", status: "Active", programs: 3 },
  { id: 16, nic: "198385382336V", fullName: "Ajith Kumara Seneviratne", phone: "0771234516", gender: "Male", status: "Active", programs: 1 },
  { id: 17, nic: "198395392337V", fullName: "Rifka Nusrath Fazil", phone: "0771234517", gender: "Female", status: "Active", programs: 2 },
  { id: 18, nic: "198405402338V", fullName: "Lahiru Chathuranga Herath", phone: "0771234518", gender: "Male", status: "Inactive", programs: 0 },
  { id: 19, nic: "198415412339V", fullName: "Nadeesha Chathurika Alwis", phone: "0771234519", gender: "Female", status: "Active", programs: 4 },
  { id: 20, nic: "198425422340V", fullName: "Sampath Bandula Rathnayake", phone: "0771234520", gender: "Male", status: "Active", programs: 2 },
];

function NavItem({ icon, label, active }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors"
      style={active ? { backgroundColor: colors.idbRed, color: '#ffffff' } : { color: colors.navyPale }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(176,212,241,0.1)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function AddParticipantDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="text-white gap-2 hover:opacity-90" style={{ backgroundColor: colors.idbRed }}>
          <Plus className="w-4 h-4" />
          Add Participant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: colors.navyMain }}>Add New Participant</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Input placeholder="Full Name" />
          <Input placeholder="NIC" />
          <Input placeholder="Phone" />
          <Select>
            <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button className="text-white w-full hover:opacity-90" style={{ backgroundColor: colors.idbRed }}>
            Save Participant
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const colStyle = "180px 2fr 140px 100px 110px 90px 80px";

export default function Participants() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = mockParticipants.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.nic.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen" style={{ backgroundColor: colors.pageBg }}>
      <aside className="w-64 flex flex-col justify-between py-6 px-3" style={{ backgroundColor: colors.navyMain }}>
        <div>
          <div className="flex items-center gap-3 px-4 mb-8">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: colors.idbRed }}>IDB</div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">IDB Platform</p>
              <p className="text-xs" style={{ color: colors.navyPale }}>TRAINING & DEV</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            <NavItem icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
            <NavItem icon={<BookOpen className="w-4 h-4" />} label="Programs" />
            <NavItem icon={<Users className="w-4 h-4" />} label="Participants" active />
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
          <h1 className="participants-title" style={{ color: colors.navyMain }}>Participants</h1>
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

        <main className="flex-1 overflow-hidden p-6 pt-4 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: colors.navyMain }}>Participants Directory</h2>
              <p className="text-gray-500 text-sm mt-1">Manage SME owners and training attendees.</p>
            </div>
            <AddParticipantDialog />
          </div>

          <div className="rounded-xl border p-4 flex gap-3" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-9" placeholder="Search by name or NIC..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
            <div className="flex-1 overflow-auto">
              <div style={{ display: 'grid', gridTemplateColumns: colStyle, minWidth: '750px', backgroundColor: colors.pageBg, borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 5 }}>
                {['NIC', 'Full Name', 'Phone', 'Gender', 'Status', 'Programs', 'Actions'].map((col) => (
                  <div key={col} className="text-sm font-semibold" style={{ color: colors.navyMain, textAlign: col === 'Programs' ? 'center' : 'left' }}>{col}</div>
                ))}
              </div>
              {filtered.map((participant, index) => (
                <div key={participant.id} style={{ display: 'grid', gridTemplateColumns: colStyle, minWidth: '750px', padding: '12px 16px', borderBottom: index < filtered.length - 1 ? '1px solid #e2e8f0' : 'none', alignItems: 'center' }} className="hover:bg-gray-50 transition-colors">
                  <div className="text-sm text-gray-600">{participant.nic}</div>
                  <div className="text-sm font-medium" style={{ color: colors.navyMain }}>{participant.fullName}</div>
                  <div className="text-sm text-gray-600">{participant.phone}</div>
                  <div className="text-sm text-gray-600">{participant.gender}</div>
                  <div>
                    <Badge className="hover:opacity-90" style={participant.status === "Active" ? { backgroundColor: '#dcfce7', color: '#16a34a' } : { backgroundColor: '#fee2e2', color: colors.idbRed }}>
                      {participant.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 text-center">{participant.programs}</div>
                  <div>
                    <button className="p-1 rounded hover:bg-gray-100">
                      <Pencil className="w-4 h-4" style={{ color: colors.idbGold }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

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
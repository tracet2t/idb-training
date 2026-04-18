import { useState } from "react";
import { Search, Bell, LayoutDashboard, Users, BarChart2, BookOpen, Settings, LogOut, Filter, Plus, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function Analytics() {
  const [matchType, setMatchType] = useState("ALL");
  const [rules, setRules] = useState([
    { id: 1, not: false, field: "program_name", operator: "contains", value: "" },
  ]);

  const addRule = () => {
    setRules([...rules, { id: Date.now(), not: false, field: "program_name", operator: "contains", value: "" }]);
  };

  const removeRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const updateRule = (id, field, value) => {
    setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

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
            <NavItem icon={<Users className="w-4 h-4" />} label="Participants" />
            <NavItem icon={<BarChart2 className="w-4 h-4" />} label="Analytics" active />
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
          <h1 className="participants-title" style={{ color: colors.navyMain }}>Analytics</h1>
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

        <main className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold" style={{ color: colors.navyMain }}>Analytics Query Builder</h2>
            <p className="text-gray-500 text-sm mt-1">Build complex queries to segment and analyze participant data.</p>
          </div>

          <div className="rounded-xl border p-6" style={{ backgroundColor: colors.cardBg, borderColor: '#e2e8f0' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" style={{ color: colors.idbGold }} />
                <span className="font-semibold text-base" style={{ color: colors.navyMain }}>Filters</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMatchType("ALL")}
                  className="px-3 py-1.5 text-sm rounded border transition-colors"
                  style={matchType === "ALL" ? { backgroundColor: colors.navyPale, color: colors.navyMain, borderColor: colors.navyMain, fontWeight: 600 } : { backgroundColor: 'transparent', color: '#6b7280', borderColor: '#e2e8f0' }}
                >
                  Match ALL (AND)
                </button>
                <button
                  onClick={() => setMatchType("ANY")}
                  className="px-3 py-1.5 text-sm rounded border transition-colors"
                  style={matchType === "ANY" ? { backgroundColor: colors.navyPale, color: colors.navyMain, borderColor: colors.navyMain, fontWeight: 600 } : { backgroundColor: 'transparent', color: '#6b7280', borderColor: '#e2e8f0' }}
                >
                  Match ANY (OR)
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: '#e2e8f0' }}>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={rule.not} onCheckedChange={(checked) => updateRule(rule.id, 'not', checked)} />
                    <span className="text-sm font-medium text-gray-600">NOT</span>
                  </div>
                  <Select value={rule.field} onValueChange={(val) => updateRule(rule.id, 'field', val)}>
                    <SelectTrigger className="w-44"><SelectValue placeholder="Select field" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="program_name">Program Name</SelectItem>
                      <SelectItem value="participant_name">Participant Name</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="gender">Gender</SelectItem>
                      <SelectItem value="nic">NIC</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={rule.operator} onValueChange={(val) => updateRule(rule.id, 'operator', val)}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Operator" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contains">contains</SelectItem>
                      <SelectItem value="equals">equals</SelectItem>
                      <SelectItem value="starts_with">starts with</SelectItem>
                      <SelectItem value="ends_with">ends with</SelectItem>
                      <SelectItem value="is_empty">is empty</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input className="flex-1" placeholder="Value" value={rule.value} onChange={(e) => updateRule(rule.id, 'value', e.target.value)} />
                  <button onClick={() => removeRule(rule.id)} className="p-2 rounded hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <button onClick={addRule} className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80" style={{ color: colors.navyMain }}>
                <Plus className="w-4 h-4" style={{ color: colors.idbGold }} />
                Add Rule
              </button>
              <Button className="text-white gap-2 hover:opacity-90" style={{ backgroundColor: colors.idbRed }}>
                <Play className="w-4 h-4 fill-white" />
                Run Query
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
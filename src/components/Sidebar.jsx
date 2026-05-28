import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  ClipboardList, 
  Cpu, 
  ShieldAlert, 
  Wrench, 
  Box, 
  GitCommit, 
  BarChart2, 
  LayoutDashboard, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: '홈', icon: Home, path: '/' },
    { name: '실시간 현황', icon: Activity, path: '/realtime' },
    { name: '생산 관리', icon: ClipboardList, path: '/production' },
    { name: '공정 관리', icon: Cpu, path: '/process' },
    { name: '품질 관리', icon: ShieldAlert, path: '/quality' },
    { name: '설비 관리', icon: Wrench, path: '/equipment' },
    { name: '자재 관리', icon: Box, path: '/material' },
    { name: '추적 관리', icon: GitCommit, path: '/tracking' },
    { name: '리포트', icon: BarChart2, path: '/reports' },
    { name: '대시보드', icon: LayoutDashboard, path: '/' }, // Linking to dashboard as well
    { name: '시스템 관리', icon: Settings, path: '/settings' },
  ];

  return (
    <aside 
      className={`relative flex flex-col bg-[#0B0F19] text-slate-300 transition-all duration-300 border-r border-[#1E293B] ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-4 py-6 border-b border-[#1E293B] overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-blue-600 font-bold text-white text-lg">
            B
          </div>
          {!isCollapsed && (
            <div className="flex flex-col select-none">
              <span className="font-semibold text-white tracking-wider text-base">
                Battery <span className="text-blue-500">MES</span>
              </span>
              <span className="text-dense-xs text-slate-500 font-medium">
                Manufacturing Execution System
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Menu List */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {menuItems.map((item, idx) => {
          // Check active state
          // For '/' and '/dashboard', they map to same component
          const isActive = 
            location.pathname === item.path || 
            (item.name === '대시보드' && location.pathname === '/');
            
          const Icon = item.icon;

          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-dense-base font-medium transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'hover:bg-slate-800/50 hover:text-white'
              }`}
              title={item.name}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse Button at the Bottom */}
      <div className="border-t border-[#1E293B] p-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-dense-sm font-medium text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-all"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-center mx-auto" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>메뉴 접기</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

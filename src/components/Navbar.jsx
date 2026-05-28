import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, HelpCircle, User, Cloud, Database, Play, Square } from 'lucide-react';
import { setSimulationActive, updateWorkOrder, addWorkOrder, addLog } from '../store/slices/mesSlice';
import HelpModal from './HelpModal';

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { dbMode, firebaseConnected, simulationActive, logs, lots, workOrders } = useSelector(state => state.mes);
  const [time, setTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date: YYYY.MM.DD (Day) HH:MM:SS
  const formatDateTime = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    
    const week = ['일', '월', '화', '수', '목', '금', '토'];
    const day = week[date.getDay()];
    
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    
    return `${yyyy}.${mm}.${dd} (${day}) ${hh}:${min}:${ss}`;
  };

  // LEVEL 1: Start simulation and auto-run pending/paused orders if none are active
  const handleToggleSimulation = () => {
    if (!simulationActive) {
      const running = workOrders.filter(o => o.status === 'running');
      if (running.length === 0) {
        const toStart = workOrders.find(o => o.status === 'pending' || o.status === 'paused');
        if (toStart) {
          dispatch(updateWorkOrder({ id: toStart.id, updates: { status: 'running' } }));
        } else {
          // Fallback: create a new active work order if all are completed
          dispatch(addWorkOrder({
            processType: 'electrode',
            status: 'running',
            targetQty: 10000,
            currentQty: 0
          }));
        }
      }
    }
    dispatch(setSimulationActive(!simulationActive));
  };

  // LEVEL 2 HelpModal State
  const [helpOpen, setHelpOpen] = useState(false);

  // Get active error/warning count for notifications
  // Based on lots with active defect status (error/warning) to match the quality tab defect table exactly
  const recentAlertsCount = lots.filter(l => l.status === 'error' || l.status === 'warning').length;

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shrink-0 z-10">
      {/* Left side: Greetings */}
      <div className="flex flex-col">
        <h1 className="text-dense-lg font-bold text-slate-800">안녕하세요, 관리자님</h1>
        <p className="text-dense-xs text-slate-500">오늘도 안전하고 효율적인 생산을 응원합니다.</p>
      </div>

      {/* Right side: Controls & Time & Profile */}
      <div className="flex items-center gap-6">
        {/* Simulator controls */}
        <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
          <button
            onClick={handleToggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-1 text-dense-xs font-semibold rounded-sm transition-all border ${
              simulationActive 
                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            {simulationActive ? (
              <>
                <Square className="h-3 w-3 fill-amber-700 text-amber-700" />
                <span>시뮬레이터 중지</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-emerald-700 text-emerald-700" />
                <span>시뮬레이터 시작</span>
              </>
            )}
          </button>

          {/* Database Mode indicator */}
          <div 
            className={`flex items-center gap-1 px-2.5 py-1 text-dense-xs font-medium rounded-sm border ${
              dbMode === 'firebase' && firebaseConnected
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
            title={dbMode === 'firebase' ? 'Firebase Cloud Firestore Connected' : 'Offline Local Mock DB Active'}
          >
            {dbMode === 'firebase' && firebaseConnected ? (
              <>
                <Cloud className="h-3 w-3" />
                <span>Cloud DB</span>
              </>
            ) : (
              <>
                <Database className="h-3 w-3" />
                <span>Local DB</span>
              </>
            )}
          </div>
        </div>

        {/* Live Clock */}
        <div className="text-dense-base font-bold text-slate-700 font-mono tracking-tight bg-slate-50 border border-slate-100 px-3 py-1 rounded-sm">
          {formatDateTime(time)}
        </div>

        {/* Alert Bell with counts - LEVEL 1 redirect to quality page */}
        <div 
          onClick={() => navigate('/quality')}
          className="relative cursor-pointer text-slate-600 hover:text-blue-600 transition-colors"
          title="이상 이력 알림 조회"
        >
          <Bell className="h-5 w-5" />
          {recentAlertsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
              {Math.min(9, recentAlertsCount)}
            </span>
          )}
        </div>

        {/* Help Icon */}
        <div 
          onClick={() => setHelpOpen(true)}
          className="cursor-pointer text-slate-600 hover:text-blue-600 transition-colors" 
          title="시스템 가이드"
        >
          <HelpCircle className="h-5 w-5" />
        </div>

        {/* User profile dropdown simulator */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4 cursor-pointer select-none">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-200">
            <User className="h-4.5 w-4.5" />
          </div>
          <span className="text-dense-sm font-semibold text-slate-700">관리자</span>
          <span className="text-[10px] text-slate-400">▼</span>
        </div>
      </div>

      {/* LEVEL 2: Dynamic Help Modal */}
      <HelpModal 
        isOpen={helpOpen} 
        onClose={() => setHelpOpen(false)} 
        currentPath={window.location.pathname}
      />
    </header>
  );
}

export default Navbar;

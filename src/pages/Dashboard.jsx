import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  X,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Package,
  Layers,
  Search,
  Eye,
  Hammer,
  ClipboardList,
  Calendar
} from 'lucide-react';
import { setSimulationActive, deleteLogThunk } from '../store/slices/mesSlice';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { lots, workOrders, equipment, logs, stats, simulationActive } = useSelector(state => state.mes);
  
  // LEVEL 2 & 3 State variables
  const [selectedDate, setSelectedDate] = useState('2026-05-28');
  const [selectedPeriod, setSelectedPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly', 'yearly'
  const [chartMetric, setChartMetric] = useState('production'); // 'production', 'utilization', 'yield'
  const [ticks, setTicks] = useState(0);

  // Wobble effect timer for liveness
  useEffect(() => {
    let interval = null;
    if (simulationActive) {
      interval = setInterval(() => {
        setTicks(t => t + 1);
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulationActive]);

  // Dynamic statistics aggregation based on date and period
  const getAggregatedStats = () => {
    let dateHash = 0;
    for (let i = 0; i < selectedDate.length; i++) {
      dateHash += selectedDate.charCodeAt(i);
    }
    const variance = 1 + (dateHash % 10 - 5) / 100; // e.g. 0.95 ~ 1.05

    let periodMultiplier = 1.0;
    if (selectedPeriod === 'weekly') periodMultiplier = 7.3;
    else if (selectedPeriod === 'monthly') periodMultiplier = 31.2;
    else if (selectedPeriod === 'yearly') periodMultiplier = 365.0;

    const basePlanned = stats.plannedQty || 31000;
    const baseActual = stats.actualQty || 30995;
    const baseUtilization = stats.overallUtilization || 90.8;
    const baseYield = stats.overallYield || 97.6;

    const plannedQty = Math.round(basePlanned * periodMultiplier * variance);
    const actualQty = Math.round(baseActual * periodMultiplier * variance);
    const achievementRate = plannedQty > 0 ? parseFloat(((actualQty / plannedQty) * 100).toFixed(2)) : 0;
    
    const overallUtilization = parseFloat(Math.min(100, Math.max(50, baseUtilization + (dateHash % 6 - 3) * 0.5)).toFixed(1));
    const overallYield = parseFloat(Math.min(100, Math.max(80, baseYield + (dateHash % 4 - 2) * 0.3)).toFixed(1));

    return {
      plannedQty,
      actualQty,
      achievementRate,
      overallUtilization,
      overallYield
    };
  };

  const currentStats = getAggregatedStats();

  // Calculate process-specific cards KPI
  const getProcessKPI = (step) => {
    const stepLots = lots.filter(l => l.processStep === step);
    const totalProd = stepLots.reduce((sum, l) => sum + l.productionQty, 0);
    const totalGood = stepLots.reduce((sum, l) => sum + l.goodQty, 0);
    const yieldRate = totalProd > 0 ? parseFloat(((totalGood / totalProd) * 100).toFixed(1)) : 100.0;

    const stepEquips = equipment.filter(e => e.processType === step);
    const avgUtil = stepEquips.length > 0 
      ? parseFloat((stepEquips.reduce((sum, e) => sum + e.utilization, 0) / stepEquips.length).toFixed(1))
      : 0;

    return {
      production: totalProd.toLocaleString(),
      yieldRate: yieldRate.toFixed(1),
      utilization: avgUtil.toFixed(1)
    };
  };

  const electrodeKPI = getProcessKPI('electrode');
  const assemblyKPI = getProcessKPI('assembly');
  const formationKPI = getProcessKPI('formation');
  const moduleKPI = getProcessKPI('module');

  // Chart Dynamic Time-Series Data based on current stats and chartMetric
  const getDynamicChartData = () => {
    const points = ['00시', '06시', '12시', '18시', '실시간'];
    
    const electrodeLots = lots.filter(l => l.processStep === 'electrode');
    const assemblyLots = lots.filter(l => l.processStep === 'assembly');
    const formationLots = lots.filter(l => l.processStep === 'formation');
    const moduleLots = lots.filter(l => l.processStep === 'module');

    const getYield = (stepLots) => {
      const prod = stepLots.reduce((sum, l) => sum + l.productionQty, 0);
      const good = stepLots.reduce((sum, l) => sum + l.goodQty, 0);
      return prod > 0 ? parseFloat(((good / prod) * 100).toFixed(1)) : 98.5;
    };

    const getUtil = (process) => {
      const stepEquips = equipment.filter(e => e.processType === process);
      return stepEquips.length > 0 
        ? parseFloat((stepEquips.reduce((sum, e) => sum + e.utilization, 0) / stepEquips.length).toFixed(1))
        : 90.0;
    };

    const baseElProd = electrodeLots.slice(0, 5).reduce((sum, l) => sum + l.productionQty, 0) || 5000;
    const baseAsProd = assemblyLots.slice(0, 5).reduce((sum, l) => sum + l.productionQty, 0) || 4000;
    const baseFmProd = formationLots.slice(0, 5).reduce((sum, l) => sum + l.productionQty, 0) || 3500;
    const baseMdProd = moduleLots.slice(0, 5).reduce((sum, l) => sum + l.productionQty, 0) || 2000;

    const elYield = getYield(electrodeLots);
    const asYield = getYield(assemblyLots);
    const fmYield = getYield(formationLots);
    const mdYield = getYield(moduleLots);

    const elUtil = getUtil('electrode');
    const asUtil = getUtil('assembly');
    const fmUtil = getUtil('formation');
    const mdUtil = getUtil('module');

    return points.map((p, idx) => {
      const mult = 0.8 + (idx * 0.1) + (Math.sin(ticks + idx) * 0.04);
      if (chartMetric === 'production') {
        return {
          name: p,
          '전극': Math.round(baseElProd * 0.2 * mult),
          '조립': Math.round(baseAsProd * 0.2 * mult),
          '화성': Math.round(baseFmProd * 0.2 * mult),
          '모듈': Math.round(baseMdProd * 0.2 * mult),
        };
      } else if (chartMetric === 'utilization') {
        return {
          name: p,
          '전극': Math.min(100, parseFloat((elUtil + Math.sin(ticks + idx) * 2).toFixed(1))),
          '조립': Math.min(100, parseFloat((asUtil + Math.cos(ticks + idx) * 2.5).toFixed(1))),
          '화성': Math.min(100, parseFloat((fmUtil + Math.sin(ticks + idx * 1.5) * 1.8).toFixed(1))),
          '모듈': Math.min(100, parseFloat((mdUtil + Math.cos(ticks + idx * 2) * 2.2).toFixed(1))),
        };
      } else {
        // yield
        return {
          name: p,
          '전극': Math.min(100, parseFloat((elYield + Math.cos(ticks + idx) * 0.3).toFixed(2))),
          '조립': Math.min(100, parseFloat((asYield + Math.sin(ticks + idx) * 0.25).toFixed(2))),
          '화성': Math.min(100, parseFloat((fmYield + Math.cos(ticks + idx * 1.2) * 0.15).toFixed(2))),
          '모듈': Math.min(100, parseFloat((mdYield + Math.sin(ticks + idx * 0.8) * 0.2).toFixed(2))),
        };
      }
    });
  };

  const chartData = getDynamicChartData();

  // SVG Gauge Renderer Helper
  const renderCircleGauge = (value, colorClass, strokeColor) => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center h-28 w-28">
        <svg className="h-full w-full transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r={radius}
            className="stroke-slate-200"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="square"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-dense-base font-extrabold text-slate-800 font-mono">{value}%</span>
          <span className="text-[10px] text-slate-400 font-medium select-none">가동률</span>
        </div>
      </div>
    );
  };

  // LEVEL 3: Filter unresolved alerts for the live alerts card
  const activeLogs = logs.filter(l => !l.resolved);

  // LEVEL 4: Handler for alerts click (redirect to quality tab and auto-open defect modal)
  const handleAlertItemClick = (log) => {
    if (log.type === 'error' || log.type === 'warning') {
      const lotNo = log.lotNo || (log.message.match(/LOT-\d+/)?.[0]);
      navigate('/quality', { state: { openDefectLotNo: lotNo } });
    }
  };

  const handleDeleteLog = (e, id) => {
    e.stopPropagation(); // Prevent trigger navigate click event
    dispatch(deleteLogThunk(id));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ================= FIRST ROW: KPI CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Electrode */}
        <div 
          onClick={() => navigate('/process-detail/electrode')}
          className="bg-white border border-slate-200 p-3 flex flex-col justify-between relative group hover:shadow-md transition-all cursor-pointer hover:border-blue-500"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-dense-xs font-bold text-white">1</span>
                <h3 className="text-dense-base font-bold text-blue-600">전극 공정</h3>
              </div>
              <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1 border border-blue-150">상세 보기 &gt;</span>
            </div>
            <p className="text-dense-xs text-slate-400 mb-2">활물질을 코팅하여 전극을 제조</p>
            <div className="h-28 w-full bg-slate-100 flex items-center justify-center overflow-hidden mb-3">
              <img src="/assets/electrode_process.png" alt="Electrode" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-slate-100 pt-2 text-center text-dense-xs">
            <div>
              <span className="block text-[10px] text-slate-400 font-medium select-none">가동률</span>
              <span className="text-dense-sm font-extrabold text-blue-600 font-mono">{electrodeKPI.utilization}%</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-medium select-none">양품률</span>
              <span className="text-dense-sm font-extrabold text-blue-600 font-mono">{electrodeKPI.yieldRate}%</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-medium select-none">생산량</span>
              <span className="text-dense-sm font-extrabold text-slate-800 font-mono">{electrodeKPI.production} m</span>
            </div>
          </div>
          <ArrowRight className="absolute top-1/2 -right-3.5 transform -translate-y-1/2 h-5 w-5 text-slate-300 z-10 hidden md:block" />
        </div>

        {/* Card 2: Assembly */}
        <div 
          onClick={() => navigate('/process-detail/assembly')}
          className="bg-white border border-slate-200 p-3 flex flex-col justify-between relative group hover:shadow-md transition-all cursor-pointer hover:border-emerald-500"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-dense-xs font-bold text-white">2</span>
                <h3 className="text-dense-base font-bold text-emerald-600">조립 공정</h3>
              </div>
              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-1 border border-emerald-150">상세 보기 &gt;</span>
            </div>
            <p className="text-dense-xs text-slate-400 mb-2">전극/분리막/케이스를 조립</p>
            <div className="h-28 w-full bg-slate-100 flex items-center justify-center overflow-hidden mb-3">
              <img src="/assets/assembly_process.png" alt="Assembly" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-slate-100 pt-2 text-center text-dense-xs">
            <div>
              <span className="block text-[10px] text-slate-400 font-medium select-none">가동률</span>
              <span className="text-dense-sm font-extrabold text-emerald-600 font-mono">{assemblyKPI.utilization}%</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-medium select-none">양품률</span>
              <span className="text-dense-sm font-extrabold text-emerald-600 font-mono">{assemblyKPI.yieldRate}%</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-medium select-none">생산량</span>
              <span className="text-dense-sm font-extrabold text-slate-800 font-mono">{assemblyKPI.production} ea</span>
            </div>
          </div>
          <ArrowRight className="absolute top-1/2 -right-3.5 transform -translate-y-1/2 h-5 w-5 text-slate-300 z-10 hidden md:block" />
        </div>

        {/* Card 3: Formation */}
        <div 
          onClick={() => navigate('/process-detail/formation')}
          className="bg-white border border-slate-200 p-3 flex flex-col justify-between relative group hover:shadow-md transition-all cursor-pointer hover:border-violet-500"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-dense-xs font-bold text-white">3</span>
                <h3 className="text-dense-base font-bold text-violet-600">화성 공정</h3>
              </div>
              <span className="text-[9px] font-bold text-violet-500 bg-violet-50 px-1 border border-violet-150">상세 보기 &gt;</span>
            </div>
            <p className="text-dense-xs text-slate-400 mb-2">활성화 및 안정화 공정</p>
            <div className="h-28 w-full bg-slate-100 flex items-center justify-center overflow-hidden mb-3">
              <img src="/assets/formation_process.png" alt="Formation" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-slate-100 pt-2 text-center text-dense-xs">
            <div>
              <span className="block text-[10px] text-slate-400 font-medium select-none">가동률</span>
              <span className="text-dense-sm font-extrabold text-violet-600 font-mono">{formationKPI.utilization}%</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-medium select-none">양품률</span>
              <span className="text-dense-sm font-extrabold text-violet-600 font-mono">{formationKPI.yieldRate}%</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-medium select-none">생산량</span>
              <span className="text-dense-sm font-extrabold text-slate-800 font-mono">{formationKPI.production} ea</span>
            </div>
          </div>
          <ArrowRight className="absolute top-1/2 -right-3.5 transform -translate-y-1/2 h-5 w-5 text-slate-300 z-10 hidden md:block" />
        </div>

        {/* Card 4: Module */}
        <div 
          onClick={() => navigate('/process-detail/module')}
          className="bg-white border border-slate-200 p-3 flex flex-col justify-between relative group hover:shadow-md transition-all cursor-pointer hover:border-orange-500"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-dense-xs font-bold text-white">4</span>
                <h3 className="text-dense-base font-bold text-orange-600">모듈 공정</h3>
              </div>
              <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-1 border border-orange-150">상세 보기 &gt;</span>
            </div>
            <p className="text-dense-xs text-slate-400 mb-2">셀을 조합하여 모듈/팩을 제조</p>
            <div className="h-28 w-full bg-slate-100 flex items-center justify-center overflow-hidden mb-3">
              <img src="/assets/module_process.png" alt="Module" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-slate-100 pt-2 text-center text-dense-xs">
            <div>
              <span className="block text-[10px] text-slate-400 font-medium select-none">가동률</span>
              <span className="text-dense-sm font-extrabold text-orange-600 font-mono">{moduleKPI.utilization}%</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-medium select-none">양품률</span>
              <span className="text-dense-sm font-extrabold text-orange-600 font-mono">{moduleKPI.yieldRate}%</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-medium select-none">생산량</span>
              <span className="text-dense-sm font-extrabold text-slate-800 font-mono">{moduleKPI.production} ea</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECOND ROW: STATS GRID & CHARTS & LOGS ================= */}
      {/* LEVEL 3: Set uniform fixed heights to avoid stretched layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Overall Factory Status (col-span-5) */}
        <div className="bg-white border border-slate-200 p-4 lg:col-span-5 flex flex-col justify-between h-[310px]">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-dense-base font-bold text-slate-800">전체 생산 현황</h3>
              
              {/* Dynamic Calendar & Period Filter */}
              <div className="flex gap-2 items-center">
                <div className="relative flex items-center border border-slate-200 bg-white h-7 px-2 shrink-0">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent border-0 text-[11px] font-semibold text-slate-700 outline-none w-24 cursor-pointer focus:ring-0"
                  />
                </div>
                
                <div className="flex border border-slate-200 bg-slate-50 h-7 select-none">
                  {['daily', 'weekly', 'monthly', 'yearly'].map((period) => {
                    const labelMap = { daily: '일간', weekly: '주간', monthly: '월간', yearly: '연간' };
                    return (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-2 py-0 text-[11px] font-semibold transition-colors ${
                          selectedPeriod === period 
                            ? 'bg-blue-600 text-white' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {labelMap[period]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 text-center mb-4">
              <div className="bg-slate-50 border border-slate-100 p-2">
                <span className="block text-[10px] text-slate-400 font-medium select-none">계획 생산</span>
                <span className="text-[11px] lg:text-dense-xs font-extrabold text-slate-800 font-mono block mt-0.5">{currentStats.plannedQty.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-2">
                <span className="block text-[10px] text-slate-400 font-medium select-none">실적 생산</span>
                <span className="text-[11px] lg:text-dense-xs font-extrabold text-blue-600 font-mono block mt-0.5">{currentStats.actualQty.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-2">
                <span className="block text-[10px] text-slate-400 font-medium select-none">달성률</span>
                <span className="text-[11px] lg:text-dense-xs font-extrabold text-slate-800 font-mono block mt-0.5">{currentStats.achievementRate}%</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-2">
                <span className="block text-[10px] text-slate-400 font-medium select-none">전체 가동</span>
                <span className="text-[11px] lg:text-dense-xs font-extrabold text-emerald-600 font-mono block mt-0.5">{currentStats.overallUtilization}%</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-2">
                <span className="block text-[10px] text-slate-400 font-medium select-none">전체 양품</span>
                <span className="text-[11px] lg:text-dense-xs font-extrabold text-violet-600 font-mono block mt-0.5">{currentStats.overallYield}%</span>
              </div>
            </div>
          </div>
          
          {/* Visual assembly line layout diagram */}
          <div className="border border-slate-100 p-2 bg-slate-50">
            <div className="flex justify-between items-center px-4 py-1.5 border-b border-slate-200">
              <span className="text-dense-xs font-bold text-slate-500 select-none">배터리 제조 라인 레이아웃</span>
              <span className="text-[10px] text-blue-600 flex items-center gap-0.5 cursor-pointer font-bold" onClick={() => navigate('/realtime')}>
                공정 실시간 모니터링 <ArrowRight className="h-3 w-3" />
              </span>
            </div>
            <div className="flex justify-between items-center p-3 relative select-none">
              <div className="flex flex-col items-center z-10 cursor-pointer" onClick={() => navigate('/process-detail/electrode')}>
                <div className="h-10 w-10 bg-blue-600 rounded-sm flex items-center justify-center text-white font-extrabold text-dense-xs shadow-sm hover:scale-105 transition-transform">전극</div>
                <span className="text-[10px] text-slate-500 mt-1 font-semibold">Mixing</span>
              </div>
              <div className="flex-1 h-1 bg-blue-500 mx-2"></div>
              <div className="flex flex-col items-center z-10 cursor-pointer" onClick={() => navigate('/process-detail/assembly')}>
                <div className="h-10 w-10 bg-emerald-600 rounded-sm flex items-center justify-center text-white font-extrabold text-dense-xs shadow-sm hover:scale-105 transition-transform">조립</div>
                <span className="text-[10px] text-slate-500 mt-1 font-semibold">Assembly</span>
              </div>
              <div className="flex-1 h-1 bg-emerald-500 mx-2"></div>
              <div className="flex flex-col items-center z-10 cursor-pointer" onClick={() => navigate('/process-detail/formation')}>
                <div className="h-10 w-10 bg-violet-600 rounded-sm flex items-center justify-center text-white font-extrabold text-dense-xs shadow-sm hover:scale-105 transition-transform">화성</div>
                <span className="text-[10px] text-slate-500 mt-1 font-semibold">Aging</span>
              </div>
              <div className="flex-1 h-1 bg-violet-500 mx-2"></div>
              <div className="flex flex-col items-center z-10 cursor-pointer" onClick={() => navigate('/process-detail/module')}>
                <div className="h-10 w-10 bg-orange-600 rounded-sm flex items-center justify-center text-white font-extrabold text-dense-xs shadow-sm hover:scale-105 transition-transform">모듈</div>
                <span className="text-[10px] text-slate-500 mt-1 font-semibold">Pack</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Production trend (col-span-4) */}
        <div className="bg-white border border-slate-200 p-4 lg:col-span-4 h-[310px]">
          <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-dense-base font-bold text-slate-800">생산 추이</h3>
            <div className="flex border border-slate-200 bg-slate-50 select-none">
              <button 
                onClick={() => setChartMetric('production')}
                className={`px-2.5 py-0.5 text-[10px] font-bold transition-colors ${chartMetric === 'production' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                생산량
              </button>
              <button 
                onClick={() => setChartMetric('utilization')}
                className={`px-2.5 py-0.5 text-[10px] font-bold transition-colors ${chartMetric === 'utilization' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                가동률
              </button>
              <button 
                onClick={() => setChartMetric('yield')}
                className={`px-2.5 py-0.5 text-[10px] font-bold transition-colors ${chartMetric === 'yield' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                양품률
              </button>
            </div>
          </div>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === 'production' ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#64748B" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#64748B" />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 5 }} />
                  <Bar dataKey="전극" stackId="a" fill="#2563EB" />
                  <Bar dataKey="조립" stackId="a" fill="#10B981" />
                  <Bar dataKey="화성" stackId="a" fill="#8B5CF6" />
                  <Bar dataKey="모듈" stackId="a" fill="#F97316" />
                </BarChart>
              ) : (
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#64748B" />
                  <YAxis unit="%" tick={{ fontSize: 9 }} stroke="#64748B" domain={chartMetric === 'utilization' ? [50, 100] : [90, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`]} contentStyle={{ fontSize: 11 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 5 }} />
                  <Line type="monotone" dataKey="전극" stroke="#2563EB" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="조립" stroke="#10B981" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="화성" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="모듈" stroke="#F97316" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Live Alerts Panel (col-span-3) */}
        <div className="bg-white border border-slate-200 p-4 lg:col-span-3 flex flex-col h-[310px] overflow-hidden">
          <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2 shrink-0">
            <h3 className="text-dense-base font-bold text-slate-800">실시간 알림</h3>
            <span className="text-[10px] text-blue-600 hover:underline cursor-pointer font-bold select-none" onClick={() => navigate('/quality')}>
              전체보기 &gt;
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {activeLogs.map((log, idx) => {
              let Icon = Info;
              let iconColor = 'text-blue-500 bg-blue-50';
              let isRedirection = log.type === 'error' || log.type === 'warning';
              
              if (log.type === 'error') {
                Icon = XCircle;
                iconColor = 'text-red-500 bg-red-50';
              } else if (log.type === 'warning') {
                Icon = AlertTriangle;
                iconColor = 'text-amber-500 bg-amber-50';
              } else if (log.type === 'info' && log.message.includes('완료')) {
                Icon = CheckCircle;
                iconColor = 'text-emerald-500 bg-emerald-50';
              }

              return (
                <div 
                  key={log.id || idx} 
                  onClick={() => handleAlertItemClick(log)}
                  className={`flex items-start gap-2.5 border-b border-slate-50 pb-2 last:border-0 p-1 group relative ${
                    isRedirection ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''
                  }`}
                  title={isRedirection ? '클릭하여 해당 공정의 상세 정보 탭으로 이동' : ''}
                >
                  <div className={`p-1 shrink-0 rounded-sm ${iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-dense-xs font-semibold text-slate-700 leading-tight break-all">
                      {log.message}
                    </p>
                    <span className="text-[9px] text-slate-400 font-mono">{log.timestamp ? log.timestamp.slice(11, 16) : ''}</span>
                  </div>

                  {/* LEVEL 3: Close button (X) for info logs on hover */}
                  {!isRedirection && (
                    <button
                      onClick={(e) => handleDeleteLog(e, log.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-1.5 top-1.5 p-0.5 bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-300"
                      title="알림 항목 삭제"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* LEVEL 3: Show "불량 없음" when list is empty */}
            {activeLogs.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-dense-xs text-slate-450 font-bold select-none py-14 gap-1.5">
                <CheckCircle className="h-9 w-9 text-emerald-500" />
                <span>불량 없음</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= THIRD ROW: EQUIPMENT & QUALITY & SHORTCUTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        {/* Left: Equipment State (col-span-4) */}
        <div className="bg-white border border-slate-200 p-4 lg:col-span-4">
          <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-dense-base font-bold text-slate-800">설비 상태</h3>
            <div className="flex gap-2.5 text-[10px] font-semibold text-slate-500 select-none">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-600"></span>가동</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400"></span>정지</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span>점검</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-600"></span>이상</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 pt-2 justify-items-center">
            <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/process-detail/electrode')}>
              {renderCircleGauge(parseFloat(electrodeKPI.utilization), 'text-blue-600', '#2563EB')}
              <span className="text-dense-xs font-bold text-slate-700 mt-1 select-none hover:text-blue-600">전극 설비 &gt;</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/process-detail/assembly')}>
              {renderCircleGauge(parseFloat(assemblyKPI.utilization), 'text-emerald-600', '#10B981')}
              <span className="text-dense-xs font-bold text-slate-700 mt-1 select-none hover:text-emerald-600">조립 설비 &gt;</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/process-detail/formation')}>
              {renderCircleGauge(parseFloat(formationKPI.utilization), 'text-violet-600', '#8B5CF6')}
              <span className="text-dense-xs font-bold text-slate-700 mt-1 select-none hover:text-violet-600">화성 설비 &gt;</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/process-detail/module')}>
              {renderCircleGauge(parseFloat(moduleKPI.utilization), 'text-orange-600', '#F97316')}
              <span className="text-dense-xs font-bold text-slate-700 mt-1 select-none hover:text-orange-600">모듈 설비 &gt;</span>
            </div>
          </div>
        </div>

        {/* Center: Quality progress bars (col-span-3) */}
        <div className="bg-white border border-slate-200 p-4 lg:col-span-3">
          <h3 className="text-dense-base font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">품질 현황 (양품률)</h3>
          <div className="space-y-3 pt-1">
            {/* Electrode Yield */}
            <div>
              <div className="flex justify-between text-dense-xs font-bold text-slate-600 mb-1 select-none">
                <span>전극 공정</span>
                <span className="font-mono text-blue-600">{electrodeKPI.yieldRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2">
                <div className="bg-blue-600 h-2 transition-all duration-500" style={{ width: `${Math.max(0, (parseFloat(electrodeKPI.yieldRate) - 80) * 5)}%` }}></div>
              </div>
            </div>

            {/* Assembly Yield */}
            <div>
              <div className="flex justify-between text-dense-xs font-bold text-slate-600 mb-1 select-none">
                <span>조립 공정</span>
                <span className="font-mono text-emerald-600">{assemblyKPI.yieldRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2">
                <div className="bg-emerald-600 h-2 transition-all duration-500" style={{ width: `${Math.max(0, (parseFloat(assemblyKPI.yieldRate) - 80) * 5)}%` }}></div>
              </div>
            </div>

            {/* Formation Yield */}
            <div>
              <div className="flex justify-between text-dense-xs font-bold text-slate-600 mb-1 select-none">
                <span>화성 공정</span>
                <span className="font-mono text-violet-600">{formationKPI.yieldRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2">
                <div className="bg-violet-600 h-2 transition-all duration-500" style={{ width: `${Math.max(0, (parseFloat(formationKPI.yieldRate) - 80) * 5)}%` }}></div>
              </div>
            </div>

            {/* Module Yield */}
            <div>
              <div className="flex justify-between text-dense-xs font-bold text-slate-600 mb-1 select-none">
                <span>모듈 공정</span>
                <span className="font-mono text-orange-600">{moduleKPI.yieldRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2">
                <div className="bg-orange-600 h-2 transition-all duration-500" style={{ width: `${Math.max(0, (parseFloat(moduleKPI.yieldRate) - 80) * 5)}%` }}></div>
              </div>
            </div>
            
            <div className="flex justify-between text-[9px] font-bold text-slate-400 pt-1 border-t border-slate-50 font-mono select-none">
              <span>80%</span>
              <span>85%</span>
              <span>90%</span>
              <span>95%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Right: Quick shortcuts grid (col-span-3) */}
        <div className="bg-white border border-slate-200 p-4 lg:col-span-3">
          <h3 className="text-dense-base font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">바로가기</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/realtime')}
              className="flex flex-col items-center justify-center p-2.5 border border-slate-200 hover:bg-blue-50/50 hover:border-blue-400 group transition-all text-center rounded-none"
            >
              <Eye className="h-5 w-5 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-dense-xs font-bold text-slate-700">실시간 모니터링</span>
            </button>
            <button
              onClick={() => navigate('/production')}
              className="flex flex-col items-center justify-center p-2.5 border border-slate-200 hover:bg-emerald-50/50 hover:border-emerald-400 group transition-all text-center rounded-none"
            >
              <ClipboardList className="h-5 w-5 text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-dense-xs font-bold text-slate-700">생산 지시 현황</span>
            </button>
            <button
              onClick={() => navigate('/quality')}
              className="flex flex-col items-center justify-center p-2.5 border border-slate-200 hover:bg-red-50/50 hover:border-red-400 group transition-all text-center rounded-none"
            >
              <ShieldCheck className="h-5 w-5 text-red-500 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-dense-xs font-bold text-slate-700">불량 현황</span>
            </button>
            <button
              onClick={() => navigate('/equipment')}
              className="flex flex-col items-center justify-center p-2.5 border border-slate-200 hover:bg-violet-50/50 hover:border-violet-400 group transition-all text-center rounded-none"
            >
              <Hammer className="h-5 w-5 text-violet-500 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-dense-xs font-bold text-slate-700">설비 상태</span>
            </button>
            <button
              onClick={() => navigate('/material')}
              className="flex flex-col items-center justify-center p-2.5 border border-slate-200 hover:bg-orange-50/50 hover:border-orange-400 group transition-all text-center rounded-none"
            >
              <Layers className="h-5 w-5 text-orange-500 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-dense-xs font-bold text-slate-700">자재 재고 현황</span>
            </button>
            <button
              onClick={() => navigate('/tracking')}
              className="flex flex-col items-center justify-center p-2.5 border border-slate-200 hover:bg-slate-100 hover:border-slate-400 group transition-all text-center rounded-none"
            >
              <Search className="h-5 w-5 text-slate-500 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-dense-xs font-bold text-slate-700">이력 추적</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

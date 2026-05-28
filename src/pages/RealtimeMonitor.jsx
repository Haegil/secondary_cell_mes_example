import React from 'react';
import { useSelector } from 'react-redux';
import { Activity, Cpu, RotateCcw, AlertTriangle } from 'lucide-react';

function RealtimeMonitor() {
  const { lots, workOrders, equipment } = useSelector(state => state.mes);

  const steps = [
    { key: 'electrode', name: '전극 공정', color: 'bg-blue-600 border-blue-600', textColor: 'text-blue-600' },
    { key: 'assembly', name: '조립 공정', color: 'bg-emerald-600 border-emerald-600', textColor: 'text-emerald-600' },
    { key: 'formation', name: '화성 공정', color: 'bg-violet-600 border-violet-600', textColor: 'text-violet-600' },
    { key: 'module', name: '모듈 공정', color: 'bg-orange-600 border-orange-600', textColor: 'text-orange-600' }
  ];

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 p-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h2 className="text-dense-base font-bold text-slate-800">실시간 공정 모니터링 현황</h2>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 font-bold font-mono">
          <RotateCcw className="h-3 w-3 animate-spin text-blue-600" />
          AUTO SYNC ACTIVE (3S)
        </span>
      </div>

      {/* Production line flowchart */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-3">
        {steps.map((step) => {
          // Find running lots for this step
          const activeLots = lots.filter(l => l.processStep === step.key).slice(0, 3);
          // Find equipment status
          const stepEquip = equipment.filter(e => e.processType === step.key);
          const runningOrders = workOrders.filter(o => o.processType === step.key && o.status === 'running');

          return (
            <div key={step.key} className="border border-slate-200 bg-slate-50/50 p-3 relative flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-dense-sm font-extrabold ${step.textColor}`}>{step.name}</h3>
                  <span className={`h-2.5 w-2.5 rounded-full ${runningOrders.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                </div>

                {/* Processing Orders */}
                <div className="space-y-1.5 mb-3">
                  <span className="text-[10px] text-slate-400 font-bold block">진행 중인 작업지시:</span>
                  {runningOrders.map(o => (
                    <div key={o.id} className="bg-white border border-slate-200 p-1.5 font-mono text-[10px]">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>{o.id}</span>
                        <span>{Math.min(100, ((o.currentQty / o.targetQty) * 100).toFixed(0))}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1 mt-1">
                        <div className="bg-blue-600 h-1" style={{ width: `${(o.currentQty / o.targetQty) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {runningOrders.length === 0 && (
                    <div className="text-[10px] text-slate-400 font-medium italic">대기 상태 (가동 중지)</div>
                  )}
                </div>

                {/* Active lots list */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold block">최근 유입 LOT:</span>
                  {activeLots.map(l => {
                    let borderCol = 'border-slate-200';
                    let bgCol = 'bg-white';
                    if (l.status === 'error') {
                      borderCol = 'border-red-300';
                      bgCol = 'bg-red-50/50';
                    } else if (l.status === 'warning') {
                      borderCol = 'border-amber-300';
                      bgCol = 'bg-amber-50/50';
                    }
                    return (
                      <div key={l.lotNo} className={`border p-1.5 text-[10px] font-mono leading-tight font-medium ${borderCol} ${bgCol}`}>
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{l.lotNo}</span>
                          <span className={l.status === 'error' ? 'text-red-600' : l.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'}>
                            {l.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400 mt-1">
                          <span>생산: {l.productionQty} ea</span>
                          <span className="font-bold text-slate-600">불량: {l.defectQty}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Equipment status inside card */}
              <div className="border-t border-slate-200 pt-2 mt-4 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">가동 장비 상태:</span>
                {stepEquip.map(eq => (
                  <div key={eq.equipmentId} className="flex justify-between text-[10px] font-medium font-mono text-slate-600">
                    <span className="truncate max-w-[100px]">{eq.name}</span>
                    <span className={`font-bold ${
                      eq.status === 'running' ? 'text-blue-600' :
                      eq.status === 'error' ? 'text-red-500' : 'text-slate-400'
                    }`}>
                      {eq.status.toUpperCase()} ({eq.utilization}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RealtimeMonitor;

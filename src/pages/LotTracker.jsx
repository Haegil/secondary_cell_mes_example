import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { GitCommit, Search, ArrowRight, CornerDownRight, CheckCircle2, Clock } from 'lucide-react';

function LotTracker() {
  const lots = useSelector(state => state.mes.lots);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLotNo, setSelectedLotNo] = useState(lots[0]?.lotNo || '');

  const filteredLots = lots.filter(l => 
    l.lotNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLot = lots.find(l => l.lotNo === selectedLotNo) || lots[0];

  const getFlowSteps = (lot) => {
    if (!lot) return [];
    
    const timeFmt = (t) => t ? t.slice(11, 19) : '대기 중';
    const dateFmt = (t) => t ? t.slice(0, 10) : '';

    const steps = [
      { name: '원료 수급 & 가공', desc: '양품 배합 완료', status: 'done', time: timeFmt(lot.startTime), date: dateFmt(lot.startTime) },
      { name: '전극 공정 (Coating)', desc: `슬러리 도포 및 롤링 (설비: EQ-CT-01)`, status: lot.processStep === 'electrode' && lot.status === 'normal' ? 'running' : 'done', time: timeFmt(lot.startTime), date: dateFmt(lot.startTime) }
    ];

    // Assembly Step
    let assemblyStatus = 'pending';
    if (lot.processStep === 'assembly') assemblyStatus = 'running';
    else if (['formation', 'module'].includes(lot.processStep)) assemblyStatus = 'done';
    steps.push({ 
      name: '조립 공정 (Assembly)', 
      desc: assemblyStatus === 'pending' ? '대기 중' : '전극 와인딩 및 전해액 주입', 
      status: assemblyStatus, 
      time: lot.processStep !== 'electrode' ? timeFmt(lot.startTime) : '', 
      date: lot.processStep !== 'electrode' ? dateFmt(lot.startTime) : '' 
    });

    // Formation Step
    let formationStatus = 'pending';
    if (lot.processStep === 'formation') formationStatus = 'running';
    else if (lot.processStep === 'module') formationStatus = 'done';
    steps.push({ 
      name: '화성 공정 (Formation)', 
      desc: formationStatus === 'pending' ? '대기 중' : '셀 충방전 활성화 및 숙성', 
      status: formationStatus, 
      time: ['formation', 'module'].includes(lot.processStep) ? timeFmt(lot.endTime || lot.startTime) : '', 
      date: ['formation', 'module'].includes(lot.processStep) ? dateFmt(lot.endTime || lot.startTime) : '' 
    });

    // Module Step
    let moduleStatus = 'pending';
    if (lot.processStep === 'module') moduleStatus = 'running';
    steps.push({ 
      name: '모듈 조립 (Module)', 
      desc: moduleStatus === 'pending' ? '대기 중' : '최종 팩 패키징 및 BMS 연결', 
      status: moduleStatus, 
      time: lot.processStep === 'module' ? timeFmt(lot.endTime) : '', 
      date: lot.processStep === 'module' ? dateFmt(lot.endTime) : '' 
    });

    return steps;
  };

  const currentSteps = getFlowSteps(selectedLot);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left: Search and Lot list (col-span-4) */}
      <div className="bg-white border border-slate-200 p-4 lg:col-span-4 flex flex-col h-[500px]">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3 shrink-0">
          <GitCommit className="h-5 w-5 text-blue-600" />
          <h2 className="text-dense-base font-bold text-slate-800">생산 Lot 목록</h2>
        </div>

        {/* Search */}
        <div className="relative shrink-0 mb-3">
          <input
            type="text"
            placeholder="Lot 번호 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 border border-slate-300 bg-white pl-8 pr-3 font-semibold text-dense-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
        </div>

        {/* Lots list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-dense-xs">
          {filteredLots.map(l => (
            <button
              key={l.lotNo}
              onClick={() => setSelectedLotNo(l.lotNo)}
              className={`w-full text-left p-2 border flex justify-between items-center rounded-none font-medium transition-all ${
                selectedLotNo === l.lotNo 
                  ? 'border-blue-500 bg-blue-50/50 font-bold' 
                  : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <span>{l.lotNo}</span>
              <span className={`px-1 text-[9px] uppercase border font-bold ${
                l.status === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                l.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {l.status}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Detailed visual flow timeline (col-span-8) */}
      <div className="bg-white border border-slate-200 p-4 lg:col-span-8 flex flex-col justify-between min-h-[500px]">
        {selectedLot ? (
          <>
            <div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-dense-base font-bold text-slate-800">
                  Lot 역추적 상세 모니터링: <span className="font-mono text-blue-600 font-extrabold">{selectedLot.lotNo}</span>
                </h3>
              </div>

              {/* Steps timeline */}
              <div className="space-y-4 max-w-xl mx-auto py-4">
                {currentSteps.map((step, idx) => {
                  let pointColor = 'bg-slate-200 border-slate-300';
                  let textColor = 'text-slate-400';
                  if (step.status === 'done') {
                    pointColor = 'bg-blue-600 border-blue-700 text-white';
                    textColor = 'text-slate-800 font-bold';
                  } else if (step.status === 'running') {
                    pointColor = 'bg-emerald-500 border-emerald-600 text-white animate-pulse';
                    textColor = 'text-emerald-700 font-extrabold';
                  }

                  return (
                    <div key={idx} className="flex gap-4 items-start relative text-dense-xs">
                      {/* Line connector */}
                      {idx < currentSteps.length - 1 && (
                        <div className="absolute left-4.5 top-9 bottom-0 w-0.5 bg-slate-200 -mb-4"></div>
                      )}

                      {/* Icon point */}
                      <div className={`h-9 w-9 shrink-0 rounded-full border-2 flex items-center justify-center font-bold text-dense-sm shadow-sm ${pointColor}`}>
                        {idx + 1}
                      </div>

                      {/* Content details */}
                      <div className="flex-1 bg-slate-50 border border-slate-100 p-2.5 flex justify-between items-center">
                        <div>
                          <p className={`text-dense-sm ${textColor}`}>{step.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{step.desc}</p>
                        </div>
                        {step.time && (
                          <div className="text-right font-mono text-[10px] text-slate-400 leading-none">
                            <span className="block font-bold text-slate-500">{step.date}</span>
                            <span className="block mt-1">{step.time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick stats summarizing completed LOT */}
            <div className="border-t border-slate-100 pt-3 mt-4">
              <h4 className="text-dense-xs font-bold text-slate-700 mb-2">Lot 공정 품질 요약</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-medium font-mono">
                <div className="bg-slate-50 border border-slate-100 p-2">
                  <span className="text-slate-400 block mb-0.5">최종 공정</span>
                  <span className="text-slate-700 font-bold uppercase">{selectedLot.processStep}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2">
                  <span className="text-slate-400 block mb-0.5">총 생산 수량</span>
                  <span className="text-slate-700 font-bold">{selectedLot.productionQty} ea</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2">
                  <span className="text-slate-400 block mb-0.5">양품 수량</span>
                  <span className="text-emerald-600 font-bold">{selectedLot.goodQty} ea</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2">
                  <span className="text-slate-400 block mb-0.5">불량 수량 / 율</span>
                  <span className="text-red-500 font-bold">{selectedLot.defectQty} ea ({selectedLot.defectRate}%)</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-dense-xs text-slate-400">
            조회할 Lot 번호를 선택하세요.
          </div>
        )}
      </div>
    </div>
  );
}

export default LotTracker;

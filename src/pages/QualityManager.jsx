import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Search, AlertTriangle, Eye, GitCommit, Play, CheckCircle } from 'lucide-react';
import DefectDetailModal from '../components/DefectDetailModal';

function QualityManager() {
  const { lots, logs } = useSelector(state => state.mes);
  const location = useLocation();
  
  // LOT Traceability states
  const [lotSearchTerm, setLotSearchTerm] = useState('');
  const [selectedLotDetails, setSelectedLotDetails] = useState(null);
  const [processSearchFilter, setProcessSearchFilter] = useState('all'); // 'all', 'electrode', 'assembly', 'formation', 'module'
  
  // Defect details modal state
  const [selectedDefectLot, setSelectedDefectLot] = useState(null);

  // Auto-open defect modal when redirected from Dashboard
  useEffect(() => {
    if (location.state && location.state.openDefectLotNo) {
      const targetLot = lots.find(l => l.lotNo === location.state.openDefectLotNo);
      if (targetLot) {
        setSelectedDefectLot(targetLot);
      }
    }
  }, [location.state, lots]);

  // Filter lots that have active defects (warning or error status only)
  const defectLots = lots.filter(lot => lot.status === 'warning' || lot.status === 'error');

  // Error mappings
  const defectDescriptions = {
    electrode: 'coating_thickness_error (코팅 두께 균일도 편차 초과)',
    assembly: 'tab_alignment_error (정렬 오차 한계치 이탈)',
    formation: 'voltage_abnormal (초기 활성화 셀 전압 미달)',
    module: 'bms_connection_fail (배터리관리시스템 신호 통신 오류)'
  };

  const processNames = {
    all: '전체 공정',
    electrode: '전극 공정 (Electrode)',
    assembly: '조립 공정 (Assembly)',
    formation: '화성 공정 (Formation)',
    module: '모듈 공정 (Module)'
  };

  const handleLotSearch = (e) => {
    if (e) e.preventDefault();
    if (!lotSearchTerm) return;
    
    const lot = lots.find(l => l.lotNo.toUpperCase() === lotSearchTerm.trim().toUpperCase());
    if (lot) {
      const lotLogs = logs.filter(log => log.message && log.message.includes(lot.lotNo));
      setSelectedLotDetails({ lot, logs: lotLogs });
    } else {
      setSelectedLotDetails(null);
      alert('입력하신 LOT 번호를 찾을 수 없습니다. 예: LOT-000001 ~ LOT-000120');
    }
  };

  // Directly select a lot from list to trace
  const handleSelectLotToTrace = (lot) => {
    setLotSearchTerm(lot.lotNo);
    const lotLogs = logs.filter(log => log.message && log.message.includes(lot.lotNo));
    setSelectedLotDetails({ lot, logs: lotLogs });
  };

  // Generate trace flow steps for a LOT
  const getTraceFlow = (lot) => {
    const steps = [
      { name: '원자재 투입 및 배합', desc: '양/음극 활물질 및 도전재 배합 완료', status: 'completed', time: lot.startTime },
      { name: '전극 공정 (Electrode)', desc: '금속 박판 코팅 및 건조/압연', status: 'completed', time: lot.startTime }
    ];

    if (lot.processStep === 'assembly' || lot.processStep === 'formation' || lot.processStep === 'module') {
      steps.push({ name: '조립 공정 (Assembly)', desc: '스태킹 및 전해액 주입 밀봉', status: 'completed', time: lot.startTime });
    } else {
      steps.push({ name: '조립 공정 (Assembly)', desc: '스태킹 대기 중', status: 'pending', time: '' });
    }

    if (lot.processStep === 'formation' || lot.processStep === 'module') {
      steps.push({ name: '화성 공정 (Formation)', desc: '초기 충방전 활성화 및 에이징', status: 'completed', time: lot.endTime || lot.startTime });
    } else {
      steps.push({ name: '화성 공정 (Formation)', desc: '에이징 대기 중', status: 'pending', time: '' });
    }

    if (lot.processStep === 'module') {
      steps.push({ name: '모듈 공정 (Module)', desc: 'BMS 및 셀 팩 최종 패키징', status: 'completed', time: lot.endTime });
    } else {
      steps.push({ name: '모듈 공정 (Module)', desc: '팩 포장 대기 중', status: 'pending', time: '' });
    }

    return steps;
  };

  // Filter lots based on process dropdown
  const filteredLotsForTrace = lots.filter(lot => {
    if (processSearchFilter === 'all') return true;
    return lot.processStep === processSearchFilter;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search Lot Tracking Box */}
      <div className="bg-white border border-slate-200 p-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
          <GitCommit className="h-5 w-5 text-blue-600" />
          <h2 className="text-dense-base font-bold text-slate-800">LOT 역추적 관리 (Traceability)</h2>
        </div>
        
        {/* LEVEL 2 Search Interface (LOT input + Process Filter) */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <form onSubmit={handleLotSearch} className="flex gap-2 max-w-sm w-full">
            <input
              type="text"
              placeholder="추적할 LOT 번호 입력 (예: LOT-000001)..."
              value={lotSearchTerm}
              onChange={(e) => setLotSearchTerm(e.target.value)}
              className="w-full h-9 border border-slate-300 bg-white px-3 font-semibold text-dense-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="flex items-center gap-1 bg-slate-800 text-white px-4 py-1.5 text-dense-xs font-semibold hover:bg-slate-700 transition-colors shrink-0"
            >
              <Search className="h-4 w-4" />
              <span>검색</span>
            </button>
          </form>

          {/* Process Filter Dropdown */}
          <div className="flex items-center gap-2 w-full max-w-xs shrink-0 select-none">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">공정 단계 검색:</span>
            <select
              value={processSearchFilter}
              onChange={(e) => setProcessSearchFilter(e.target.value)}
              className="h-9 w-full border border-slate-300 bg-white px-2 font-semibold text-dense-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">전체 공정 (All)</option>
              <option value="electrode">전극 공정 (Electrode)</option>
              <option value="assembly">조립 공정 (Assembly)</option>
              <option value="formation">화성 공정 (Formation)</option>
              <option value="module">모듈 공정 (Module)</option>
            </select>
          </div>
        </div>

        {/* Process list suggestion cards for Traceability click */}
        <div className="border border-slate-150 p-2.5 bg-slate-50 mb-4">
          <span className="text-[10px] font-extrabold text-slate-500 block mb-2 select-none">
            {processNames[processSearchFilter]} LOT 리스트 (클릭 시 이력 추적 로드):
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin select-none max-h-20">
            {filteredLotsForTrace.map(lot => {
              let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              if (lot.status === 'error') badgeColor = 'bg-red-50 text-red-700 border-red-200';
              else if (lot.status === 'warning') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

              return (
                <button
                  key={lot.lotNo}
                  type="button"
                  onClick={() => handleSelectLotToTrace(lot)}
                  className={`flex flex-col p-1.5 border min-w-24 text-center bg-white hover:border-blue-400 hover:shadow-sm transition-all ${
                    lotSearchTerm === lot.lotNo ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200'
                  }`}
                >
                  <span className="font-mono font-bold text-slate-800 text-[10px]">{lot.lotNo}</span>
                  <span className={`text-[8px] font-bold border px-1 mt-0.5 inline-block mx-auto uppercase ${badgeColor}`}>
                    {lot.status}
                  </span>
                </button>
              );
            })}
            {filteredLotsForTrace.length === 0 && (
              <span className="text-[10px] text-slate-400 font-bold p-1">일치하는 가동 LOT가 없습니다.</span>
            )}
          </div>
        </div>

        {/* Selected Lot detailed timeline */}
        {selectedLotDetails && (
          <div className="mt-2 border border-slate-200 p-3 bg-slate-50 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
              <span className="text-dense-sm font-extrabold text-slate-800 select-none">
                LOT 추적 정보: <span className="text-blue-600 font-mono">{selectedLotDetails.lot.lotNo}</span>
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-none uppercase select-none ${
                selectedLotDetails.lot.status === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                selectedLotDetails.lot.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {selectedLotDetails.lot.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Summary table */}
              <div className="text-dense-xs font-medium space-y-1.5 bg-white border border-slate-200 p-3">
                <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-2 select-none">LOT 세부 명세</h4>
                <div className="flex justify-between">
                  <span className="text-slate-400">최종 단계</span>
                  <span className="text-slate-700 font-bold uppercase">{selectedLotDetails.lot.processStep}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">투입 설비</span>
                  <span className="text-slate-700 font-mono font-semibold">{selectedLotDetails.lot.equipmentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">총 생산량 / 양품수</span>
                  <span className="text-slate-700 font-mono">{selectedLotDetails.lot.productionQty} ea / {selectedLotDetails.lot.goodQty} ea</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">불량수 / 불량률</span>
                  <span className="text-red-500 font-mono font-bold">{selectedLotDetails.lot.defectQty} ea ({selectedLotDetails.lot.defectRate}%)</span>
                </div>
              </div>

              {/* Right: Flow timeline */}
              <div className="bg-white border border-slate-200 p-3">
                <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-3 text-dense-xs select-none">공정 진행 히스토리</h4>
                <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-4">
                  {getTraceFlow(selectedLotDetails.lot).map((step, idx) => (
                    <div key={idx} className="relative text-dense-xs">
                      {/* Node point */}
                      <span className={`absolute -left-6.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white ${
                        step.status === 'completed' ? 'bg-blue-600' : 'bg-slate-300'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-700">{step.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{step.desc}</p>
                        </div>
                        {step.time && (
                          <span className="text-[9px] text-slate-400 font-mono">{step.time.slice(5,16).replace('T',' ')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lot alerts log history */}
            {selectedLotDetails.logs.length > 0 && (
              <div className="mt-3 bg-red-50/50 border border-red-200/50 p-2.5">
                <span className="text-[10px] font-bold text-red-700 block mb-1 select-none">관련 수집 경보 로그:</span>
                <ul className="list-disc pl-4 text-[10px] text-slate-600 space-y-1 font-semibold">
                  {selectedLotDetails.logs.map(l => (
                    <li key={l.id}>{l.message} ({l.timestamp.slice(11,19)})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Defect Logs Table - LEVEL 2 row click defect modal open */}
      <div className="bg-white border border-slate-200 p-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
          <ShieldCheck className="h-5 w-5 text-red-500" />
          <h2 className="text-dense-base font-bold text-slate-800">품질 이상 로그 (불량 목록 조회)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-dense-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold select-none">
                <th className="p-3">불량 LOT</th>
                <th className="p-3">발생 공정</th>
                <th className="p-3">이상 등급</th>
                <th className="p-3">검출 오류 유형</th>
                <th className="p-3 text-right">총 생산수</th>
                <th className="p-3 text-right">불량 수량</th>
                <th className="p-3 text-right">불량률</th>
                <th className="p-3">완료 시각</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {defectLots.map(lot => {
                let rating = 'Warning';
                let ratingColor = 'bg-amber-50 text-amber-700 border-amber-200';
                if (lot.status === 'error') {
                  rating = 'Error';
                  ratingColor = 'bg-red-50 text-red-700 border-red-200';
                } else if (lot.status === 'normal') {
                  rating = 'Resolved';
                  ratingColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                }

                return (
                  <tr 
                    key={lot.lotNo} 
                    onClick={() => setSelectedDefectLot(lot)}
                    className="hover:bg-red-50/20 cursor-pointer transition-colors"
                    title="클릭하여 즉각 현장 조치 실시"
                  >
                    <td className="p-3 font-mono font-bold text-slate-800">
                      <span className="text-blue-600 hover:underline font-mono font-bold select-all">
                        {lot.lotNo}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700 uppercase">{lot.processStep}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold border rounded-none select-none uppercase ${ratingColor}`}>
                        {rating}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-semibold">{defectDescriptions[lot.processStep] || 'unknown_defect'}</td>
                    <td className="p-3 text-right font-mono text-slate-700">{lot.productionQty.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-red-500 font-bold">{lot.defectQty.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-red-600">{lot.defectRate}%</td>
                    <td className="p-3 font-mono text-slate-400">
                      {lot.endTime ? lot.endTime.slice(5, 16).replace('T', ' ') : '-'}
                    </td>
                  </tr>
                );
              })}
              {defectLots.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-dense-xs text-slate-400 select-none">
                    현재 감지된 이상/불량 LOT가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Defect action details modal */}
      <DefectDetailModal 
        isOpen={selectedDefectLot !== null}
        onClose={() => setSelectedDefectLot(null)}
        lot={selectedDefectLot}
      />
    </div>
  );
}

export default QualityManager;

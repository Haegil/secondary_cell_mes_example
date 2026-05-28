import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Cpu, Search, AlertCircle, RefreshCw } from 'lucide-react';
import DefectDetailModal from '../components/DefectDetailModal';

function ProcessManager() {
  const lots = useSelector(state => state.mes.lots);
  const [activeTab, setActiveTab] = useState('electrode');
  const [searchTerm, setSearchTerm] = useState('');
  
  // LEVEL 3 Defect modal state
  const [selectedDefectLot, setSelectedDefectLot] = useState(null);

  const tabs = [
    { key: 'electrode', name: '전극 공정 (Electrode)' },
    { key: 'assembly', name: '조립 공정 (Assembly)' },
    { key: 'formation', name: '화성 공정 (Formation)' },
    { key: 'module', name: '모듈 공정 (Module)' }
  ];

  // Filter lots based on activeTab and searchTerm
  const filteredLots = lots.filter(lot => {
    const matchStep = lot.processStep === activeTab;
    const matchSearch = lot.lotNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (lot.equipmentId && lot.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStep && matchSearch;
  });

  // Calculate summary metrics for the active tab
  const totalProduction = filteredLots.reduce((sum, l) => sum + l.productionQty, 0);
  const totalGood = filteredLots.reduce((sum, l) => sum + l.goodQty, 0);
  const totalDefect = filteredLots.reduce((sum, l) => sum + l.defectQty, 0);
  const avgDefectRate = totalProduction > 0 ? ((totalDefect / totalProduction) * 100) : 0;

  // Format short timestamp
  const formatTime = (isoString) => {
    if (!isoString) return '-';
    return isoString.slice(5, 16).replace('T', ' ');
  };

  const handleRowClick = (lot) => {
    if (lot.status !== 'normal') {
      setSelectedDefectLot(lot);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-blue-600" />
          <h2 className="text-dense-base font-bold text-slate-800">공정 관리 (실시간 LOT 관리)</h2>
        </div>
        {/* Search input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="LOT 번호 또는 설비 ID 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 border border-slate-300 bg-white pl-8 pr-3 font-semibold text-dense-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="absolute left-2.5 top-2 h-4.5 w-4.5 text-slate-400" />
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 bg-slate-50 select-none">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-dense-xs font-bold transition-all relative border-r border-slate-200 ${
              activeTab === tab.key 
                ? 'bg-white text-blue-600 border-t-2 border-t-blue-600 font-extrabold' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab statistics summary line */}
      <div className="grid grid-cols-4 gap-4 bg-slate-50 border border-slate-200 p-2.5 text-center text-dense-xs font-medium">
        <div>
          <span className="text-slate-400 select-none">공정 총 생산량</span>
          <span className="block text-dense-base font-extrabold text-slate-800 font-mono mt-0.5">{totalProduction.toLocaleString()} ea</span>
        </div>
        <div>
          <span className="text-slate-400 select-none">공정 양품 수량</span>
          <span className="block text-dense-base font-extrabold text-emerald-600 font-mono mt-0.5">{totalGood.toLocaleString()} ea</span>
        </div>
        <div>
          <span className="text-slate-400 select-none">공정 불량 수량</span>
          <span className="block text-dense-base font-extrabold text-red-500 font-mono mt-0.5">{totalDefect.toLocaleString()} ea</span>
        </div>
        <div>
          <span className="text-slate-400 select-none">평균 불량률</span>
          <span className="block text-dense-base font-extrabold text-slate-800 font-mono mt-0.5">{avgDefectRate.toFixed(2)}%</span>
        </div>
      </div>

      {/* High Density Lots Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-dense-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold select-none">
              <th className="p-3">LOT 번호</th>
              <th className="p-3">가동 상태</th>
              <th className="p-3">설비 ID</th>
              <th className="p-3 text-right">생산 수량</th>
              <th className="p-3 text-right">양품 수량</th>
              <th className="p-3 text-right">불량 수량</th>
              <th className="p-3 text-right">불량률</th>
              <th className="p-3">시작 시간</th>
              <th className="p-3">종료 시간</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredLots.map((lot) => {
              // Status styling (Green, Yellow, Red)
              let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              const isAnomaly = lot.status !== 'normal';
              
              if (lot.status === 'warning') statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
              else if (lot.status === 'error') statusBadge = 'bg-red-50 text-red-700 border-red-200';

              return (
                <tr 
                  key={lot.lotNo} 
                  onClick={() => handleRowClick(lot)}
                  className={`transition-colors ${
                    isAnomaly 
                      ? 'hover:bg-red-50/20 cursor-pointer' 
                      : 'hover:bg-slate-50/50'
                  }`}
                  title={isAnomaly ? '클릭하여 즉각 현장 조치 실시' : ''}
                >
                  <td className="p-3 font-mono font-bold text-slate-800">
                    <span className={isAnomaly ? 'text-blue-600 hover:underline' : ''}>
                      {lot.lotNo}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold border rounded-none uppercase select-none ${statusBadge}`}>
                      {lot.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-semibold text-slate-600">{lot.equipmentId || '-'}</td>
                  <td className="p-3 text-right font-mono font-semibold text-slate-700">{lot.productionQty.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-semibold text-emerald-600">{lot.goodQty.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-semibold text-red-500">{lot.defectQty.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-700">
                    <span className={lot.defectRate > 2 ? 'text-red-500' : lot.defectRate > 0.5 ? 'text-amber-500' : 'text-slate-600'}>
                      {lot.defectRate.toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-400">{formatTime(lot.startTime)}</td>
                  <td className="p-3 font-mono text-slate-400">{formatTime(lot.endTime)}</td>
                </tr>
              );
            })}
            {filteredLots.length === 0 && (
              <tr>
                <td colSpan="9" className="p-6 text-center text-dense-xs text-slate-400">
                  해당 조건에 만족하는 LOT 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* LEVEL 3: Row click defect modal */}
      <DefectDetailModal 
        isOpen={selectedDefectLot !== null} 
        onClose={() => setSelectedDefectLot(null)} 
        lot={selectedDefectLot} 
      />
    </div>
  );
}

export default ProcessManager;

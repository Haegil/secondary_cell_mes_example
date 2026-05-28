import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layers, Plus, RefreshCw } from 'lucide-react';
import { addMaterialReceiptThunk } from '../store/slices/mesSlice';
import NumericInput from '../components/NumericInput';

function MaterialManager() {
  const dispatch = useDispatch();
  const { materials, materialReceipts = [] } = useSelector(state => state.mes);
  
  const [selectedMatCode, setSelectedMatCode] = useState('MAT-001');
  const [replenishQty, setReplenishQty] = useState(1000);

  const handleReplenish = async (e) => {
    e.preventDefault();
    if (!replenishQty || replenishQty <= 0) return;

    const material = materials.find(m => m.materialCode === selectedMatCode);
    if (material) {
      dispatch(addMaterialReceiptThunk({
        materialCode: selectedMatCode,
        materialName: material.name,
        targetQty: Number(replenishQty),
        currentQty: 0,
        status: 'running'
      }));
    }
  };

  const getStockStatus = (qty, code) => {
    if (code === 'MAT-005') { // separator
      if (qty < 2000) return 'text-red-500 font-bold';
      if (qty < 5000) return 'text-amber-500 font-semibold';
      return 'text-emerald-600 font-semibold';
    }
    if (qty < 1000) return 'text-red-500 font-bold';
    if (qty < 2500) return 'text-amber-500 font-semibold';
    return 'text-emerald-600 font-semibold';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top section: inventory list + import form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Inventory List Table (col-span-8) */}
        <div className="bg-white border border-slate-200 p-4 lg:col-span-8">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
            <Layers className="h-5 w-5 text-blue-600" />
            <h2 className="text-dense-base font-bold text-slate-800">원부자재 재고 현황</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-dense-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold select-none">
                  <th className="p-3">자재 코드</th>
                  <th className="p-3">자재 품명</th>
                  <th className="p-3 text-right">현재 재고량</th>
                  <th className="p-3">단위</th>
                  <th className="p-3">재고 상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {materials.map(mat => {
                  let statusText = '안정';
                  let statusBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  
                  const threshold = mat.materialCode === 'MAT-005' ? 2000 : 1000;
                  const warningThreshold = mat.materialCode === 'MAT-005' ? 5000 : 2500;

                  if (mat.stockQty < threshold) {
                    statusText = '부족 (입고 필요)';
                    statusBg = 'bg-red-50 text-red-700 border-red-200';
                  } else if (mat.stockQty < warningThreshold) {
                    statusText = '경계';
                    statusBg = 'bg-amber-50 text-amber-700 border-amber-200';
                  }

                  return (
                    <tr key={mat.materialCode} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-slate-800">{mat.materialCode}</td>
                      <td className="p-3 font-bold text-slate-700">{mat.name}</td>
                      <td className={`p-3 text-right font-mono text-dense-base ${getStockStatus(mat.stockQty, mat.materialCode)}`}>
                        {mat.stockQty.toLocaleString()}
                      </td>
                      <td className="p-3 text-slate-500 font-semibold">{mat.unit}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold border rounded-none uppercase select-none ${statusBg}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Info Box: Material consumption rates */}
          <div className="mt-4 bg-slate-50 border border-slate-200 p-3 text-dense-xs">
            <span className="font-bold text-slate-700 block mb-1">공정별 자재 소모량 안내 (1 Lot 기준)</span>
            <ul className="list-disc pl-4 text-slate-500 space-y-1 font-medium">
              <li><span className="font-bold text-slate-600">전극 공정 (Mixing/Coating)</span>: 양극 활물질 30kg, 음극 활물질 30kg, 도전재 7.5kg, 바인더 4.5kg 소모</li>
              <li><span className="font-bold text-slate-600">조립 공정 (Stacking/Electrolyte)</span>: 분리막 22.5m, 전해액 12L 소모</li>
              <li><span className="font-bold text-slate-600">화성 / 모듈 공정</span>: 가공품 투입 (원자재 소모 없음)</li>
            </ul>
          </div>
        </div>

        {/* Right: Register Import Form (col-span-4) */}
        <div className="bg-white border border-slate-200 p-4 lg:col-span-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
            <Plus className="h-5 w-5 text-blue-600" />
            <h2 className="text-dense-base font-bold text-slate-800">자재 입고 등록</h2>
          </div>

          <form onSubmit={handleReplenish} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-dense-xs font-semibold text-slate-600 select-none">입고 대상 자재</label>
              <select
                value={selectedMatCode}
                onChange={(e) => setSelectedMatCode(e.target.value)}
                className="h-9 border border-slate-300 bg-white px-3 font-semibold text-dense-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {materials.map(m => (
                  <option key={m.materialCode} value={m.materialCode}>
                    {m.name} ({m.materialCode})
                  </option>
                ))}
              </select>
            </div>

            <NumericInput
              label="입고 수량"
              value={replenishQty}
              onChange={setReplenishQty}
              min={50}
              max={10000}
              step={50}
              required
            />

            <button
              type="submit"
              className="w-full h-9 bg-blue-600 text-dense-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm mt-2 rounded-none"
            >
              자재 입고 처리
            </button>
          </form>
        </div>
      </div>

      {/* 자재 입고 진행 현황 Card */}
      <div className="bg-white border border-slate-200 p-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
          <RefreshCw className="h-5 w-5 text-blue-600" />
          <h2 className="text-dense-base font-bold text-slate-800">자재 입고 진행 현황</h2>
        </div>
        
        <div className="overflow-x-auto max-h-60 overflow-y-auto">
          <table className="w-full text-left border-collapse text-dense-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold select-none">
                <th className="p-3">입고 번호</th>
                <th className="p-3">자재 코드</th>
                <th className="p-3">자재 품명</th>
                <th className="p-3 text-right">목표 수량</th>
                <th className="p-3 text-right">현재 입고량</th>
                <th className="p-3">진행률</th>
                <th className="p-3">입고 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {materialReceipts.map(receipt => {
                const progress = Math.min(100, parseFloat(((receipt.currentQty / receipt.targetQty) * 100).toFixed(1)));
                
                let badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
                if (receipt.status === 'running') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                else if (receipt.status === 'completed') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <tr key={receipt.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-slate-800">{receipt.id}</td>
                    <td className="p-3 font-mono text-slate-500">{receipt.materialCode}</td>
                    <td className="p-3 font-bold text-slate-700">{receipt.materialName}</td>
                    <td className="p-3 text-right font-mono font-semibold text-slate-700">{receipt.targetQty.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-semibold text-slate-700">{receipt.currentQty.toLocaleString()}</td>
                    <td className="p-3 w-1/4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-100 h-2 rounded-none overflow-hidden border border-slate-200">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              receipt.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`} 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="font-mono font-bold text-slate-700 w-10 text-right select-none">{progress}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold border rounded-none uppercase select-none ${badgeColor}`}>
                        {receipt.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {materialReceipts.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-dense-xs text-slate-400 select-none">
                    현재 진행 중이거나 완료된 자재 입고 작업이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MaterialManager;

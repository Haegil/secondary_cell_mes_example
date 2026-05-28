import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, AlertTriangle, ShieldCheck, Settings, Wrench, RefreshCw, Layers } from 'lucide-react';
import { resolveDefectThunk } from '../store/slices/mesSlice';

function DefectDetailModal({ isOpen, onClose, lot }) {
  if (!isOpen || !lot) return null;
  const dispatch = useDispatch();
  
  const [selectedAction, setSelectedAction] = useState('recalibrate');
  const [operatorNotes, setOperatorNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defectDescriptions = {
    electrode: 'coating_thickness_error (코팅 두께 균일도 편차 초과)',
    assembly: 'tab_alignment_error (정렬 오차 한계치 이탈)',
    formation: 'voltage_abnormal (초기 활성화 셀 전압 미달)',
    module: 'bms_connection_fail (배터리관리시스템 신호 통신 오류)'
  };

  const handleResolve = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(resolveDefectThunk({ lotNo: lot.lotNo, equipmentId: lot.equipmentId })).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to resolve defect:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white border border-slate-300 w-full max-w-lg flex flex-col p-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <h3 className="text-dense-base font-extrabold text-slate-800">품질 이상 상세 정보 & 즉각 조치</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 text-dense-xs overflow-y-auto max-h-[70vh] pr-1">
          {/* Section 1: Lot Specs */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-3">
            <div>
              <span className="text-slate-400 font-medium block">LOT 번호</span>
              <span className="text-dense-sm font-bold text-slate-800 font-mono">{lot.lotNo}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">발생 공정 단계</span>
              <span className="text-dense-sm font-bold text-slate-800 uppercase font-mono">{lot.processStep}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">검출 설비 ID</span>
              <span className="text-dense-sm font-bold text-slate-800 font-mono">{lot.equipmentId || 'EQ-GEN'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">이상 수준</span>
              <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold border rounded-none uppercase mt-0.5 select-none ${
                lot.status === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {lot.status === 'error' ? 'ERROR (상)' : 'WARNING (중)'}
              </span>
            </div>
          </div>

          {/* Section 2: Defect description */}
          <div className="border border-slate-150 p-3">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-2 select-none">수집된 이상 측정치</h4>
            <div className="space-y-1.5 font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">오류 규격 유형</span>
                <span className="text-red-600">{defectDescriptions[lot.processStep] || '이상 판정'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">총 생산 수량</span>
                <span className="text-slate-700 font-mono">{lot.productionQty.toLocaleString()} ea</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">불량 검출 수량</span>
                <span className="text-red-500 font-mono font-bold">{lot.defectQty.toLocaleString()} ea</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">최종 계산 불량률</span>
                <span className="text-red-600 font-mono font-extrabold">{lot.defectRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">이상 검출 시각</span>
                <span className="text-slate-500 font-mono font-medium">{lot.endTime ? lot.endTime.replace('T', ' ').slice(0, 19) : '-'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Action Panel */}
          <div className="border border-slate-200 p-3 bg-blue-50/20">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-3 flex items-center gap-1.5 select-none">
              <Wrench className="h-4 w-4 text-blue-600" />
              <span>MES 현장 작업 지시 피드백 (조치 사항 입력)</span>
            </h4>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-slate-500 font-bold select-none">적용 조치 유형</label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="h-8 border border-slate-300 bg-white px-2 font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="recalibrate">설비 센서 캘리브레이션 및 영점 재조정</option>
                  <option value="cleaning">롤 표면 클리닝 및 이물질 강제 제거</option>
                  <option value="replace_part">기계 부품 가이드 및 마모 날개 소모품 교체</option>
                  <option value="voltage_tune">안정화 챔버 내부 가열 온도 및 주입 전압 튜닝</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-500 font-bold select-none">조치자 조치 소견 (비고)</label>
                <textarea
                  value={operatorNotes}
                  onChange={(e) => setOperatorNotes(e.target.value)}
                  placeholder="현장 조치 관련 세부 내역을 간략히 기록하십시오..."
                  rows={2}
                  className="p-2 border border-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3.5 mt-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 text-dense-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleResolve}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-1.5 bg-red-600 text-dense-xs font-bold text-white hover:bg-red-700 transition-colors shrink-0"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>조치 적용 중...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>현장 조치 완료 (Clear Alert)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DefectDetailModal;

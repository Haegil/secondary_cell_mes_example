import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  PlusCircle, 
  X, 
  ClipboardList 
} from 'lucide-react';
import { addWorkOrder, updateWorkOrder } from '../store/slices/mesSlice';
import NumericInput from '../components/NumericInput';

function ProductionManager() {
  const dispatch = useDispatch();
  const workOrders = useSelector(state => state.mes.workOrders);
  
  const [showModal, setShowModal] = useState(false);
  const [processType, setProcessType] = useState('electrode');
  const [targetQty, setTargetQty] = useState(1000);
  
  // LEVEL 2 Fields
  const [operatorName, setOperatorName] = useState('');
  const [lineId, setLineId] = useState('LINE-01');
  const [materialBatch, setMaterialBatch] = useState('MAT-BAT-001');
  const [priority, setPriority] = useState('normal'); // 'high', 'normal', 'low'

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!targetQty || targetQty <= 0) return;

    dispatch(addWorkOrder({
      processType,
      status: 'pending',
      targetQty: Number(targetQty),
      currentQty: 0,
      operatorName: operatorName.trim() || '관리자',
      lineId,
      materialBatch: materialBatch.trim() || 'MAT-BAT-01',
      priority
    }));

    setShowModal(false);
    setTargetQty(1000);
    setOperatorName('');
    setLineId('LINE-01');
    setMaterialBatch('MAT-BAT-001');
    setPriority('normal');
  };

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateWorkOrder({ id, updates: { status: newStatus } }));
  };

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 p-4">
      {/* Header and buttons */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-blue-600" />
          <h2 className="text-dense-base font-bold text-slate-800">생산 관리 (작업 지시)</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 text-dense-xs font-semibold rounded-none hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          <span>신규 작업지시 생성</span>
        </button>
      </div>

      {/* Grid table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-dense-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold select-none">
              <th className="p-3">지시 번호</th>
              <th className="p-3">대상 공정</th>
              <th className="p-3">라인</th>
              <th className="p-3">작업자</th>
              <th className="p-3">자재 배치</th>
              <th className="p-3">우선순위</th>
              <th className="p-3">지시 상태</th>
              <th className="p-3 text-right">목표 수량</th>
              <th className="p-3 text-right">현재 생산량</th>
              <th className="p-3">진행률</th>
              <th className="p-3 text-center">제어 명령</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {workOrders.map((order) => {
              const progress = Math.min(100, parseFloat(((order.currentQty / order.targetQty) * 100).toFixed(1)));
              
              // Status badges colors
              let badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
              if (order.status === 'running') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
              else if (order.status === 'completed') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              else if (order.status === 'paused') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

              // Priority badges
              let priorityColor = 'bg-slate-50 text-slate-700 border-slate-200';
              if (order.priority === 'high') priorityColor = 'bg-red-50 text-red-700 border-red-200';
              else if (order.priority === 'low') priorityColor = 'bg-blue-50 text-blue-700 border-blue-200';

              const processNames = {
                electrode: '전극 공정 (Electrode)',
                assembly: '조립 공정 (Assembly)',
                formation: '화성 공정 (Formation)',
                module: '모듈 공정 (Module)'
              };

              const priorityNames = {
                high: '긴급 (High)',
                normal: '보통 (Normal)',
                low: '낮음 (Low)'
              };

              return (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold text-slate-800">{order.id}</td>
                  <td className="p-3 font-semibold text-slate-700">{processNames[order.processType] || order.processType}</td>
                  
                  {/* LEVEL 2 columns */}
                  <td className="p-3 font-semibold text-slate-600 uppercase font-mono">{order.lineId || 'LINE-01'}</td>
                  <td className="p-3 font-semibold text-slate-700">{order.operatorName || '시스템'}</td>
                  <td className="p-3 font-mono text-slate-500 font-semibold">{order.materialBatch || 'MAT-BAT-01'}</td>
                  <td className="p-3">
                    <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold border rounded-none uppercase select-none ${priorityColor}`}>
                      {priorityNames[order.priority] || '보통 (Normal)'}
                    </span>
                  </td>

                  <td className="p-3">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold border rounded-none uppercase select-none ${badgeColor}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-slate-700">{order.targetQty.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-semibold text-slate-700">{order.currentQty.toLocaleString()}</td>
                  <td className="p-3 w-1/5">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-100 h-2.5 rounded-none overflow-hidden border border-slate-200">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            order.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`} 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="font-mono font-bold text-slate-700 w-10 text-right select-none">{progress}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-1.5">
                      {order.status !== 'completed' && order.status !== 'running' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'running')}
                          className="flex items-center gap-0.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-2 py-0.5 font-bold rounded-none"
                          title="시작"
                        >
                          <Play className="h-3 w-3 fill-blue-700 text-blue-700" />
                          <span>시작</span>
                        </button>
                      )}
                      {order.status === 'running' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'paused')}
                          className="flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-2 py-0.5 font-bold rounded-none"
                          title="일시정지"
                        >
                          <Pause className="h-3 w-3 fill-amber-700 text-amber-700" />
                          <span>정지</span>
                        </button>
                      )}
                      {order.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'completed')}
                          className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-2 py-0.5 font-bold rounded-none"
                          title="강제완료"
                        >
                          <CheckCircle className="h-3 w-3" />
                          <span>완료</span>
                        </button>
                      )}
                      {order.status === 'completed' && (
                        <span className="text-slate-400 text-[10px] font-semibold select-none">제어불가</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white border border-slate-300 w-full max-w-md flex flex-col p-4 shadow-xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-4">
              <h3 className="text-dense-base font-bold text-slate-800">신규 작업지시 생성</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateOrder} className="flex flex-col gap-3.5 text-dense-xs">
              <div className="flex flex-col gap-1">
                <label className="text-dense-xs font-semibold text-slate-600 select-none">대상 공정 선택</label>
                <select
                  value={processType}
                  onChange={(e) => setProcessType(e.target.value)}
                  className="h-9 border border-slate-300 bg-white px-3 font-semibold text-dense-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="electrode">전극 공정 (Electrode)</option>
                  <option value="assembly">조립 공정 (Assembly)</option>
                  <option value="formation">화성 공정 (Formation)</option>
                  <option value="module">모듈 공정 (Module)</option>
                </select>
              </div>

              {/* LEVEL 2 Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-dense-xs font-semibold text-slate-600 select-none">공정 가동 라인 ID</label>
                  <select
                    value={lineId}
                    onChange={(e) => setLineId(e.target.value)}
                    className="h-9 border border-slate-300 bg-white px-2 font-semibold text-dense-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="LINE-01">LINE-01 (1호기 라인)</option>
                    <option value="LINE-02">LINE-02 (2호기 라인)</option>
                    <option value="LINE-03">LINE-03 (3호기 라인)</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-dense-xs font-semibold text-slate-600 select-none">지시 우선순위</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="h-9 border border-slate-300 bg-white px-2 font-semibold text-dense-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="low">낮음 (Low)</option>
                    <option value="normal">보통 (Normal)</option>
                    <option value="high">긴급 (High)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-dense-xs font-semibold text-slate-600 select-none">담당 작업자명</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 홍길동 대리"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="h-9 border border-slate-300 bg-white px-3 font-semibold text-dense-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-dense-xs font-semibold text-slate-600 select-none">투입 원자재 배치 코드</label>
                  <input
                    type="text"
                    required
                    placeholder="예: MAT-BAT-095"
                    value={materialBatch}
                    onChange={(e) => setMaterialBatch(e.target.value)}
                    className="h-9 border border-slate-300 bg-white px-3 font-semibold text-dense-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Stepper click adjustment numeric input - LEVEL 3: 50~10000 with step 50 */}
              <NumericInput
                label="목표 생산 수량 (ea / m)"
                value={targetQty}
                onChange={setTargetQty}
                min={50}
                max={10000}
                step={50}
                required
              />

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 border border-slate-300 text-dense-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-dense-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  지시 발행
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductionManager;

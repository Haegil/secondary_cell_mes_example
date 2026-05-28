import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Wrench } from 'lucide-react';
import { updateEquipmentStatus } from '../store/slices/mesSlice';

function EquipmentManager() {
  const equipment = useSelector(state => state.mes.equipment);
  const dispatch = useDispatch();

  const handleStatusChange = (eqId, newStatus) => {
    let utilization = 0;
    if (newStatus === 'running') utilization = 85.0;
    else if (newStatus === 'maintenance') utilization = 20.0;
    else if (newStatus === 'idle') utilization = 0.0;

    dispatch(updateEquipmentStatus({ equipmentId: eqId, status: newStatus, utilization }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'idle': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'maintenance': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 p-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-blue-600" />
          <h2 className="text-dense-base font-bold text-slate-800">설비 상태 관리 (Equipment Monitoring)</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {equipment.map(eq => (
          <div key={eq.equipmentId} className="border border-slate-200 p-3 bg-slate-50 flex flex-col justify-between h-44">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold block">{eq.equipmentId}</span>
                  <h3 className="text-dense-sm font-bold text-slate-800">{eq.name}</h3>
                </div>
                <span className={`px-1.5 py-0.5 text-[9px] font-bold border rounded-none uppercase select-none ${getStatusColor(eq.status)}`}>
                  {eq.status}
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center select-none text-dense-xs">
                <span className="text-slate-400 font-medium">실시간 가동률</span>
                <span className="font-mono font-bold text-slate-800">{eq.utilization}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 mt-1 rounded-none overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    eq.status === 'error' ? 'bg-red-500' :
                    eq.status === 'maintenance' ? 'bg-amber-500' :
                    eq.status === 'running' ? 'bg-blue-500' : 'bg-slate-400'
                  }`} 
                  style={{ width: `${eq.utilization}%` }}
                ></div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-4 gap-1 border-t border-slate-200 pt-2 mt-3 select-none">
              <button
                onClick={() => handleStatusChange(eq.equipmentId, 'running')}
                className="text-[9px] font-bold py-1 bg-white border border-slate-200 hover:bg-blue-50 text-blue-600 rounded-none"
                title="가동 시작"
              >
                가동
              </button>
              <button
                onClick={() => handleStatusChange(eq.equipmentId, 'idle')}
                className="text-[9px] font-bold py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-none"
                title="가동 대기"
              >
                대기
              </button>
              <button
                onClick={() => handleStatusChange(eq.equipmentId, 'maintenance')}
                className="text-[9px] font-bold py-1 bg-white border border-slate-200 hover:bg-amber-50 text-amber-600 rounded-none"
                title="설비 점검"
              >
                점검
              </button>
              <button
                onClick={() => handleStatusChange(eq.equipmentId, 'error')}
                className="text-[9px] font-bold py-1 bg-white border border-slate-200 hover:bg-red-50 text-red-600 rounded-none"
                title="이상 발생"
              >
                이상
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EquipmentManager;

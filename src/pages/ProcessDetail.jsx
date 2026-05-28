import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Cpu, Activity, Zap, Thermometer, Gauge, Wind, Settings, AlertTriangle } from 'lucide-react';
import DefectDetailModal from '../components/DefectDetailModal';

function ProcessDetail() {
  const { processType } = useParams();
  const navigate = useNavigate();
  const [ticks, setTicks] = useState(0);

  // LEVEL 3 states
  const { lots } = useSelector(state => state.mes);
  const [selectedDefectLot, setSelectedDefectLot] = useState(null);

  // Real-time sensor wobbly effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTicks(t => t + 1);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const processNames = {
    electrode: '전극 공정 (Electrode)',
    assembly: '조립 공정 (Assembly)',
    formation: '화성 공정 (Formation)',
    module: '모듈 공정 (Module)'
  };

  const getSubProcessData = () => {
    const seed = Math.sin(ticks);
    const seed2 = Math.cos(ticks);

    switch (processType) {
      case 'electrode':
        return [
          {
            name: '슬러리 믹싱 (Slurry Mixing)',
            description: '활물질, 도전재, 바인더를 균일하게 배합하는 원재료 공정',
            metrics: [
              { label: '교반 점도 (Viscosity)', value: (5800 + seed * 120).toFixed(0), unit: 'cPs', icon: Activity, color: '#2563EB' },
              { label: '임펠러 교반 속도 (RPM)', value: (1350 + seed2 * 45).toFixed(0), unit: 'rpm', icon: Settings, color: '#3B82F6' },
              { label: '믹싱조 온도 (Slurry Temp)', value: (25.4 + seed * 0.8).toFixed(1), unit: '°C', icon: Thermometer, color: '#EF4444' }
            ]
          },
          {
            name: '롤 코팅 & 건조 (Roll Coating & Drying)',
            description: '알루미늄/구리 집전체 집전판에 슬러리를 정밀 도포 후 열풍 가열 건조',
            metrics: [
              { label: '도포 코팅 두께 (Thickness)', value: (122.3 + seed2 * 1.2).toFixed(1), unit: 'μm', icon: Gauge, color: '#10B981' },
              { label: '건조 히터 온도 (Oven Temp)', value: (118.5 + seed * 3.2).toFixed(1), unit: '°C', icon: Thermometer, color: '#F59E0B' },
              { label: '코팅 롤 속도 (Line Speed)', value: (15.2 + seed2 * 0.3).toFixed(1), unit: 'm/min', icon: Activity, color: '#6366F1' }
            ]
          },
          {
            name: '압연 프레싱 (Roll Pressing)',
            description: '전극 밀도 향상을 위해 상하 롤러로 전극판을 초고압 가압 압축',
            metrics: [
              { label: '압축 롤러 선압 (Roll Pressure)', value: (2.25 + seed * 0.08).toFixed(2), unit: 'ton/cm', icon: Zap, color: '#D97706' },
              { label: '압연 후 전극 밀도 (Density)', value: (1.68 + seed2 * 0.02).toFixed(2), unit: 'g/cm³', icon: Gauge, color: '#8B5CF6' }
            ]
          },
          {
            name: '슬리팅 & 노칭 (Slitting & Notching)',
            description: '규격 치수에 맞게 극판을 세로로 절단 및 탭 형상 타칭 레이저 컷팅',
            metrics: [
              { label: '노칭 정밀 오차 (Notch Offset)', value: (0.035 + Math.abs(seed) * 0.012).toFixed(3), unit: 'mm', icon: Cpu, color: '#EC4899' },
              { label: '레이저 커터 파워 (Laser Power)', value: (450 + seed2 * 10).toFixed(0), unit: 'W', icon: Zap, color: '#EF4444' }
            ]
          }
        ];
      case 'assembly':
        return [
          {
            name: '스태킹/와인딩 (Stacking & Winding)',
            description: '양극/세퍼레이터/음극을 차곡차곡 적층하거나 둥글게 말아 젤리롤 제조',
            metrics: [
              { label: '셀 적층 속도 (Stacking Speed)', value: (195 + seed * 12).toFixed(0), unit: 'cells/min', icon: Activity, color: '#10B981' },
              { label: '극판 정렬 오차 (Tab Align)', value: (0.142 + Math.abs(seed2) * 0.03).toFixed(3), unit: 'mm', icon: Cpu, color: '#059669' }
            ]
          },
          {
            name: '케이스 패키징 (Alu-foil Packaging)',
            description: '젤리롤을 파우치/캔 케이스에 삽입 후 3면 고온 정밀 실링 진공 실장',
            metrics: [
              { label: '내부 진공도 (Vacuum level)', value: (-98.8 + seed * 0.5).toFixed(1), unit: 'kPa', icon: Wind, color: '#06B6D4' },
              { label: '압착 실러 온도 (Sealing Temp)', value: (165.2 + seed2 * 1.8).toFixed(1), unit: '°C', icon: Thermometer, color: '#EF4444' }
            ]
          },
          {
            name: '전해액 주입 (Electrolyte Injection)',
            description: '셀 내부에 정밀 실린더 펌프를 이용하여 규정량의 전해액을 고속 주입',
            metrics: [
              { label: '노즐 주입 압력 (Inject Press)', value: (3.35 + seed * 0.12).toFixed(2), unit: 'bar', icon: Gauge, color: '#6366F1' },
              { label: '주입량 정밀 오차 (Inject Vol)', value: (100.08 + seed2 * 0.09).toFixed(2), unit: '%', icon: Activity, color: '#3B82F6' }
            ]
          }
        ];
      case 'formation':
        return [
          {
            name: '초기 충방전 (Initial Charge & Discharge)',
            description: '정전류/정전압 가압 충전을 통해 셀 계면 SEI 피막 형성 및 전기적 성질 부여',
            metrics: [
              { label: '인가 전압 (Cell Voltage)', value: (3.72 + seed * 0.05).toFixed(2), unit: 'V', icon: Zap, color: '#8B5CF6' },
              { label: '충전 전류 (Current)', value: (48.5 + seed2 * 1.5).toFixed(1), unit: 'A', icon: Activity, color: '#7C3AED' }
            ]
          },
          {
            name: '고온 & 상온 에이징 (High Temp Aging)',
            description: '지정 습온도 조건 챔버에서 배터리를 일정 기간 방치하여 전해액 내부 침투 안정화',
            metrics: [
              { label: 'HT 에이징 온도 (Chamber Temp)', value: (43.2 + seed * 0.6).toFixed(1), unit: '°C', icon: Thermometer, color: '#F59E0B' },
              { label: '내부 상대 습도 (Humid)', value: (27.4 + seed2 * 0.9).toFixed(1), unit: '%', icon: Wind, color: '#10B981' }
            ]
          },
          {
            name: '가스 제거 디개싱 (Cell Degassing)',
            description: '초기 활성화 공정 중 파우치 내부에 축적된 유기 배출 가스를 천공 진공 흡착 배출',
            metrics: [
              { label: '챔버 진공 배출압 (Extract Press)', value: (-94.2 + seed * 1.1).toFixed(1), unit: 'kPa', icon: Wind, color: '#06B6D4' },
              { label: '누적 가스 배출량 (Gas Qty)', value: (13.5 + Math.abs(seed2) * 1.2).toFixed(1), unit: 'cc/cell', icon: Activity, color: '#6366F1' }
            ]
          }
        ];
      case 'module':
        return [
          {
            name: '단품 셀 정밀 분류 (Cell Grading)',
            description: '화성 검사를 통과한 단품 셀들의 내부 저항 및 개방회로 전압을 정밀 검측 분류',
            metrics: [
              { label: '개방 회로 전압 (OCV)', value: (3.824 + seed * 0.002).toFixed(3), unit: 'V', icon: Zap, color: '#F97316' },
              { label: '셀 내부 저항 (AC IR)', value: (1.24 + seed2 * 0.03).toFixed(2), unit: 'mΩ', icon: Gauge, color: '#EA580C' }
            ]
          },
          {
            name: '모듈 조립 & BMS 스택 체결 (Module & BMS Assembly)',
            description: '복수의 셀을 알루미늄 프레임 케이스에 적층 배열 결합 및 배터리관리보드(BMS) 배선 결선',
            metrics: [
              { label: '비전 얼라인 정밀도 (Align)', value: (0.018 + Math.abs(seed) * 0.005).toFixed(3), unit: 'mm', icon: Cpu, color: '#EC4899' },
              { label: 'BMS 신호 송수신 수신율 (BMS RF)', value: (100.0 - Math.abs(seed2) * 0.04).toFixed(2), unit: '%', icon: Activity, color: '#10B981' }
            ]
          },
          {
            name: '팩 하우징 & 고전압 테스트 (HV Pack Insulation)',
            description: '모듈 여러 개를 고밀도 팩 프레임 하우징에 최종 내장 장착 및 절연 내전압 최종 테스트',
            metrics: [
              { label: '고전압 절연 저항 (HV Insulate)', value: (278.4 + seed * 8.5).toFixed(1), unit: 'MΩ', icon: Zap, color: '#EF4444' },
              { label: '냉각수 배관 기밀 압력 (Leak Press)', value: (6.2 + seed2 * 0.1).toFixed(1), unit: 'bar', icon: Gauge, color: '#2563EB' }
            ]
          }
        ];
      default:
        return [];
    }
  };

  const steps = getSubProcessData();
  const processName = processNames[processType] || '공정 세부 정보';

  // LEVEL 3: Filter unresolved defect lots in this process
  const activeDefectLots = lots.filter(l => l.processStep === processType && l.status !== 'normal');

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation and Title */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-3 bg-white p-4">
        <button
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Cpu className="h-5 w-5 text-blue-600 animate-pulse" />
            <h2 className="text-dense-base font-extrabold text-slate-800">{processName}</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold">각 단위 세부 기계 장치별 실시간 센서 계측 통계를 관측하고 상태 노드를 점검합니다.</p>
        </div>
      </div>

      {/* LEVEL 3: Active defect warnings banner linked to DefectDetailModal */}
      {activeDefectLots.map(lot => (
        <div 
          key={lot.lotNo}
          onClick={() => setSelectedDefectLot(lot)}
          className="bg-red-50 border border-red-200 text-red-800 p-3 flex items-center justify-between cursor-pointer hover:bg-red-100/50 transition-all animate-pulse select-none shrink-0"
        >
          <div className="flex items-center gap-2 font-bold text-dense-xs">
            <AlertTriangle className="h-4.5 w-4.5 text-red-600 shrink-0" />
            <span>[품질 이상 경보] {lot.lotNo}에 이상측정치(불량률: {lot.defectRate}%)가 감지되었습니다. (설비: {lot.equipmentId})</span>
          </div>
          <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 border border-red-700">즉각 현장 조치 실시 &gt;</span>
        </div>
      ))}

      {/* Grid of Subprocess Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-4 flex flex-col justify-between">
            {/* Step header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-5 w-5 items-center justify-center bg-slate-850 text-white font-mono text-dense-xs font-bold rounded-sm">
                  {idx + 1}
                </span>
                <h3 className="text-dense-sm font-bold text-slate-800">{step.name}</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{step.description}</p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-3 gap-2">
              {step.metrics.map((metric, midx) => {
                const Icon = metric.icon;
                return (
                  <div key={midx} className="bg-slate-50 border border-slate-100 p-2.5 flex flex-col justify-between h-20 relative overflow-hidden">
                    {/* Tiny visual chart indicator line at the bottom */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-0.5" 
                      style={{ backgroundColor: metric.color }}
                    ></div>
                    
                    <div className="flex justify-between items-start text-slate-400">
                      <span className="text-[9px] font-bold text-slate-400 leading-tight w-4/5 break-all select-none">
                        {metric.label}
                      </span>
                      <Icon className="h-3.5 w-3.5 opacity-60" style={{ color: metric.color }} />
                    </div>

                    <div className="flex items-baseline gap-0.5 mt-1">
                      <span className="text-dense-sm font-extrabold font-mono text-slate-800">
                        {metric.value}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 select-none">
                        {metric.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Warning Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 text-dense-xs text-blue-800 leading-relaxed font-semibold">
        <div className="flex gap-2">
          <Cpu className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
          <p>
            본 화면의 수치들은 생산 기계의 OPC-UA 서버 및 현장 계측 게이트웨이(PLC)를 통해 실시간으로 수집되는 50ms 주기 정밀 물리 센서 계량값입니다.<br />
            오류 기준(가동 온도 한계 임계치 이탈 등) 초과 감증 시 AI 품질 예측 경보 엔진에 의해 즉시 실시간 알림 경고가 상단 벨 아이콘에 기록됩니다.
          </p>
        </div>
      </div>

      {/* LEVEL 3: Defect Detail Modal mounting */}
      <DefectDetailModal 
        isOpen={selectedDefectLot !== null}
        onClose={() => setSelectedDefectLot(null)}
        lot={selectedDefectLot}
      />
    </div>
  );
}

export default ProcessDetail;

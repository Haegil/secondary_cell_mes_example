import React from 'react';
import { createPortal } from 'react-dom';
import { X, HelpCircle, Info, BookOpen, Settings, AlertTriangle } from 'lucide-react';

function HelpModal({ isOpen, onClose, currentPath }) {
  if (!isOpen) return null;

  // Clean path for matching
  const path = currentPath || window.location.pathname;

  const getHelpContent = () => {
    switch (path) {
      case '/':
      case '/dashboard':
        return {
          title: '대시보드 종합 모니터링 가이드',
          description: '공장 전체 가동 현황과 4대 주요 공정(전극, 조립, 화성, 모듈)의 실시간 KPI를 한눈에 관측하는 화면입니다.',
          steps: [
            { title: '공정 카드 모니터링', text: '주요 4대 공정의 실시간 가동률, 양품률, 누적 생산량을 관측합니다. 각 공정 카드를 클릭하면 상세 기계 센서 계측 페이지로 즉시 이동합니다.' },
            { title: '전체 생산 현황 필터링', text: '날짜 선택 달력 및 일간/주간/월간/연간 탭 필터를 사용하여 기간별 총 계획/실적량, 달성률, 평균 가동률 및 양품률을 실시간 재조회합니다.' },
            { title: '생산 추이 & 실시간 알림', text: '생산량(바 차트), 가동률(라인 차트), 양품률(라인 차트) 탭을 토글하여 시각적 통계를 확인하고, 우측 패널에서 최신 설비/품질 경보 로그를 즉각 수집합니다.' }
          ]
        };
      case '/realtime':
        return {
          title: '실시간 공정 모니터링 가이드',
          description: '현재 라인에서 흘러가는 전체 설비의 센서 수치와 상태 변화를 그래픽 노드로 직관적으로 관찰합니다.',
          steps: [
            { title: '실시간 가동 현황', text: '가동(초록색), 정지(회색), 점검(노란색), 이상(빨간색)으로 표시되는 각 라인의 흐름을 한눈에 식별할 수 있습니다.' },
            { title: '센서 수치 모니터링', text: '시뮬레이터 활성화 상태에서 실시간으로 갱신되는 설비별 가동률 및 센서 수치를 통해 이상 징후를 예방 진단합니다.' }
          ]
        };
      case '/production':
        return {
          title: '생산 관리 및 작업 지시 발행 가이드',
          description: '생산 계획 수립에 의거하여 신규 생산 지시를 발행하고 가동 중인 작업에 대한 실시간 제어 명령을 하달합니다.',
          steps: [
            { title: '신규 작업지시 생성', text: '우측 상단의 버튼을 클릭해 대상 공정, 목표 생산 수량, 담당 작업자명, 공정 가동 라인 ID, 투입 원자재 배치 코드, 우선순위(긴급/보통/낮음)를 정밀 정의하여 발행합니다.' },
            { title: '작업 실시간 제어', text: '발행된 지시의 상태(Pending, Running, Paused, Completed)를 테이블에서 직접 제어합니다. 시작/정지/완료 버튼을 통해 라인을 즉시 통제합니다.' },
            { title: '진행률 트랙킹', text: '목표 수량 대비 현재 생산 완료 수량을 퍼센트 바를 통해 가독성 높은 인터페이스로 상시 점검합니다.' }
          ]
        };
      case '/process':
        return {
          title: '공정별 가동 상태 가이드',
          description: '각 공정 단계별 설비 및 원재료 수급에 대한 요약 정보를 종합 제공하는 화면입니다.',
          steps: [
            { title: '공정 요약', text: '전극 코팅, 조립 스태킹, 화성 에이징 등 각 공정의 핵심 업무 특성 및 상태 데이터를 일괄 검토할 수 있습니다.' },
            { title: '연계 현황 파악', text: '설비 가동 효율 및 자재 투입 균형을 맞추어 보틀넥 현상이 발생하는 지점을 빠르게 진증합니다.' }
          ]
        };
      case '/quality':
        return {
          title: '품질 관리 및 LOT Traceability 역추적 가이드',
          description: '발생한 불량 제품의 원인을 분석하고 즉각 조치하여 공장 수율을 극대화하며, 투입부터 최종 출하까지의 모든 이력을 추적합니다.',
          steps: [
            { title: '품질 이상 로그 (불량 목록 조회)', text: '이상(Error) 또는 경고(Warning)가 발생한 LOT들의 검출 오류 유형, 불량량, 불량률을 추적합니다. Row를 클릭하면 세부 이상치 현황 및 조치 팝업이 노출됩니다.' },
            { title: '현장 즉각 조치 (Take Action)', text: '불량 상세 모달에서 "현장 조치 완료" 버튼을 클릭하면 LOT가 정상화되고 연관 설비가 재가동되며, 상단 알림 배지 카운트가 즉각 소거됩니다.' },
            { title: 'LOT 이력 역추적 (Traceability)', text: 'LOT 번호 직접 검색 외에도, "발생 공정별 필터"를 통해 특정 공정군에서 생산된 LOT 목록을 확인하고 해당 LOT의 원재료 투입, 설비 이력, 공정 타임라인을 정밀 분석합니다.' }
          ]
        };
      case '/equipment':
        return {
          title: '설비 가동 제어 가이드',
          description: '공장 내 가동 중인 설비 기계(믹싱기, 코팅기, 스태킹기, 주입기, 에이징 챔버 등)의 종합 상태 관리 페이지입니다.',
          steps: [
            { title: '실시간 가동 제어', text: '설비 카드의 "가동", "대기", "점검" 버튼을 클릭하여 현장 작업자의 설비 제어를 시스템 상에 실시간 반영시킬 수 있습니다.' },
            { title: '종합 가동률 계산', text: '각 설비 카드의 개별 가동률 및 온도/압력 상태를 확인하고 과부하 방지 점검을 상시 예약 관리합니다.' }
          ]
        };
      case '/material':
        return {
          title: '자재 재고 관리 가이드',
          description: '배터리 팩 제조에 필요한 원부자재(양극재, 음극재, 도전재, 바인더, 분리막, 전해액)의 재고 현황을 모니터링합니다.',
          steps: [
            { title: '재고 실시간 차감', text: '시뮬레이터 가동에 따라 각 공정에서 규정된 소비량(양극재, 음극재 등)만큼 자재가 실시간 소모 차감됩니다.' },
            { title: '위험 재고 경보', text: '재고량이 안전 임계치 미만으로 떨어지는 경우, 노란색/빨간색 상태 배지와 함께 경보 메시지가 로그에 즉시 기록되어 수급을 재촉합니다.' }
          ]
        };
      case '/reports':
        return {
          title: '최종 가동 결과 보고서 & Excel 출력 가이드',
          description: '축적된 가동 데이터(생산량, 양품수, 불량수, 불량률)를 종합 취합하여 사내 기안 보고용 문서를 출력합니다.',
          steps: [
            { title: '공정 요약 통계', text: '총 생산량, 총 양품 수량, 총 불량 수량, 그리고 공정별 불량률 추이를 Recharts 그래픽을 통해 한눈에 파악합니다.' },
            { title: '회사 제출용 Excel 내보내기', text: '우측 상단의 "Excel 다운로드" 버튼을 클릭하면, 아름다운 셀 테두리, 배경 색상, 정렬 포맷 및 합계 요약 행이 정의된 Excel 호환 보고서(.xls)를 즉시 로컬로 다운로드합니다.' }
          ]
        };
      case '/settings':
        return {
          title: '시스템 설정 및 동기화 가이드',
          description: '시스템 가동을 위한 Database 동기화 모드 관리 및 테스트/디버깅을 위한 환경설정 화면입니다.',
          steps: [
            { title: 'Cloud DB 연동 모드', text: 'Firebase Cloud Firestore와의 실시간 연동을 활성화하거나 로컬 브라우저 Storage 기반의 Mock DB 모드로 신속하게 전환합니다.' },
            { title: '시스템 데이터베이스 완전 초기화', text: '"시스템 데이터베이스 초기화" 버튼을 제공하여, 반복 테스트 진행 도중 꼬인 데이터나 불량 로그를 최초 Seed 상태(정상 120 Lots 생성 등)로 즉각 포맷팅합니다.' }
          ]
        };
      default:
        return {
          title: 'Battery MES 시스템 가이드',
          description: '이 시스템은 2차전지 배터리 생산 공정의 생산(Production), 품질(Quality), 설비(Equipment), 자재(Material) 데이터를 실시간 모니터링/제어하는 통합 MES 플랫폼입니다.',
          steps: [
            { title: '시뮬레이션 가동', text: '상단 네비게이션바의 "시뮬레이터 시작"을 누르면 3초 단위로 생산 지시가 진행되며 원재료 소진, 제품 적재 및 난수 품질 이상(불량/경고)이 자동으로 시뮬레이션 작동합니다.' },
            { title: '종합 연계', text: '품질 이상이 발생한 LOT의 조치 버튼을 누르면 설비가 재가동되고 네비게이션 알림이 자동으로 소거되는 완벽한 시스템 연계 처리가 보장되어 있습니다.' }
          ]
        };
    }
  };

  const help = getHelpContent();

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[9999] animate-fade-in p-4">
      <div className="bg-white border border-slate-300 w-full max-w-lg flex flex-col p-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2 text-blue-600">
            <HelpCircle className="h-5 w-5" />
            <h3 className="text-dense-base font-extrabold text-slate-800">{help.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 text-dense-xs overflow-y-auto max-h-[70vh] pr-1">
          <div className="bg-slate-50 border-l-4 border-blue-500 p-3">
            <div className="flex gap-2">
              <Info className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
              <p className="font-semibold text-slate-700 leading-relaxed">{help.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex items-center gap-1.5 select-none">
              <BookOpen className="h-4 w-4 text-slate-500" />
              <span>주요 모니터링 & 조작 매뉴얼</span>
            </h4>
            
            <div className="space-y-3.5 pl-1">
              {help.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="flex h-5 w-5 items-center justify-center bg-slate-150 border border-slate-200 text-[10px] font-bold text-slate-600 rounded-none shrink-0 select-none">
                    {idx + 1}
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">{step.title}</p>
                    <p className="text-slate-500 leading-relaxed font-medium">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 pt-3.5 mt-4 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-dense-xs font-bold text-white hover:bg-slate-700 transition-colors"
          >
            안내 창 닫기
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default HelpModal;

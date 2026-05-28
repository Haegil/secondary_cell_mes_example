import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Settings, Database, Cloud, RefreshCw, AlertTriangle, Key } from 'lucide-react';
import { changeDbMode, fetchAllData, resetSystemDatabase } from '../store/slices/mesSlice';
import { firebaseConfig } from '../firebase/firebaseConfig';

function SystemSettings() {
  const dispatch = useDispatch();
  const { dbMode, firebaseConnected } = useSelector(state => state.mes);
  const [seeding, setSeeding] = useState(false);

  const handleModeSwitch = (mode) => {
    dispatch(changeDbMode(mode));
    dispatch(fetchAllData());
    alert(`${mode === 'firebase' ? 'Firebase Cloud' : '로컬 Mock'} 데이터베이스 모드로 전환되었습니다.`);
  };

  const handleSystemReset = () => {
    const dbLabel = dbMode === 'firebase' ? 'Firebase Cloud Firestore' : '로컬 Mock';
    if (window.confirm(`${dbLabel} 데이터베이스의 모든 작업지시, LOT 기록, 감산 자재 재고, 로그 이력을 전부 소거하고 시스템 최초 가동 상태로 복원하시겠습니까?`)) {
      setSeeding(true);
      dispatch(resetSystemDatabase()).then(() => {
        setSeeding(false);
        alert('시스템 데이터베이스 초기화 및 기본 데이터 시딩이 성공적으로 완수되었습니다!');
      }).catch(() => {
        setSeeding(false);
        alert('데이터베이스 초기화 중 오류가 발생했습니다.');
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* DB Connection Mode Panel */}
      <div className="bg-white border border-slate-200 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="h-5 w-5 text-blue-600" />
          <h2 className="text-dense-base font-bold text-slate-800">데이터베이스 환경 관리</h2>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-dense-xs text-slate-500">
            MES 시스템이 가공/가동 데이터를 조회하고 업데이트할 채널을 선택합니다.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Mock Mode Button */}
            <button
              type="button"
              onClick={() => handleModeSwitch('mock')}
              className={`p-4 border flex flex-col items-center justify-center gap-2 rounded-none transition-all ${
                dbMode === 'mock'
                  ? 'border-blue-500 bg-blue-50/50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Database className="h-6 w-6" />
              <div className="text-center">
                <span className="block text-dense-xs font-bold">로컬 Mock DB 사용</span>
                <span className="text-[10px] text-slate-400">브라우저 내 오프라인 저장소</span>
              </div>
            </button>

            {/* Firebase Mode Button */}
            <button
              type="button"
              onClick={() => handleModeSwitch('firebase')}
              disabled={!firebaseConnected}
              className={`p-4 border flex flex-col items-center justify-center gap-2 rounded-none transition-all ${
                dbMode === 'firebase'
                  ? 'border-blue-500 bg-blue-50/50 text-blue-700'
                  : !firebaseConnected
                  ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Cloud className="h-6 w-6" />
              <div className="text-center">
                <span className="block text-dense-xs font-bold">Firebase Cloud 사용</span>
                <span className="text-[10px] text-slate-400">
                  {!firebaseConnected ? '설정 및 연결 안 됨' : '실시간 Firestore DB'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Unified reset database button */}
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <h3 className="text-dense-xs font-bold text-slate-700">시스템 데이터 복원 및 초기화</h3>
          <p className="text-[10px] text-slate-400 leading-normal select-none">
            현재 활성화된 데이터베이스 모드({dbMode === 'firebase' ? 'Firebase Cloud' : '로컬 Mock'})의 가동 이력(LOT 가공량, 자재 소모량, 장비 가동 정보, 알림 로그)을 모두 리셋하여 프로젝트 최초 상태 데이터로 복원합니다.
          </p>
          <button
            onClick={handleSystemReset}
            disabled={seeding}
            className="w-full flex items-center justify-center gap-1.5 h-10 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-dense-xs font-bold transition-all rounded-none"
          >
            <RefreshCw className={`h-4 w-4 ${seeding ? 'animate-spin' : ''}`} />
            <span>시스템 전체 데이터 초기 상태로 리셋</span>
          </button>
        </div>
      </div>

      {/* Firebase Configurations Panel */}
      <div className="bg-white border border-slate-200 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Key className="h-5 w-5 text-blue-600" />
          <h2 className="text-dense-base font-bold text-slate-800">Firebase 웹 앱 설정 정보</h2>
        </div>

        <div className="space-y-3 font-medium text-dense-xs">
          <p className="text-slate-500">
            `prompt/firebase_config.js`에 설정된 Firebase 자격증명 상세 항목입니다.
          </p>

          <div className="space-y-2 border border-slate-200 p-3 bg-slate-50 font-mono text-slate-600">
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span>Project ID:</span>
              <span className="text-slate-800 font-bold">{firebaseConfig.projectId || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span>Auth Domain:</span>
              <span className="text-slate-800 font-semibold">{firebaseConfig.authDomain || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span>App ID:</span>
              <span className="text-slate-800 truncate pl-4 text-right max-w-[200px]" title={firebaseConfig.appId}>{firebaseConfig.appId || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>API Key:</span>
              <span className="text-slate-800 font-semibold">
                {firebaseConfig.apiKey ? `${firebaseConfig.apiKey.slice(0, 10)}...` : '-'}
              </span>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 p-3 flex gap-2.5 text-blue-700">
            <AlertTriangle className="h-5 w-5 shrink-0 text-blue-600" />
            <div className="leading-tight">
              <span className="font-bold block text-dense-xs">데이터 동기화 연동 방법:</span>
              <span className="text-[10px]">
                실제 클라우드로 데이터가 전달되기 위해서는 Firestore의 보안 규칙(Rules)이 쓰기 권한이 허용되도록 설정되어 있어야 합니다 (예: `allow read, write: if true;` 테스트 모드).
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemSettings;

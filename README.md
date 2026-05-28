# 🔋 Battery MES — 2차 전지 스마트 팩토리 생산 관리 시스템

> **Manufacturing Execution System for Secondary Battery Production**  
> 전극 → 조립 → 화성 → 모듈의 전 공정을 실시간 모니터링·제어하는 포트폴리오용 MES 웹 애플리케이션

🌐 **Live Demo**: [https://battery-mes.web.app](https://battery-mes.web.app)

---

## 📌 프로젝트 소개

2차 전지(리튬이온 배터리) 제조 공정을 가상으로 시뮬레이션하는 **스마트 팩토리 MES 시스템**입니다.  
실시간 시뮬레이터를 통해 실제 공장처럼 생산·품질·설비·자재 데이터가 흘러가는 경험을 제공합니다.

- 배포된 URL에 접속하면 **방문자마다 독립된 데모 환경**이 자동으로 구성됩니다 (localStorage 기반 격리)
- 별도 로그인 없이 즉시 전 기능 체험 가능

---

## 🚀 주요 기능

### 📊 대시보드 (Dashboard)
- 전극·조립·화성·모듈 4대 공정의 실시간 KPI (가동률, 양품률, 생산량) 통합 모니터링
- 일간/주간/월간/연간 기간 필터 및 달력 날짜 선택기
- 생산량·가동률·양품률 추이 차트 (탭 토글)
- 실시간 알림 카드 — 이상 감지/경고 클릭 시 품질 탭으로 즉시 리다이렉트 & 조치 모달 자동 오픈

### ⚙️ 생산 관리 (Production)
- 신규 작업지시 생성 (`WO-YYYYMMDD-XXX` 규칙 번호)
- 공정 유형, 목표 수량(50~10,000, 50 배수), 담당자, 라인 ID, 자재 배치 코드, 우선순위 설정
- 시뮬레이터 연동: 가동 중인 작업지시가 실시간으로 진행률 업데이트

### 🏭 공정 모니터링 (Process)
- 전극·조립·화성·모듈 공정별 설비 센서 KPI 카드
- 카드 클릭 시 공정 상세 페이지 이동 (믹싱/코팅/압연/슬리팅 등 세부 공정 실시간 수치)

### 🛡️ 품질 관리 (Quality)
- 품질 이상 로그 — WARNING/ERROR 등급 LOT 목록 (조치 완료 시 목록에서 자동 제외)
- Row 클릭 → 불량 상세 모달 (즉각 현장 조치 → 설비 재가동 + 알림 배지 소거 연동)
- LOT 역추적 (Traceability) — 번호 검색 또는 공정 단계 필터로 80개 LOT 전체 이력 추적

### 🔧 설비 관리 (Equipment)
- 믹싱기·코팅기·스태킹기·에이징 챔버 등 8대 설비 실시간 가동률 모니터링
- 가동/대기/점검 상태 직접 전환 (페이지 리로드 없이 즉시 반영)

### 📦 자재 관리 (Material)
- 양극재·음극재·도전재·바인더·분리막·전해액 재고 실시간 차감 모니터링
- 자재 입고 작업 등록 (50~10,000, 50 배수) → 시뮬레이터 진행에 따라 실시간 수량 증가
- 자재 입고 진행 현황 테이블 (진행률 실시간 표시)

### 📈 리포트 (Reports)
- 공정별 생산량·양품수·불량률 집계 및 Recharts 바 차트 시각화
- Excel(.xls) 다운로드 — 회사 공유용 포맷 (외부 라이브러리 없이 순수 Blob 구현)
- 30일 종합 가동 로그 아카이브 (날짜·시간별 필터, 자동 만료)

### ⚙️ 시스템 관리 (Settings)
- 시스템 전체 데이터 초기 상태 리셋 (80개 LOT 포함 더미데이터 재시딩)
- Firebase ↔ Local DB 모드 전환 (개발 환경 전용)

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|---|---|
| **프레임워크** | React 18.3 + Vite 5.3 |
| **스타일링** | TailwindCSS v4 |
| **상태 관리** | Redux Toolkit 2.2 + React Redux 9.1 |
| **라우팅** | React Router DOM 6.23 |
| **데이터 시각화** | Recharts 2.12 |
| **아이콘** | Lucide React |
| **배포** | Firebase Hosting |
| **DB (개발)** | Cloud Firestore / localStorage (Mock DB) |

---

## 🗂️ 프로젝트 구조

```
secondary_cell_mes_example/
├── public/
│   └── assets/              # 공정 이미지 (전극·조립·화성·모듈)
├── src/
│   ├── components/          # 공통 컴포넌트
│   │   ├── Navbar.jsx       # 상단 네비게이션 (알림 배지, 시뮬레이터 제어)
│   │   ├── Sidebar.jsx      # 좌측 탭 메뉴
│   │   ├── HelpModal.jsx    # 탭별 가이드 모달 (Portal 렌더링)
│   │   ├── DefectDetailModal.jsx  # 불량 즉각 조치 모달
│   │   └── NumericInput.jsx # 스텝 입력 컴포넌트
│   ├── firebase/
│   │   ├── config.js        # Firebase 초기화
│   │   ├── firebaseConfig.js # Firebase 프로젝트 설정
│   │   └── db.js            # DB 추상화 레이어 (Firebase/localStorage 통합)
│   ├── pages/               # 각 탭 페이지
│   │   ├── Dashboard.jsx
│   │   ├── ProductionManager.jsx
│   │   ├── ProcessManager.jsx / ProcessDetail.jsx
│   │   ├── QualityManager.jsx
│   │   ├── EquipmentManager.jsx
│   │   ├── MaterialManager.jsx
│   │   ├── Reports.jsx
│   │   └── SystemSettings.jsx
│   └── store/
│       └── slices/mesSlice.js  # Redux 상태 + 비동기 Thunk (시뮬레이터 포함)
├── firebase.json            # Firebase Hosting 설정 (SPA 리라이트)
└── index.html
```

---

## 💻 로컬 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/Haegil/secondary_cell_mes_example.git
cd secondary_cell_mes_example

# 2. 패키지 설치
npm install

# 3. 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 후 상단의 **[시뮬레이터 시작]** 버튼을 클릭하면 실시간 공정 시뮬레이션이 시작됩니다.

---

## 🌐 배포 구조

```
프로덕션 빌드 (npm run build)
    ↓
import.meta.env.PROD === true
    ↓
getDbMode() → 항상 'mock' (localStorage) 반환
    ↓
방문자마다 독립적인 80 LOT 더미데이터 환경 자동 구성
    ↓
Firebase Hosting 서빙
```

- Firestore 규칙은 `allow read, write: if false` — 배포 환경에서 Firestore 미사용
- 각 방문자는 자신의 브라우저 localStorage에 완전히 격리된 데이터 환경을 가짐

---

## 🔄 시뮬레이터 작동 방식

1. **[시뮬레이터 시작]** 클릭 → `running` 상태인 작업지시를 탐색
2. 3초 간격으로 `runSimulationStepThunk` 실행:
   - 자재 소비 → 생산량 증가 → LOT 품질 난수 판정 (Error 1.2%, Warning 2.3%)
   - 이상 발생 시 설비 상태 변경 + 알림 로그 생성 + 배지 카운트 증가
   - 자재 입고 작업 진행 (틱당 100~250 단위 증가)
3. 목표 수량 달성 시 작업지시 완료 처리

---

## 📄 라이선스

본 프로젝트는 포트폴리오 목적으로 제작되었습니다.

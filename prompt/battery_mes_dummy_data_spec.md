# Battery MES 더미데이터 생성 규칙

## 기본 기준
- 총 100~500건 생성
- 기본 상태: normal
- 약 1% 확률로 warning 또는 error 포함

## LOT 규칙
```txt
LOT-000001
LOT-000002
LOT-000003
```

## 랜덤 데이터 항목
- 생산 수량
- 양품 수량
- 불량 수량
- 불량률
- 공정 단계
- 설비 번호
- 작업 시작/종료 시간

## 오류 예시
### 전극
- coating_thickness_error

### 조립
- tab_alignment_error

### 화성
- voltage_abnormal

### 모듈
- bms_connection_fail

## 시뮬레이션 로직
- 생산 시작 버튼 클릭 시 데이터 생성
- 3~5초 주기로 상태 업데이트
- 오류율 실시간 변동
- 완료 시 결과 요약 출력

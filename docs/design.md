# Still Point

현재 기본 화면은 [DINO RUN / Paper Page 2](runner.md)입니다. 아래 기존 Still Point는
`?game=still-point`로 보존합니다.

한국어, 무음, 절차적으로 그린 2D 링, Select(Enter) 전용 로컬 프로토타입.
Paper Scratchpad / Page 1에서 세션 중 확인한 시작·준비·플레이·Perfect·Good·결과·일시정지 화면을 재현한다. Paper MCP를 재호출하지 않았다.

## Rules
- 시작 → 준비 0.8초 → 플레이 → 성공 0.45초 → 다음 라운드. 실패 한 번으로 결과.
- 반지름 160→64를 선형 수축, 목표 반지름 96. 이 전체 이동 시간은 최초 2.2초.
- 성공마다 속도 ×1.04: 시간 max(0.85, 2.2 / 1.04^score).
- 반지름 차이 절댓값 ≤5 Perfect; 5 초과 ≤12 Good. 둘 다 +1점.
- 이른 선택은 early, 늦은 선택은 late, 구간을 통과하면 missed. 자동 실패 이후 입력은 다음 키 입력부터 재시작한다.
- 메뉴 방향키; 일시정지 ↑/← 재개, ↓/→ 다시 시작. 입력 repeat 무시.
- 최고 기록은 namespaced KeyValueStore. 저장 불가 시 세션 내 유지.
- 숨김/화면 이탈 시 정지, 복귀 후 명시적 Select 재개. 준비와 성공 피드백도 보존.

## Design and assets
검정 #000000, 청록 #8EF7F0, 보라 #B7A4FF, 흰색, 보조 #D4D8E0, 실패 #FF9AA8.
600×600 기준, 사방 24px, 최소 16px. Paper의 중심과 반지름을 사용한다.
모든 링은 Three.js RingGeometry; 모든 글자/메뉴는 DOM. 외부 이미지/폰트/음원 없음.
Paper 주석 보드는 미완료여서 수축 종료 반지름 64, 준비 0.8초, 작은 화면 배치 및 상세 경계 판정은 명시적 구현 가정이다.
실제 가산 광학, EMG 지연, 실기기 프레임/발열/배터리는 미검증.

## Scope
로컬 기능 프로토타입만. 배포/공개 URL/등록/심사는 하지 않는다.

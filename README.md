# Wedding XR Realistic v3

사용자 제공 레퍼런스 이미지를 참고하여 만든 **웹 기반 3D 웨딩홀 + 버진로드 체험 + WebXR** 프로토타입입니다.

## 주요 변경점

- 화면 전체를 3D 홀로 사용
- 왼쪽에 **플로팅 편집 패널**
- 패널을 접고 펼칠 수 있음
- 돌아다니면서 즉시 옵션 수정 가능
- 크림톤 아치형 천장
- 반복되는 간접조명 리브
- 클래식 기둥
- 샹들리에
- 유광 아이보리 버진로드
- 아이보리 원형 의자 / 우드 벤치 전환
- 풍성한 화이트 플라워
- 꽃 볼륨, 조명 밝기, 플라워 톤 수정
- 1인칭 버진로드 이동
- Galaxy XR WebXR 진입
- XR 텔레포트 포인트
- 컨트롤러 stick 이동 지원

## 조작

### PC
- 마우스 드래그: 시선 이동
- W/S 또는 ↑/↓: 전진 / 후진
- A/D 또는 ←/→: 회전

### 모바일
오른쪽 아래 이동 패드 사용

### Galaxy XR
1. GitHub에 업로드
2. Vercel/Netlify 등 HTTPS로 배포
3. Galaxy XR의 Chrome에서 배포 주소 접속
4. `Galaxy XR로 입장` 클릭
5. 버진로드의 원형 포인트를 손/컨트롤러로 선택해 이동

## 실행

파일 더블클릭 대신 HTTP 서버를 사용하세요.

```bash
python -m http.server 5173
```

그 다음:

```text
http://localhost:5173
```

## Vercel

- Framework Preset: Other
- Build Command: 비워두기
- Output Directory: `.`
- Deploy

## 파일 구조

```text
wedding-xr-realistic-v3/
├── index.html
├── style.css
├── app.js
├── README.md
├── .gitignore
└── assets/
    └── reference.png
```

## 한계 / 다음 단계

현재 홀은 Three.js 기본 geometry로 만든 고급 프로토타입입니다.
**실제 특정 웨딩홀과 사진 수준의 1:1 현실감을 얻으려면 실제 GLB/GLTF 3D 모델 또는 LiDAR/photogrammetry 데이터가 필요합니다.**

그 모델이 준비되면 현재 UI, 이동, WebXR 로직은 그대로 유지하고 홀 geometry만 교체할 수 있습니다.

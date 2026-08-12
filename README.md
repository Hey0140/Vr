# 3D 360° Wedding Simulator Prototype

웹 기반 3D 웨딩 시뮬레이션 프로토타입입니다.

## 현재 구현 기능

- 3D 웨딩홀
- 마우스 / 터치 360° 회전
- 입장 / 하객 / 무대 / 전체 시점 전환
- 웨딩 스타일 변경
- 꽃 장식 밀도 변경
- 조명 밝기 변경
- 예상 하객 수에 따른 좌석 변화
- 예상 연출 비용 예시
- XR 지원 여부 확인

> 현재 버전은 **WebXR 지원 여부 확인까지 구현**되어 있으며,
> 실제 VR 헤드셋의 immersive VR 세션 진입 기능은 아직 포함하지 않았습니다.

---

## 실행 방법

이 프로젝트는 빌드 과정 없이 실행 가능한 정적 웹 프로젝트입니다.

### 방법 1. VS Code Live Server

VS Code에서 폴더를 연 뒤 `index.html`을 Live Server로 실행합니다.

### 방법 2. Python 로컬 서버

```bash
python -m http.server 5173
```

이후 브라우저에서:

```text
http://localhost:5173
```

접속합니다.

---

## GitHub에 올리기

```bash
git init
git add .
git commit -m "Initial 3D wedding simulator"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

---

## Vercel 배포

1. GitHub에 저장소 업로드
2. Vercel 로그인
3. `Add New Project`
4. GitHub 저장소 선택
5. Framework Preset: `Other`
6. Build Command: 비워둠
7. Output Directory: `.`
8. Deploy

정적 HTML 프로젝트이므로 별도 빌드는 필요하지 않습니다.

---

## Netlify 배포

GitHub 저장소를 연결한 후 Publish directory를 프로젝트 루트(`.`)로 설정하면 됩니다.

---

## 실제 VR 테스트를 위한 다음 단계

현재 코드에는 XR 지원 체크만 존재합니다.

실제 Meta Quest 등에서 VR 모드로 진입하려면 아래가 추가되어야 합니다.

- `renderer.xr.enabled = true`
- Three.js `VRButton` 또는 `XRButton`
- `renderer.setAnimationLoop()`
- VR 컨트롤러 입력
- 이동 / 텔레포트 인터랙션

WebXR은 HTTPS 환경에서 테스트하는 것을 권장하므로,
Vercel/Netlify 등의 HTTPS 배포 후 Quest Browser에서 접속하는 구조가 편리합니다.

---

## 파일 구조

```text
wedding-3d-prototype/
├── index.html
├── style.css
├── app.js
├── README.md
└── .gitignore
```

## 기술

- HTML
- CSS
- JavaScript
- Three.js
- OrbitControls
- WebXR API 지원 여부 체크

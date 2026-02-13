# ⚔️ TODO QUEST - RPG 투두리스트

할 일을 완료하고 용사를 키워 드래곤을 처치하라!

## 🚀 배포 방법

### 방법 1: Vercel (가장 쉬움, 추천!)

1. [GitHub](https://github.com) 계정 만들기 (이미 있으면 건너뛰기)
2. GitHub에 새 저장소(Repository) 만들기
3. 이 폴더의 파일들을 전부 업로드
4. [Vercel](https://vercel.com) 에 GitHub 계정으로 로그인
5. "New Project" → GitHub 저장소 선택 → "Deploy" 클릭
6. 끝! URL이 생성됩니다 (예: `todo-quest.vercel.app`)

### 방법 2: Netlify

1. [Netlify](https://netlify.com) 에 가입
2. GitHub 저장소 연결하거나, 빌드된 폴더를 드래그앤드롭
3. Build command: `npm run build`
4. Publish directory: `dist`

### 방법 3: 로컬에서 직접 실행

```bash
# 1. Node.js 설치 (https://nodejs.org)
# 2. 터미널에서 이 폴더로 이동 후:
npm install
npm run dev
# 브라우저에서 http://localhost:5173 접속
```

## 📁 파일 구조

```
todo-quest/
├── index.html          # HTML 진입점
├── package.json        # 프로젝트 설정 & 의존성
├── vite.config.js      # Vite 빌드 설정
├── README.md           # 이 파일
└── src/
    ├── main.jsx        # React 렌더링 진입점
    └── App.jsx         # TODO QUEST 메인 앱
```

## 🎮 기능

- 🗡️ RPG 용사 성장 & 드래곤 전투
- ⏰ 데드라인 타이머 & HP 디버프
- 🔥 연속 완료 콤보 시스템
- 🏅 13종 업적/뱃지
- ⚡ 스킬 시스템 (치유/치명타/방어막/분노)
- 🎁 아이템 드롭 & 장비 시스템
- 🎯 일일 보너스 퀘스트
- 🐾 펫/동료 시스템
- 📂 커스텀 카테고리

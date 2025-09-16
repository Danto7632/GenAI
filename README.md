# 🏠 DreamSpace AI - 개인 맞춤형 인테리어 디자인 서비스

![DreamSpace AI](https://img.shields.io/badge/Status-In%20Development-yellow)
![React](https://img.shields.io/badge/React-18.0-blue)
![Flask](https://img.shields.io/badge/Flask-2.3-green)
![AI](https://img.shields.io/badge/AI-NVIDIA%20SANA-purple)

## 📖 프로젝트 개요

DreamSpace AI는 NVIDIA의 SANA 모델 기반 이미지 생성형 AI 기술을 활용하여, 사용자가 도면이나 집 사진을 업로드하면 게임 커스터마이징처럼 인터랙티브하게 가구를 배치할 수 있는 웹서비스입니다.

### ✨ 주요 기능

- 📸 **이미지 업로드 & 분석**: 도면/집 사진 업로드 및 AI 기반 공간 인식
- 🎮 **게임 스타일 가구 배치**: 드래그 앤 드롭으로 가구 배치, 크기 조절, 회전
- 🏷️ **카테고리별 가구 라이브러리**: 거실, 침실, 주방, 화장실별 가구 분류
- 🔄 **실시간 인터랙션**: 즉시 피드백과 직관적인 조작
- 💾 **레이아웃 저장**: 디자인한 인테리어 레이아웃 저장 및 공유

## 🚀 기술 스택

### Frontend
- **React 18** + TypeScript
- **Styled-components** - 컴포넌트 기반 스타일링
- **React-draggable** - 인터랙티브 가구 조작

### Backend  
- **Flask** - Python 웹 프레임워크
- **OpenCV** - 이미지 처리 및 공간 인식
- **NVIDIA SANA** - AI 이미지 생성 모델

### Database
- **PostgreSQL** - 사용자 및 프로젝트 데이터 관리

## 🛠️ 설치 및 실행

### 🚀 원클릭 설치 (권장)
```bash
# 저장소 클론
git clone https://github.com/YOUR_USERNAME/dreamspace-ai.git
cd dreamspace-ai

# 자동 설치 스크립트 실행
# macOS/Linux:
chmod +x setup.sh && ./setup.sh

# Windows:
setup.bat

# 개발 서버 실행 (백엔드 + 프론트엔드 동시 실행)
npm run dev
```

###  수동 설치

#### 사전 요구사항
- **Node.js 18+** - [다운로드](https://nodejs.org/)
- **Python 3.8+** - [다운로드](https://www.python.org/downloads/)
- **Git** - [다운로드](https://git-scm.com/)

#### 📥 프로젝트 클론
```bash
git clone https://github.com/YOUR_USERNAME/dreamspace-ai.git
cd dreamspace-ai
```

#### 🐍 백엔드 설정 (Flask)
```bash
# 백엔드 디렉토리로 이동
cd backend

# Python 가상환경 생성
python -m venv venv

# 가상환경 활성화
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정 (선택사항)
cp .env.example .env
# .env 파일을 열어서 필요한 설정값 입력

# Flask 앱 실행
python app.py
```

**🧹 자동 파일 관리**
- 서버 시작 시 `uploads/` 폴더 자동 정리
- 24시간 이상 된 파일들 주기적 삭제
- 저장공간 효율적 관리

백엔드 서버가 `http://localhost:5001`에서 실행됩니다. (AirPlay 충돌 방지를 위해 5001 포트 사용)

#### ⚛️ 프론트엔드 설정 (React)
새 터미널 창을 열고:
```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# Node.js 의존성 설치
npm install

# React 개발 서버 실행
npm start
```
프론트엔드가 `http://localhost:3000`에서 실행됩니다.

### 🎯 접속 방법
설치 완료 후 브라우저에서 `http://localhost:3000`으로 접속하세요!

### 🔧 문제 해결

#### Node.js 의존성 문제
```bash
# npm 캐시 클리어
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

#### Python 의존성 문제
```bash
# pip 업그레이드
pip install --upgrade pip

# 가상환경 재생성
rm -rf venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 포트 충돌
- 프론트엔드 포트 변경: `PORT=3001 npm start`
- 백엔드 포트 변경: `app.py`에서 `port=5001` 수정

## 📁 프로젝트 구조

```
dreamspace-ai/
├── backend/                 # Flask 백엔드
│   ├── app.py              # 메인 앱
│   ├── routes/             # API 라우트
│   ├── models/             # 데이터베이스 모델
│   ├── services/           # AI 서비스 로직
│   └── requirements.txt    # Python 의존성
├── frontend/               # React 프론트엔드  
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── types/          # TypeScript 타입
│   │   └── App.tsx         # 메인 앱
│   └── package.json        # Node 의존성
└── README.md
```

---

## 🎯 서비스 후보 2: FoodieVision - AI 레시피 시각화 및 요리 가이드

## 🎯 서비스 비전

### 서비스명
**DreamSpace AI**

### 개발 필요성
- **인테리어 시장 급성장**: 국내 인테리어 시장 규모 20조원, 셀프 인테리어 트렌드 확산
- **전문가 접근성 문제**: 개인이 전문 인테리어 디자이너를 고용하기 어려운 비용 문제
- **시각화의 어려움**: 머릿속 아이디어를 구체적인 이미지로 확인하기 어려움
- **개성화 수요**: 획일적인 인테리어에서 벗어나 개성 있는 공간 창조 욕구 증가

### 경제성
- **B2C 구독**: 월 14,900원 (무제한 디자인 생성)
- **B2B 가구업체**: 월 100만원 (고객 맞춤 디자인 제공 도구)
- **인테리어 업체 연계**: 디자인 성사 시 수수료 20%
- **예상 수익**: 1년차 사용자 5만명 기준 연매출 90억원

### 파급효과
- **인테리어 산업 혁신**: 디자인 과정의 디지털 전환 가속화
- **중소 가구업체 지원**: AI 도구로 대기업과 경쟁력 확보
- **부동산 시장 연계**: 집 구매 전 인테리어 미리보기로 구매 결정 지원

## 🔗 참고 자료

- [NVIDIA SANA](https://nvlabs.github.io/Sana/)
- [HuggingFace SANA Model](https://huggingface.co/Efficient-Large-Model/Sana_600M_512px_diffusers)

## 📝 개발 로드맵

- [x] 프로젝트 구조 설계 및 환경 설정
- [x] 도면/사진 업로드 및 인식 API 구현  
- [x] SANA 모델 연동 및 가구 생성 API
- [x] React 프론트엔드 프로젝트 초기화
- [x] 인터랙티브 가구 배치 UI 개발
- [ ] 3D 시각화 및 렌더링 시스템
- [ ] 데이터베이스 및 사용자 관리
- [ ] 베타 테스트 및 피드백 수집
- [ ] 상용 서비스 출시

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 만듭니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 만듭니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. [LICENSE](LICENSE) 파일을 참조하세요.

## 📧 연락처

- 이메일: contact@dreamspace-ai.com
- 웹사이트: [dreamspace-ai.com](https://dreamspace-ai.com)

---

⭐ 이 프로젝트가 유용하다면 Star를 눌러주세요!

## 개발 계획
### Phase 1: 기본 구조 및 공간 인식 (4주)
- Flask 백엔드 API 구조 설계
- 이미지 업로드 및 공간 인식 시스템
- React + Three.js 기본 3D 뷰어

### Phase 2: AI 가구 생성 및 배치 시스템 (6주)
- SANA 모델 인테리어 도메인 Fine-tuning
- 드래그 앤 드롭 가구 배치 인터페이스
- 실시간 3D 렌더링 최적화

### Phase 3: 고도화 및 상용화 (4주)
- 사용자 계정 관리 및 프로젝트 저장
- 스타일 추천 알고리즘
- 가구업체 연동 및 구매 연결

## 참고 모델 및 기술
- NVIDIA SANA: https://nvlabs.github.io/Sana/
- HuggingFace Diffusers: https://huggingface.co/Efficient-Large-Model/Sana_600M_512px_diffusers


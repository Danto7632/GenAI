@echo off
REM DreamSpace AI 설치 스크립트 (Windows)

echo 🏠 DreamSpace AI 설치를 시작합니다...

REM Node.js 확인
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js가 설치되지 않았습니다. https://nodejs.org에서 Node.js 18+ 를 설치해주세요.
    pause
    exit /b 1
)

REM Python 확인
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python이 설치되지 않았습니다. https://python.org에서 Python 3.8+ 를 설치해주세요.
    pause
    exit /b 1
)

echo ✅ Node.js 버전:
node -v
echo ✅ Python 버전:
python --version

REM 루트 의존성 설치
echo 📦 루트 의존성 설치 중...
npm install

REM 백엔드 설정
echo 🐍 백엔드 설정 중...
cd backend

REM Python 가상환경 생성
if not exist "venv" (
    echo 가상환경 생성 중...
    python -m venv venv
)

REM 가상환경 활성화
call venv\Scripts\activate.bat

REM Python 의존성 설치
pip install -r requirements.txt

REM 환경변수 파일 복사
if not exist ".env" (
    copy .env.example .env
    echo ✅ .env 파일이 생성되었습니다. 필요시 수정해주세요.
)

cd ..

REM 프론트엔드 설정
echo ⚛️ 프론트엔드 설정 중...
cd frontend
npm install
cd ..

echo.
echo 🎉 설치가 완료되었습니다!
echo.
echo 실행 방법:
echo 1. 개발 서버 실행: npm run dev
echo 2. 개별 실행:
echo    - 백엔드: npm run start:backend
echo    - 프론트엔드: npm run start:frontend
echo 3. Docker 실행: docker-compose up --build
echo.
echo 브라우저에서 http://localhost:3000 으로 접속하세요!
pause
#!/bin/bash

# DreamSpace AI 설치 스크립트

echo "🏠 DreamSpace AI 설치를 시작합니다..."

# Node.js 버전 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되지 않았습니다. https://nodejs.org에서 Node.js 18+ 를 설치해주세요."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ 가 필요합니다. 현재 버전: $(node -v)"
    exit 1
fi

# Python 버전 확인
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3이 설치되지 않았습니다. https://python.org에서 Python 3.8+ 를 설치해주세요."
    exit 1
fi

echo "✅ Node.js 버전: $(node -v)"
echo "✅ Python 버전: $(python3 --version)"

# 루트 디렉토리에서 concurrently 설치
echo "📦 루트 의존성 설치 중..."
npm install

# 백엔드 설정
echo "🐍 백엔드 설정 중..."
cd backend

# Python 가상환경 생성
if [ ! -d "venv" ]; then
    echo "가상환경 생성 중..."
    python3 -m venv venv
fi

# 가상환경 활성화
source venv/bin/activate

# Python 의존성 설치
pip install -r requirements.txt

# 환경변수 파일 복사
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ .env 파일이 생성되었습니다. 필요시 수정해주세요."
fi

cd ..

# 프론트엔드 설정
echo "⚛️ 프론트엔드 설정 중..."
cd frontend
npm install
cd ..

echo ""
echo "🎉 설치가 완료되었습니다!"
echo ""
echo "실행 방법:"
echo "1. 개발 서버 실행: npm run dev"
echo "2. 개별 실행:"
echo "   - 백엔드: npm run start:backend"
echo "   - 프론트엔드: npm run start:frontend"
echo "3. Docker 실행: docker-compose up --build"
echo ""
echo "브라우저에서 http://localhost:3000 으로 접속하세요!"
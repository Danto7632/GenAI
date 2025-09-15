# Backend Dockerfile
FROM python:3.9-slim

WORKDIR /app

# 시스템 패키지 설치 (OpenCV 등을 위한)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . .

# 필요한 디렉토리 생성
RUN mkdir -p uploads models cache

# Flask 앱 실행
EXPOSE 5000
CMD ["python", "app.py"]
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
from datetime import timedelta
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

# Flask 앱 초기화
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dreamspace-ai-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost/dreamspace_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# 확장 초기화
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# 모델 임포트
from models.user import User
from models.project import Project
from models.furniture import Furniture

# 라우트 임포트
from routes.auth import auth_bp
from routes.upload import upload_bp
from routes.ai_generation import ai_bp
from routes.projects import projects_bp

# 블루프린트 등록
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(upload_bp, url_prefix='/api/upload')
app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(projects_bp, url_prefix='/api/projects')

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "service": "DreamSpace AI Backend"})

@app.route('/')
def home():
    return jsonify({
        "message": "DreamSpace AI Backend API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "auth": "/api/auth",
            "upload": "/api/upload",
            "ai": "/api/ai",
            "projects": "/api/projects"
        }
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
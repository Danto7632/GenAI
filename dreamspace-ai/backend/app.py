from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename
from datetime import datetime
import logging

# Flask 앱 초기화
app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])  # 프론트엔드만 허용

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 설정
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# 업로드 폴더 생성
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
logger.info(f"업로드 폴더 생성: {UPLOAD_FOLDER}")

def allowed_file(filename):
    """허용된 파일 확장자인지 확인"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """루트 엔드포인트"""
    return jsonify({
        'message': 'DreamSpace AI Backend Server',
        'status': 'running',
        'version': '2.0',
        'endpoints': {
            'upload': 'POST /api/upload/image',
            'generate': 'POST /api/ai/generate-interior',
            'files': 'GET /api/files/<filename>',
            'health': 'GET /api/health'
        }
    })

@app.route('/api/upload/image', methods=['POST'])
def upload_image():
    """이미지 업로드 API"""
    try:
        logger.info("이미지 업로드 요청 받음")
        
        # 파일 존재 확인
        if 'image' not in request.files:
            logger.warning("파일이 요청에 포함되지 않음")
            return jsonify({'error': '파일이 선택되지 않았습니다.'}), 400
        
        file = request.files['image']
        
        # 파일명 확인
        if file.filename == '':
            logger.warning("파일명이 비어있음")
            return jsonify({'error': '파일명이 비어있습니다.'}), 400
        
        # 파일 형식 확인
        if not allowed_file(file.filename):
            logger.warning(f"지원하지 않는 파일 형식: {file.filename}")
            return jsonify({'error': '지원하지 않는 파일 형식입니다. (jpg, png, gif 등만 가능)'}), 400
        
        # 안전한 파일명 생성
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # 파일 저장
        file.save(file_path)
        logger.info(f"파일 저장 성공: {file_path}")
        
        # 파일 URL 생성
        file_url = f"http://localhost:5001/api/files/{unique_filename}"
        
        return jsonify({
            'message': '이미지 업로드 성공',
            'image_url': file_url,
            'filename': unique_filename,
            'original_filename': filename,
            'file_size': os.path.getsize(file_path),
            'upload_time': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"업로드 처리 중 오류: {str(e)}")
        return jsonify({'error': f'업로드 처리 중 오류가 발생했습니다: {str(e)}'}), 500

@app.route('/api/files/<filename>')
def uploaded_file(filename):
    """업로드된 파일 제공"""
    try:
        logger.info(f"파일 요청: {filename}")
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except FileNotFoundError:
        logger.warning(f"파일을 찾을 수 없음: {filename}")
        return jsonify({'error': '파일을 찾을 수 없습니다.'}), 404

@app.route('/api/ai/generate-interior', methods=['POST'])
def generate_interior():
    """AI 인테리어 생성 API"""
    try:
        logger.info("AI 인테리어 생성 요청 받음")
        
        # 요청 데이터 확인
        data = request.get_json()
        if not data:
            logger.warning("요청 데이터가 없음")
            return jsonify({'error': '요청 데이터가 없습니다.'}), 400
        
        image_url = data.get('image_url')
        furniture_layout = data.get('furniture_layout', [])
        
        # 데이터 유효성 검사
        if not image_url:
            logger.warning("이미지 URL이 없음")
            return jsonify({'error': '이미지 URL이 필요합니다.'}), 400
        
        if not furniture_layout or len(furniture_layout) == 0:
            logger.warning("가구 배치 정보가 없음")
            return jsonify({'error': '가구 배치 정보가 필요합니다.'}), 400
        
        # 모의 AI 처리
        generation_id = f"gen_{uuid.uuid4().hex[:12]}"
        
        # 상세 로그
        logger.info(f"AI 생성 요청 처리:")
        logger.info(f"  - 이미지: {image_url}")
        logger.info(f"  - 가구 개수: {len(furniture_layout)}")
        for i, furniture in enumerate(furniture_layout, 1):
            logger.info(f"    {i}. {furniture.get('name')} at ({furniture.get('x')}, {furniture.get('y')})")
        
        # 성공 응답
        result = {
            'message': 'AI 인테리어 생성이 완료되었습니다',
            'generation_id': generation_id,
            'status': 'completed',
            'input_image': image_url,
            'furniture_count': len(furniture_layout),
            'furniture_list': [f"{item.get('name')} ({item.get('x')}, {item.get('y')})" for item in furniture_layout],
            'generated_time': datetime.now().isoformat(),
            'processing_time': '2.3s'  # 모의 처리 시간
        }
        
        logger.info(f"AI 생성 완료: {generation_id}")
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"AI 생성 중 오류: {str(e)}")
        return jsonify({'error': f'AI 생성 중 오류가 발생했습니다: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """헬스체크 API"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'upload_folder': UPLOAD_FOLDER,
        'upload_folder_exists': os.path.exists(UPLOAD_FOLDER),
        'upload_folder_writable': os.access(UPLOAD_FOLDER, os.W_OK),
        'server_version': '2.0'
    }), 200

# 에러 핸들러
@app.errorhandler(413)
def request_entity_too_large(error):
    logger.warning("파일 크기 제한 초과")
    return jsonify({'error': '파일 크기가 너무 큽니다. 16MB 이하로 업로드해주세요.'}), 413

@app.errorhandler(404)
def not_found(error):
    logger.warning(f"404 오류: {request.url}")
    return jsonify({'error': '요청한 리소스를 찾을 수 없습니다.'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 오류: {str(error)}")
    return jsonify({'error': '서버 내부 오류가 발생했습니다.'}), 500

@app.after_request
def after_request(response):
    """요청 로깅"""
    logger.info(f"{request.method} {request.path} - {response.status_code}")
    return response

if __name__ == '__main__':
    print("=" * 60)
    print("🏠 DreamSpace AI Backend Server v2.0")
    print("=" * 60)
    print(f"📁 업로드 폴더: {os.path.abspath(UPLOAD_FOLDER)}")
    print(f"📝 로그 레벨: INFO")
    print(f"🌐 CORS 허용: http://localhost:3000")
    print(f"📊 최대 파일 크기: 16MB")
    print("=" * 60)
    print("🚀 서버 시작: http://localhost:5001")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5001)
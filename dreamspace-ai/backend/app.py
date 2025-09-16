from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
import glob
import time
from werkzeug.utils import secure_filename
from sana_integration import sana_ai

app = Flask(__name__)

# CORS 설정 - 프론트엔드에서 백엔드로 요청 허용
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# 설정
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 업로드 폴더 생성
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def cleanup_uploads_folder():
    """uploads 폴더 정리 - 서버 시작 시 기존 파일들 삭제"""
    try:
        files = glob.glob(os.path.join(UPLOAD_FOLDER, '*'))
        deleted_count = 0
        
        for file_path in files:
            if os.path.isfile(file_path):
                os.remove(file_path)
                deleted_count += 1
                
        print(f"🧹 Uploads folder cleaned: {deleted_count} files deleted")
        return deleted_count
    except Exception as e:
        print(f"❌ Failed to clean uploads folder: {e}")
        return 0

def cleanup_old_files():
    """24시간 이상 된 파일들만 삭제하는 함수 (옵션)"""
    try:
        files = glob.glob(os.path.join(UPLOAD_FOLDER, '*'))
        current_time = time.time()
        deleted_count = 0
        
        for file_path in files:
            if os.path.isfile(file_path):
                file_age = current_time - os.path.getmtime(file_path)
                # 24시간 = 86400초
                if file_age > 86400:
                    os.remove(file_path)
                    deleted_count += 1
                    
        if deleted_count > 0:
            print(f"🗑️  Cleaned {deleted_count} old files (>24h)")
        return deleted_count
    except Exception as e:
        print(f"❌ Failed to clean old files: {e}")
        return 0

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return jsonify({'message': 'DreamSpace AI Backend', 'status': 'running'})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """업로드된 파일들을 제공하는 라우트"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    # OPTIONS 요청 처리 (CORS preflight)
    if request.method == 'OPTIONS':
        return '', 200
    
    print(f"Upload request received: {request.method}")
    print(f"Files in request: {list(request.files.keys())}")
    
    if 'file' not in request.files:
        print("No file in request")
        return jsonify({'error': 'No file', 'success': False}), 400
    
    file = request.files['file']
    print(f"File received: {file.filename}")
    
    if file.filename == '':
        print("Empty filename")
        return jsonify({'error': 'No file selected', 'success': False}), 400
        
    if not allowed_file(file.filename):
        print(f"File type not allowed: {file.filename}")
        return jsonify({'error': 'File type not allowed', 'success': False}), 400
    
    try:
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        print(f"File saved successfully: {file_path}")
        
        # 업로드 시 오래된 파일들 정리 (24시간 이상 된 파일)
        cleanup_old_files()
        
        return jsonify({
            'success': True,
            'filename': unique_filename,
            'url': f'/uploads/{unique_filename}'
        })
    except Exception as e:
        print(f"Upload error: {str(e)}")
        return jsonify({'error': f'Upload failed: {str(e)}', 'success': False}), 500

@app.route('/generate', methods=['POST', 'OPTIONS'])
def generate_ai():
    # OPTIONS 요청 처리 (CORS preflight)
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    canvas_image = data.get('canvas_image')  # 캔버스 전체 이미지 (base64)
    original_image = data.get('original_image')  # 원본 이미지 URL
    furniture = data.get('furniture', [])  # 가구 정보 (위치, 크기, 회전)
    
    print(f"AI Generation request:")
    print(f"- Canvas image: {'Present' if canvas_image else 'Missing'}")
    print(f"- Original image: {original_image}")
    print(f"- Furniture count: {len(furniture)}")
    
    if not canvas_image or not furniture:
        return jsonify({'error': 'Missing canvas image or furniture data', 'success': False}), 400
    
    # 캔버스 이미지 저장 (선택사항)
    if canvas_image.startswith('data:image'):
        try:
            import base64
            image_data = canvas_image.split(',')[1]
            decoded_image = base64.b64decode(image_data)
            canvas_filename = f"canvas_{uuid.uuid4().hex[:8]}.png"
            canvas_path = os.path.join(app.config['UPLOAD_FOLDER'], canvas_filename)
            
            with open(canvas_path, 'wb') as f:
                f.write(decoded_image)
            print(f"Canvas saved: {canvas_path}")
        except Exception as e:
            print(f"Canvas save error: {e}")
    
    # SANA AI를 사용한 인테리어 생성
    try:
        generated_filename = sana_ai.generate_interior_from_canvas(
            canvas_data=canvas_image,
            furniture_info=furniture,
            original_image_path=original_image
        )
        
        if generated_filename:
            generated_url = f"/uploads/{generated_filename}"
            return jsonify({
                'success': True,
                'generation_id': generation_id,
                'message': f'AI generated with {len(furniture)} furniture items',
                'canvas_saved': canvas_filename if 'canvas_filename' in locals() else None,
                'generated_image': generated_url,
                'generated_filename': generated_filename
            })
        else:
            return jsonify({
                'success': False,
                'error': 'AI generation failed',
                'generation_id': generation_id
            }), 500
            
    except Exception as e:
        print(f"SANA AI generation error: {e}")
        return jsonify({
            'success': False,
            'error': f'AI generation error: {str(e)}',
            'generation_id': generation_id
        }), 500

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 DreamSpace AI Backend Starting...")
    print(f"📍 Server URL: http://localhost:5001")
    print(f"📁 Upload folder: {UPLOAD_FOLDER}")
    
    # 시작 시 uploads 폴더 정리
    cleanup_uploads_folder()
    
    print(f"✅ CORS enabled for localhost:3000")
    print("⚠️  Port 5000 changed to 5001 (AirPlay conflict)")
    print("=" * 50)
    app.run(debug=True, port=5001, host='0.0.0.0')
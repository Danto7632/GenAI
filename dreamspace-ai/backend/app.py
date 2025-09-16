from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename

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

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return jsonify({'message': 'DreamSpace AI Backend', 'status': 'running'})

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
        
        return jsonify({
            'success': True,
            'filename': unique_filename,
            'url': f'/files/{unique_filename}'
        })
    except Exception as e:
        print(f"Upload error: {str(e)}")
        return jsonify({'error': f'Upload failed: {str(e)}', 'success': False}), 500

@app.route('/files/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

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
    
    # 모의 AI 처리
    generation_id = f"gen_{uuid.uuid4().hex[:8]}"
    
    # 가구 정보 로그
    for item in furniture:
        print(f"  - {item['name']}: pos({item['x']:.1f},{item['y']:.1f}) size({item['width']:.1f}x{item['height']:.1f}) rot({item['rotation']:.1f}°)")
    
    return jsonify({
        'success': True,
        'generation_id': generation_id,
        'message': f'AI generated with {len(furniture)} furniture items from canvas',
        'canvas_saved': canvas_filename if 'canvas_filename' in locals() else None
    })

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 DreamSpace AI Backend Starting...")
    print(f"📍 Server URL: http://localhost:5001")
    print(f"📁 Upload folder: {UPLOAD_FOLDER}")
    print(f"✅ CORS enabled for localhost:3000")
    print("⚠️  Port 5000 changed to 5001 (AirPlay conflict)")
    print("=" * 50)
    app.run(debug=True, port=5001, host='0.0.0.0')
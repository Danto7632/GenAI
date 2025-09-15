from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import cv2
import numpy as np
from PIL import Image
import boto3
from ultralytics import YOLO
import uuid

upload_bp = Blueprint('upload', __name__)

# YOLO 모델 로드 (전역으로 한번만)
try:
    # 객체 감지용 YOLO 모델
    detection_model = YOLO('yolov8n.pt')
except:
    detection_model = None

# AWS S3 설정
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'ap-northeast-2')
)
BUCKET_NAME = os.getenv('S3_BUCKET_NAME', 'dreamspace-ai-images')

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_to_s3(file_path, object_name=None):
    """S3에 파일 업로드"""
    if object_name is None:
        object_name = os.path.basename(file_path)
    
    try:
        s3_client.upload_file(file_path, BUCKET_NAME, object_name)
        return f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION', 'ap-northeast-2')}.amazonaws.com/{object_name}"
    except Exception as e:
        print(f"S3 업로드 오류: {e}")
        return None

def detect_room_objects(image_path):
    """이미지에서 방 구조와 가구 감지"""
    if not detection_model:
        return {"error": "YOLO 모델을 로드할 수 없습니다."}
    
    try:
        # 이미지 로드
        image = cv2.imread(image_path)
        if image is None:
            return {"error": "이미지를 읽을 수 없습니다."}
        
        # YOLO로 객체 감지
        results = detection_model(image)
        
        detected_objects = []
        furniture_classes = [
            'chair', 'couch', 'bed', 'dining table', 'toilet', 'tv', 
            'laptop', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator'
        ]
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    class_id = int(box.cls[0])
                    class_name = detection_model.names[class_id]
                    confidence = float(box.conf[0])
                    
                    # 가구 관련 객체만 필터링
                    if class_name in furniture_classes and confidence > 0.5:
                        x1, y1, x2, y2 = box.xyxy[0].tolist()
                        detected_objects.append({
                            'name': class_name,
                            'confidence': confidence,
                            'bbox': {
                                'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2,
                                'width': x2 - x1, 'height': y2 - y1
                            }
                        })
        
        # 이미지 크기 정보
        height, width = image.shape[:2]
        
        return {
            'image_dimensions': {'width': width, 'height': height},
            'detected_objects': detected_objects,
            'total_objects': len(detected_objects)
        }
        
    except Exception as e:
        return {"error": f"객체 감지 중 오류 발생: {str(e)}"}

@upload_bp.route('/image', methods=['POST'])
@jwt_required()
def upload_image():
    try:
        current_user_id = get_jwt_identity()
        
        if 'file' not in request.files:
            return jsonify({'error': '파일이 선택되지 않았습니다.'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '파일이 선택되지 않았습니다.'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': '지원하지 않는 파일 형식입니다.'}), 400
        
        # 임시 파일 저장
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        temp_path = f"/tmp/{unique_filename}"
        file.save(temp_path)
        
        # 이미지 분석
        analysis_result = detect_room_objects(temp_path)
        
        # S3에 업로드
        s3_object_name = f"uploads/{current_user_id}/{unique_filename}"
        s3_url = upload_to_s3(temp_path, s3_object_name)
        
        # 임시 파일 삭제
        os.remove(temp_path)
        
        if not s3_url:
            return jsonify({'error': 'S3 업로드에 실패했습니다.'}), 500
        
        return jsonify({
            'message': '이미지 업로드 및 분석 완료',
            'image_url': s3_url,
            'analysis': analysis_result
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500

@upload_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_existing_image():
    """기존 업로드된 이미지 재분석"""
    try:
        data = request.get_json()
        image_url = data.get('image_url')
        
        if not image_url:
            return jsonify({'error': '이미지 URL이 필요합니다.'}), 400
        
        # URL에서 이미지 다운로드 (임시)
        import requests
        response = requests.get(image_url)
        if response.status_code != 200:
            return jsonify({'error': '이미지를 다운로드할 수 없습니다.'}), 400
        
        # 임시 파일로 저장
        temp_filename = f"/tmp/{uuid.uuid4()}.jpg"
        with open(temp_filename, 'wb') as f:
            f.write(response.content)
        
        # 분석 수행
        analysis_result = detect_room_objects(temp_filename)
        
        # 임시 파일 삭제
        os.remove(temp_filename)
        
        return jsonify({
            'message': '이미지 분석 완료',
            'analysis': analysis_result
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500
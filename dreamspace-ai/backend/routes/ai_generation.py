from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.furniture import Furniture
from models.user import User
from app import db
import torch
from diffusers import StableDiffusionPipeline
import os
import uuid
from PIL import Image
import boto3

ai_bp = Blueprint('ai', __name__)

# SANA/Diffusers 모델 로드 (전역으로 한번만)
try:
    # GPU 사용 가능 시 CUDA, 아니면 CPU
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    # SANA 모델이 없는 경우 Stable Diffusion 사용
    model_id = "runwayml/stable-diffusion-v1-5"
    pipe = StableDiffusionPipeline.from_pretrained(
        model_id, 
        torch_dtype=torch.float16 if device == "cuda" else torch.float32
    )
    pipe = pipe.to(device)
    
    # 메모리 최적화
    if device == "cuda":
        pipe.enable_attention_slicing()
        pipe.enable_memory_efficient_attention()
        
except Exception as e:
    print(f"AI 모델 로드 실패: {e}")
    pipe = None

# AWS S3 설정
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'ap-northeast-2')
)
BUCKET_NAME = os.getenv('S3_BUCKET_NAME', 'dreamspace-ai-images')

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

def generate_furniture_prompt(category, style, color, material):
    """가구 생성을 위한 프롬프트 생성"""
    base_prompts = {
        'sofa': f"modern {style} {color} {material} sofa, clean background, product photography, high quality, detailed",
        'chair': f"elegant {style} {color} {material} chair, minimalist background, professional lighting, 4k",
        'table': f"stylish {style} {color} {material} table, white background, studio lighting, detailed texture",
        'bed': f"comfortable {style} {color} {material} bed, clean room setting, soft lighting, high resolution",
        'cabinet': f"functional {style} {color} {material} cabinet, modern interior, professional photography",
        'desk': f"contemporary {style} {color} {material} desk, office setting, clean background, detailed"
    }
    
    return base_prompts.get(category, f"{style} {color} {material} furniture, clean background, high quality")

@ai_bp.route('/generate-furniture', methods=['POST'])
@jwt_required()
def generate_furniture():
    try:
        current_user_id = get_jwt_identity()
        
        if not pipe:
            return jsonify({'error': 'AI 모델이 로드되지 않았습니다.'}), 500
        
        data = request.get_json()
        
        # 필수 파라미터 검증
        required_fields = ['category', 'style']
        if not all(field in data for field in required_fields):
            return jsonify({'error': '카테고리와 스타일은 필수입니다.'}), 400
        
        category = data['category']
        style = data.get('style', 'modern')
        color = data.get('color', 'neutral')
        material = data.get('material', 'wood')
        custom_prompt = data.get('custom_prompt', '')
        
        # 프롬프트 생성
        if custom_prompt:
            prompt = custom_prompt
        else:
            prompt = generate_furniture_prompt(category, style, color, material)
        
        # 네거티브 프롬프트
        negative_prompt = "blurry, low quality, distorted, ugly, bad anatomy, extra limbs, text, watermark"
        
        # 이미지 생성
        with torch.autocast(device):
            image = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=20,
                guidance_scale=7.5,
                width=512,
                height=512
            ).images[0]
        
        # 이미지 저장
        unique_id = str(uuid.uuid4())
        temp_filename = f"/tmp/furniture_{unique_id}.png"
        image.save(temp_filename)
        
        # S3에 업로드
        s3_object_name = f"generated/{current_user_id}/furniture_{unique_id}.png"
        s3_url = upload_to_s3(temp_filename, s3_object_name)
        
        # 임시 파일 삭제
        os.remove(temp_filename)
        
        if not s3_url:
            return jsonify({'error': 'S3 업로드에 실패했습니다.'}), 500
        
        # 데이터베이스에 저장
        furniture = Furniture(
            name=f"{style.title()} {category.title()}",
            category=category,
            style=style,
            image_url=s3_url,
            thumbnail_url=s3_url,  # 나중에 썸네일 따로 생성 가능
            color=color,
            material=material,
            prompt_used=prompt,
            generation_params={
                'style': style,
                'color': color,
                'material': material,
                'custom_prompt': custom_prompt
            },
            created_by=current_user_id
        )
        
        db.session.add(furniture)
        db.session.commit()
        
        return jsonify({
            'message': '가구 생성 완료',
            'furniture': furniture.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500

@ai_bp.route('/furniture-library', methods=['GET'])
@jwt_required()
def get_furniture_library():
    """사용자별 생성된 가구 라이브러리 조회"""
    try:
        current_user_id = get_jwt_identity()
        
        # 쿼리 파라미터
        category = request.args.get('category')
        style = request.args.get('style')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # 기본 쿼리 (사용자가 생성한 가구 + 템플릿 가구)
        query = Furniture.query.filter(
            (Furniture.created_by == current_user_id) | 
            (Furniture.is_template == True)
        )
        
        # 필터 적용
        if category:
            query = query.filter(Furniture.category == category)
        if style:
            query = query.filter(Furniture.style == style)
        
        # 페이지네이션
        furniture_list = query.order_by(Furniture.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'furniture': [item.to_dict() for item in furniture_list.items],
            'total': furniture_list.total,
            'pages': furniture_list.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500

@ai_bp.route('/suggest-style', methods=['POST'])
@jwt_required()
def suggest_style():
    """공간 분석 결과를 바탕으로 스타일 추천"""
    try:
        data = request.get_json()
        room_type = data.get('room_type', 'living_room')
        detected_objects = data.get('detected_objects', [])
        room_dimensions = data.get('room_dimensions', {})
        
        # 간단한 룰 기반 스타일 추천 로직
        suggestions = []
        
        # 방 크기 기반 추천
        area = room_dimensions.get('width', 0) * room_dimensions.get('height', 0)
        if area > 200000:  # 큰 방
            suggestions.extend(['modern', 'classic', 'luxurious'])
        elif area > 100000:  # 중간 방
            suggestions.extend(['modern', 'minimalist', 'scandinavian'])
        else:  # 작은 방
            suggestions.extend(['minimalist', 'compact', 'scandinavian'])
        
        # 기존 가구 기반 추천
        existing_furniture = [obj['name'] for obj in detected_objects]
        if 'couch' in existing_furniture or 'chair' in existing_furniture:
            suggestions.append('cozy')
        if 'tv' in existing_furniture:
            suggestions.append('entertainment')
        
        # 방 타입별 추천
        room_style_map = {
            'living_room': ['modern', 'cozy', 'entertainment'],
            'bedroom': ['minimalist', 'cozy', 'romantic'],
            'kitchen': ['modern', 'functional', 'clean'],
            'office': ['minimalist', 'professional', 'functional']
        }
        
        suggestions.extend(room_style_map.get(room_type, ['modern']))
        
        # 중복 제거 및 점수 계산
        unique_suggestions = list(set(suggestions))
        style_scores = {style: suggestions.count(style) for style in unique_suggestions}
        
        # 점수 순으로 정렬
        sorted_suggestions = sorted(style_scores.items(), key=lambda x: x[1], reverse=True)
        
        return jsonify({
            'suggested_styles': [
                {
                    'style': style,
                    'score': score,
                    'confidence': min(score / len(suggestions), 1.0)
                }
                for style, score in sorted_suggestions[:5]
            ],
            'analysis_summary': {
                'room_type': room_type,
                'estimated_area': area,
                'existing_furniture_count': len(detected_objects),
                'recommendations': f"추천 스타일: {', '.join([s[0] for s in sorted_suggestions[:3]])}"
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500
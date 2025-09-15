from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.project import Project
from models.user import User
from app import db

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_projects():
    """사용자의 프로젝트 목록 조회"""
    try:
        current_user_id = get_jwt_identity()
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        projects = Project.query.filter_by(user_id=current_user_id)\
                               .order_by(Project.updated_at.desc())\
                               .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'projects': [project.to_dict() for project in projects.items],
            'total': projects.total,
            'pages': projects.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500

@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    """새 프로젝트 생성"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # 필수 필드 검증
        if not data.get('name'):
            return jsonify({'error': '프로젝트 이름은 필수입니다.'}), 400
        
        project = Project(
            name=data['name'],
            description=data.get('description', ''),
            user_id=current_user_id,
            original_image_url=data.get('original_image_url'),
            room_type=data.get('room_type'),
            room_dimensions=data.get('room_dimensions'),
            detected_objects=data.get('detected_objects'),
            style_preference=data.get('style_preference'),
            color_scheme=data.get('color_scheme'),
            is_public=data.get('is_public', False)
        )
        
        db.session.add(project)
        db.session.commit()
        
        return jsonify({
            'message': '프로젝트가 생성되었습니다.',
            'project': project.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500

@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    """특정 프로젝트 조회"""
    try:
        current_user_id = get_jwt_identity()
        
        project = Project.query.filter_by(
            id=project_id, 
            user_id=current_user_id
        ).first()
        
        if not project:
            return jsonify({'error': '프로젝트를 찾을 수 없습니다.'}), 404
        
        return jsonify(project.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    """프로젝트 업데이트 (가구 배치 저장 등)"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        project = Project.query.filter_by(
            id=project_id, 
            user_id=current_user_id
        ).first()
        
        if not project:
            return jsonify({'error': '프로젝트를 찾을 수 없습니다.'}), 404
        
        # 업데이트 가능한 필드들
        updatable_fields = [
            'name', 'description', 'furniture_layout', 'style_preference', 
            'color_scheme', 'is_public'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(project, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': '프로젝트가 업데이트되었습니다.',
            'project': project.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    """프로젝트 삭제"""
    try:
        current_user_id = get_jwt_identity()
        
        project = Project.query.filter_by(
            id=project_id, 
            user_id=current_user_id
        ).first()
        
        if not project:
            return jsonify({'error': '프로젝트를 찾을 수 없습니다.'}), 404
        
        db.session.delete(project)
        db.session.commit()
        
        return jsonify({'message': '프로젝트가 삭제되었습니다.'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500

@projects_bp.route('/<int:project_id>/furniture', methods=['POST'])
@jwt_required()
def add_furniture_to_project(project_id):
    """프로젝트에 가구 배치"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        project = Project.query.filter_by(
            id=project_id, 
            user_id=current_user_id
        ).first()
        
        if not project:
            return jsonify({'error': '프로젝트를 찾을 수 없습니다.'}), 404
        
        # 현재 가구 배치 정보 가져오기
        current_layout = project.furniture_layout or []
        
        # 새 가구 정보 추가
        new_furniture = {
            'id': data.get('furniture_id'),
            'position': data.get('position', {'x': 0, 'y': 0, 'z': 0}),
            'rotation': data.get('rotation', {'x': 0, 'y': 0, 'z': 0}),
            'scale': data.get('scale', {'x': 1, 'y': 1, 'z': 1}),
            'timestamp': data.get('timestamp')
        }
        
        current_layout.append(new_furniture)
        project.furniture_layout = current_layout
        
        db.session.commit()
        
        return jsonify({
            'message': '가구가 프로젝트에 추가되었습니다.',
            'furniture_layout': project.furniture_layout
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500

@projects_bp.route('/<int:project_id>/furniture/<furniture_index>', methods=['DELETE'])
@jwt_required()
def remove_furniture_from_project(project_id, furniture_index):
    """프로젝트에서 가구 제거"""
    try:
        current_user_id = get_jwt_identity()
        
        project = Project.query.filter_by(
            id=project_id, 
            user_id=current_user_id
        ).first()
        
        if not project:
            return jsonify({'error': '프로젝트를 찾을 수 없습니다.'}), 404
        
        current_layout = project.furniture_layout or []
        
        try:
            furniture_index = int(furniture_index)
            if 0 <= furniture_index < len(current_layout):
                removed_furniture = current_layout.pop(furniture_index)
                project.furniture_layout = current_layout
                db.session.commit()
                
                return jsonify({
                    'message': '가구가 제거되었습니다.',
                    'removed_furniture': removed_furniture,
                    'furniture_layout': project.furniture_layout
                }), 200
            else:
                return jsonify({'error': '잘못된 가구 인덱스입니다.'}), 400
                
        except ValueError:
            return jsonify({'error': '가구 인덱스는 숫자여야 합니다.'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500
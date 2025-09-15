from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # 필수 필드 검증
        if not all(k in data for k in ('email', 'username', 'password')):
            return jsonify({'error': '이메일, 사용자명, 비밀번호는 필수입니다.'}), 400
        
        # 중복 확인
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': '이미 존재하는 이메일입니다.'}), 400
            
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': '이미 존재하는 사용자명입니다.'}), 400
        
        # 새 사용자 생성
        user = User(
            email=data['email'],
            username=data['username']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # 액세스 토큰 생성
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': '회원가입이 완료되었습니다.',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not all(k in data for k in ('email', 'password')):
            return jsonify({'error': '이메일과 비밀번호는 필수입니다.'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': '이메일 또는 비밀번호가 올바르지 않습니다.'}), 401
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': '로그인 성공',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': '사용자를 찾을 수 없습니다.'}), 404
            
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500
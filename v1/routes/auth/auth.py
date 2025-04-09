from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token, 
    jwt_required, 
    get_jwt,
    get_jwt_identity, 
    current_user
    )
from v1.models.user import User
from v1.models.token import TokenBlocklist

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.post('/register')
def register_user():
    data = request.get_json()

    print(f"Data from client: {data}")
    
    user = User.get_username(username=data.get('username'))

    if user:
        return jsonify({"error": "Username is taken. Please choose a different username"})
    
    email = User.get_email(email=data.get('email'))

    if email:
        return jsonify({"error": "Email already exists"})
     
    new_user = User(
        name = data.get('name'),
        username = data.get('username'),
        email = data.get('email')
    )
    new_user.set_password(password=data.get('password'))
    new_user.save()

    return jsonify({"message": "User created"}), 201

@auth_bp.post('/login')
def login_user():
    data = request.get_json()
    print(f"Data from client: {data}")
    user = User.get_username(username=data.get('username'))

    if user and (user.check_password(password=data.get('password'))):
        access_token = create_access_token(identity=user.username)
        refresh_token = create_refresh_token(identity=user.username)

        return jsonify(
            {
                "message":"logged in",
                "tokens":{
                    "access":access_token,
                    "refresh":refresh_token
                }
            }
        ), 200
    
    return jsonify({"error": "Invalid username or password"})


@auth_bp.get('/user')
@jwt_required()
def get_user():
    print(f"Request from client: ")
    return jsonify(
        {
            "message": "user details", 
            "user_details": {
                "user_id":current_user.user_id, 
                "username":current_user.username, 
                "email":current_user.email
            }
        }
    )

@auth_bp.get('/refresh')
@jwt_required(refresh=True)
def refresh_access():
    identity = get_jwt_identity()

    new_access_token = create_access_token(identity=identity)

    return jsonify({"access_token": new_access_token})

@auth_bp.get('/logout')
@jwt_required(verify_type=False)
def logout_user():
    jwt = get_jwt()
    jti = jwt['jti']
    token_type = jwt['type']
    token_b = TokenBlocklist(jti=jti)
    token_b.save()
    
    return jsonify({"message": f"{token_type} token revoked successfully"}), 200
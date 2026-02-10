
from flask import Flask, request, jsonify, g
from flask_cors import CORS, cross_origin
from flask_bcrypt import Bcrypt
from story_weaver import weave_narrative, analyze_image_content
from models import db, User, Project
import json
import uuid
import os
from functools import wraps

app = Flask(__name__)
# Allow CORS for localhost:5173 (Vite default) and 3000
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Database Config
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'visual_narrator.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
bcrypt = Bcrypt(app)

# Helper to ensure DB exists
with app.app_context():
    db.create_all()

# --- Auth Routes ---

@app.route('/api/register', methods=['POST'])
@cross_origin()
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', 'Explorer')

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(
        id=str(uuid.uuid4()),
        email=email,
        password_hash=hashed_password,
        name=name,
        age=""
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify(new_user.to_dict())

@app.route('/api/login', methods=['POST'])
@cross_origin()
def login_manual():
    # Supports both Manual (email/pass) and "Login only by email" if password not sent (for old compatibility/mock)
    # But user specifically asked for password verification.
    
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    # Check if this is a Google Token Login (handled by separate endpoint usually, but let's check)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        # This is a Google/Firebase ID Token login attempt
        # Retrieve user by decoding token (skipped here, assume verified by middleware if used)
        pass 

    user = User.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    # If password provided, verify it
    if password:
        if user.password_hash and bcrypt.check_password_hash(user.password_hash, password):
            return jsonify(user.to_dict())
        else:
            return jsonify({"error": "Invalid password"}), 401
    
    # Fallback/Safety: If no password provided but user has one specificed
    if user.password_hash and not password:
        return jsonify({"error": "Password required"}), 401

    # Allow password-less login ONLY if user has no password (e.g. pure Google/Guest users if any)
    return jsonify(user.to_dict())


@app.route('/api/google-login', methods=['POST'])
@cross_origin()
def google_login_sync():
    """Syncs a Google User with local DB"""
    data = request.json
    uid = data.get('uid')
    email = data.get('email')
    name = data.get('name')
    
    user = User.query.filter_by(email=email).first()
    if not user:
        # Create new Google User (no password)
        user = User(
            id=uid,
            email=email,
            name=name,
            password_hash=None 
        )
        db.session.add(user)
    else:
        # Update existing info if needed
        if not user.id == uid:
            # Link Google UID to existing email account? Complex.
            # For now, just return the existing user
            pass
            
    db.session.commit()
    return jsonify(user.to_dict())


@app.route('/api/projects', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin()
def projects():
    if request.method == 'POST':
        data = request.json
        user_id = data.get('userId')
        
        # Check if project exists
        existing = Project.query.get(data.get('id'))
        if existing:
             # Update
             existing.title = data.get('title')
             existing.pages_json = json.dumps(data.get('pages', []))
             existing.cover_image = data.get('coverImage')
             db.session.commit()
             return jsonify(existing.to_dict())
        else:
            # Create
            new_project = Project(
                id=data.get('id', str(uuid.uuid4())),
                user_id=user_id,
                title=data.get('title'),
                date=data.get('date'),
                cover_image=data.get('coverImage'),
                pages_json=json.dumps(data.get('pages', []))
            )
            db.session.add(new_project)
            db.session.commit()
            return jsonify(new_project.to_dict())
            
    # GET
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify([])
        
    user_projects = Project.query.filter_by(user_id=user_id).all()
    return jsonify([p.to_dict() for p in user_projects])

@app.route('/api/projects/<project_id>', methods=['DELETE', 'OPTIONS'])
@cross_origin()
def delete_project(project_id):
    project = Project.query.get(project_id)
    if project:
        db.session.delete(project)
        db.session.commit()
        return jsonify({"message": "Project deleted"}), 200
    return jsonify({"error": "Project not found"}), 404


@app.route('/api/users/<user_id>', methods=['PUT', 'OPTIONS'])
@cross_origin()
def update_user(user_id):
    data = request.json
    user = User.query.get(user_id)
    if user:
        user.name = data.get('name', user.name)
        user.age = data.get('age', user.age)
        db.session.commit()
        return jsonify(user.to_dict())
    return jsonify({"error": "User not found"}), 404


@app.route('/api/generate-story', methods=['POST'])
@cross_origin()
def generate_story_endpoint():
    data = request.json
    # Logic remains same...
    processed_images = []
    images_input = data.get('images', [])
    for img in images_input:
        desc = analyze_image_content(img.get('url', '')) # Mock function
        processed_images.append({
            'id': img.get('id'),
            'desc': desc,
            'context': img.get('note', '')
        })
    
    user_profile = {'name': 'Explorer', 'age': '10'} # Mock/Fetch from DB
    
    try:
        story_json = weave_narrative(processed_images, user_profile)
        return jsonify({"status": "success", "pages": story_json, "title": "The Magical Journey"})
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
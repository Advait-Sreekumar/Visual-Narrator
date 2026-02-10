import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from flask import request, jsonify, g
from functools import wraps
import os

# Initialize Firebase Admin (do this once at startup)
# Use the actual service account key filename in the project root
# Construct path relative to this script's location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FIREBASE_CRED_PATH = os.environ.get(
    "FIREBASE_CRED_PATH",
    os.path.join(BASE_DIR, "trial-projefct-firebase-adminsdk-fbsvc-d1e095b53c.json.json")
)
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CRED_PATH)
    firebase_admin.initialize_app(cred)

def verify_firebase_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            # Respond to the CORS preflight request
            return jsonify({'status': 'ok'}), 200
        id_token = None
        # Expect token in Authorization header as "Bearer <token>"
        auth_header = request.headers.get("Authorization", None)
        if auth_header and auth_header.startswith("Bearer "):
            id_token = auth_header.split(" ")[1]
        if not id_token:
            return jsonify({"error": "Missing ID token"}), 401
        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
            g.firebase_user = decoded_token
        except Exception as e:
            print(f"Firebase token verification failed: {e}") # Add detailed logging
            return jsonify({"error": "Invalid ID token", "details": str(e)}), 401
        return f(*args, **kwargs)
    return decorated_function

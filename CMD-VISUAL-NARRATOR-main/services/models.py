from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=True) # Nullable for purely Google Auth users
    name = db.Column(db.String(100), nullable=True)
    age = db.Column(db.String(10), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    projects = db.relationship('Project', backref='owner', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'age': self.age
        }

class Project(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    date = db.Column(db.String(50))
    cover_image = db.Column(db.Text) # Base64 can be large, Text is better
    pages_json = db.Column(db.Text) # Storing pages as JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'userId': self.user_id,
            'title': self.title,
            'date': self.date,
            'coverImage': self.cover_image,
            'pages': json.loads(self.pages_json) if self.pages_json else []
        }

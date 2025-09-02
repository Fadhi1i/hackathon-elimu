from flask import Flask, request, jsonify, session
from supabase import create_client, Client
from flask_cors import CORS
import os
from datetime import timedelta

# Initialize Flask app - ADDED static_folder parameter to serve your HTML/CSS/JS files
app = Flask(__name__, static_folder='.', static_url_path='')
# CHANGED: Get secret key from environment variable for security
app.secret_key = os.environ.get("SECRET_KEY", os.urandom(24))
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)

# CHANGED: Allow all origins for deployment - you can restrict this later
CORS(app, origins=["*"], supports_credentials=True)

# CHANGED: Get Supabase config from environment variables for security
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://tuatxlavzuoyjlcytuzc.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1YXR4bGF2enVveWpsY3l0dXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MTgzMTcsImV4cCI6MjA3MjE5NDMxN30.K5nyh3IJ78gWU1u6C6QuiRl3GlRDoGgVCHzrvOaSJ2U")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ADDED: Serve your main HTML file at the root URL
@app.route("/")
def serve_index():
    return app.send_static_file('index.html')

# ADDED: Serve other HTML files (like login.html)
@app.route("/<path:page_name>")
def serve_pages(page_name):
    return app.send_static_file(page_name)

# YOUR EXISTING CODE BELOW - NO CHANGES MADE TO YOUR API ROUTES
@app.route("/test-session")
def test_session():
    user_id = session.get('user_id')
    user_email = session.get('user_email')
    return jsonify({
        "user_id": user_id,
        "user_email": user_email,
        "session_data": dict(session)
    })

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard_data():
    if 'user_id' not in session:
        print("DEBUG: No user_id in session, unauthorized")
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    
    try:
        user_id = session['user_id']
        print(f"DEBUG: Fetching data for user_id: {user_id}")
        
        user_response = supabase.table("users").select("*").eq("id", user_id).execute()
        user_data = user_response.data[0] if user_response.data else None
        
        if not user_data:
            print("DEBUG: User not found in database")
            return jsonify({"success": False, "message": "User not found"}), 404
        
        children_response = supabase.table("children").select("*").eq("user_id", user_id).execute()
        children_data = children_response.data
        
        dashboard_data = {
            "user": {
                "id": user_data.get("id"),
                "username": user_data.get("username"),
                "email": user_data.get("email")
            },
            "children": children_data,
        }
        
        print("DEBUG: Dashboard data fetched successfully")
        return jsonify({"success": True, "data": dashboard_data}), 200
        
    except Exception as e:
        print(f"ERROR: Error fetching dashboard data: {str(e)}")
        return jsonify({"success": False, "message": "Server error"}), 500

@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        mobile_number = data.get("mobile_number")
        no_of_children = data.get("no_of_children")
        children = data.get("children")

        response = supabase.table("users").insert({
            "username": username,
            "email": email,
            "password": password,
            "phone": mobile_number,
            "no_of_children": no_of_children,
            "children": children
        }).execute()

        if response.error:
            return jsonify({"success": False, "message": response.error.message}), 400

        return jsonify({"success": True, "message": "User registered successfully", "data": response.data}), 201

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"success": False, "message": "Email and password required"}), 400

        response = supabase.table("users").select("*").ilike("email", email).execute()
        
        if response.data:
            user = response.data[0]
            if user.get("password") == password:
                # Set session as permanent
                session.permanent = True
                session['user_id'] = user['id']
                session['user_email'] = user['email']
                session['username'] = user['username']
                
                print(f"DEBUG: User {user['email']} logged in successfully")
                print(f"DEBUG: Session data: {dict(session)}")
                
                return jsonify({
                    "success": True, 
                    "message": "Login successful!",
                    "user": {
                        "id": user['id'],
                        "email": user['email'],
                        "username": user['username']
                    }
                }), 200
            else:
                print("DEBUG: Incorrect password")
                return jsonify({"success": False, "message": "Incorrect password"}), 401
        else:
            print("DEBUG: User not found")
            return jsonify({"success": False, "message": "User not found"}), 404

    except Exception as e:
        print(f"ERROR: Exception in login: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    print("DEBUG: User logged out")
    return jsonify({"success": True, "message": "Logged out successfully"})

# CHANGED: Added PORT configuration for Render
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

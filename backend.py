from flask import Flask, request, jsonify, session, send_from_directory
from supabase import create_client, Client
from flask_cors import CORS
import os
from datetime import timedelta

app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = os.environ.get("SECRET_KEY", os.urandom(24))
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)

# Allow all origins for deployment
CORS(app, origins=["*"], supports_credentials=True)

# Get Supabase config from environment variables
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Serve the main page
@app.route("/")
def serve_index():
    return app.send_static_file('mainpage.html')  # Change to index.html if you rename it

# Serve other HTML files
@app.route("/<path:page_name>")
def serve_pages(page_name):
    if "." not in page_name:
        page_name += ".html"
    return app.send_static_file(page_name)

# KEEP ALL YOUR EXISTING API ROUTES (signup, login, dashboard, etc.)
# ... [all your existing @app.route functions remain unchanged] ...

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)

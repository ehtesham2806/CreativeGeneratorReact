import os
from flask import Flask, request, send_file, jsonify, send_from_directory
from PyPDF2 import PdfReader
from PIL import Image
import io
import base64
import fitz  # PyMuPDF
import re
from flask_cors import CORS
from dropdowns import DROPDOWN_OPTIONS  # Import dropdown options

app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
CORS(app)

# Increase max upload size (50MB)
app.config['MAX_CONTENT_LENGTH'] = 150 * 1024 * 1024  # 150MB

# Normalize filename function (identical to old code)
def normalize_filename(pdf_name):
    """
    Normalize a PDF filename to create a standardized image filename.
    1. Removes file extension
    2. Converts to lowercase
    3. Removes special characters and apostrophes
    4. Replaces spaces and existing hyphens with a single hyphen
    5. Adds .jpg extension
    """
    print(f"Normalizing filename: {pdf_name}")
    name_without_ext = pdf_name.rsplit('.', 1)[0] if '.' in pdf_name else pdf_name
    name_lower = name_without_ext.lower()
    name_cleaned = re.sub(r'[^\w\s-]', '', name_lower)
    name_with_spaces = name_cleaned.replace('-', ' ')
    name_normalized = re.sub(r'\s+', ' ', name_with_spaces).strip()
    name_with_hyphens = name_normalized.replace(' ', '-')
    result = f"{name_with_hyphens}.jpg"
    print(f"Normalized result: {result}")
    return result

# Extract first page function (matches old code, with optional scaling from new code)
def extract_first_page(pdf_bytes, filename, width=800, height=600, bgcolor="#ffffff", apply_scaling=False):
    pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
    first_page = pdf_document[0]
    pix = first_page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))  # High-res rendering, same as old code
    img_data = pix.tobytes("jpeg")
    img = Image.open(io.BytesIO(img_data))
    img_width, img_height = img.size
    is_landscape = img_width > img_height

    # Optional server-side scaling (from your new code, disabled by default to match old code)
    if apply_scaling:
        background = Image.new('RGB', (width, height), bgcolor)
        img = img.convert('RGB')
        img.thumbnail((width, height), Image.Resampling.LANCZOS)
        img_left = (width - img.size[0]) // 2
        img_top = (height - img.size[1]) // 2
        background.paste(img, (img_left, img_top))
        output = io.BytesIO()
        background.save(output, format="JPEG")
        img_bytes = output.getvalue()
    else:
        img_bytes = img_data  # Raw image, as in old code

    pdf_document.close()
    return img_bytes, is_landscape, filename

# API Routes
@app.route('/api/dropdown-options', methods=['GET'])
def get_dropdown_options():
    return jsonify(DROPDOWN_OPTIONS)

@app.route('/api/normalize-filename', methods=['POST'])
def normalize_filename_route():
    data = request.get_json()
    if not data or 'filename' not in data:
        return jsonify({"error": "No filename provided", "normalized_filename": "image.jpg"}), 400
    
    pdf_name = data.get('filename', '')
    print(f"Received filename normalization request: {pdf_name}")
    if not pdf_name or pdf_name.strip() == '':
        return jsonify({"error": "Empty filename", "normalized_filename": "image.jpg"}), 400
    
    normalized_name = normalize_filename(pdf_name)
    return jsonify({"normalized_filename": normalized_name})

@app.route('/api/extract-first-page', methods=['POST'])
def extract_first_page_route():
    if 'pdf' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    pdf_file = request.files['pdf']
    if pdf_file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    try:
        pdf_filename = pdf_file.filename
        pdf_bytes = pdf_file.read()

        # Get form data (identical to old code)
        template = request.form.get("template", "")  # Matches frontend Form.jsx
        width = 800
        height = 600
        bgcolor = "#ffffff"

        # Apply template defaults if selected (identical to old code)
        if template in DROPDOWN_OPTIONS:
            width = DROPDOWN_OPTIONS[template]["width"]
            height = DROPDOWN_OPTIONS[template]["height"]
            bgcolor = DROPDOWN_OPTIONS[template].get("bgcolor", bgcolor)

        # Override with form values if provided (identical to old code)
        width = int(request.form.get('width', width))
        height = int(request.form.get('height', height))
        bgcolor = request.form.get('bgcolor', bgcolor)

        # Extract the first page (raw image by default, matching old code)
        img_bytes, is_landscape, _ = extract_first_page(pdf_bytes, pdf_filename, width, height, bgcolor, apply_scaling=False)
        image_data = base64.b64encode(img_bytes).decode()

        # Return all data as in old code
        return jsonify({
            "image_data": image_data,
            "is_landscape": is_landscape,
            "pdf_filename": pdf_filename,
            "width": width,
            "height": height,
            "bgcolor": bgcolor
        })
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Serve React frontend (new addition)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
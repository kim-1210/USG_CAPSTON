from charset_normalizer import detect
from flask import Flask, render_template, Response, request, jsonify
import sys
import firebase_storage as fs
import ai_cal as ai


app = Flask(__name__, static_folder='static')

@app.route('/')
def index():
    return render_template('./user/main.html')

@app.route('/process_image', methods=['POST'])
def process_image_route():
    # POST로 전송된 JSON 데이터에서 이미지 데이터 추출
    image_data = request.json.get('image_data', '')
    
    # 이미지 데이터를 처리
    result_image, bounding_box, result_check = ai.process_image(image_data)
    return jsonify({'result_image': result_image, 'bounding_box': bounding_box, 'result_check' : result_check})

@app.route('/go_to_work')
def go_to_work():
    return render_template('./user/check_safe_cloth.html')

if __name__ == "__main__":
    app.run(debug = True, host="127.0.0.1", port = 8080)
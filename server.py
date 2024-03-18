from charset_normalizer import detect
from flask import Flask, render_template, Response, request, jsonify
from flask_socketio import SocketIO, emit
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


#     # 데이터베이스에 새로운 정보가 추가될 때 호출되는 함수
# def on_new_data(event):
#     data = event["data"]
#     emit('new_data', data, broadcast=True)

# # 데이터베이스의 변경 사항을 감지하고 on_new_data 함수를 호출하여 웹 소켓을 통해 데이터를 전송
# def listen_to_database():
#     my_stream = db.child("your_data_path").stream(on_new_data)
    
#실시간 시각화 할것 : 금일 출근
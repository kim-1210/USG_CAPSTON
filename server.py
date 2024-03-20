from charset_normalizer import detect
from flask import Flask, render_template, Response, request, jsonify
from flask_socketio import SocketIO, emit
import sys
import firebase_storage as fs
import ai_cal as ai

app = Flask(__name__, static_folder='static')
socketio = SocketIO(app)

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

@app.route('/create_user', methods=['POST']) #추가
def create_user():
    create_information = request.json.get('information', '')
    result_string = fs.create_user(create_information['corporation'], create_information['typed'], 
                                   create_information['id'], create_information['password'], 
                                   create_information['name'], create_information['birthday'])
    my_stream = fs.db.child(create_information['corporation']).child('user').child(create_information['typed']).stream(on_new_data)
    return jsonify({'result_alert' : result_string})

@app.route('/remove_user', methods=['POST']) #삭제
def remove_user():
    remove_information = request.json.get('information','')
    result_string = fs.user_remove(remove_information['corporation'], remove_information['typed'], remove_information['id'])
    my_stream = fs.db.child(result_string['corporation']).child('user').child(result_string['typed']).stream(on_new_data)
    return jsonify({'result_alert' : result_string})



# 데이터베이스에 새로운 정보가 삭제, 추가될 때 호출되는 함수 (실시간)
#실시간 시각화 할것 : 금일 출근
def on_new_data(event):
    data = event["data"]
    print(type(data))
    print(data)
    # 새로운 데이터를 클라이언트에게 전송
    emit('new_data', data, broadcast=True)

if __name__ == "__main__":
    socketio.run(app, debug=True, host="127.0.0.1", port=8080)
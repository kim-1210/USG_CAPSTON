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

@app.route('/detector/login')
def detector_login():
    return render_template('./detector/login.html')

@app.route('/detector/main')
def detector_main():
    return render_template('./detector/main.html')

@app.route('/user/check_safe_cloth')
def user_check_safe_cloth():
    return render_template('./user/check_safe_cloth.html')

@app.route('/user/main')
def user_main():
    return render_template('./user/main.html')

@app.route('/process_image', methods=['POST'])
def process_image_route():
    # POST로 전송된 JSON 데이터에서 이미지 데이터 추출
    image_data = request.json.get('image_data', '')
    
    # 이미지 데이터를 처리
    result_image, bounding_box, result_check = ai.process_image(image_data)
    return jsonify({'result_image': result_image, 'bounding_box': bounding_box, 'result_check' : result_check})

@app.route('/check_today', methods=['POST'])
def check_today():
    check_data = request.json.get('data','')
    alert = fs.check_today(check_today['corporation'], check_today['id'])
    return jsonify({'result_content' : alert})

@app.route('/create_user', methods=['POST']) #추가
def create_user():
    create_information = request.json
    result_string = fs.create_user(create_information.get('corporation'), create_information.get('typed'), 
                                   create_information.get('id'), create_information.get('password'), 
                                   create_information.get('name'), create_information.get('birthday'))
    my_stream = fs.db.child(create_information.get('corporation')).child('user').child(create_information.get('typed')).stream(on_new_data)
    return jsonify({'result_alert' : result_string})

@app.route('/remove_user', methods=['POST']) #삭제
def remove_user():
    remove_information = request.json
    result_string = fs.user_remove(remove_information.get('corporation'), remove_information.get('typed'), remove_information.get('id'))
    #my_stream = fs.db.child(result_string['corporation']).child('user').child(result_string['typed']).stream(on_new_data)
    return jsonify({'result_alert' : result_string})

@app.route('/get_today', methods=['POST']) #금일 출근 표시
def get_today():
    corporation = request.json.get('corporation','')
    to_html = fs.get_today_excel(corporation)
    return jsonify({'today_excel' : to_html})

@app.route('/get_excel', methods=['POST']) #모든 출근일에서 가져오기
def get_excel():
    data = request.json  # JSON 데이터 직접 가져오기
    corporation = data.get('corporation')
    year = data.get('year')
    month = data.get('month')
    id = data.get('id')
    to_html = fs.get_all_excel(corporation, year, month, id)
    return jsonify({'excel_data' : to_html})

@app.route('/get_id', methods=['POST']) #관리자가 회원출근 현황을 검색할떄 드롭 해야함
def get_id():
    corporation = request.json.get('corporation','')
    id_list = fs.all_search_user(corporation, 'worked')
    return jsonify({'id_list' : id_list})

@app.route('/get_list_detector', methods=['POST'])
def get_list_detector():
    corporation = request.json.get('data','')
    send_data = fs.get_suggest(corporation)
    return jsonify({'data_list' : send_data})

@app.route('/get_year_file', methods=['POST'])
def get_year_file():
    corporation = request.json.get('corporation','')
    send_list = fs.get_year_file(corporation)
    return jsonify({'data_list' : send_list})

@app.route('/get_detail_suggest', methods=['POST'])
def get_datail_suggest():
    data = request.json
    send_title, send_image, send_cotent = fs.get_detail_suggest(data['corporation'], data['cnt'])
    return jsonify({'title': send_title, 'image' : send_image, 'content' : send_cotent})

@app.route('/set_suggest', methods = ['POST'])
def set_suggest():
    data = request.json
    result_str = fs.set_suggest(data.get('corporation'), data.get('title'), data.get('image'), data.get('content'), data.get('id'))
    return jsonify({'send_data' : result_str})

@app.route('/get_id_suggest', methods=['POST'])
def get_id_suggest():
    data = request.json.get('data','')
    send_data = fs.get_id_suggest(data['corporation'], data['id'])
    return jsonify({'send_data' : send_data})

if __name__ == "__main__":
    socketio.run(app, debug=True, host="127.0.0.1", port=8080)
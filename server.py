from certificate_file import ssl_context #https 인증서
from flask import Flask, render_template, Response, request, jsonify
from flask_sslify import SSLify
from flask_socketio import SocketIO
from watchdog.events import FileSystemEventHandler

import sys
import firebase_storage as fs

import ai_cal as ai

app = Flask(__name__, static_folder='static')
sslify = SSLify(app)

#--------- user ----------

@app.route('/')
def index():
    return render_template('./user/publiclogin.html')

@app.route('/user/record')
def user_record():
    return render_template('./user/record.html')

@app.route('/user/check_safe_cloth')
def user_check_safe_cloth():
    corporation_name = request.args.get('corporation')
    id_name = request.args.get('id')
    return render_template('./user/check_safe_cloth.html', corporation = corporation_name, id = id_name)

@app.route('/user/main')
def user_main():
    corporation_name = request.args.get('corporation')
    id_name = request.args.get('id')
    return render_template('./user/main.html', corporation = corporation_name, id = id_name)

#--------- safe ----------

@app.route('/safe_detector/main')
def safe_detector_main():
    return render_template('./safe_detector/main.html')

@app.route('/safe_detector/photoSuggest')
def safe_detector_photoSuggest():
    return render_template('./safe_detector/photoSuggest.html')

@app.route('/safe_detector/detailview')
def safe_detector_detailview():
    return render_template('./safe_detector/detailview.html')

@app.route('/safe_detector/list')
def safe_detector_list():
    return render_template('./safe_detector/list.html')

#--------- detector ----------

@app.route('/detector/login')
def detector_login():
    return render_template('./detector/login.html')

@app.route('/detector/main')
def detector_main():
    corporation_name = request.args.get('corporation')
    return render_template('./detector/main.html', corporation = corporation_name)

#--------- 기능 ----------
@app.route('/true_false_enter', methods=['POST'])
def true_false_enter():
    check_data = request.json
    true_false_check, check_time = fs.true_false_enter(check_data.get('corporation'), check_data.get('id'))
    return jsonify({'true_false_check' : true_false_check, 'check_time' : check_time})

@app.route('/process_image', methods=['POST'])
def process_image_route():
    # POST로 전송된 JSON 데이터에서 이미지 데이터 추출
    image_data = request.json.get('image_data')
    image_id = request.json.get('image_id')
    image_corporation = request.json.get('image_corporation')
    # 이미지 데이터를 처리
    result_image, bounding_box, result_check, facecheck = ai.process_image(image_data, image_id, image_corporation)
    return jsonify({'result_image': result_image, 'bounding_box': bounding_box, 'result_check' : result_check, 'face_checking' : facecheck})

@app.route('/check_today', methods=['POST'])
def check_today():
    check_data = request.json
    alert = fs.check_today(check_data.get('corporation'), check_data.get('id'), check_data.get('check'))
    return jsonify({'result_content' : alert})

@app.route('/user_login', methods=['POST'])
def user_login():
    data = request.json
    result_bool, name = fs.login(data.get('corporation'), data.get('typed'), data.get('id'), data.get('password'))
    return jsonify({'result' : result_bool, 'name': name})

@app.route('/detector_login', methods=['POST'])
def detector_login_check():
    data = request.json
    result_bool, name = fs.detector_login(data.get('corporation'), data.get('id'), data.get('password'))
    return jsonify({'result' : result_bool, 'name' : name})
    

@app.route('/create_user', methods=['POST']) #추가
def create_user():
    create_information = request.json
    result_string = fs.create_user(create_information.get('corporation'), create_information.get('typed'), 
                                   create_information.get('id'), create_information.get('password'), 
                                   create_information.get('name'), create_information.get('birthday'),
                                   create_information.get('target_img'))
    print(result_string)
    return jsonify({'result_alert' : result_string})

@app.route('/remove_user', methods=['POST']) #삭제
def remove_user():
    remove_information = request.json
    result_string = fs.user_remove(remove_information.get('corporation'), remove_information.get('typed'), remove_information.get('id'))
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

@app.route('/get_list_detector', methods=['POST']) #안전관리자도 이걸로 뽑기
def get_list_detector():
    corporation = request.json.get('corporation','')
    send_data_title, send_data_id, send_data_date = fs.get_suggest(corporation)
    return jsonify({'title_list' : send_data_title, 'id_list' : send_data_id, 'date_list' : send_data_date})

@app.route('/get_year_file', methods=['POST'])
def get_year_file():
    corporation = request.json.get('corporation','')
    send_list = fs.get_year_file(corporation)
    return jsonify({'data_list' : send_list})

@app.route('/get_detail_suggest', methods=['POST'])
def get_datail_suggest():
    data = request.json
    send_title, send_image, send_cotent = fs.get_detail_suggest(data.get('corporation'), int(data.get('cnt')))
    if './suggests' in send_image:
        read_img = fs.cv2.imread(send_image)
        _, buffer = ai.cv2.imencode('.jpg', read_img)
        frame_base64 = ai.base64.b64encode(buffer).decode('utf-8')
    else:
        frame_base64 = ''
    return jsonify({'title': send_title, 'image' : frame_base64, 'content' : send_cotent})

@app.route('/safe_detector_detail', methods=['POST']) #안전관리자 디테일 건의사항 보기
def safe_detector_detail():
    data = request.json
    title, img, content, date, name = fs.get_safe_detail(data.get('corporation'), data.get('id'), int(data.get('cnt')))
    if './suggests' in img:
        read_img = fs.cv2.imread(img)
        _, buffer = ai.cv2.imencode('.jpg', read_img)
        frame_base64 = ai.base64.b64encode(buffer).decode('utf-8')
    else:
        frame_base64 = ' '
    return jsonify({'title': title, 'image' : frame_base64, 'content' : content, 'date':date, 'name':name})

@app.route('/get_safe_suggest', methods=['POST'])
def get_safe_suggest():
    data = request.json
    titles,contents, dates= fs.get_safe_suggest(data.get('corporation'), data.get('id'))
    return jsonify({'titles' : titles , "contents" :contents ,"dates" : dates})

@app.route('/set_suggest', methods = ['POST'])
def set_suggest():
    data = request.json
    result_str = fs.set_suggest(data.get('corporation'), data.get('title'), data.get('image'), data.get('content'), data.get('id'), data.get('name'))
    return jsonify({'send_data' : result_str})

@app.route('/get_id_suggest', methods=['POST'])
def get_id_suggest():
    data = request.json
    send_data = fs.get_id_suggest(data.get('corporation'), data.get('id'))
    return jsonify({'send_data' : send_data})

@app.route('/get_corporation', methods=['POST'])
def get_corporation():
    send_list = fs.get_corporation()
    return jsonify({'send_list' : send_list})

@app.route('/get_manage_user', methods=['POST'])
def get_manage_user():
    corporation = request.json.get('corporation')
    worked_id, worked_name, worked_birthday, protected_id, protected_name, protected_birthday = fs.get_manage_user(corporation)
    return jsonify({'worked_id': worked_id, 'worked_name' : worked_name, 'worked_birthday' : worked_birthday, 'protected_id': protected_id, 'protected_name' : protected_name, 'protected_birthday' : protected_birthday})

@app.route('/get_img_ai_check', methods=['POST'])
def get_img_ai_check():
    datas = request.json
    imgs = datas.get('image', '')
    img, _ = ai.img_ai_check(imgs)
    return jsonify({'img' : img})

@app.route('/get_location', methods = ['POST'])
def get_location():
    data = request.json
    latitude, longitude = fs.get_location(data.get('corporation'))
    return jsonify({'lat' : latitude, 'long' : longitude})

@app.route('/set_location', methods = ['POST'])
def set_location():
    data = request.json
    fs.set_location(data.get('corporation'), data.get('long'), data.get('lat'))
    return jsonify({'alert_text' : '수정을 완료하였습니다.'})

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=8080)  # 내부 실행
    #app.run(ssl_context=ssl_context, debug=True, host="0.0.0.0", port=8080)  # 외부 연결 및 SSL/TLS 설정

#domain = safty-construction.kro.kr
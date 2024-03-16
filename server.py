from charset_normalizer import detect
from flask import Flask, render_template, Response, request, jsonify
import pandas as pd
import numpy as np
import torch
import cv2
import sys
import torch
import torchvision.models as models
import torchvision
import torch.nn as nn
import torch.nn.functional as F
import base64

device = 'cuda' if torch.cuda.is_available() else 'cpu'
# model = torch.hub.load('./ai/yolov5', 'custom', path='./ai/class5_protective_model/weights/best.pt', source='local')
# labeling = ['Boots', 'Gloves', 'Helmet', 'Human', 'Vest']
# def ok_check(detecting_list):
#     result = ''
#     matching = {'Boots' : 0, 'Gloves' : 0, 'Helmet' : 0, 'Human' : 0, 'Vest' : 0}
#     for i in detecting_list:
#         matching[i] = matching[i] + 1
#     for i in matching.keys():
#         if i == 'Boots' :
#             if matching[i] == 0 or matching[i] > 2:
#                 result += i + ', '
#         elif i != 'Gloves':
#             if matching[i] != 1:
#                 result += i + ', '
#     return result


model = torch.hub.load('./ai/yolov5', 'custom', path='./ai/protective_model5/weights/best.pt', source='local')
labeling = ['NoHelMet', 'NoVest', 'Person', 'HelMet', 'Vest']
def ok_check(detecting_list):
    result = ''
    matching = {'NoHelMet' : 0, 'NoVest' : 0, 'Person' : 0, 'HelMet' : 0, 'Vest' : 0}
    for i in detecting_list:
        matching[i] = matching[i] + 1
    for i in matching.keys():
        if matching[i] != 0:
            result += i + ', '
    return result

def process_image(image_data):
    # base64로 인코딩된 이미지 데이터를 디코딩
    _, img_encoded = image_data.split(",", 1)
    img_decoded = base64.b64decode(img_encoded)
    nparr = np.frombuffer(img_decoded, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    result = model(frame)
    detecting_name = []
    # 예측된 바운딩 박스 그리기
    for box in result.xyxy[0]:
        x1, y1, x2, y2, score, label = box.tolist()
        detecting_name.append(labeling[int(label)])
        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)  # 바운딩 박스 좌표를 정수형으로 변환
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)  # 바운딩 박스 그리기
        label_text = f'{labeling[int(label)]}'  # 정수로 변환한 label을 사용하여 labeling 리스트에서 해당하는 클래스명 가져오기
        cv2.putText(frame, label_text, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)  # 클래스 이름과 점수 표시, fontScale 값을 0.5로 변경
        
    ret, buffer = cv2.imencode('.jpg', frame)
    frame_base64 = base64.b64encode(buffer)
    result_check = ok_check(detecting_name)

    try:
        return frame_base64.decode('utf-8'), [[x1, y1, x2, y2]], result_check
    except Exception as err:
        return frame_base64.decode('utf-8'), [[0,0,0,0]], result_check



app = Flask(__name__, static_folder='static')

@app.route('/')
def index():
    return render_template('./user/main.html')

@app.route('/process_image', methods=['POST'])
def process_image_route():
    # POST로 전송된 JSON 데이터에서 이미지 데이터 추출
    image_data = request.json.get('image_data', '')
    
    # 이미지 데이터를 처리
    result_image, bounding_box, result_check = process_image(image_data)
    return jsonify({'result_image': result_image, 'bounding_box': bounding_box, 'result_check' : result_check})

@app.route('/go_to_work')
def go_to_work():
    return render_template('./user/check_safe_cloth.html')

if _
_name__ == "__main__":
    app.run(debug = True, host="127.0.0.1", port = 8080)
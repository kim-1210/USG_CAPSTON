
import torch
import torchvision.models as models
import torchvision
import torch.nn as nn
import torch.nn.functional as F
import base64
import pandas as pd
import numpy as np
import cv2

device = 'cuda' if torch.cuda.is_available() else 'cpu'
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
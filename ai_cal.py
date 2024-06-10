
import torch
import torchvision.models as models
from torchvision import transforms
import torch.nn as nn
import torch.nn.functional as F
import base64
import pandas as pd
import numpy as np
import cv2
import face_check as face
import threading

device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(device)

model = torch.hub.load('./ai/yolov5', 'custom', path='./ai/safty_modeling/weights/best.pt', source='local')
model.to(device)
model.eval()
labeling = ['Gloves', 'Helmet', 'Non-Helmet', 'Person', 'Shoes', 'Vest', 'bare-arms']
def ok_check(detecting_list):
    result = ''
    matching = {'Gloves' : 0, 'Helmet' : 0, 'Non-Helmet' : 0, 'Person' : 0, 'Shoes' : 0, 'Vest' : 0, 'bare-arms' : 0}
    for i in detecting_list:
        matching[i] = matching[i] + 1
    for i in matching.keys():
        if matching[i] == 1:
            result += i + ', '
    return result

class Drawing(threading.Thread):
    def __init__(self, target, args=()):
        super().__init__()
        self._target = target
        self._args = args
        self._detecting_name = []
        self._bounding_boxes = []
        self._frame = None
    def run(self):
        self._detecting_name, self._bounding_boxes, self._frame = self._target(*self._args)
    def get_result(self):
        self.join()
        return self._detecting_name, self._bounding_boxes, self._frame

def draw_bounding_boxes(result, frame):
    detecting_name = []
    bounding_boxes = []
    for box in result.xyxy[0]:
        x1, y1, x2, y2, score, label = box.tolist()
        detecting_name.append(labeling[int(label)])
        if labeling[int(label)] != 'Non-Helmet' and labeling[int(label)] != 'Shoes' and labeling[int(label)] != 'bare-arms' and labeling[int(label)] != 'Gloves':
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)  # 바운딩 박스 좌표를 정수형으로 변환
            if labeling[int(label)] == 'Person':
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)  # 바운딩 박스 그리기
            else:
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)  # 바운딩 박스 그리기
            bounding_boxes.append([x1, y1, x2, y2])
    return detecting_name, bounding_boxes, frame


def process_image(image_data, id, corporation):
    # base64로 인코딩된 이미지 데이터를 디코딩
    _, img_encoded = image_data.split(",", 1)
    img_decoded = base64.b64decode(img_encoded)
    nparr = np.frombuffer(img_decoded, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    cv2.imwrite('./test.jpg', frame)
    find_face_img = frame.copy()
    frame = cv2.resize(frame, (480, 640), interpolation=cv2.INTER_CUBIC)

    find_face_img = cv2.resize(find_face_img, (600, 900), interpolation=cv2.INTER_CUBIC)

    #frame = cv2.resize(frame, (480, 640))
    result = model(frame)

    # 얼굴 찾기 스레드 시작
    face_checking = False
    t_face = face.Find_facing(target=face.find_face, args=(f'./corporation_face/{corporation}/{id}.npy', find_face_img))
    t_face.start()

    # 바운딩 박스 그리기 및 라벨링 스레드 시작
    t_bounding_boxes = Drawing(target=draw_bounding_boxes, args=(result, frame))
    t_bounding_boxes.start()

    face_checking = t_face.get_result()

    detecting_name, bounding_boxes, frame = t_bounding_boxes.get_result()


    ret, buffer = cv2.imencode('.jpg', frame)
    frame_base64 = base64.b64encode(buffer)
    result_check = ok_check(detecting_name)
    print(f'{face_checking} : {result_check}')
    try:
        return frame_base64.decode('utf-8'), bounding_boxes, result_check, face_checking
    except Exception as err:
        return frame_base64.decode('utf-8'), [[0,0,0,0]], result_check, face_checking
    
# ---------------- detector -----------------

detector_model = torch.hub.load('./ai/yolov5', 'custom', path='./ai/protective_model5/weights/best.pt', source='local')
detector_labeling = ['NoHelMet', 'NoVest', 'Person', 'HelMet', 'Vest']

def img_ai_check(image_data): #이미지를 받아 Ai검사하여 bounding box 처리 할 예정
    _, img_encoded = image_data.split(",", 1)
    img_decoded = base64.b64decode(img_encoded)
    nparr = np.frombuffer(img_decoded, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    result = detector_model(frame) #이미지 예측
    #detecting_name = []

    # 예측된 바운딩 박스 그리기
    for box in result.xyxy[0]:
        x1, y1, x2, y2, score, label = box.tolist()
        #detecting_name.append(detector_labeling[int(label)])
        if 'No' in detector_labeling[int(label)]:
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)  # 바운딩 박스 좌표를 정수형으로 변환
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)  # 바운딩 박스 그리기
        #label_text = f'{detector_labeling[int(label)]}'  # 정수로 변환한 label을 사용하여 labeling 리스트에서 해당하는 클래스명 가져오기
        # cv2.putText(frame, "", (x1, y1 - 10),
        #             cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)  # 클래스 이름과 점수 표시, fontScale 값을 0.5로 변경
        
    ret, buffer = cv2.imencode('.jpg', frame)
    frame_base64 = base64.b64encode(buffer)

    try:
        print("das")
        return frame_base64.decode('utf-8'), [[x1, y1, x2, y2]]
    except Exception as err:
        print("ewqe")
        return frame_base64.decode('utf-8'), [[0,0,0,0]]

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
    
detector_model = torch.hub.load('./ai/yolov5', 'custom', path='./ai/protective_model5/weights/best.pt', source='local')
detector_model.to(device)
detector_labeling = ['NoHelMet', 'NoVest', 'Person', 'HelMet', 'Vest']

detector_model2 = torch.hub.load('./ai/yolov5', 'custom', path='./ai/class5_protective_model/weights/best.pt', source='local')
detector_model2.to(device)
detector_labeling2 = ['Boots', 'Gloves', 'Helmet', 'Person', 'Vest']

def ok_check(detecting_list):
    result = ''
    #matching = {'NoHelMet' : 0, 'NoVest' : 0, 'Person' : 0, 'HelMet' : 0, 'Vest' : 0}
    matching = {'Boots' : 0, 'Gloves' : 0, 'Helmet' : 0, 'Person' : 0, 'Vest' : 0}
    for i in detecting_list:
        matching[i] = matching[i] + 1
    for i in matching.keys():
        if matching[i] == 1:
            result += i + ', '
    print(f'탐지 : {result}')
    # if 'Person' in result and not ('NoHelMet' in result) and not ('NoVest' in result) and 'HelMet' in result and 'Vest' in result:
    #     return True
    # else:
    #     return False
    if 'Person' in result and 'Helmet' in result and 'Vest' in result:
        return True
    else:
        return False

def draw_bounding_boxes(result, frame):
    detecting_name = []
    bounding_boxes = []
    for box in result.xyxy[0]:
        x1, y1, x2, y2, score, label = box.tolist()
        detecting_name.append(detector_labeling2[int(label)])
        if detector_labeling2[int(label)] != 'Gloves' and detector_labeling2[int(label)] != 'Boots':
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)  # 바운딩 박스 좌표를 정수형으로 변환
            if detector_labeling2[int(label)] != 'Person':
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 4)  # 바운딩 박스 그리기
            bounding_boxes.append([x1, y1, x2, y2])
    return detecting_name, bounding_boxes, frame

def sharpen_image(image):
    kernel = np.array([[0, -1, 0],
                       [-1, 5,-1],
                       [0, -1, 0]])
    return cv2.filter2D(image, -1, kernel)


def process_image(image_data, id, corporation):
    # base64로 인코딩된 이미지 데이터를 디코딩
    frame = image_data
    wi, he = frame.shape[:2]
    print(f'기존크기 : {wi} , {he}')
    if wi > he:
        new_width = 512
        new_height = int(512 * he / wi)
    else:
        new_height = 512
        new_width = int(512 * wi / he)

    frame = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
    find_face_img = frame.copy()
    frame = sharpen_image(frame)

    #frame = cv2.resize(frame, (480, 640))
    result_person = detector_model(frame)
    result = detector_model2(frame)


    #result = detector_model2(frame)

    # 얼굴 찾기 스레드 시작
    face_checking = False
    t_face = face.Find_facing(target=face.find_face, args=(f'./corporation_face/{corporation}/{id}.npy', find_face_img))
    t_face.start()

    # 바운딩 박스 그리기 및 라벨링 스레드 시작
    t_bounding_boxes = Drawing(target=draw_bounding_boxes, args=(result, frame))
    t_bounding_boxes.start()

    face_checking, face_img = t_face.get_result()

    detecting_name, bounding_boxes, frame = t_bounding_boxes.get_result()

    for i in result_person.xyxy[0]:
        x1, y1, x2, y2, score, label = i.tolist()
        if detector_labeling[int(label)] == 'Person':
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2) 
            cv2.rectangle(frame, (x1, y1), (x2, y2), (102, 204, 255), 4)
            detecting_name.append(detector_labeling[int(label)])

    if not face_img is None:
        resized_imageA = cv2.resize(face_img, (70, 70))
        width_face, height_face = resized_imageA.shape[:2]
        frame[0:width_face, 0:height_face] = resized_imageA
        if face_checking:
            #BGR
            cv2.rectangle(frame, (0, 0), (width_face, height_face), (255, 0, 0), 2)
        else:
            cv2.rectangle(frame, (0, 0), (width_face, height_face), (0, 0, 255), 2)
    
    ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 50])
    frame_base64 = base64.b64encode(buffer)
    result_check = ok_check(detecting_name)
    print(f'얼굴 탐지 : {face_checking}, 최종결과 : {result_check}')
    try:
        return frame_base64.decode('utf-8'), bounding_boxes, result_check, face_checking
    except Exception as err:
        return frame_base64.decode('utf-8'), [[0,0,0,0]], result_check, face_checking
    
# ---------------- detector -----------------

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
        return frame_base64.decode('utf-8'), [[x1, y1, x2, y2]]
    except Exception as err:
        return frame_base64.decode('utf-8'), [[0,0,0,0]]
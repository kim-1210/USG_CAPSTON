
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
from PIL import ImageFont, ImageDraw, Image
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
        self._person_imgs = []
        self._frame = None
    def run(self):
        self._detecting_name, self._bounding_boxes, self._frame, self._person_imgs = self._target(*self._args)
    def get_result(self):
        self.join()
        return self._detecting_name, self._bounding_boxes, self._frame, self._person_imgs
    
detector_model = torch.hub.load('./ai/yolov5', 'custom', path='./ai/protective_model5/weights/best.pt', source='local')
detector_model.to(device)
detector_labeling = ['NoHelMet', 'NoVest', 'Person', 'HelMet', 'Vest']

def ok_check(detecting_list):
    result = ''
    matching = {'NoHelMet' : 0, 'NoVest' : 0, 'Person' : 0, 'HelMet' : 0, 'Vest' : 0}
    for i in detecting_list:
        matching[i] = matching[i] + 1
    for i in matching.keys():
        if matching[i] == 1:
            result += i + ', '
    print(f'탐지 : {result}')
    if not ('NoHelMet' in result) and not ('NoVest' in result) and 'HelMet' in result and 'Vest' in result:
        return True
    else:
        return False

def draw_bounding_boxes(result, frame):
    detecting_name = []
    bounding_boxes = []
    person_imgs = []
    frame_temp = frame.copy()
    for box in result.xyxy[0]:
        x1, y1, x2, y2, score, label = box.tolist()
        detecting_name.append(detector_labeling[int(label)])
        if detector_labeling[int(label)] != 'NoHelMet' and detector_labeling[int(label)] != 'NoVest':
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)  # 바운딩 박스 좌표를 정수형으로 변환
            if detector_labeling[int(label)] == 'Person':
                #BGR
                #255 204 102
                person_imgs.append(frame_temp[y1:y2, x1:x2])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (102, 204, 255), 4)  # 바운딩 박스 그리기
            else:
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 4)  # 바운딩 박스 그리기
            bounding_boxes.append([x1, y1, x2, y2])
    return detecting_name, bounding_boxes, frame, person_imgs

def sharpen_image(image):
    kernel = np.array([[0, -1, 0],
                       [-1, 5,-1],
                       [0, -1, 0]])
    return cv2.filter2D(image, -1, kernel)


def process_image(image_data, id, corporation):
    # base64로 인코딩된 이미지 데이터를 디코딩
    frame = image_data
    wi, he = frame.shape[:2]
    if wi > he:
        new_width = 512
        new_height = int(512 * he / wi)
    else:
        new_height = 512
        new_width = int(512 * wi / he)

    frame = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
    #find_face_img = frame.copy()
    frame = sharpen_image(frame)
    person_imgs = []

    result = detector_model(frame)

    # 바운딩 박스 그리기 및 라벨링 스레드 시작
    t_bounding_boxes = Drawing(target=draw_bounding_boxes, args=(result, frame))
    t_bounding_boxes.start()

    detecting_name, bounding_boxes, frame, person_imgs = t_bounding_boxes.get_result()

    # 얼굴 찾기 스레드 시작
    face_checking = False
    face_img = None

    detecting_name = []

    if len(person_imgs) > 0:
        for i in person_imgs:
            wi, he = i.shape[:2]
            print(f'원본 크기: {wi} , {he}')
            wi_cut = 360
            he_cut = 640

            if wi > wi_cut or he > he_cut:
                # 비율 계산
                width_ratio = wi_cut / wi
                height_ratio = he_cut / he
                ratio = min(width_ratio, height_ratio)
        
                # 새로운 크기 계산
                new_wi = int(wi * ratio)
                new_he = int(he * ratio)
        
                # 세로가 가로보다 길도록 조정
                if new_wi > new_he:
                    dim = (new_he, new_wi)
                else:
                    dim = (new_wi, new_he)
        
                # 이미지 크기 조정
                i = cv2.resize(i, dim, interpolation=cv2.INTER_AREA)
            
            wi, he = i.shape[:2]
            print(f'다음 : {wi} , {he}')

            t_face = face.Find_facing(target=face.find_face, args=(f'./corporation_face/{corporation}/{id}.npy', i))
            t_face.start()
            face_checking, face_img = t_face.get_result()
            if face_checking:
                result = detector_model(i)
                resized_imageA = cv2.resize(face_img, (70, 70))
                width_face, height_face = resized_imageA.shape[:2]
                frame[0:width_face, 0:height_face] = resized_imageA
                cv2.rectangle(frame, (0, 0), (width_face, height_face), (255, 0, 0), 2)
                detecting_name = []
                for box in result.xyxy[0]:
                    x1, y1, x2, y2, score, label = box.tolist()
                    detecting_name.append(detector_labeling[int(label)])
                break
    
    

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
            if detector_labeling[int(label)] == 'NoHelMet':
                cv2.putText(frame, 'HelMet X', (x1, y1 + 20), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,255), 3, cv2.LINE_AA )
            elif detector_labeling[int(label)] == 'NoVest':
                cv2.putText(frame, 'Vest X', (x1, y1 + 20), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,255), 3, cv2.LINE_AA)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 4)  # 바운딩 박스 그리기
        #label_text = f'{detector_labeling[int(label)]}'  # 정수로 변환한 label을 사용하여 labeling 리스트에서 해당하는 클래스명 가져오기
        # cv2.putText(frame, "", (x1, y1 - 10),
        #             cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)  # 클래스 이름과 점수 표시, fontScale 값을 0.5로 변경
        
    ret, buffer = cv2.imencode('.jpg', frame)
    frame_base64 = base64.b64encode(buffer)

    try:
        return frame_base64.decode('utf-8'), [[x1, y1, x2, y2]]
    except Exception as err:
        return frame_base64.decode('utf-8'), [[0,0,0,0]]
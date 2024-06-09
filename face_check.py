import face_recognition
import os
import cv2
import dlib
import base64
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import threading

detector = dlib.get_frontal_face_detector()
executor = ThreadPoolExecutor(max_workers=2)

class Find_facing(threading.Thread):
    def __init__(self, target, args=()):
        super().__init__()
        self._target = target
        self._args = args
        self._result = None
    def run(self):
        self._result = self._target(*self._args)
    def get_result(self):
        self.join()
        return self._result

def find_face(path1, image1):
    try:
        image2_encoding = np.load(path1)
        rgb_image1 = cv2.cvtColor(image1, cv2.COLOR_BGR2RGB)
        faces = detector(rgb_image1)
        if faces:
            face = faces[0]
            x, y, w, h = face.left(), face.top(), face.width(), face.height()
            #face_image = rgb_image1[y:y+h, x:x+w]
            face_locations = face_recognition.face_locations(rgb_image1)
            if face_locations:
                face_encodings = face_recognition.face_encodings(rgb_image1, face_locations)
                
                for face_encoding in face_encodings:
                    face_match = face_recognition.compare_faces([image2_encoding], face_encoding)
                    print(f'정확도 : {face_match[0]}')
                    
                    if face_match[0]:
                        return True
                    else:
                        return False
        return False
    except Exception as err:
        print(f'{err} : 실패')
        return False
    
def set_feature(img, id, corporation):
    try:
        _, img_encoded = img.split(",", 1)
        img_decoded = base64.b64decode(img_encoded)
        nparr = np.frombuffer(img_decoded, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        reference_encoding = face_recognition.face_encodings(frame)
        if reference_encoding:
            reference_encoding_save = reference_encoding[0]
            np.save(f'./corporation_face/{corporation}/{id}.npy', reference_encoding_save)
            return True
        else:
            return False
    except Exception as err:
        print(err)
        return False
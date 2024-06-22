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
        self._result_bool = None
        self._result_img = None
    def run(self):
        self._result_bool, self._result_img = self._target(*self._args)
    def get_result(self):
        self.join()
        return self._result_bool, self._result_img

def apply_clahe(image):
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl, a, b))
    return cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

def unsharp_mask(image, kernel_size=(5, 5), sigma=1.0, amount=1.0, threshold=0):
    blurred = cv2.GaussianBlur(image, kernel_size, sigma)
    sharpened = float(amount + 1) * image - float(amount) * blurred
    sharpened = np.maximum(sharpened, np.zeros(sharpened.shape))
    sharpened = np.minimum(sharpened, 255 * np.ones(sharpened.shape))
    sharpened = sharpened.round().astype(np.uint8)
    if threshold > 0:
        low_contrast_mask = np.absolute(image - blurred) < threshold
        np.copyto(sharpened, image, where=low_contrast_mask)
    return sharpened

def find_face(path1, image1):
    try:
        image2_encoding = np.load(path1)
        rgb_image1 = image1
        rgb_image1 = apply_clahe(rgb_image1)
        #rgb_image1 = unsharp_mask(rgb_image1)
        cv2.imwrite('./test.jpg', rgb_image1)
        face_locations = face_recognition.face_locations(rgb_image1, model='cnn-gpu')
        #cnn-gpu / cnn / hog
        if face_locations:
            face_encodings = face_recognition.face_encodings(rgb_image1, face_locations)
                
            for face_encoding, face_location in zip(face_encodings, face_locations):
                face_match = face_recognition.compare_faces([image2_encoding], face_encoding, tolerance=0.53)
                print(f'정확도 : {face_match[0]}')
                    
                if face_match[0]:
                    top, right, bottom, left = face_location
                    cropped_face = rgb_image1[top:bottom, left:right]
                    return True, cropped_face
                else:
                    top, right, bottom, left = face_location
                    cropped_face = rgb_image1[top:bottom, left:right]
                    return False, cropped_face
        return False, None
    except Exception as err:
        print(f'{err} : 실패')
        return False, None
    
def set_feature(img, id, corporation):
    try:
        _, img_encoded = img.split(",", 1)
        img_decoded = base64.b64decode(img_encoded)
        nparr = np.frombuffer(img_decoded, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
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
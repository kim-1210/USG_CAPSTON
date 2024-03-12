from flask import Flask, render_template, Response
import pandas as pd
import numpy as np
import torch
import cv2

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

def generate_frames():
    cap = cv2.VideoCapture(0)

    while True:
        success, frame = cap.read()
        if not success:
            break

        with torch.no_grad():
            image = torch.from_numpy(frame).permute(2, 0, 1).float().div(255.0).unsqueeze(0)
            predictions = model(image)

        results = Detect()(predictions)

        # 여기에서 results를 이용하여 frame을 처리하고 원하는 방식으로 출력

        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True)
from flask import Flask, render_template, Response, request, jsonify
import sys
import base64

app = Flask(__name__, static_folder='static')

@app.route('/')
def index():
    return render_template('./detector/register.html')

if __name__ == "__main__":
    app.run(debug = True, host="127.0.0.1", port = 8080)

    # http://127.0.0.1:8080/
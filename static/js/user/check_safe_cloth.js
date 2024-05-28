var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get('corporation');
var id = urlParams.get('id');
var name = urlParams.get('name');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const video = document.getElementById('video'); //element는 canvas다 

let stream;
var one_play = 0;
async function startCamera() {
    try {

        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1080 },
                height: { ideal: 1920 },
                facingMode: 'user',
                bitrate: { ideal: 2000000 }
            }
        });
        const videoTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack);
        const bitmap = await imageCapture.grabFrame();
        const context1 = video.getContext('2d');
        context1.drawImage(bitmap, 0, 0, video.width, video.height);
        setTimeout(() => {
            $('.loadingbox').fadeOut();
            if (one_play == 0) {
                one_play += 1;
                document.getElementById('explain_modal').style.display = 'block';
            }
        }, 400);
        setTimeout(() => {
            $('.explain_modal').fadeOut();
        }, 3000);
    }
    catch (error) {
        alert("카메라가 없습니다.")
    }
}

setInterval(startCamera, 500);
// 이미지 전송 함수
function sendImageToServer(imageData) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/process_image", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // 서버에서의 응답 처리
            var responseData = JSON.parse(xhr.responseText);
            var resultImage = document.getElementById('resultImage');
            resultImage.src = 'data:image/jpeg;base64,' + responseData.result_image;
            var checking_reslut = responseData.result_check;
            if (checking_reslut.length > 0) {
                checking(checking_reslut);
            }

        }
    };

    // 이미지 데이터를 JSON 형태로 변환하여 전송
    xhr.send(JSON.stringify({ image_data: imageData }));
}

// 프레임 캡처 및 이미지 전송
function captureFrame() {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', 0.7);  // 이미지 데이터를 base64로 변환
    sendImageToServer(imageData);
}

// 프레임 캡처 주기 설정 (3초에 한 번)
setInterval(captureFrame, 500);

function checking(result_str) { //출석 요청
    console.log(result_str)
    if (result_str.includes('Person') == true) { //사람이 있다.
        console.log("사람성공")
        if (result_str.includes('Non-Helmet') == false && result_str.includes('NoVest') == false) {
            console.log("없음성공")
            if (result_str.includes('Helmet') == true && result_str.includes('Vest') == true) {
                console.log("출석성공")
                var xhr = new XMLHttpRequest();
                xhr.open("POST", "/check_today", true);
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var responseData = JSON.parse(xhr.responseText);
                        var dingdong = responseData.result_content;
                        const text = document.getElementById('bottomtext');
                        text.innerHTML = '출석 완료 <br> 안전한 하루 되십시오';
                        alert(dingdong)
                        main();
                    }
                };
                xhr.send(JSON.stringify({ 'corporation': corporation, 'id': id, 'check': 'O' }));

            }
        }
        else {
            const text = document.getElementById('bottomtext');
            text.innerHTML = '알맞은 복장을 <br> 착용해 주세요';
        }
    }
}

function main() {
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(id) + '&name=' + encodeURIComponent(name);
    location.href = '/user/main' + queryString;
}
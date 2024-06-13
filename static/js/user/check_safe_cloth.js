$.ajax({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.min.js',
    dataType: 'script',
    success: function () {
        var socket = io();
        // jQuery 로드 성공 시 실행할 코드
        var queryString = window.location.search;
        var urlParams = new URLSearchParams(queryString);
        var corporation = urlParams.get('corporation');
        var id = urlParams.get('id');
        var name = urlParams.get('name');
        let stream;
        var one_play = 0;
        var img = document.getElementById('resultImage');

        function main() {
            var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(id) + '&name=' + encodeURIComponent(name);
            location.href = '/user/main' + queryString;
        }

        socket.on('connect', function () {
            // 이곳에서 서버와 연결된 후에 수행할 작업을 정의할 수 있습니다.
            // 예를 들어, 서버에 데이터를 전송하거나 다른 이벤트를 수신할 수 있습니다.
            console.log('connect!')
            socket.emit('process_image', { image_id: id, image_corporation: corporation });
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
        });

        socket.on('video_frame', function (data) {
            const { result_image, result_check, facecheck } = data;
            img.src = 'data:image/jpeg;base64,' + result_image;
        });
    }
});
// socket.on('connect', () => {
//     console.log('Connected to server');
// });

// socket.on('sending_result', (data) => {
//     const { result_image, bounding_box, result_check, face_checking } = data;
//     var resultImage = document.getElementById('resultImage');
//     resultImage.src = 'data:image/jpeg;base64,' + result_image;
//     var checking_reslut = result_check;
//     sleep(2000);
//     if (checking_reslut.length > 0) {
//         checking(checking_reslut, face_checking);
//     }
// });

// let stream;
// var one_play = 0;

// async function startCamera() {
//     try {

//         stream = await navigator.mediaDevices.getUserMedia({
//             video: {
//                 width: { ideal: 480 },
//                 height: { ideal: 640 },
//                 facingMode: 'user'
//             }
//         });
//         const videoTrack = stream.getVideoTracks()[0];
//         const imageCapture = new ImageCapture(videoTrack);
//         const bitmap = await imageCapture.grabFrame();
//         const context1 = video.getContext('2d');
//         context1.drawImage(bitmap, 0, 0, video.width, video.height);
//         setTimeout(() => {
//             $('.loadingbox').fadeOut();
//             if (one_play == 0) {
//                 one_play += 1;
//                 document.getElementById('explain_modal').style.display = 'block';
//             }
//         }, 400);
//         setTimeout(() => {
//             $('.explain_modal').fadeOut();
//         }, 3000);
//     }
//     catch (error) {
//         alert("카메라가 없습니다.")
//     }
// }

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }
// var imageData_sample = null;
// // 프레임 캡처 및 이미지 전송
// canvas.width = video.width;
// canvas.height = video.height;
// function captureFrame() {
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);
//     //const imageData = canvas.toDataURL('image/jpeg', 1.0);  // 이미지 데이터를 base64로 변환
//     imageData_sample = canvas.toDataURL('image/png');  // PNG 포맷 사용
//     //imageData_sample = canvas.toDataURL('image/jpeg', 0.7);
//     socket.emit('process_image', { image_data: imageData_sample, image_id: id, image_corporation: corporation });
//     //resultImage.src = imageData_sample;
// }
// // 프레임 캡처 주기 설정 (3초에 한 번)
// setInterval(startCamera, 700);
// setInterval(captureFrame, 1000);
// var one_check = 0;
// var pre_texting = "";

// function checking(result_str, face_result) { //출석 요청
//     console.log(result_str)
//     if (result_str.includes('Person') == true && face_result == true) { //사람이 있다.
//         console.log("사람성공")
//         if (result_str.includes('Non-Helmet') == false && result_str.includes('NoVest') == false) {
//             console.log("없음성공")
//             if (result_str.includes('Helmet') == true && result_str.includes('Vest') == true) {
//                 if (pre_texting == result_str) {
//                     console.log("출석성공")
                    // var xhr = new XMLHttpRequest();
                    // xhr.open("POST", "/check_today", true);
                    // xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    // xhr.onreadystatechange = function () {
                    //     if (xhr.readyState === 4 && xhr.status === 200) {
                    //         if (one_check == 0) {
                    //             var responseData = JSON.parse(xhr.responseText);
                    //             var dingdong = responseData.result_content;
                    //             const text = document.getElementById('bottomtext');
                    //             text.innerHTML = '출석 완료 <br> 안전한 하루 되십시오';
                    //             alert(dingdong)
                    //             main();
                    //         }
                    //         if (one_check > 2) {
                    //             one_check = 0;
                    //         }
                    //         one_check += 1
                    //     }
                    // };
                    // xhr.send(JSON.stringify({ 'corporation': corporation, 'id': id, 'check': 'O' }));
//                 }
//                 else {
//                     pre_texting = result_str;
//                 }
//             }
//         }
//         else {
//             const text = document.getElementById('bottomtext');
//             text.innerHTML = '알맞은 복장을 <br> 착용해 주세요';
//         }
//     }
// }
var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get('corporation');
var user_id = urlParams.get('id');
var cnt = urlParams.get('cnt');

var xhr = new XMLHttpRequest(); //flask에 요청
xhr.open("POST", "/safe_detector_detail", true);
xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        console.log("성공!");
        result = JSON.parse(xhr.responseText);
        document.getElementById('title').textContent = '제목 : ' + result.title

        if (result.image == ' ' || result.image == '') {//이미지가 없을시
            console.log('dasda')
            var img_span = document.createElement('span');
            img_span.innerHTML = '이미지 없음';
            document.getElementById('file').appendChild(img_span);
        }
        else { //이미지가 있을시
            console.log('win')
            var imging = document.createElement('img');
            imging.src = 'data:image/jpeg;base64,' + result.image;
            imging.classList.add('img_resize');
            document.getElementById('file').appendChild(imging)
            var img_span = document.createElement('span');
            document.getElementById('file').appendChild(img_span);
        }

        document.getElementById('detail').textContent = result.content
    }
};
xhr.send(JSON.stringify({ 'corporation': corporation, 'id' : user_id, 'cnt' : cnt}));

function back(){
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(user_id);
    location.href = '/safe_detector/list' + queryString;
}
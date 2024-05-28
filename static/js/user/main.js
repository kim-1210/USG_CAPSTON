var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get('corporation');
var id = urlParams.get('id');
var name = urlParams.get('name');

function user_check_safe_cloth() {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/true_false_enter", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // 서버에서의 응답 처리
            var responseData = JSON.parse(xhr.responseText);
            var true_false_check = responseData.true_false_check;
            var check_true_time = responseData.check_time;
            if(true_false_check == 'O'){
                alert(`이미 출근 하셨습니다. ${check_true_time}`)
            }
            else{
                var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(id) + '&name=' + encodeURIComponent(name);
                location.href = '/user/check_safe_cloth' + queryString;
            }

        }
    };

    // 이미지 데이터를 JSON 형태로 변환하여 전송
    xhr.send(JSON.stringify({ corporation: corporation, id : id }));
}

function user_record(){
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(id) + '&name=' + encodeURIComponent(name);
    location.href = '/user/record' + queryString;
}

setTimeout(() => {
    $('.loadingbox').fadeOut();
  }, 500);
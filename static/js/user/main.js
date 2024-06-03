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
            if (true_false_check == 'O') {
                alert(`이미 출근 하셨습니다. ${check_true_time}`)
            }
            else {
                var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(id) + '&name=' + encodeURIComponent(name);
                location.href = '/user/check_safe_cloth' + queryString;
            }

        }
    };

    // 이미지 데이터를 JSON 형태로 변환하여 전송
    xhr.send(JSON.stringify({ corporation: corporation, id: id }));
}

function logout() {
    location.href = '/';
}

function user_record() {
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(id) + '&name=' + encodeURIComponent(name);
    location.href = '/user/record' + queryString;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // 지구의 반경 (단위: 킬로미터)
    var dLat = deg2rad(lat2 - lat1); // 위도 차이를 라디안으로 변환
    var dLon = deg2rad(lon2 - lon1); // 경도 차이를 라디안으로 변환
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distance = R * c; // 거리 (단위: 킬로미터)
    distance = distance * 1000
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

var cur_lat = 0;
var cur_long = 0;

function cur_location() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                cur_lat = position.coords.latitude;
                cur_long = position.coords.longitude;
            },
            function (error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert("User denied the request for Geolocation.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        alert("The request to get user location timed out.");
                        break;
                    case error.UNKNOWN_ERROR:
                        alert("An unknown error occurred.");
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function place_in_check(){
    cur_location();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/get_location", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // 서버에서의 응답 처리
            var responseData = JSON.parse(xhr.responseText);
            var fix_lat = responseData.lat;
            var fix_long = responseData.long;
            var range_distance = getDistanceFromLatLonInKm(fix_lat, fix_long, cur_lat, cur_long);
            if(range_distance > 500){
                alert('지정된 위치에서 너무 멉니다.')
            }
            else{
                user_check_safe_cloth();
            }
        }
    };

    // 이미지 데이터를 JSON 형태로 변환하여 전송
    xhr.send(JSON.stringify({ corporation: corporation}));
}

setTimeout(() => {
    $('.loadingbox').fadeOut();
}, 500);
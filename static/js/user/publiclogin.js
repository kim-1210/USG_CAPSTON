var options = []
var dataList = document.getElementById('list');
var xhr = new XMLHttpRequest(); //flask에 요청
xhr.open("POST", "/get_corporation", true);
xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        corporation_list = JSON.parse(xhr.responseText);
        options = corporation_list.send_list
        options.forEach(function (option) {
            var optionElement = document.createElement('option');
            optionElement.value = option;
            dataList.appendChild(optionElement);
        });


        document.getElementById('corporation_drop').addEventListener('input', function () {
            var inputValue = this.value;
            var options = dataList.querySelectorAll('option');
            options.forEach(function (option) {
                if (option.value.indexOf(inputValue) !== -1) {
                    option.style.display = 'block';
                } else {
                    option.style.display = 'none';
                }
            });
        });
    }
};
xhr.send();

function login() {
    var typed = document.getElementById('jobselect').value;
    var corporation_name = document.getElementById('corporation_drop').value;
    var id = document.getElementById('idinput').value;
    var pw = document.getElementById('pwinput').value;
    var fail_cnt = 0;

    var xhr = new XMLHttpRequest(); //flask에 요청
    xhr.open("POST", "/user_login", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            result = JSON.parse(xhr.responseText);
            if (result.result == true) {
                var queryString = '?corporation=' + encodeURIComponent(corporation_name) + '&id=' + encodeURIComponent(id) + '&name=' + encodeURIComponent(result.name);
                if (typed == 'worked') {
                    location.href = '/user/main' + queryString;
                }
                else {
                    location.href = '/safe_detector/main' + queryString;
                }
            }
            else{
                if (fail_cnt == 0) {
                    alert('로그인 실패!!')
                    document.getElementById('idinput').value = "";
                    document.getElementById('pwinput').value = "";
                }
                fail_cnt++;
                if(fail_cnt == 3){fail_cnt = 0;}
                return;
            }
        }
    };
    var data = JSON.stringify({ 'corporation': corporation_name, 'typed': typed, 'id': id, 'password': pw });
    xhr.send(data);
}

$(window).load(function(){
    $('.loadingbox').fadeOut();
});
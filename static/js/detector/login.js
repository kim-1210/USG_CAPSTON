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

var c_cnt = 0

function login() {
    var corporation_name = document.getElementById('corporation_drop').value;
    var id = document.getElementById('idinput').value;
    var pw = document.getElementById('pwinput').value;

    var xhr = new XMLHttpRequest(); //flask에 요청
    xhr.open("POST", "/detector_login", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            result = JSON.parse(xhr.responseText);
            if (result.result == true) {
                var queryString = '?corporation=' + encodeURIComponent(corporation_name) + '&name=' + encodeURIComponent(result.name);
                location.href = '/detector/main' + queryString;
            }
            else {
                alert('로그인 실패!!')
            }
        }
        else {
            c_cnt += 1
            if (c_cnt == 3) {
                document.getElementById('idinput').value = "";
                document.getElementById('pwinput').value = "";
                alert("아이디 및 비밀번호를 다시 한번 확인해주세요.")
                c_cnt = 0;
            }
        }
    };
    var data = JSON.stringify({ 'corporation': corporation_name, 'id': id, 'password': pw });
    xhr.send(data);
}
const { fuchsia } = require("color-name");

var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get('corporation');
var user_name = urlParams.get('name');
var dataList = document.getElementById('list');

var per_timer = null; //당일 출근 관련 변수
var per_O_X = [];

document.getElementById('userName').innerHTML = "관리자 : " + user_name;

document.getElementById('list_contents').style.display = "block";
document.getElementById('check_calender').style.display = "none";
document.getElementById('workerBox').style.display = "none";
list_change();

$(function () {
    //input을 datepicker로 선언
    $("#datepicker").datepicker({
        dateFormat: 'yy-mm-dd'
        , showOtherMonths: true
        , showMonthAfterYear: true
        , changeYear: true
        , changeMonth: true
        , showOn: "both"
        , buttonImage: "http://jqueryui.com/resources/demos/datepicker/images/calendar.gif"
        , buttonImageOnly: true
        , buttonText: "선택"
        , yearSuffix: "년"
        , monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
        , monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
        , dayNamesMin: ['일', '월', '화', '수', '목', '금', '토']
        , dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
        , minDate: "-50Y"
    });

    $('#datepicker').datepicker('setDate', 'today');
});

function show_list() { //건의사항 리스트 
    var xhr_suggest = new XMLHttpRequest(); //flask에 요청
    xhr_suggest.open("POST", "/get_list_detector", true);
    xhr_suggest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr_suggest.onreadystatechange = function () {
        if (xhr_suggest.readyState === 4 && xhr_suggest.status === 200) {
            document.getElementById('list_nemo').innerHTML = '';
            var data = JSON.parse(xhr_suggest.responseText);
            var titles = data.data_list
            for (var i = 0; i < titles.length; i++) {
                var div_list = document.createElement('div');
                div_list.innerText = titles[i];
                div_list.classList.add("list_item");
                div_list.setAttribute('data-value', i);
                div_list.onclick = function () {
                    var value = this.getAttribute('data-value');
                    handleClick(corporation, value);
                };
                document.getElementById('list_nemo').appendChild(div_list);
            }
        }
    };
    var data = JSON.stringify({ 'corporation': corporation });
    xhr_suggest.send(data);
}

function handleClick(corporation, cnt) { //건의사항 리스트 클릭시
    var xhr_detail = new XMLHttpRequest(); //flask에 요청
    xhr_detail.open("POST", "/get_detail_suggest", true);
    xhr_detail.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr_detail.onreadystatechange = function () {
        if (xhr_detail.readyState === 4 && xhr_detail.status === 200) {
            document.getElementById('list_nemo').innerHTML = '';
            var add_html = JSON.parse(xhr_detail.responseText);
            console.log(add_html.title + ", " + add_html.image + ", " + add_html.content)

            var big_div = document.createElement('div');
            big_div.classList.add('suggest_detail');

            var title_span = document.createElement('span');
            title_span.innerHTML = "제목 : " + add_html.title;
            title_span.classList.add('underbar');
            title_span.classList.add('title');
            big_div.appendChild(title_span);

            if (add_html.image == ' ' || add_html.image == '') {//이미지가 없을시
                console.log('dasda')
                var img_span = document.createElement('span');
                img_span.innerHTML = '이미지 없음';
                img_span.classList.add('underbar')
                big_div.appendChild(img_span);
            }
            else { //이미지가 있을시
                console.log('win')
                var imging = document.createElement('img');
                imging.src = 'data:image/jpeg;base64,' + add_html.image;
                imging.classList.add('img_resize');
                big_div.appendChild(imging)
                var img_span = document.createElement('span');
                img_span.classList.add('underbar');
                big_div.appendChild(img_span);
            }
            content_span = document.createElement('span');
            content_span.innerHTML = "내용 : " + add_html.content;
            content_span.classList.add('content')
            big_div.appendChild(content_span);

            document.getElementById('list_nemo').appendChild(big_div);
        }
    };
    var data = JSON.stringify({ 'corporation': corporation, 'cnt': cnt });
    xhr_detail.send(data);
}

function list_change() {

    if (document.getElementById('menu1').checked) {
        document.getElementById('list_contents').style.display = "block";
        document.getElementById('check_calender').style.display = "none";
        document.getElementById('workerBox').style.display = "none";
        show_list();

        if (per_timer != null) {
            clearInterval(timer); // 타이머 중지
            per_timer = null;
        }
    }
    else if (document.getElementById('menu2').checked) {
        document.getElementById('list_contents').style.display = "none";
        document.getElementById('check_calender').style.display = "block";
        document.getElementById('workerBox').style.display = "none";
        show_day();
    }
    else {
        document.getElementById('list_contents').style.display = "none";
        document.getElementById('check_calender').style.display = "none";
        document.getElementById('workerBox').style.display = "block";
        manage_user();

        if (per_timer != null) {
            clearInterval(timer); // 타이머 중지
            per_timer = null;
        }
    }

}

function dropdownChangeHandler(event) {
    if (confirm('정말 바꾸시겠습니까?')) {
        var selectedOption = event.target.value;
        var select = this.getAttribute('id');

        console.log(select + " : " + selectedOption)

        var xhr1 = new XMLHttpRequest(); //flask에 요청
        xhr1.open("POST", "/check_today", true);
        xhr1.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr1.onreadystatechange = function () {
            if (xhr1.readyState === 4 && xhr1.status === 200) {
                var result_text = JSON.parse(xhr1.responseText);
                alert(result_text.result_content);
                show_day();
            }
        };
        var send_data = JSON.stringify({ 'corporation': corporation, 'id': select, 'check': selectedOption });
        xhr1.send(send_data);
    }
    else {
        if (this.firstElementChild.selected == true) {
            this.lastElementChild.selected = true;
        }
        else {
            this.firstElementChild.selected = true;
        }
    }
}

function per_go_to_work_check() { //당일 출근 쓰레드
    document.getElementById('search_if').style.display = 'none';
    var xhr = new XMLHttpRequest(); //flask에 요청
    xhr.open("POST", "/get_today", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('day_nemo').innerHTML = '';
            var add_html = JSON.parse(xhr.responseText);

            var table_html = add_html.today_excel;
            var tempElement = document.createElement('div');
            tempElement.innerHTML = table_html;
            
            var xCells = tempElement.querySelectorAll('td');
            var cnt_list = 0;
            var temp_per_O_X = [];
            xCells.forEach(function (cell) {
                if (cell.innerText.trim() === 'X' || cell.innerText.trim() === 'O') {
                    temp_per_O_X.push(cell.innerText.trim())
                }
            });
            if(temp_per_O_X.length != per_O_X.length){ //사람이 늘었다면
                show_day();
            }
            else{
                per_O_X.forEach(cell =>{ //출근이 바뀌었다면
                    if(cell != temp_per_O_X[cnt_list]){
                        show_day();
                    }
                    cnt_list = cnt_list + 1;
                });
            }
        }
    };
    var data = JSON.stringify({ 'corporation': corporation });
    xhr.send(data);
}

function show_day() {
    if (document.getElementById('f_tday').checked) { //당일 출근
        document.getElementById('search_if').style.display = 'none';
        var xhr = new XMLHttpRequest(); //flask에 요청
        xhr.open("POST", "/get_today", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                document.getElementById('day_nemo').innerHTML = '';
                var add_html = JSON.parse(xhr.responseText);

                var table_html = add_html.today_excel;
                var tempElement = document.createElement('div');
                tempElement.innerHTML = table_html;
                var xCells = tempElement.querySelectorAll('td');
                var tableRows = tempElement.querySelectorAll('tr');
                per_O_X = [];
                var lists_id = 1;
                xCells.forEach(function (cell) {
                    if (cell.innerText.trim() === 'X' || cell.innerText.trim() === 'O') {
                        var dropdown = document.createElement('select');

                        var optionO = document.createElement('option');
                        optionO.value = 'O';
                        optionO.innerText = 'O';
                        if (cell.innerText.trim() === 'O') {
                            per_O_X.push('O')
                            optionO.selected = true; //'O'면 선택된 상태로 설정
                        }
                        dropdown.appendChild(optionO);

                        var optionX = document.createElement('option');
                        optionX.value = 'X';
                        optionX.innerText = 'X';
                        if (cell.innerText.trim() === 'X') {
                            per_O_X.push('X')
                            optionX.selected = true; //'X'면 선택된 상태로 설정
                        }
                        dropdown.appendChild(optionX);

                        dropdown.setAttribute('id', xCells[lists_id - 2].innerText);
                        dropdown.classList.add('status-dropdown');
                        dropdown.addEventListener('change', dropdownChangeHandler);
                        cell.innerHTML = '';
                        cell.appendChild(dropdown);
                    }
                    lists_id += 1;
                });

                document.getElementById('day_nemo').appendChild(tempElement);
                //쓰레드로 flask의 callback 계산
                if (per_timer == null) {
                    per_timer = setInterval(show_day, 60000); //1분 마다 갱신
                }
            }
        };
        var data = JSON.stringify({ 'corporation': corporation });
        xhr.send(data);
    }
    else { //총 출근
        if (per_timer != null) {
            clearInterval(timer); // 타이머 중지
            per_timer = null;
        }

        document.getElementById('day_nemo').innerHTML = '';
        var xhr1 = new XMLHttpRequest(); //flask에 요청
        xhr1.open("POST", "/get_year_file", true);
        xhr1.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr1.onreadystatechange = function () {
            if (xhr1.readyState === 4 && xhr1.status === 200) {
                var year_list = JSON.parse(xhr1.responseText);
                var year_dropdown = document.getElementById('year_dropdown')
                year_dropdown.innerHTML = '';
                for (var i = 0; i < year_list.data_list.length; i++) {
                    options = document.createElement('option')
                    options.text = year_list.data_list[i];
                    options.value = year_list.data_list[i];
                    year_dropdown.appendChild(options);
                }
            }
        };
        var send_data = JSON.stringify({ 'corporation': corporation });
        xhr1.send(send_data);

        var month_dropdown = document.getElementById('month_dropdown')
        month_dropdown.innerHTML = "";
        for (var i = 1; i < 13; i++) {
            var options = document.createElement('option')
            options.text = i.toString();
            options.value = i.toString();
            month_dropdown.appendChild(options);
        }

        var xhr2 = new XMLHttpRequest(); //flask에 요청
        xhr2.open("POST", "/get_id", true);
        xhr2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr2.onreadystatechange = function () {
            if (xhr2.readyState === 4 && xhr2.status === 200) {
                var id_list = JSON.parse(xhr2.responseText);
                var id_dorpdown = document.getElementById('id_dropdown')
                dataList.innerHTML = '';
                var op_all = document.createElement('option')
                op_all.text = '전체';
                op_all.value = '전체';
                dataList.appendChild(op_all);
                for (var i = 0; i < id_list.id_list.length; i++) {
                    options = document.createElement('option')
                    options.text = id_list.id_list[i];
                    options.value = id_list.id_list[i];
                    dataList.appendChild(options);
                }

                document.getElementById('id_dropdown').addEventListener('input', function () {
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
        var send_data = JSON.stringify({ 'corporation': corporation });
        xhr2.send(send_data);

        document.getElementById('search_if').style.display = 'flex';
    }
}

function show_excel() {
    if (document.getElementById('id_dropdown').value === '') {
        alert('id를 정확히입력해주세요.');
        return '';
    }
    else {
        var xhr = new XMLHttpRequest(); //flask에 요청
        xhr.open("POST", "/get_excel", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                document.getElementById('day_nemo').innerHTML = '';
                add_html = JSON.parse(xhr.responseText);
                var modifiedData = add_html.excel_data.replace(/dataframe/g, 'allday');
                document.getElementById('day_nemo').innerHTML += modifiedData;
            }
        };

        var send_data = JSON.stringify({ 'corporation': corporation, 'year': document.getElementById('year_dropdown').value.toString(), 'month': document.getElementById('month_dropdown').value.toString(), 'id': document.getElementById('id_dropdown').value });
        xhr.send(send_data);
    }
}

function register() { //등록 함수
    var typed = document.getElementById("job").value;
    var date = document.getElementById('datepicker').value;
    var dateParts = date.split('-');
    var year = dateParts[0].slice(-2);
    var month = dateParts[1];
    var day = dateParts[2];

    var name = document.getElementById('name').value;
    var id = document.getElementById('id').value;
    var password = document.getElementById('pw').value;
    var birthday = year + month + day;

    var xhr = new XMLHttpRequest(); //flask에 요청
    xhr.open("POST", "/create_user", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("데이터 전송 완료");
            alert_text = JSON.parse(xhr.responseText);
            cancel();
            alert(alert_text.result_alert);
        }
    };
    var data = JSON.stringify({ 'corporation': corporation, 'typed': typed, 'id': id, 'password': password, 'name': name, 'birthday': birthday });
    xhr.send(data);
}

function manage_user() {
    var xhr = new XMLHttpRequest(); //flask에 요청
    xhr.open("POST", "/get_manage_user", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            data = JSON.parse(xhr.responseText);
            document.getElementById('worker_nemo').innerHTML = "";
            worked_id = data.worked_id
            worked_name = data.worked_name
            worked_birthday = data.worked_birthday
            protected_id = data.protected_id
            protected_name = data.protected_name
            protected_birthday = data.protected_birthday
            for (var i = 0; i < worked_id.length; i++) {
                li_div = document.createElement('div')
                li_div.classList.add('worker_box')

                box = document.createElement('span')
                box.innerHTML = worked_name[i] + " : " + worked_id[i] + " : " + worked_birthday[i] + " : 현장직";
                box.id = "worked" + i.toString();

                remove_btn = document.createElement('button')
                remove_btn.textContent = "삭제"
                remove_btn.setAttribute("id", worked_id[i]);
                remove_btn.setAttribute("typed", "worked");
                remove_btn.onclick = function () {
                    if (confirm('정말 삭제하시겠습니까?')) {
                        var xhr = new XMLHttpRequest(); //flask에 요청
                        xhr.open("POST", "/remove_user", true);
                        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState === 4 && xhr.status === 200) {
                                console.log("데이터 전송 완료");
                                alert_text = JSON.parse(xhr.responseText);
                                alert(alert_text.result_alert);
                                manage_user();
                                show_day();
                            }
                        };
                        var data = JSON.stringify({ 'corporation': corporation, 'typed': this.getAttribute('typed'), 'id': this.getAttribute('id') });
                        xhr.send(data);
                    }
                };
                li_div.appendChild(box)
                li_div.appendChild(remove_btn)
                document.getElementById('worker_nemo').appendChild(li_div)
            }

            for (var i = 0; i < protected_id.length; i++) {
                li_div = document.createElement('div')
                li_div.classList.add('worker_box')

                box = document.createElement('span')
                box.innerHTML = protected_name[i] + " : " + protected_id[i] + " : " + protected_birthday[i] + " : 안전관리자";
                box.id = "protected" + i.toString();

                remove_btn = document.createElement('button')
                remove_btn.textContent = "삭제"
                remove_btn.setAttribute("id", protected_id[i]);
                remove_btn.setAttribute("typed", "protected");
                remove_btn.onclick = function () {
                    if (confirm('정말 삭제하시겠습니까?')) {
                        var xhr = new XMLHttpRequest(); //flask에 요청
                        xhr.open("POST", "/remove_user", true);
                        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState === 4 && xhr.status === 200) {
                                console.log("데이터 전송 완료");
                                alert_text = JSON.parse(xhr.responseText);
                                alert(alert_text.result_alert);
                                manage_user();
                                show_day();
                            }
                        };
                        var data = JSON.stringify({ 'corporation': corporation, 'typed': this.getAttribute('typed'), 'id': this.getAttribute('id') });
                        xhr.send(data);
                    }
                };
                li_div.appendChild(box)
                li_div.appendChild(remove_btn)
                document.getElementById('worker_nemo').appendChild(li_div)
            }
        }
    };
    var data = JSON.stringify({ 'corporation': corporation });
    xhr.send(data);
}

function show() {
    document.querySelector(".modalbackground").className = "modalbackground show";
}

function cancel() {
    document.querySelector(".modalbackground").className = "modalbackground";
    document.getElementById('name').value = '';
    document.getElementById('id').value = '';
    document.getElementById('pw').value = '';
}
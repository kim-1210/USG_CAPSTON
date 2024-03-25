var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get('corporation');

document.getElementById('list_contents').style.display = "block";
document.getElementById('check_calender').style.display = "none";

$(function() {
    //input을 datepicker로 선언
    $("#datepicker").datepicker({
        dateFormat: 'yy-mm-dd'
        ,showOtherMonths: true
        ,showMonthAfterYear:true
        ,changeYear: true
        ,changeMonth: true               
        ,showOn: "both" 
        ,buttonImage: "http://jqueryui.com/resources/demos/datepicker/images/calendar.gif" 
        ,buttonImageOnly: true
        ,buttonText: "선택"          
        ,yearSuffix: "년"
        ,monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
        ,monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
        ,dayNamesMin: ['일','월','화','수','목','금','토']
        ,dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일']
        ,minDate: "-5Y"
        ,maxDate: "+5y"
    });                    
    
    $('#datepicker').datepicker('setDate', 'today');           
});

function list_change() {
    if (document.getElementById('menu1').checked) {
        document.getElementById('list_contents').style.display = "block";
        document.getElementById('check_calender').style.display = "none";
    }
    else {
        document.getElementById('list_contents').style.display = "none";
        document.getElementById('check_calender').style.display = "block";
        show_day()
    }
}


function show_day() {
    if (document.getElementById('f_tday').checked) { //당일 출근
        document.getElementById('search_if').style.display = 'none';
        var xhr = new XMLHttpRequest(); //flask에 요청
        xhr.open("POST", "/get_today", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                if (xhr.status === 200) {
                    document.getElementById('day_nemo').innerHTML = '';
                    add_html = JSON.parse(xhr.responseText);
                    //console.log(add_html.today_excel);
                    document.getElementById('day_nemo').innerHTML += add_html.today_excel;
                } else {
                    console.error("데이터 전송 실패");
                }
            }
        };
        var data = JSON.stringify({ 'corporation': corporation });
        xhr.send(data);
    }
    else { //총 출근
        document.getElementById('day_nemo').innerHTML = '';
        var xhr1 = new XMLHttpRequest(); //flask에 요청
        xhr1.open("POST", "/get_year_file", true);
        xhr1.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr1.onreadystatechange = function () {
            if (xhr1.readyState === 4 && xhr1.status === 200) {
                year_list = JSON.parse(xhr1.responseText);
                year_dropdown = document.getElementById('year_dropdown')
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

        month_dropdown = document.getElementById('month_dropdown')
        for (var i = 1; i < 13; i++) {
            options = document.createElement('option')
            options.text = i.toString();
            options.value = i.toString();
            month_dropdown.appendChild(options);
        }

        var xhr2 = new XMLHttpRequest(); //flask에 요청
        xhr2.open("POST", "/get_id", true);
        xhr2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr2.onreadystatechange = function () {
            if (xhr2.readyState === 4 && xhr2.status === 200) {
                id_list = JSON.parse(xhr2.responseText);
                id_dorpdown = document.getElementById('id_dorpdown')
                for (var i = 0; i < id_list.id_list.length; i++) {
                    options = document.createElement('option')
                    options.text = id_list.id_list[i];
                    options.value = id_list.id_list[i];
                    id_dorpdown.appendChild(options);
                }
            }
        };
        var send_data = JSON.stringify({ 'corporation': corporation });
        xhr2.send(send_data);

        document.getElementById('search_if').style.display = 'block';
    }
}

function show_excel() {
    var xhr = new XMLHttpRequest(); //flask에 요청
    xhr.open("POST", "/get_excel", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('day_nemo').innerHTML = '';
            add_html = JSON.parse(xhr.responseText);
            document.getElementById('day_nemo').innerHTML += add_html.excel_data;
        }
    };

    var send_data = JSON.stringify({ 'corporation': corporation, 'year': document.getElementById('year_dropdown').value.toString(), 'month': document.getElementById('month_dropdown').value.toString(), 'id': document.getElementById('id_dorpdown').value });
    xhr.send(send_data);
}

function register() { //등록 함수
    var dropdown = document.getElementById("job").value;
    var year = document.getElementById('year').value;
    var month = document.getElementById('month').value;
    var day = document.getElementById('day').value;
    var name = document.getElementById('name').value;
    var id = document.getElementById('id').value;
    var password = document.getElementById('pw').value;
    var birthday = year + month + day;
    console.log(birthday)

    var xhr = new XMLHttpRequest(); //flask에 요청
    xhr.open("POST", "/create_user", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            if (xhr.status === 200) {
                console.log("데이터 전송 완료");
                alert_text = JSON.parse(xhr.responseText);
                alert(alert_text.result_string);
            } else {
                console.error("데이터 전송 실패");
            }
        }
    };
    var data = JSON.stringify({ 'corporation': corporation, 'tpyed': tpyed, 'id': id, 'password': password, 'name': name, 'birthday': birthday });
    xhr.send(data);
}

function show() {
    document.querySelector(".modalbackground").className = "modalbackground show";
}

function cancel() {
    document.querySelector(".modalbackground").className = "modalbackground";
}
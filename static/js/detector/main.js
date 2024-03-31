var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get('corporation');
var user_name = urlParams.get('name');
var dataList = document.getElementById('list');
document.getElementById('userName').innerHTML = "관리자 : " + user_name;

document.getElementById('list_contents').style.display = "block";
document.getElementById('check_calender').style.display = "none";
document.getElementById('workerBox').style.display = "none";

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

function show_list() {
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
            // {'title': send_title, 'image' : send_image, 'content' : send_cotent}

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
                imging.src = 'data:image/jpeg;base64,'+ add_html.image;
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
    }
    else if(document.getElementById('menu2').checked) {
        document.getElementById('list_contents').style.display = "none";
        document.getElementById('check_calender').style.display = "block";
        document.getElementById('workerBox').style.display = "none";
        show_day()
    }
    else{
        document.getElementById('list_contents').style.display = "none";
        document.getElementById('check_calender').style.display = "none";
        document.getElementById('workerBox').style.display = "block";
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
                document.getElementById('day_nemo').innerHTML = '';
                var add_html = JSON.parse(xhr.responseText);
                //console.log(add_html.today_excel);
                document.getElementById('day_nemo').innerHTML += add_html.today_excel;
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
    var dropdown = document.getElementById("job").value;
    var date = document.getElementById('datepicker').value;
    var selectedDate = new Date(selectedDateStr);
    var year = selectedDate.getFullYear().toString().slice(-2);
    var month = (selectedDate.getMonth() + 1).toString();
    var day = (selectedDate.getDate()).toString();

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
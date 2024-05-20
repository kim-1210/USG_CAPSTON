var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get('corporation');
var id = urlParams.get('id');
var name1 = urlParams.get('name');
const currentDate = new Date();

function main() {
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(id) + '&name=' + encodeURIComponent(name1);
    location.href = '/user/main' + queryString;
}

var xhr = new XMLHttpRequest(); //flask에 요청
xhr.open("POST", "/get_year_file", true);
xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        var responseData = JSON.parse(xhr.responseText);
        var year_list = responseData.data_list; //년도 리스트
        var month = currentDate.getMonth() + 1
        const year_drop_down = document.getElementById('year_drop_down');
        const month_drop_down = document.getElementById('month_drop_down');

        if (year_drop_down && month_drop_down) {
            year_drop_down.innerHTML = "";
            month_drop_down.innerHTML = "";
        }

        year_list.forEach(element => {
            op = document.createElement('option');
            op.text = element + " 년";
            op.value = element;
            year_drop_down.appendChild(op);
        });
        year_drop_down.selectedIndex = 0;

        for(var i = 1; i<=12; i++){
            op = document.createElement('option');
            op.text = i + " 월";
            op.value = i;
            month_drop_down.appendChild(op);
        }
        month_drop_down.selectedIndex = month - 1;
        find_checked_date();
    }
};
xhr.send(JSON.stringify({ corporation: corporation }));

function find_checked_date(){
    $('.loadingbox').fadeIn();
    year_drop_down = document.getElementById('year_drop_down');
    year = year_drop_down.options[year_drop_down.selectedIndex].value;
    month_drop_down = document.getElementById('month_drop_down');
    month = month_drop_down.options[month_drop_down.selectedIndex].value;
    var xhr1 = new XMLHttpRequest(); //flask에 요청
    xhr1.open("POST", "/get_excel", true);
    xhr1.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr1.onreadystatechange = function () {
        if (xhr1.readyState === 4 && xhr1.status === 200) {
            var responseData = JSON.parse(xhr1.responseText);
            var date_data = responseData.excel_data;
            document.getElementById('date_show').innerHTML = date_data;
            $('.loadingbox').fadeOut();
        }
    };
    xhr1.send(JSON.stringify({ corporation: corporation, year : year, month : month, id : id }));
}
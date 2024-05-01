var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get('corporation');
var user_id = urlParams.get('id');
var user_name = urlParams.get('name');

var xhr = new XMLHttpRequest(); //flask에 요청
xhr.open("POST", "/get_safe_suggest", true);
xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        document.getElementById('list_box').innerHTML = "";
        console.log("성공!");
        result = JSON.parse(xhr.responseText);
        for(var i = 0; i < result.titles.length; i++){
            list = document.createElement('span');
            list.setAttribute('cnt' , i.toString());
            list.innerHTML = result.titles[i];
            (function(cnt) {
                list.onclick = function() {
                    enter(cnt);
                };
            })(i);
            document.getElementById('list_box').appendChild(list);
        }
    }
};
xhr.send(JSON.stringify({ 'corporation': corporation, 'id' : user_id}));

function main() {
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(user_id) + '&name=' + encodeURIComponent(user_name);
    location.href = '/safe_detector/main' + queryString;
}

function enter(cnt){
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(user_id) + '&name=' + encodeURIComponent(user_name) + '&cnt=' + encodeURIComponent(cnt);
    location.href = '/safe_detector/detailview' + queryString; //만들어야함
}
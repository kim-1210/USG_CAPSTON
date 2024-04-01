var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get('corporation');
var user_id = urlParams.get('id');

document.querySelector('.appearlabel').addEventListener('click',
    function Show_Hide(e) {
        e.stopPropagation(); // 부모(slidemenu) 클릭 이벤트를 방지.
        var checkbox = document.getElementById('slidemenuicon');
        var sidebar = document.querySelector('.sidebar');
        if (checkbox.checked) {
            checkbox.checked = false;
            sidebar.style.left = '-200px';
        }
        else {
            checkbox.checked = true;
            sidebar.style.left = '0';
        }
    });
document.querySelector('.sidebar').addEventListener('click', function (e) {
    e.stopPropagation();
});
document.querySelector('.slidemenu').addEventListener('click',
    function Show_Hide() {
        var checkbox = document.getElementById('slidemenuicon');
        var sidebar = document.querySelector('.sidebar');
        if (checkbox.checked) {
            checkbox.checked = false;
            sidebar.style.left = '-200px';
        }
        else {
            checkbox.checked = true;
            sidebar.style.left = '0';
        }
    });
function show() {
    document.querySelector(".modalbackground").className = "modalbackground show";
}
function cancel() {
    document.querySelector(".modalbackground").className = "modalbackground";
}

function send_suggest() {
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(user_id);
    location.href = '/safe_detector/photoSuggest' + queryString;
}

function show_list() {
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(user_id);
    location.href = '/safe_detector/list' + queryString;
}
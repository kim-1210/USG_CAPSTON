var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get('corporation');
var user_id = urlParams.get('id');
var user_name = urlParams.get('name');

setTimeout(() => {
    $('.loadingbox').fadeOut();
  }, 500);


function logout() {
    location.href = '/';
}

function send_suggest() {
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(user_id) + '&name=' + encodeURIComponent(user_name);
    location.href = '/safe_detector/photoSuggest' + queryString;
}

function show_list() {
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(user_id) + '&name=' + encodeURIComponent(user_name);
    location.href = '/safe_detector/list' + queryString;
}
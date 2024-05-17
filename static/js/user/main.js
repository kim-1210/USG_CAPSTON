var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get('corporation');
var id = urlParams.get('id');
var name = urlParams.get('name');

function user_check_safe_cloth() {
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(id) + '&name=' + encodeURIComponent(name);
    location.href = '/user/check_safe_cloth' + queryString;
}

function user_record(){
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(id) + '&name=' + encodeURIComponent(name);
    location.href = '/user/record' + queryString;
}

setTimeout(() => {
    $('.loadingbox').fadeOut();
  }, 500);
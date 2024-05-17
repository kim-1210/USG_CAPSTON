var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get('corporation');
var id = urlParams.get('id');
var name = urlParams.get('name');

var monthDropdown = document.getElementById("workmonth");
for (var month = 1; month <= 12; month++) {
    var option = document.createElement("option");
    option.text = month + "월";
    option.value = month;
    monthDropdown.add(option);
}

function main() {
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(id) + '&name=' + encodeURIComponent(name);
    location.href = '/user/main' + queryString;
}

$(window).load(function(){
    setTimeout(() => {
        $('.loadingbox').fadeOut();
      }, 500);
});
var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get("corporation");
var user_id = urlParams.get("id");
var user_name = urlParams.get("name");

var xhr = new XMLHttpRequest(); //flask에 요청
xhr.open("POST", "/get_safe_suggest", true);
xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4 && xhr.status === 200) {
    // 성공적인 응답을 받았을 때 실행될 코드
    var tbody = document.querySelector(".tbody");
    console.log("성공!");
    result = JSON.parse(xhr.responseText);

    for (var i = 0; i < result.titles.length; i++) {
      var newRow = document.createElement("tr");
      (function (cnt) {
        newRow.onclick = function () {
          enter(cnt);
        };
      })(i);
      var rowcell = document.createElement("th");
      rowcell.textContent = i;

      var newCell1 = document.createElement("td");
      newCell1.textContent = result.titles[i];

      var newCell2 = document.createElement("td");
      newCell2.textContent = result.contents[i];

      var newCell3 = document.createElement("td");
      newCell3.textContent = result.dates[i];

      newRow.appendChild(rowcell);
      newRow.appendChild(newCell1);
      newRow.appendChild(newCell2);
      newRow.appendChild(newCell3);
      tbody.appendChild(newRow);
    }
  }
};

xhr.send(JSON.stringify({ corporation: corporation, id: user_id }));

function main() {
  var queryString =
    "?corporation=" +
    encodeURIComponent(corporation) +
    "&id=" +
    encodeURIComponent(user_id) +
    "&name=" +
    encodeURIComponent(user_name);
  location.href = "/safe_detector/main" + queryString;
}

function enter(cnt) {
  var queryString =
    "?corporation=" +
    encodeURIComponent(corporation) +
    "&id=" +
    encodeURIComponent(user_id) +
    "&name=" +
    encodeURIComponent(user_name) +
    "&cnt=" +
    encodeURIComponent(cnt);
  location.href = "/safe_detector/detailview" + queryString; //만들어야함
}

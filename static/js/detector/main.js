var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get("corporation");
var user_name = urlParams.get("name");
var dataList = document.getElementById("list");

var per_timer = null; //당일 출근 관련 변수
var per_O_X = [];

var loading_modal = document.getElementById("loading_modal");
var loader = document.getElementById("loader");
var latitude;
var longitude;
var checkbox_nothing = document.getElementById('nothing');
let target_img = null;

$(document).ready(function () {
  list_change();
});

document.getElementById("userName").innerHTML = "관리자 : " + user_name;

$(function () {
  //input을 datepicker로 선언
  $("#datepicker").datepicker({
    dateFormat: "yy-mm-dd",
    showOtherMonths: true,
    showMonthAfterYear: true,
    changeYear: true,
    changeMonth: true,
    showOn: "both",
    buttonImage:
      "http://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
    buttonImageOnly: true,
    buttonText: "선택",
    yearSuffix: "년",
    monthNamesShort: [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ],
    monthNames: [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ],
    dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"],
    dayNames: [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ],
    minDate: "-50Y",
  });

  $("#datepicker").datepicker("setDate", "today");
});

function show_list() {
  // 건의사항 리스트
  var xhr_suggest = new XMLHttpRequest(); // flask에 요청
  xhr_suggest.open("POST", "/get_list_detector", true);
  xhr_suggest.setRequestHeader(
    "Content-Type",
    "application/json;charset=UTF-8"
  );
  xhr_suggest.onreadystatechange = function () {
    if (xhr_suggest.readyState === 4 && xhr_suggest.status === 200) {
      var tbody = document.getElementById("tbody1");
      tbody.innerHTML = "";
      var data = JSON.parse(xhr_suggest.responseText);
      var titles = data.title_list;
      var ids = data.id_list; // 공지사항 올린 id
      var dates = data.date_list; // 공지사항 날짜
      for (var i = 0; i < titles.length; i++) {
        var newRow = document.createElement("tr");
        var rowcell = document.createElement("th");
        rowcell.textContent = i;

        var newCell1 = document.createElement("td");
        newCell1.textContent = titles[i];

        var newCell2 = document.createElement("td");
        newCell2.textContent = ids[i];

        var newCell3 = document.createElement("td");
        newCell3.textContent = dates[i];

        newRow.setAttribute("data-value", i);
        newRow.onclick = function () {
          var value = this.getAttribute("data-value");
          handleClick(corporation, value);
        };
        newRow.appendChild(rowcell);
        newRow.appendChild(newCell1);
        newRow.appendChild(newCell2);
        newRow.appendChild(newCell3);
        tbody.appendChild(newRow);
      }
      loading_modal.style.zIndex = -2;
      loader.style.display = "none";
    }
  };
  var data = JSON.stringify({ corporation: corporation });
  xhr_suggest.send(data);
}

function handleClick(corporation, cnt) {
  //건의사항 리스트 클릭시
  var xhr_detail = new XMLHttpRequest(); //flask에 요청
  xhr_detail.open("POST", "/get_detail_suggest", true);
  xhr_detail.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr_detail.onreadystatechange = function () {
    if (xhr_detail.readyState === 4 && xhr_detail.status === 200) {
      document.getElementById("list_nemo1").style.display = "none";
      document.getElementById("list_nemo2").style.display = "block";
      document.getElementById("list_nemo2").innerHTML = "";
      var add_html = JSON.parse(xhr_detail.responseText);

      var big_div = document.createElement("div");
      big_div.classList.add("suggest_detail");

      var title_span = document.createElement("span");
      title_span.innerHTML = "제목 : " + add_html.title;
      title_span.classList.add("underbar");
      title_span.classList.add("title");
      big_div.appendChild(title_span);

      if (add_html.image == " " || add_html.image == "") {
        //이미지가 없을시
        console.log("dasda");
        var img_span = document.createElement("span");
        img_span.innerHTML = "이미지 없음";
        img_span.classList.add("underbar");
        big_div.appendChild(img_span);
      } else {
        //이미지가 있을시
        console.log("win");
        var imging = document.createElement("img");
        imging.src = "data:image/jpeg;base64," + add_html.image;
        imging.classList.add("img_resize");
        big_div.appendChild(imging);
        var img_span = document.createElement("span");
        img_span.classList.add("underbar");
        big_div.appendChild(img_span);
      }
      content_span = document.createElement("span");
      content_span.innerHTML = "내용 : " + add_html.content;
      content_span.classList.add("content");
      big_div.appendChild(content_span);

      document.getElementById("list_nemo2").appendChild(big_div);
    }
  };
  var data = JSON.stringify({ corporation: corporation, cnt: cnt });
  xhr_detail.send(data);
}

function list_change() {
  loading_modal.style.zIndex = 10000;
  loader.style.display = "block";

  if (document.getElementById("menu1").checked) {
    document.getElementById("list_nemo1").style.display = "block";
    document.getElementById("list_nemo2").style.display = "none";
    document.getElementById("list_contents").style.display = "block";
    document.getElementById("check_calender").style.display = "none";
    document.getElementById("workerBox").style.display = "none";
    document.getElementById("enter_location").style.display = "none";
    show_list();

    if (per_timer != null) {
      clearInterval(per_timer); // 타이머 중지
      per_timer = null;
    }
  } else if (document.getElementById("menu2").checked) {
    document.getElementById("list_contents").style.display = "none";
    document.getElementById("check_calender").style.display = "block";
    document.getElementById("workerBox").style.display = "none";
    document.getElementById("enter_location").style.display = "none";
    show_day();
  }
  else if (document.getElementById("menu5").checked) {
    document.getElementById("list_contents").style.display = "none";
    document.getElementById("check_calender").style.display = "none";
    document.getElementById("workerBox").style.display = "none";
    document.getElementById("enter_location").style.display = "block";
    find_location();
  } else {
    document.getElementById("list_contents").style.display = "none";
    document.getElementById("check_calender").style.display = "none";
    document.getElementById("workerBox").style.display = "block";
    document.getElementById("enter_location").style.display = "none";
    manage_user();

    if (per_timer != null) {
      clearInterval(per_timer); // 타이머 중지
      per_timer = null;
    }
  }
}

function update_location() {
  if (checkbox_nothing.checked == true) {
    var xhr = new XMLHttpRequest(); //flask에 요청
    xhr.open("POST", "/set_location", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var add_html = JSON.parse(xhr.responseText);
        alert(add_html.alert_text);
        location.reload(true);
      }
    };
    var data = JSON.stringify({ corporation: corporation, long: -181, lat: -181 });
    xhr.send(data);
  }
  else {
    var xhr = new XMLHttpRequest(); //flask에 요청
    xhr.open("POST", "/set_location", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var add_html = JSON.parse(xhr.responseText);
        alert(add_html.alert_text);
        location.reload(true);
      }
    };
    var data = JSON.stringify({ corporation: corporation, long: longitude, lat: latitude });
    xhr.send(data);
  }
}

function find_location() {
  var xhr = new XMLHttpRequest(); //flask에 요청
  xhr.open("POST", "/get_location", true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var add_html = JSON.parse(xhr.responseText);
      latitude = add_html.lat;
      longitude = add_html.long;
      if ((latitude < -180 || longitude < -180) && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function (position) {
            checkbox_nothing.checked = true;
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            show_map();
          },
          function (error) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                alert("User denied the request for Geolocation.");
                break;
              case error.POSITION_UNAVAILABLE:
                alert("Location information is unavailable.");
                break;
              case error.TIMEOUT:
                alert("The request to get user location timed out.");
                break;
              case error.UNKNOWN_ERROR:
                alert("An unknown error occurred.");
                break;
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        )
      }
      else{
        show_map();
      }
    }
  };
  var data = JSON.stringify({ corporation: corporation });
  xhr.send(data);
}

function show_map() {
  const container = document.getElementById('location_map');
  document.getElementById('print_location').textContent = '경도 : ' + latitude + " 위도 : " + longitude;
  const options = {
    center: new kakao.maps.LatLng(latitude, longitude),
    level: 2
  };

  const map = new kakao.maps.Map(container, options);
  const markerPosition = new kakao.maps.LatLng(latitude, longitude);

  // 마커를 생성합니다
  const marker = new kakao.maps.Marker({
    position: markerPosition
  });

  // 마커가 지도 위에 표시되도록 설정합니다
  marker.setMap(map);

  kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
    // 클릭한 위도, 경도 정보를 가져옵니다 
    const latlng = mouseEvent.latLng;

    // 마커 위치를 클릭한 위치로 옮깁니다
    marker.setPosition(latlng);
    latitude = latlng.getLat();
    longitude = latlng.getLng();
    document.getElementById('print_location').textContent = '경도 : ' + latitude + " 위도 : " + longitude;
  });

  loading_modal.style.zIndex = -2;
  loader.style.display = "none";
}

function dropdownChangeHandler(event) {
  if (confirm("정말 바꾸시겠습니까?")) {
    var selectedOption = event.target.value;
    var select = this.getAttribute("id");

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
    var send_data = JSON.stringify({
      corporation: corporation,
      id: select,
      check: selectedOption,
    });
    xhr1.send(send_data);
  } else {
    if (this.firstElementChild.selected == true) {
      this.lastElementChild.selected = true;
    } else {
      this.firstElementChild.selected = true;
    }
  }
}

function per_go_to_work_check() {
  //당일 출근 쓰레드
  document.getElementById("search_if").style.display = "none";
  var xhr = new XMLHttpRequest(); //flask에 요청
  xhr.open("POST", "/get_today", true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var add_html = JSON.parse(xhr.responseText);

      var table_html = add_html.today_excel;
      var tempElement = document.createElement("div");
      tempElement.innerHTML = table_html;

      var xCells = tempElement.querySelectorAll("td");
      var cnt_list = 0;
      var temp_per_O_X = [];
      xCells.forEach(function (cell) {
        if (cell.innerText.trim() === "X" || cell.innerText.trim() === "O") {
          temp_per_O_X.push(cell.innerText.trim());
        }
      });

      if (temp_per_O_X.length != per_O_X.length) {
        //사람이 늘었다면
        show_day();
      } else {
        per_O_X.forEach((cell) => {
          //출근이 바뀌었다면
          if (cell != temp_per_O_X[cnt_list]) {
            show_day();
          }
          cnt_list = cnt_list + 1;
        });
      }

    }
  };
  var data = JSON.stringify({ corporation: corporation });
  xhr.send(data);
}

function show_day() {
  if (document.getElementById("f_tday").checked) {
    //당일 출근
    document.getElementById("search_if").style.display = "none";
    var xhr = new XMLHttpRequest(); //flask에 요청
    xhr.open("POST", "/get_today", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        document.getElementById("day_nemo").innerHTML = "";
        var add_html = JSON.parse(xhr.responseText);

        var table_html = add_html.today_excel;
        var tempElement = document.createElement("div");
        tempElement.innerHTML = table_html;
        var temp1 = tempElement.querySelectorAll('thead th');

        temp1.forEach(function (header) {
          if (header.textContent === 'name') {
            header.textContent = "이름";
          } else if (header.textContent === 'id') {
            header.textContent = "아이디";
          } else if (header.textContent === 'check') {
            header.textContent = "출근 상태";
          } else if (header.textContent === 'check_time') {
            header.textContent = "출근 시간";
          }
        });

        var xCells = tempElement.querySelectorAll("td");
        var tableRows = tempElement.querySelectorAll("tr");
        per_O_X = [];
        var lists_id = 1;
        xCells.forEach(function (cell) {
          if (cell.innerText.trim() === "X" || cell.innerText.trim() === "O") {
            var dropdown = document.createElement("select");

            var optionO = document.createElement("option");
            optionO.value = "O";
            optionO.innerText = "O";
            if (cell.innerText.trim() === "O") {
              per_O_X.push("O");
              optionO.selected = true; //'O'면 선택된 상태로 설정
            }
            dropdown.appendChild(optionO);

            var optionX = document.createElement("option");
            optionX.value = "X";
            optionX.innerText = "X";
            if (cell.innerText.trim() === "X") {
              per_O_X.push("X");
              optionX.selected = true; //'X'면 선택된 상태로 설정
            }
            dropdown.appendChild(optionX);

            dropdown.setAttribute("id", xCells[lists_id - 2].innerText);
            dropdown.classList.add("status-dropdown");
            dropdown.addEventListener("change", dropdownChangeHandler);
            cell.innerHTML = "";
            cell.appendChild(dropdown);
          }
          lists_id += 1;
        });

        document.getElementById("day_nemo").appendChild(tempElement);
        //쓰레드로 flask의 callback 계산
        if (per_timer == null) {
          per_timer = setInterval(per_go_to_work_check, 60000); //1분 마다 갱신
        }
        loading_modal.style.zIndex = -2;
        loader.style.display = "none";
      }
    };
    var data = JSON.stringify({ corporation: corporation });
    xhr.send(data);
  } else {
    //총 출근
    if (per_timer != null) {
      clearInterval(per_timer); // 타이머 중지
      per_timer = null;
    }

    document.getElementById("day_nemo").innerHTML = "";
    var xhr1 = new XMLHttpRequest(); //flask에 요청
    xhr1.open("POST", "/get_year_file", true);
    xhr1.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr1.onreadystatechange = function () {
      if (xhr1.readyState === 4 && xhr1.status === 200) {
        var year_list = JSON.parse(xhr1.responseText);
        var year_dropdown = document.getElementById("year_dropdown");
        year_dropdown.innerHTML = "";
        for (var i = 0; i < year_list.data_list.length; i++) {
          options = document.createElement("option");
          options.text = year_list.data_list[i];
          options.value = year_list.data_list[i];
          year_dropdown.appendChild(options);
        }
      }
    };
    var send_data = JSON.stringify({ corporation: corporation });
    xhr1.send(send_data);

    var month_dropdown = document.getElementById("month_dropdown");
    month_dropdown.innerHTML = "";
    for (var i = 1; i < 13; i++) {
      var options = document.createElement("option");
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
        var id_dorpdown = document.getElementById("id_dropdown");
        dataList.innerHTML = "";
        var op_all = document.createElement("option");
        op_all.text = "전체";
        op_all.value = "전체";
        dataList.appendChild(op_all);
        for (var i = 0; i < id_list.id_list.length; i++) {
          options = document.createElement("option");
          options.text = id_list.id_list[i];
          options.value = id_list.id_list[i];
          dataList.appendChild(options);
        }

        document
          .getElementById("id_dropdown")
          .addEventListener("input", function () {
            var inputValue = this.value;
            var options = dataList.querySelectorAll("option");
            options.forEach(function (option) {
              if (option.value.indexOf(inputValue) !== -1) {
                option.style.display = "block";
              } else {
                option.style.display = "none";
              }
            });
          });
        loading_modal.style.zIndex = -2;
        loader.style.display = "none";
      }
    };
    var send_data = JSON.stringify({ corporation: corporation });
    xhr2.send(send_data);

    document.getElementById("search_if").style.display = "flex";
  }
}

function show_excel() {
  if (document.getElementById("id_dropdown").value === "") {
    alert("id를 정확히입력해주세요.");
    return "";
  } else {
    var xhr = new XMLHttpRequest(); //flask에 요청
    xhr.open("POST", "/get_excel", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        document.getElementById("day_nemo").innerHTML = "";
        add_html = JSON.parse(xhr.responseText);
        var modifiedData = add_html.excel_data.replace(/dataframe/g, "allday");
        document.getElementById("day_nemo").innerHTML += modifiedData;
        var temp1 = document.getElementById("day_nemo").querySelectorAll('thead th');

        temp1.forEach(function (header) {
          if (header.textContent === 'name') {
            header.textContent = "이름";
          } else if (header.textContent === 'id') {
            header.textContent = "아이디";
          } else if (header.textContent === 'check') {
            header.textContent = "출근 상태";
          } else if (header.textContent === 'check_time') {
            header.textContent = "출근 시간";
          } else if (header.textContent === 'day') {
            header.textContent = "일";
          }
        });
        loading_modal.style.zIndex = -2;
        loader.style.display = "none";
      }
    };

    var send_data = JSON.stringify({
      corporation: corporation,
      year: document.getElementById("year_dropdown").value.toString(),
      month: document.getElementById("month_dropdown").value.toString(),
      id: document.getElementById("id_dropdown").value,
    });
    xhr.send(send_data);
  }
}

function loadFile(input) {
  let file = input.files[0]; // 선택한 파일 가져오기
  let container = document.getElementById('img_upload');
  let newImage = new Image();

  if (file instanceof Blob || file instanceof File) {
      let reader = new FileReader();
      reader.onload = function (e) {
          newImage.src = e.target.result;
          target_img = e.target.result;
      };
      reader.readAsDataURL(file);

      newImage.onload = function() {
          let maxWidth = container.offsetWidth;
          let maxHeight = container.offsetHeight;

          let widthRatio = maxWidth / newImage.width;
          let heightRatio = maxHeight / newImage.height;
          let ratio = Math.min(widthRatio, heightRatio);

          // 새로운 이미지 크기 계산
          let newWidth = newImage.width * ratio;
          let newHeight = newImage.height * ratio;

          // 새 이미지 요소 설정
          newImage.style.width = newWidth + "px";
          ai_width = newImage.style.width;
          newImage.style.height = newHeight - (5) + "px";
          ai_height = newImage.style.height;
          newImage.style.objectFit = "cover"

          container.innerHTML = "";
          container.appendChild(newImage);
      };
  } else {
      console.error("잘못된 파일 형식입니다.");
  }
}

function register() {
  //등록 함수
  var typed = document.getElementById("job").value;
  var date = document.getElementById("datepicker").value;
  var dateParts = date.split("-");
  var year = dateParts[0].slice(-2);
  var month = dateParts[1];
  var day = dateParts[2];

  var name = document.getElementById("name").value;
  var id = document.getElementById("id").value;
  var password = document.getElementById("pw").value;
  var birthday = year + month + day;

  if (name.length != 0 && id.length != 0 && password.length != 0 && birthday.length != 0) {
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
    var data = JSON.stringify({
      corporation: corporation,
      typed: typed,
      id: id,
      password: password,
      name: name,
      birthday: birthday,
      img : target_img
    });
    xhr.send(data);
  }
}

function manage_user() {
  var xhr = new XMLHttpRequest(); //flask에 요청
  xhr.open("POST", "/get_manage_user", true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      data = JSON.parse(xhr.responseText);
      console.log(corporation)
      document.getElementById("worker_nemo").innerHTML = "";
      worked_id = data.worked_id;
      worked_name = data.worked_name;
      worked_birthday = data.worked_birthday;
      protected_id = data.protected_id;
      protected_name = data.protected_name;
      protected_birthday = data.protected_birthday;
      for (var i = 0; i < worked_id.length; i++) {
        li_div = document.createElement("div");
        li_div.classList.add("worker_box");

        self_Pic = document.createElement("div");
        self_Pic.classList.add("self_Pic");

        self_img = document.createElement("img");
        self_img.classList.add("self_img");
        self_img.src = "/static/images/img.png";


        self_Pic.appendChild(self_img);

        box = document.createElement("div");
        box.classList.add("worker_info");
        box.innerHTML =
          "이름: " +
          worked_name[i] +
          "<br>" +
          "아이디: " +
          worked_id[i] +
          "<br>" +
          "생일: " +
          worked_birthday[i] +
          "<br>" +
          "직군: 현장직";
        box.id = "worked" + i.toString();

        remove_btn = document.createElement("button");
        remove_btn.classList.add("remove_btn");
        remove_btn.textContent = "X";
        remove_btn.setAttribute("id", worked_id[i]);
        remove_btn.setAttribute("typed", "worked");
        remove_btn.onclick = function () {
          if (confirm("정말 삭제하시겠습니까?")) {
            var xhr = new XMLHttpRequest(); //flask에 요청
            xhr.open("POST", "/remove_user", true);
            xhr.setRequestHeader(
              "Content-Type",
              "application/json;charset=UTF-8"
            );
            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4 && xhr.status === 200) {
                console.log("데이터 전송 완료");
                alert_text = JSON.parse(xhr.responseText);
                alert(alert_text.result_alert);
                manage_user();
                show_day();
              }
            };
            var data = JSON.stringify({
              corporation: corporation,
              typed: this.getAttribute("typed"),
              id: this.getAttribute("id"),
            });
            xhr.send(data);
          }
        };
        li_div.appendChild(remove_btn);
        li_div.appendChild(self_Pic);
        li_div.appendChild(box);
        document.getElementById("worker_nemo").appendChild(li_div);
      }

      for (var i = 0; i < protected_id.length; i++) {
        li_div = document.createElement("div");
        li_div.classList.add("worker_box");

        self_Pic = document.createElement("div");
        self_Pic.classList.add("self_Pic");

        self_img = document.createElement("img");
        self_img.classList.add("self_img");
        self_img.src = "/static/images/img.png";


        self_Pic.appendChild(self_img);

        box = document.createElement("div");
        box.classList.add("worker_info");
        box.innerHTML =
          "이름: " +
          protected_name[i] +
          "<br>" +
          "아이디: " +
          protected_id[i] +
          "<br>" +
          "생일: " +
          protected_birthday[i] +
          "<br>" +
          "직군: 안전관리자";
        box.id = "protected" + i.toString();

        remove_btn = document.createElement("button");
        remove_btn.classList.add("remove_btn");
        remove_btn.textContent = "X";
        remove_btn.setAttribute("id", protected_id[i]);
        remove_btn.setAttribute("typed", "protected");
        remove_btn.onclick = function () {
          if (confirm("정말 삭제하시겠습니까?")) {
            var xhr = new XMLHttpRequest(); //flask에 요청
            xhr.open("POST", "/remove_user", true);
            xhr.setRequestHeader(
              "Content-Type",
              "application/json;charset=UTF-8"
            );
            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4 && xhr.status === 200) {
                console.log("데이터 전송 완료");
                alert_text = JSON.parse(xhr.responseText);
                alert(alert_text.result_alert);
                manage_user();
                show_day();
              }
            };
            var data = JSON.stringify({
              corporation: corporation,
              typed: this.getAttribute("typed"),
              id: this.getAttribute("id"),
            });
            xhr.send(data);
          }
        };
        li_div.appendChild(remove_btn);
        li_div.appendChild(self_Pic);
        li_div.appendChild(box);
        document.getElementById("worker_nemo").appendChild(li_div);
      }
      loading_modal.style.zIndex = -2;
      loader.style.display = "none";
    }
  };
  var data = JSON.stringify({ corporation: corporation });
  xhr.send(data);
}

function show() {
  document.querySelector(".modalbackground").className = "modalbackground show";
  document.querySelector(".modalbackground").style.zIndex = 4000;
  document.querySelector(".modalbackground").style.opacity = 1;
}

function cancel() {
  document.querySelector(".modalbackground").className = "modalbackground";
  document.querySelector(".modalbackground").style.zIndex = -1;
  document.querySelector(".modalbackground").style.opacity = 0;
  document.getElementById("name").value = "";
  document.getElementById("id").value = "";
  document.getElementById("pw").value = "";
}

function logout() {
  location.href = "/detector/login";
}

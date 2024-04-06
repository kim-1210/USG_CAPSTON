var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var corporation = urlParams.get('corporation');
var user_id = urlParams.get('id');
var user_name = urlParams.get('name');

let file = null;
let target_img = null;
function loadFile(input) {

    document.getElementById('img_upload').innerHTML = "";
    file = input.files[0]; // 선택파일 가져오기
    let newImage = document.createElement("img"); //새 이미지 태그 생성
    console.log(input.files[0])

    if (file instanceof Blob || file instanceof File) {
        var reader = new FileReader();
        reader.onload = function (e) {
            target_img = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
        newImage.src = URL.createObjectURL(file);
        newImage.id = 'upload_img';
        newImage.style.width = "100%"; //div에 꽉차게 넣으려고
        newImage.style.height = "100%";
        newImage.style.objectFit = "cover"; // div에 넘치지 않고 들어가게

        let container = document.getElementById('img_upload');
        container.appendChild(newImage);
    } else {
        console.error("잘못된 파일 형식입니다.");
    }
}

function upload() { //건의사항 업로드
    if (file == null) { //이미지가 없음
        if (confirm('정말로 보내시겠습니까?')) {
            var title = document.getElementById('suggestTitle').value;
            var content = document.getElementById('suggestText').value;
            var img = '-'
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/set_suggest", true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    document.getElementById('suggestTitle').value = "";
                    document.getElementById('suggestText').value = "";
                    file = null;
                    alert('건의하였습니다.')
                }
            };

            var data = { 'corporation': corporation, 'title': title, 'image': img, 'content': content, 'id': user_id, 'name': user_name };
            xhr.send(JSON.stringify(data));
        }
    }
    else { //이미지가 있음
        if (confirm('정말로 보내시겠습니까?')) {
            var title = document.getElementById('suggestTitle').value;
            var content = document.getElementById('suggestText').value;
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/set_suggest", true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    document.getElementById('suggestTitle').value = "";
                    document.getElementById('suggestText').value = "";
                    file = null;
                    target_img = null;
                    document.getElementById('img_load').value = '';
                    document.getElementById('img_upload').removeChild(document.getElementById('upload_img'));
                    alert('건의하였습니다.')
                }
            };

            var data = { 'corporation': corporation, 'title': title, 'image': target_img, 'content': content, 'id': user_id, 'name': user_name };
            xhr.send(JSON.stringify(data));
        }
    }
}

function main() {
    var queryString = '?corporation=' + encodeURIComponent(corporation) + '&id=' + encodeURIComponent(user_id) + '&name=' + encodeURIComponent(user_name);
    location.href = '/safe_detector/main' + queryString;
}
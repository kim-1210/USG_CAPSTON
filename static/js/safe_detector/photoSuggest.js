let file = null;
function loadFile(input) {
    document.getElementById('img_upload').innerHTML = "";
    file = input.files[0]; // 선택파일 가져오기

    let newImage = document.createElement("img"); //새 이미지 태그 생성
    if (file instanceof Blob || file instanceof File) {
        // 파일이 올바른 형식인 경우 이미지 source 가져오기
        newImage.src = URL.createObjectURL(file);
        newImage.id = 'upload_img';
        newImage.style.width = "100%"; //div에 꽉차게 넣으려고
        newImage.style.height = "100%";
        newImage.style.objectFit = "cover"; // div에 넘치지 않고 들어가게
    
        //이미지를 image-show div에 추가
        let container = document.getElementById('img_upload');
        container.appendChild(newImage);
    } else {
        console.error("잘못된 파일 형식입니다.");
    }
}

function upload(){ //건의사항 업로드
    var title = document.getElementById('suggestTitle').value;
    var content = document.getElementById('suggestText').value;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/set_suggest", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById('suggestTitle').value = "";
            document.getElementById('suggestText').value = "";
            if(file !== null){
                file = null;
                document.getElementById('img_upload').removeChild(document.getElementById('upload_img'));
            }
        }
    };

    var data = {'corporation':corporation, 'title':title, 'image' : file, 'content':content, 'id':id};
    xhr.send(JSON.stringify(data));
}
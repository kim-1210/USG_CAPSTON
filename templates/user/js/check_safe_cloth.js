const video = document.getElementById('video');

async function startCamera() {
    try{
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    }
    catch (error){
        alert("카메라가 없습니다.")
    }
}

startCamera();
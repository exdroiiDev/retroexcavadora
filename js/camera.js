// Variables globales
let stream = null;
let photoData = null;

// Función para inicializar la cámara
function initCamera() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        }).then(s => {
            stream = s;
            const cameraView = document.getElementById('camera-view');
            cameraView.srcObject = stream;
            resolve();
        }).catch(err => {
            console.error("Error al acceder a la cámara:", err);
            alert("No se pudo acceder a la cámara. Asegúrate de permitir el acceso.");
            reject(err);
        });
    });
}

// Función para capturar foto
function capturePhoto() {
    const cameraView = document.getElementById('camera-view');
    const photoPreview = document.getElementById('photo-preview');
    
    const canvas = document.createElement('canvas');
    canvas.width = cameraView.videoWidth;
    canvas.height = cameraView.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cameraView, 0, 0, canvas.width, canvas.height);
    
    // Mostrar vista previa
    photoData = canvas.toDataURL('image/jpeg');
    photoPreview.src = photoData;
    photoPreview.style.display = 'block';
    cameraView.style.display = 'none';
    
    // Cambiar estado de los botones
    document.getElementById('capture-btn').style.display = 'none';
    document.getElementById('retry-btn').style.display = 'block';
    document.getElementById('send-btn').style.display = 'block';
    enableSendButton();
    
    return photoData;
}

// Función para resetear la cámara
function resetCamera() {
    const photoPreview = document.getElementById('photo-preview');
    const cameraView = document.getElementById('camera-view');
    
    photoPreview.style.display = 'none';
    cameraView.style.display = 'block';
    photoData = null;
}

// Función para obtener los datos de la foto
function getPhotoData() {
    return photoData;
}
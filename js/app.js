document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la cámara
    initCamera().then(() => {
        console.log("Cámara inicializada correctamente");
    }).catch(error => {
        console.error("Error al inicializar cámara:", error);
        document.getElementById('capture-btn').disabled = true;
        document.getElementById('capture-btn').textContent = "Error al acceder a la cámara";
    });

    // Configurar event listeners
    document.getElementById('capture-btn').addEventListener('click', function() {
        capturePhoto();
        enableSendButton();
        toggleButtons();
    });

    document.getElementById('retry-btn').addEventListener('click', function() {
        resetCamera();
        disableSendButton();
        toggleButtons();
    });

    document.getElementById('send-btn').addEventListener('click', function() {
        const photoData = getPhotoData();
        if (!photoData) return;
        
        showLoading(true);
        disableSendButton();
        
        console.log("Foto enviada para análisis:", photoData.substring(0, 30) + "...");
        
                    setTimeout(() => {
            showLoading(false);
            const mockData = {
                profundidad: {
                    estimacion: "1.2 - 1.8 metros",
                    confianza: "alta",
                    observaciones: "Terreno semi-compacto con buena estabilidad"
                },
                consejos: [
                    "Iniciar con ángulo de 30-45 grados",
                    "Mantener velocidad constante",
                    "Verificar nivel de aceite cada 2 horas"
                ],
                advertencias: [
                    "Posible presencia de raíces a 1 metro de profundidad",
                    "Terreno puede volverse más blando después de lluvia"
                ]
            };
            displayResults(mockData);
        }, 2000);
    });
});

function enableSendButton() {
    const sendBtn = document.getElementById('send-btn');
    sendBtn.disabled = false;
    sendBtn.classList.remove('btn-disabled');
    sendBtn.classList.add('btn-secondary');
    sendBtn.style.display = 'block'; // Asegurar que esté visible
}

function disableSendButton() {
    const sendBtn = document.getElementById('send-btn');
    sendBtn.disabled = true;
    sendBtn.classList.add('btn-disabled');
    sendBtn.classList.remove('btn-secondary');
}

function toggleButtons() {
    const captureBtn = document.getElementById('capture-btn');
    const retryBtn = document.getElementById('retry-btn');
    captureBtn.style.display = captureBtn.style.display === 'none' ? 'block' : 'none';
    retryBtn.style.display = retryBtn.style.display === 'none' ? 'block' : 'none';
}

function showLoading(show) {
    document.querySelector('.loading').style.display = show ? 'block' : 'none';
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'block';
}

// Función principal para manejar el envío a Gemini
// Modifica la función displayRealResults
function displayRealResults(data) {
    // Validar datos recibidos
    if (!data || typeof data !== 'object') {
        showError('Datos de análisis no válidos');
        return;
    }

    const resultsDiv = document.getElementById('results');
    const depthResult = document.getElementById('depth-result');
    const tipsResult = document.getElementById('tips-result');
    const warningsResult = document.getElementById('warnings-result');
    const newPhotoBtn = document.getElementById('new-photo-btn');

    // Mostrar sección de resultados
    resultsDiv.style.display = 'block';
    
    // Ocultar sección de cámara
    document.querySelector('.camera-container').style.display = 'none';
    document.getElementById('capture-btn').style.display = 'none';
    document.getElementById('send-btn').style.display = 'none';
    document.getElementById('retry-btn').style.display = 'none';

    // Profundidad
    if (data.profundidad) {
        depthResult.innerHTML = `
            <p><strong>Rango estimado:</strong> ${data.profundidad.estimacion || 'No disponible'}</p>
            <p><strong>Nivel de confianza:</strong> <span class="confidence-${data.profundidad.confianza || 'medio'}">${data.profundidad.confianza || 'medio'}</span></p>
            ${data.profundidad.observaciones ? `<p><strong>Observaciones:</strong> ${data.profundidad.observaciones}</p>` : ''}
        `;
    }

    // Consejos
    tipsResult.innerHTML = '';
    if (data.consejos && data.consejos.length > 0) {
        const tipsList = document.createElement('ul');
        tipsList.className = 'tips-list';
        
        data.consejos.forEach(tip => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="tip-icon">✓</span> ${tip}`;
            tipsList.appendChild(li);
        });
        
        tipsResult.appendChild(tipsList);
    } else {
        tipsResult.innerHTML = '<p>No se generaron consejos específicos para este terreno.</p>';
    }

    // Advertencias
    warningsResult.innerHTML = '';
    if (data.advertencias && data.advertencias.length > 0) {
        const warningsList = document.createElement('ul');
        warningsList.className = 'warnings-list';
        
        data.advertencias.forEach(warning => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="warning-icon">⚠️</span> ${warning}`;
            warningsList.appendChild(li);
        });
        
        warningsResult.appendChild(warningsList);
    } else {
        warningsResult.innerHTML = '<p>No se detectaron advertencias importantes para este terreno.</p>';
    }

    // Configurar botón para nueva foto
    newPhotoBtn.addEventListener('click', resetToCamera);
        document.body.classList.add('showing-results');
}

// Función para volver a la cámara
function resetToCamera() {
    // Resetear la cámara
    resetCamera();
    
    // Mostrar elementos de cámara
    document.querySelector('.camera-container').style.display = 'block';
    document.getElementById('capture-btn').style.display = 'block';
    document.getElementById('send-btn').style.display = 'block';
    document.getElementById('retry-btn').style.display = 'none';
    
    // Ocultar resultados y botón de nueva foto
    document.getElementById('results').style.display = 'none';
    document.getElementById('new-photo-btn').style.display = 'none';
    
    // Resetear estado de los botones
    disableSendButton();
}

// Modificar la función sendToGemini para ocultar el JSON
async function sendToGemini() {
    const photoData = getPhotoData();
    if (!photoData) {
        showError('No hay foto para analizar');
        return;
    }

    showLoading(true);
    disableUI();

    try {
        const analysisResults = await analyzeTerrainWithGemini(photoData);
        displayRealResults(analysisResults);
    } catch (error) {
        console.error('Error:', error);
        showError('Error al analizar el terreno: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Configurar event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar cámara
    initCamera().catch(error => {
        document.getElementById('capture-btn').disabled = true;
        document.getElementById('capture-btn').textContent = "Error en cámara";
    });

    // Asignar evento al botón de enviar
    document.getElementById('send-btn').addEventListener('click', sendToGemini);
});

// Funciones de apoyo para UI
function disableUI() {
    document.getElementById('send-btn').disabled = true;
    document.getElementById('retry-btn').disabled = true;
}

function enableUI() {
    document.getElementById('send-btn').disabled = false;
    document.getElementById('retry-btn').disabled = false;
}

function showError(message) {
    alert(`Error: ${message}`);
    // También puedes mostrar el error en la UI en lugar de un alert
    // document.getElementById('error-message').textContent = message;
}
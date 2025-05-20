// Configuración de la API de Gemini
const API_KEY = 'AIzaSyDZdXjmFR7tmSMLRPUj7va9jx1mJnIKn88'; // Reemplaza con tu API key real
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`;

// Prompt
const SYSTEM_PROMPT = `
Eres un experto en análisis de terrenos para operación de retroexcavadoras con más de 20 años de experiencia. 
Analiza la imagen proporcionada y genera un informe técnico detallado que incluya:

1. Estimación PROFESIONAL de profundidad del terreno:
   - Rango en metros (mínimo-máximo)
   - Nivel de confianza (bajo/medio/alto)
   - Observaciones técnicas

2. Consejos ESPECÍFICOS para operación segura y eficiente:
   - Técnicas de excavación recomendadas
   - Configuraciones de máquina
   - Precauciones operacionales

3. Advertencias TÉCNICAS relevantes:
   - Riesgos potenciales
   - Condiciones del terreno a monitorear
   - Señales de alerta

Devuelve SOLO un JSON VÁLIDO con esta estructura exacta:
{
  "profundidad": {
    "estimacion": "X.X - X.X metros",
    "confianza": "bajo/medio/alto",
    "observaciones": "Texto descriptivo profesional"
  },
  "consejos": [
    "Consejo 1 específico para este terreno",
    "Consejo 2 relevante para las condiciones visibles"
  ],
  "advertencias": [
    "Advertencia 1 importante",
    "Advertencia 2 relevante"
  ]
}
`;

async function analyzeTerrainWithGemini(imageData) {
    // Validar entrada
    if (!imageData || !imageData.startsWith('data:image')) {
        throw new Error('Datos de imagen no válidos');
    }

    // Extraer base64
    const base64Image = imageData.split(',')[1];
    
    // Construir el payload
    const payload = {
        contents: [{
            parts: [
                { text: SYSTEM_PROMPT },
                { 
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: base64Image
                    }
                }
            ]
        }],
        safetySettings: {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
        },
        generationConfig: {
            temperature: 0.3,
            topK: 32,
            topP: 0.8
        }
    };

    try {
        // Realizar la petición a la API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error en API: ${errorData.error?.message || response.status}`);
        }

        const responseData = await response.json();
        
        // Extraer y validar la respuesta
        const responseText = responseData.candidates[0]?.content?.parts[0]?.text;
        if (!responseText) throw new Error('Respuesta vacía de la API');

        // Extraer el JSON de la respuesta
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}') + 1;
        const jsonResponse = responseText.slice(jsonStart, jsonEnd);

        // Parsear y validar la estructura
        const result = JSON.parse(jsonResponse);
        if (!result.profundidad || !result.consejos || !result.advertencias) {
            throw new Error('La respuesta no tiene la estructura esperada');
        }

        return result;

    } catch (error) {
        console.error('Error en analyzeTerrainWithGemini:', error);
        throw new Error(`Error al analizar el terreno: ${error.message}`);
    }
}
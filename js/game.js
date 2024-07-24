const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const frameCanvasElement = document.getElementById('frameCanvas');
const frameCanvas = new fabric.Canvas(frameCanvasElement);

let objects = [];

function initializeGame() {
    drawObjects();
}

function generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 16);
}

function drawObjects() {
    // Limpa o canvas antes de desenhar os objetos novamente
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach(obj => {
        drawObject(obj);
    });
}

function drawObject(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

function updateProperty(id, property, value) {
    const targetObject = objects.find(obj => obj.id === id);
    if (targetObject) {
        targetObject[property] = property === "color" ? value : parseInt(value, 10);
        drawObjects();
    }
}

function executeGame() {
    handleEvents({});  // Ensure `handleEvents` is called with a default event object
}

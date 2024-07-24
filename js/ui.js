const contextMenu = document.getElementById("context-menu");
const defaultContextMenu = document.getElementById("default-context-menu");
const objectContextMenu = document.getElementById("object-context-menu");
const propertyPanel = document.getElementById("property-panel");
const propertiesContainer = document.getElementById("properties");
const objectSelectionModal = document.getElementById("object-selection-modal");
const insertObjectModal = document.getElementById("insert-object-modal");

function initializeUI() {
    document.addEventListener("click", function(event) {
        if (!contextMenu.contains(event.target)) {
            hideContextMenu();
        }
    });

    canvas.addEventListener("contextmenu", function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const clickedObject = objects.find(obj => {
            return x >= obj.x && x <= obj.x + obj.width &&
                   y >= obj.y && y <= obj.y + obj.height;
        });

        if (clickedObject) {
            showContextMenu(event, true);
            selectedObject = clickedObject;
        } else {
            showContextMenu(event, false);
            selectedObject = null;
        }
    });

    canvas.addEventListener("click", function(event) {
        if (event.button === 0 && selectedObject) {
            showPropertyPanel(selectedObject);
        }
    });

    populateEventList();
    populateObjectList();
}

function showTab(tabName) {
    const tabs = document.querySelectorAll(".tab-content");
    tabs.forEach(tab => {
        tab.style.display = "none";
    });
    document.getElementById(tabName).style.display = "flex";
}

function showContextMenu(event, isObject) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    contextMenu.style.top = `${event.clientY - rect.top}px`;
    contextMenu.style.left = `${event.clientX - rect.left}px`;
    contextMenu.style.display = "block";
    defaultContextMenu.style.display = isObject ? "none" : "block";
    objectContextMenu.style.display = isObject ? "block" : "none";
}

function hideContextMenu() {
    contextMenu.style.display = "none";
}

function showPropertyPanel(obj) {
    propertiesContainer.innerHTML = `
        <label for="x">X:</label>
        <input type="number" id="x" value="${obj.x}" onchange="updateProperty('${obj.id}', 'x', this.value)">
        <label for="y">Y:</label>
        <input type="number" id="y" value="${obj.y}" onchange="updateProperty('${obj.id}', 'y', this.value)">
        <label for="width">Width:</label>
        <input type="number" id="width" value="${obj.width}" onchange="updateProperty('${obj.id}', 'width', this.value)">
        <label for="height">Height:</label>
        <input type="number" id="height" value="${obj.height}" onchange="updateProperty('${obj.id}', 'height', this.value)">
        <label for="color">Color:</label>
        <input type="color" id="color" value="${obj.color}" onchange="updateProperty('${obj.id}', 'color', this.value)">
    `;
    propertyPanel.style.display = "block";
}

function closePropertyPanel() {
    propertyPanel.style.display = "none";
}

function closeEventModal() {
    eventModal.style.display = "none";
}

function closeActionModal() {
    actionModal.style.display = "none";
}

function closeObjectSelectionModal() {
    objectSelectionModal.style.display = "none";
}

function showEventModal() {
    eventModal.style.display = "block";
}

function showActionModal() {
    actionModal.style.display = "block";
}

function showObjectSelectionModal() {
    objectSelectionModal.style.display = "block";
}

function showInsertObjectModal() {
    insertObjectModal.style.display = "block";
}

function closeInsertObjectModal() {
    insertObjectModal.style.display = "none";
}

function showAddSubEventModal(button) {
    const parentEvent = button.parentElement.parentElement;
    showEventModal();
    const eventItems = document.querySelectorAll("#event-list .event-item");
    eventItems.forEach(item => {
        item.onclick = function() {
            const eventType = item.textContent;
            addSubEvent(parentEvent, eventType);
            closeEventModal();
        };
    });
}

function showAddActionModal(button) {
    const parentEvent = button.parentElement.parentElement;
    showActionModal();
    const actionItems = document.querySelectorAll("#action-list .action-item");
    actionItems.forEach(item => {
        item.onclick = function() {
            const actionType = item.textContent;
            addAction(parentEvent, actionType);
            closeActionModal();
        };
    });
}

function populateEventList() {
    const eventList = document.getElementById("event-list");
    const events = ["Key Press", "Collision", "Loop", "Mouse Click", "Timer"];
    events.forEach(event => {
        const eventItem = document.createElement("div");
        eventItem.className = "event-item";
        eventItem.textContent = event;
        eventItem.onclick = function() {
            addEvent(event);
            closeEventModal();
        };
        eventList.appendChild(eventItem);
    });
}

function populateObjectList() {
    const objectList = document.getElementById("object-list");
    const objects = ["Object 1", "Object 2", "Object 3"];
    objects.forEach(object => {
        const objectItem = document.createElement("div");
        objectItem.className = "object-item";
        objectItem.textContent = object;
        objectItem.onclick = function() {
            alert(`Selected ${object}`);
            closeObjectSelectionModal();
        };
        objectList.appendChild(objectItem);
    });
}

function populateActionList() {
    const actionList = document.getElementById("action-list");
    const actions = ["Move Right", "Move Left", "Move Up", "Move Down", "Change Color", "Play Sound"];
    actions.forEach(action => {
        const actionItem = document.createElement("div");
        actionItem.className = "action-item";
        actionItem.textContent = action;
        actionItem.onclick = function() {
            addAction(action);
            closeActionModal();
        };
        actionList.appendChild(actionItem);
    });
}

window.insertObject = function() {
    const id = document.getElementById('object-id').value;
    const name = document.getElementById('object-name').value;
    const width = parseInt(document.getElementById('object-width').value, 10);
    const height = parseInt(document.getElementById('object-height').value, 10);
    const x = parseInt(document.getElementById('object-x').value, 10);
    const y = parseInt(document.getElementById('object-y').value, 10);

    if (!id || !name || isNaN(width) || isNaN(height) || isNaN(x) || isNaN(y)) {
        alert("Please fill out all fields correctly.");
        return;
    }

    const newObject = {
        id: id,
        name: name,
        x: x,
        y: y,
        width: width,
        height: height,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16)
    };

    objects.push(newObject);
    drawObjects();
    closeInsertObjectModal();
};

window.addImage = function() {
    const imageUrl = prompt("Enter the URL of the image:");
    if (imageUrl) {
        const img = new Image();
        img.onload = function() {
            const newImage = new fabric.Image(img, {
                left: selectedObject.x,
                top: selectedObject.y,
                width: selectedObject.width,
                height: selectedObject.height
            });
            frameCanvas.add(newImage);
            frameCanvas.renderAll();
        };
        img.src = imageUrl;
    }
    hideContextMenu();
};

window.resizeObject = function() {
    const newWidth = parseInt(prompt("Enter new width:", selectedObject.width), 10);
    const newHeight = parseInt(prompt("Enter new height:", selectedObject.height), 10);
    if (!isNaN(newWidth) && !isNaN(newHeight)) {
        selectedObject.set({ width: newWidth, height: newHeight });
        frameCanvas.renderAll();
    }
    hideContextMenu();
};

window.positionObject = function() {
    const newX = parseInt(prompt("Enter new X position:", selectedObject.left), 10);
    const newY = parseInt(prompt("Enter new Y position:", selectedObject.top), 10);
    if (!isNaN(newX) && !isNaN(newY)) {
        selectedObject.set({ left: newX, top: newY });
        frameCanvas.renderAll();
    }
    hideContextMenu();
};

window.changeObjectColor = function() {
    const newColor = prompt("Enter new color (hex code):", selectedObject.fill);
    if (newColor) {
        selectedObject.set({ fill: newColor });
        frameCanvas.renderAll();
    }
    hideContextMenu();
};

window.changeObjectShape = function() {
    const shape = prompt("Enter new shape (rectangle/circle):", "rectangle");
    let newObject;
    if (shape) {
        if (shape.toLowerCase() === "rectangle") {
            newObject = new fabric.Rect({
                left: selectedObject.left,
                top: selectedObject.top,
                width: selectedObject.width,
                height: selectedObject.height,
                fill: selectedObject.fill
            });
        } else if (shape.toLowerCase() === "circle") {
            newObject = new fabric.Circle({
                left: selectedObject.left,
                top: selectedObject.top,
                radius: selectedObject.width / 2,
                fill: selectedObject.fill
            });
        }
        if (newObject) {
            frameCanvas.add(newObject);
            frameCanvas.remove(selectedObject);
            selectedObject = newObject;
            frameCanvas.renderAll();
        }
    }
    hideContextMenu();
};

window.addAnimation = function() {
    const animationType = prompt("Enter animation type (bounce/rotate):", "bounce");
    if (animationType) {
        if (animationType.toLowerCase() === "bounce") {
            fabric.util.animate({
                startValue: selectedObject.top,
                endValue: selectedObject.top + 100,
                duration: 1000,
                onChange: function(value) {
                    selectedObject.set('top', value);
                    frameCanvas.renderAll();
                },
                onComplete: function() {
                    fabric.util.animate({
                        startValue: selectedObject.top + 100,
                        endValue: selectedObject.top,
                        duration: 1000,
                        onChange: function(value) {
                            selectedObject.set('top', value);
                            frameCanvas.renderAll();
                        }
                    });
                }
            });
        } else if (animationType.toLowerCase() === "rotate") {
            fabric.util.animate({
                startValue: selectedObject.angle,
                endValue: selectedObject.angle + 360,
                duration: 1000,
                onChange: function(value) {
                    selectedObject.set('angle', value);
                    frameCanvas.renderAll();
                }
            });
        }
    }
    hideContextMenu();
};

window.deleteObject = function() {
    if (selectedObject) {
        frameCanvas.remove(selectedObject);
        selectedObject = null;
        frameCanvas.renderAll();
        hideContextMenu();
    }
};

function updateProperty(id, property, value) {
    const targetObject = objects.find(obj => obj.id === id);
    if (targetObject) {
        targetObject[property] = property === "color" ? value : parseInt(value, 10);
        drawObjects();
    }
}

function drawObjects() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach(obj => {
        drawObject(obj);
    });
}

function drawObject(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

document.addEventListener("DOMContentLoaded", initializeUI);

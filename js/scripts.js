document.addEventListener("DOMContentLoaded", function() {
    const eventsContainer = document.getElementById("events");
    const addEventButton = document.getElementById("add-event-button");
    const addActionButton = document.getElementById("add-action-button");
    const executeGameButton = document.getElementById("execute-game-button");
    const eventModal = document.getElementById("event-modal");
    const actionModal = document.getElementById("action-modal");
    const objectSelectionModal = document.getElementById("object-selection-modal");
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const contextMenu = document.getElementById("context-menu");
    const propertyPanel = document.getElementById("property-panel");
    const propertiesContainer = document.getElementById("properties");
    const frameEditor = document.getElementById("frame-editor");
    const frameCanvasElement = document.getElementById('frameCanvas');
    const frameCanvas = new fabric.Canvas(frameCanvasElement);

    let player = {
        id: generateUniqueId(),
        x: 50,
        y: 50,
        size: 20,
        color: "#0000FF" // Use hexadecimal format for colors
    };

    let selectedObject = null;
    let events = [];

    function generateUniqueId() {
        return 'id-' + Math.random().toString(36).substr(2, 16);
    }

    function drawPlayer() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);
    }

    function createEventBlock(eventType) {
        const eventBlock = document.createElement("div");
        eventBlock.className = "event";
        const eventId = `event-${Date.now()}`;
        let eventContent = `
            <div class="event-header">
                <span class="event-type">${eventType}</span>
                <button onclick="deleteEvent(this)">Delete</button>
                <button onclick="showAddSubEventModal(this)">Add Sub-Event</button>
                <button onclick="showAddActionModal(this)">Add Action</button>
            </div>
            <div class="sub-events-container"></div>
            <div class="actions-container"></div>
        `;
        if (eventType === "Loop") {
            eventContent += `
                <div class="loop-settings">
                    <label for="${eventId}-loop-count">Repetitions:</label>
                    <input type="number" id="${eventId}-loop-count" class="loop-count" value="1" min="1">
                    <label for="${eventId}-loop-forever">
                        <input type="checkbox" id="${eventId}-loop-forever" class="loop-forever"> Infinite
                    </label>
                </div>
            `;
        }
        eventBlock.innerHTML = eventContent;

        new Sortable(eventBlock.querySelector(".actions-container"), {
            group: {
                name: "actions",
                put: true,
                pull: true
            },
            animation: 150,
            fallbackOnBody: true,
            swapThreshold: 0.65
        });
        new Sortable(eventBlock.querySelector(".sub-events-container"), {
            group: {
                name: "events",
                put: true,
                pull: true
            },
            animation: 150,
            fallbackOnBody: true,
            swapThreshold: 0.65
        });
        return eventBlock;
    }

    function createActionBlock(actionType) {
        const actionBlock = document.createElement("div");
        actionBlock.className = "action";
        actionBlock.innerHTML = `
            <div class="action-header">
                <span class="action-type">${actionType}</span>
                <button onclick="deleteAction(this)">Delete</button>
            </div>
        `;
        return actionBlock;
    }

    window.addEvent = function(eventType) {
        const eventBlock = createEventBlock(eventType);
        eventsContainer.appendChild(eventBlock);
        events.push(eventBlock);
    }

    window.addSubEvent = function(parentEvent, eventType) {
        const subEventBlock = createEventBlock(eventType);
        subEventBlock.className = "sub-event";
        parentEvent.querySelector(".sub-events-container").appendChild(subEventBlock);
    }

    window.addAction = function(parentEvent, actionType) {
        const actionsContainer = parentEvent.querySelector(".actions-container");
        const actionBlock = createActionBlock(actionType);
        actionsContainer.appendChild(actionBlock);
    }

    window.deleteEvent = function(button) {
        const eventBlock = button.parentElement.parentElement;
        eventBlock.remove();
        events = events.filter(event => event !== eventBlock);
    }

    window.deleteAction = function(button) {
        const actionBlock = button.parentElement.parentElement;
        actionBlock.remove();
    }

    function handleEvents() {
        document.addEventListener("keydown", function(e) {
            events.forEach(eventBlock => {
                const eventType = eventBlock.querySelector(".event-type").textContent;
                if (eventType === "Key Press" && e.key.startsWith("Arrow")) {
                    processActions(eventBlock.querySelector(".actions-container").children, e);
                } else if (eventType === "Loop") {
                    const loopCountElement = eventBlock.querySelector(".loop-count");
                    const loopForeverElement = eventBlock.querySelector(".loop-forever");
                    const loopCount = loopCountElement ? parseInt(loopCountElement.value) : 1;
                    const loopForever = loopForeverElement ? loopForeverElement.checked : false;
                    if (loopForever) {
                        let stop = false;
                        while (!stop) {
                            processActions(eventBlock.querySelector(".actions-container").children, e, true);
                        }
                    } else {
                        for (let i = 0; i < loopCount; i++) {
                            processActions(eventBlock.querySelector(".actions-container").children, e, true);
                        }
                    }
                }
            });
            drawPlayer();
        });
    }

    function processActions(actionBlocks, e, isLoop = false) {
        const delay = isLoop ? 100 : 0;
        Array.from(actionBlocks).forEach((actionBlock, index) => {
            setTimeout(() => {
                const actionType = actionBlock.querySelector(".action-type").textContent;
                if (actionType === "Move Right" && e.key === "ArrowRight") {
                    player.x += 10;
                } else if (actionType === "Move Left" && e.key === "ArrowLeft") {
                    player.x -= 10;
                } else if (actionType === "Move Up" && e.key === "ArrowUp") {
                    player.y -= 10;
                } else if (actionType === "Move Down" && e.key === "ArrowDown") {
                    player.y += 10;
                }
                drawPlayer();
            }, delay * index);
        });
    }

    function showContextMenu(event) {
        event.preventDefault();
        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.display = "block";
    }

    function hideContextMenu() {
        contextMenu.style.display = "none";
    }

    function showPropertyPanel() {
        propertiesContainer.innerHTML = `
            <label for="x">X:</label>
            <input type="number" id="x" value="${player.x}" onchange="updateProperty('${player.id}', 'x', this.value)">
            <label for="y">Y:</label>
            <input type="number" id="y" value="${player.y}" onchange="updateProperty('${player.id}', 'y', this.value)">
            <label for="size">Size:</label>
            <input type="number" id="size" value="${player.size}" onchange="updateProperty('${player.id}', 'size', this.value)">
            <label for="color">Color:</label>
            <input type="color" id="color" value="${player.color}" onchange="updateProperty('${player.id}', 'color', this.value)">
        `;
        propertyPanel.style.display = "block";
    }

    window.closeEventModal = function() {
        eventModal.style.display = "none";
    }

    window.closeActionModal = function() {
        actionModal.style.display = "none";
    }

    window.closeObjectSelectionModal = function() {
        objectSelectionModal.style.display = "none";
    }

    window.showEventModal = function() {
        eventModal.style.display = "block";
    }

    window.showActionModal = function() {
        actionModal.style.display = "block";
    }

    window.showObjectSelectionModal = function() {
        objectSelectionModal.style.display = "block";
    }

    window.showAddSubEventModal = function(button) {
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

    window.showAddActionModal = function(button) {
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
        const events = ["Key Press", "Collision", "Loop"];
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

    function populateActionList() {
        const actionList = document.getElementById("action-list");
        const actions = ["Move Right", "Move Left", "Move Up", "Move Down"];
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

    window.closePropertyPanel = function() {
        propertyPanel.style.display = "none";
    }

    window.addImage = function() {
        alert("Add Image functionality to be implemented");
        hideContextMenu();
    }

    window.deleteObject = function() {
        alert("Delete Object functionality to be implemented");
        hideContextMenu();
    }

    window.resizeObject = function() {
        alert("Resize Object functionality to be implemented");
        hideContextMenu();
    }

    window.positionObject = function() {
        alert("Position Object functionality to be implemented");
        hideContextMenu();
    }

    window.insertObject = function() {
        const newObject = new fabric.Rect({
            left: Math.random() * frameCanvas.width,
            top: Math.random() * frameCanvas.height,
            fill: '#'+Math.floor(Math.random()*16777215).toString(16),
            width: 50,
            height: 50
        });
        frameCanvas.add(newObject);
        hideContextMenu();
    }

    window.addFrames = function() {
        frameEditor.style.display = "block";
        hideContextMenu();
        // Initialize Fabric.js canvas with some sample content
        frameCanvas.clear();
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            fill: '#ff0000', // Use hexadecimal format for colors
            width: 50,
            height: 50
        });
        frameCanvas.add(rect);
    }

    window.closeFrameEditor = function() {
        frameEditor.style.display = "none";
    }

    window.addFrame = function() {
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            fill: '#ff0000', // Use hexadecimal format for colors
            width: 50,
            height: 50
        });
        frameCanvas.add(rect);
    }

    window.applyChanges = function() {
        const activeObject = frameCanvas.getActiveObject();
        if (activeObject) {
            activeObject.set({
                fill: document.getElementById('shape-fill').value,
                stroke: document.getElementById('shape-stroke').value,
                strokeWidth: parseInt(document.getElementById('shape-stroke-width').value, 10),
                angle: parseInt(document.getElementById('shape-rotation').value, 10)
            });
            frameCanvas.renderAll();
        }
    }

    window.saveFrames = function() {
        const objects = frameCanvas.getObjects();
        if (objects.length > 0) {
            const object = objects[0];  // Use the first object for simplicity
            player.color = object.fill;
            player.size = object.width;
            drawPlayer();
            frameEditor.style.display = "none";
        }
    }

    window.updateProperty = function(id, property, value) {
        if (id === player.id) {
            player[property] = property === "color" ? value : parseInt(value, 10);
            drawPlayer();
        }
    }

    canvas.addEventListener("contextmenu", function(event) {
        showContextMenu(event);
        selectedObject = player;  // For simplicity, selecting the player object
    });

    canvas.addEventListener("click", function(event) {
        if (event.button === 0) {
            showPropertyPanel();
        }
    });

    document.addEventListener("click", function(event) {
        if (!contextMenu.contains(event.target)) {
            hideContextMenu();
        }
    });

    addEventButton.addEventListener("click", function() {
        showEventModal();
    });

    addActionButton.addEventListener("click", function() {
        showActionModal();
    });

    executeGameButton.addEventListener("click", function() {
        executeGame();
    });

    function executeGame() {
        drawPlayer();
        handleEvents();
    }

    drawPlayer();
    populateEventList();
    populateActionList();
    populateObjectList();
});

function showTab(tabName) {
    const tabs = document.querySelectorAll(".tab-content");
    tabs.forEach(tab => {
        tab.style.display = "none";
    });
    document.getElementById(tabName).style.display = "flex";
}


const eventsContainer = document.getElementById("events");
const addEventButton = document.getElementById("add-event-button");
const addActionButton = document.getElementById("add-action-button");
const executeGameButton = document.getElementById("execute-game-button");
const eventModal = document.getElementById("event-modal");
const actionModal = document.getElementById("action-modal");

let eventsList = [];

function initializeEvents() {
    addEventButton.addEventListener("click", function() {
        showEventModal();
    });

    addActionButton.addEventListener("click", function() {
        showActionModal();
    });

    executeGameButton.addEventListener("click", function() {
        executeGame();
    });

    document.addEventListener("keydown", handleEvents);
}

function handleEvents(e) {
    eventsList.forEach(eventBlock => {
        const eventType = eventBlock.querySelector(".event-type").textContent;
        const objectId = eventBlock.querySelector(".event-object-id").textContent.replace("Object ID: ", "");
        const targetObject = objects.find(obj => obj.id === objectId);
        if (!targetObject) return;

        if (eventType === "Key Press" && e && e.key && e.key.startsWith("Arrow")) {
            processActions(eventBlock.querySelector(".actions-container").children, e, targetObject);
        } else if (eventType === "Loop") {
            const loopCountElement = eventBlock.querySelector(".loop-count");
            const loopForeverElement = eventBlock.querySelector(".loop-forever");
            const loopCount = loopCountElement ? parseInt(loopCountElement.value) : 1;
            const loopForever = loopForeverElement ? loopForeverElement.checked : false;
            if (loopForever) {
                let stop = false;
                while (!stop) {
                    processActions(eventBlock.querySelector(".actions-container").children, e, targetObject, true);
                }
            } else {
                for (let i = 0; i < loopCount; i++) {
                    processActions(eventBlock.querySelector(".actions-container").children, e, targetObject, true);
                }
            }
        } else if (eventType === "Mouse Click" && e.type === "click") {
            processActions(eventBlock.querySelector(".actions-container").children, e, targetObject);
        } else if (eventType === "Timer") {
            const timerDurationElement = eventBlock.querySelector(".timer-duration");
            const timerDuration = timerDurationElement ? parseInt(timerDurationElement.value) : 1000;
            setInterval(() => {
                processActions(eventBlock.querySelector(".actions-container").children, e, targetObject);
            }, timerDuration);
        }
    });
    drawObjects(); // Redesenha todos os objetos após processar os eventos
}

function createEventBlock(eventType, objectId) {
    const eventBlock = document.createElement("div");
    eventBlock.className = "event";
    const eventId = `event-${Date.now()}`;
    let eventContent = `
        <div class="event-header">
            <span class="event-type">${eventType}</span>
            <span class="event-object-id">Object ID: ${objectId}</span>
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
    } else if (eventType === "Timer") {
        eventContent += `
            <div class="timer-settings">
                <label for="${eventId}-timer-duration">Duration (ms):</label>
                <input type="number" id="${eventId}-timer-duration" class="timer-duration" value="1000" min="100">
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

function addEvent(eventType) {
    const objectId = document.getElementById("event-object-id").value;
    if (!objectId) {
        alert("Please enter an Object ID");
        return;
    }
    const eventBlock = createEventBlock(eventType, objectId);
    eventsContainer.appendChild(eventBlock);
    eventsList.push(eventBlock);
}

function addSubEvent(parentEvent, eventType) {
    const objectId = document.getElementById("event-object-id").value;
    if (!objectId) {
        alert("Please enter an Object ID");
        return;
    }
    const subEventBlock = createEventBlock(eventType, objectId);
    subEventBlock.className = "sub-event";
    parentEvent.querySelector(".sub-events-container").appendChild(subEventBlock);
}

function deleteEvent(button) {
    const eventBlock = button.parentElement.parentElement;
    eventBlock.remove();
    eventsList = eventsList.filter(event => event !== eventBlock);
}

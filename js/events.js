const eventsContainer = document.getElementById("events");
const addEventButton = document.getElementById("add-event-button");
const addActionButton = document.getElementById("add-action-button");
const executeGameButton = document.getElementById("execute-game-button");
const eventModal = document.getElementById("event-modal");
const actionModal = document.getElementById("action-modal");

let eventsList = [];
let customEvents = []; // Lista para armazenar eventos carregados de extensões

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

const defaultEvents = [
    {
        name: "KeyPress",
        code: "function KeyPress(eventData) { console.log('Key Pressed:', eventData.key); }",
        description: "Triggered when a specific key is pressed.",
        inputs: [
            { label: "Key", name: "key", type: "text" }
        ]
    },
    {
        name: "Collision",
        code: "function Collision(eventData) { console.log('Collision detected between', eventData.objectId1, 'and', eventData.objectId2); }",
        description: "Triggered when two objects collide.",
        inputs: [
            { label: "Object ID 1", name: "objectId1", type: "text" },
            { label: "Object ID 2", name: "objectId2", type: "text" }
        ]
    },
    {
        name: "Timer",
        code: "function Timer(eventData) { console.log('Timer triggered after', eventData.interval, 'ms'); }",
        description: "Triggered after a specific time interval.",
        inputs: [
            { label: "Interval (ms)", name: "interval", type: "number" }
        ]
    }
];

function createEventBlock(eventType, inputs) {
    const eventBlock = document.createElement("div");
    eventBlock.className = "event";

    let eventHeader = `
        <div class="event-header">
            <span class="event-type">${eventType}</span>
            <button onclick="deleteEvent(this)">Delete</button>
            <button onclick="showAddSubEventModal(this)">Add Sub-Event</button>
            <button onclick="showAddActionModal(this)">Add Action</button>
        </div>
    `;

    let eventInputs = '';
    inputs.forEach(input => {
        eventInputs += `
            <div class="event-input">
                <label for="${input.name}">${input.label}:</label>
                <input type="${input.type}" id="${input.name}" name="${input.name}">
            </div>
        `;
    });

    eventBlock.innerHTML = eventHeader + eventInputs;
    return eventBlock;
}

function addEvent(eventType) {
    const selectedEvent = findEventByName(eventType);
    if (!selectedEvent) {
        alert("Evento não encontrado.");
        return;
    }

    const eventBlock = createEventBlock(eventType, selectedEvent.inputs);
    eventsContainer.appendChild(eventBlock);
    eventsList.push(eventBlock);
}

function findEventByName(eventName) {
    const events = defaultEvents.concat(customEvents);
    return events.find(event => event.name === eventName);
}

function handleEvents(e) {
    eventsList.forEach(eventBlock => {
        const eventType = eventBlock.querySelector(".event-type").textContent;
        const event = findEventByName(eventType);

        if (event) {
            const eventInputs = event.inputs.reduce((data, input) => {
                data[input.name] = eventBlock.querySelector(`[name="${input.name}"]`).value;
                return data;
            }, {});

            try {
                const func = new Function('eventData', event.code.substring(event.code.indexOf('{') + 1, event.code.lastIndexOf('}')));
                func(eventInputs);
            } catch (err) {
                console.error(`Error executing event ${eventType}:`, err);
            }
        } else {
            console.error(`Evento não encontrado: ${eventType}`);
        }
    });
    drawObjects(); // Redesenha todos os objetos após processar os eventos
}

function populateEventList() {
    const eventList = document.getElementById("event-list");
    if (!eventList) {
        console.error("Elemento da lista de eventos não encontrado.");
        return;
    }

    eventList.innerHTML = ''; // Limpa a lista de eventos antes de adicionar novos itens

    const events = defaultEvents.concat(customEvents); // Supondo que você tenha eventos personalizados

    events.forEach(event => {
        const eventItem = document.createElement("div");
        eventItem.className = "event-item";
        eventItem.textContent = event.name;
        eventItem.onclick = function() {
            addEvent(event.name);
            closeEventModal();
        };
        eventList.appendChild(eventItem);
    });
}

function deleteEvent(button) {
    const eventBlock = button.parentElement.parentElement;
    eventBlock.remove();
    eventsList = eventsList.filter(event => event !== eventBlock);
}

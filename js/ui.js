const contextMenu = document.getElementById("context-menu");
const defaultContextMenu = document.getElementById("default-context-menu");
const objectContextMenu = document.getElementById("object-context-menu");
const propertyPanel = document.getElementById("property-panel");
const propertiesContainer = document.getElementById("properties");
const objectSelectionModal = document.getElementById("object-selection-modal");
const insertObjectModal = document.getElementById("insert-object-modal");
const addExtensionButton = document.getElementById("add-extension-button");
let selectedObject = null;

let extensionCache = {
    events: [],
    actions: []
};
let extensionActions = [];
let extensionEvents = [];

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

        selectedObject = objects.find(obj => 
            x >= obj.x && x <= obj.x + obj.width &&
            y >= obj.y && y <= obj.y + obj.height
        );

        showContextMenu(event, Boolean(selectedObject));
    });

    canvas.addEventListener("click", function(event) {
        if (event.button === 0 && selectedObject) {
            showPropertyPanel(selectedObject);
        }
    });

    if (typeof populateEventList === 'function') populateEventList();
    if (typeof populateObjectList === 'function') populateObjectList();
    if (typeof populateActionList === 'function') populateActionList();
}

function showContextMenu(event, isObject) {
    event.preventDefault();
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;
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
    document.getElementById("event-modal").style.display = "none";
}

function closeActionModal() {
    document.getElementById("action-modal").style.display = "none";
}

function closeObjectSelectionModal() {
    objectSelectionModal.style.display = "none";
}

function showEventModal() {
    document.getElementById("event-modal").style.display = "block";
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

    // Pega os eventos da lista de eventos
    const eventItems = document.querySelectorAll("#event-list .event-item");
    eventItems.forEach(item => {
        item.onclick = function() {
            const eventName = item.textContent;
            const event = findEventByName(eventName);

            if (event) {
                let subEventsContainer = parentEvent.querySelector(".sub-events-container");
                if (!subEventsContainer) {
                    console.error("Container de sub-eventos não encontrado. Criando um novo container...");
                    subEventsContainer = document.createElement("div");
                    subEventsContainer.className = "sub-events-container";
                    parentEvent.appendChild(subEventsContainer);
                }

                const subEventBlock = createEventBlock(eventName, event.inputs);
                subEventBlock.className = "sub-event";
                subEventsContainer.appendChild(subEventBlock);
            } else {
                console.error(`Evento não encontrado: ${eventName}`);
                alert(`Evento não encontrado: ${eventName}`);
            }
            closeEventModal();
        };
    });
}

function showAddActionModal(button) {
    const parentEvent = button.parentElement.parentElement;
    
    // Certifique-se de que a lista de ações esteja atualizada
    populateActionList();

    const actionItems = document.querySelectorAll("#action-list .action-item");

    if (actionItems.length === 0) {
        console.error("Elemento da lista de ações não encontrado.");
        alert("Nenhuma ação disponível.");
        return;
    }

    actionItems.forEach(item => {
        item.onclick = function() {
            const actionName = item.textContent;
            const action = findActionByName(actionName);
            if (action) {
                addAction(parentEvent, action.name);
            } else {
                console.error(`Ação não encontrada: ${actionName}`);
                alert(`Ação não encontrada: ${actionName}`);
            }
        };
    });

    document.getElementById("action-modal").style.display = "block";
}

function findActionByName(actionName) {
    const actions = defaultActions.concat(extensionActions);
    return actions.find(action => action.name === actionName);
}

function showActionModal(actionName, actionCode, inputs = []) {
    const actionModal = document.getElementById("action-modal");
    const modalContent = actionModal.querySelector('.modal-content');
    modalContent.innerHTML = `<span class="close" onclick="closeActionModal()">&times;</span><h3>${actionName}</h3>`;

    inputs.forEach(input => {
        const inputElement = document.createElement("div");
        inputElement.innerHTML = `<label for="${input.name}">${input.label}:</label><input type="${input.type}" id="${input.name}" name="${input.name}">`;
        modalContent.appendChild(inputElement);
    });

    const applyButton = document.createElement("button");
    applyButton.textContent = "Apply";
    applyButton.onclick = function() {
        const actionData = {};
        inputs.forEach(input => {
            actionData[input.name] = document.getElementById(input.name).value;
        });

        try {
            if (actionCode) {
                const func = new Function('actionData', actionCode.substring(actionCode.indexOf('{') + 1, actionCode.lastIndexOf('}')));
                func(actionData);
            } else {
                console.error("Invalid action code.");
            }
        } catch (e) {
            console.error("Error executing action:", e);
        }

        closeActionModal();
    };
    modalContent.appendChild(applyButton);

    actionModal.style.display = "block";
}


function populateEventList() {
    const eventList = document.getElementById("event-list");
    if (!eventList) {
        console.error("Elemento da lista de eventos não encontrado.");
        return;
    }

    eventList.innerHTML = ''; // Limpa a lista de eventos antes de adicionar novos itens

    const events = defaultEvents.concat(extensionEvents); // Inclui eventos de extensões

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

function populateObjectList() {
    const objectList = document.getElementById("object-list");
    ["Object 1", "Object 2", "Object 3"].forEach(object => {
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

function populateActionList(customActions = []) {
    const actionList = document.getElementById("action-list");
    if (!actionList) {
        console.error("Elemento da lista de ações não encontrado.");
        return;
    }

    actionList.innerHTML = ''; // Limpa a lista de ações antes de adicionar novos itens

    const actions = defaultActions.concat(customActions);

    actions.forEach(action => {
        const actionItem = document.createElement("div");
        actionItem.className = "action-item";
        actionItem.textContent = action.name;
        actionItem.onclick = function() {
            addAction(document.querySelector(".event"), action.name); // Supondo que estamos adicionando a ação ao primeiro evento
        };
        actionList.appendChild(actionItem);
    });

    console.log("populateActionList completed", actions);
}

function showExtensionModal() {
    document.getElementById("extension-modal").style.display = "block";
}

function closeExtensionModal() {
    document.getElementById("extension-modal").style.display = "none";
}

function handleExtensionUpload() {
    const fileInput = document.getElementById("extension-file");
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const extensionData = JSON.parse(event.target.result);
                processExtensionData(extensionData);
                closeExtensionModal();
            } catch (e) {
                alert("Invalid extension file format.");
                console.error(e);
            }
        };
        reader.readAsText(file);
    } else {
        alert("Please select a file.");
    }
}

function processExtensionData(extensionData) {
    if (!Array.isArray(extensionData.events) || !Array.isArray(extensionData.actions)) {
        alert("Invalid data structure in the extension file.");
        return;
    }

    extensionActions = extensionActions.concat(extensionData.actions);
    extensionEvents = extensionEvents.concat(extensionData.events);

    extensionData.events.forEach(event => {
        if (typeof event.name === 'string' && typeof event.code === 'string') {
            addEventToSystem(event.name, event.code);
        } else {
            console.error("Invalid event format:", event);
        }
    });

    extensionData.actions.forEach(action => {
        if (typeof action.name === 'string' && typeof action.code === 'string') {
            addActionToSystem(action.name, action.code, action.inputs);
        } else {
            console.error("Invalid action format:", action);
        }
    });

    addExtensionToCache(extensionData.events, extensionData.actions);
}

function addEventToSystem(eventName, eventCode) {
    const eventList = document.getElementById("event-list");
    const eventItem = document.createElement("div");
    eventItem.className = "event-item";
    eventItem.textContent = eventName;

    try {
        const func = new Function('eventData', eventCode.substring(eventCode.indexOf('{') + 1, eventCode.lastIndexOf('}')));
        eventItem.onclick = function() {
            addEvent(eventName, func);
        };
    } catch (e) {
        console.error("Error creating function for event:", eventName, e);
    }

    eventList.appendChild(eventItem);
}

function addActionToSystem(actionName, actionCode, inputs = []) {
    const actionList = document.getElementById("action-list");
    if (!actionList) {
        console.error("Elemento da lista de ações não encontrado.");
        return;
    }

    const actionItem = document.createElement("div");
    actionItem.className = "action-item";
    actionItem.textContent = actionName;

    actionItem.onclick = function() {
        showActionModal(actionName, actionCode, inputs);
    };

    actionList.appendChild(actionItem);
}

function addExtensionToCache(events, actions) {
    extensionCache.events = extensionCache.events.concat(events);
    extensionCache.actions = extensionCache.actions.concat(actions);
    console.log("Current Cache:", extensionCache);
}

function insertObject() {
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
}


function showTab(tabName) {
    const tabs = document.querySelectorAll(".tab-content");
    tabs.forEach(tab => {
        tab.style.display = "none";
    });
    document.getElementById(tabName).style.display = "flex";
}

// Certifique-se de que initializeUI seja chamada após a definição de todas as funções necessárias
document.addEventListener("DOMContentLoaded", function() {
    initializeUI();
    addExtensionButton.addEventListener("click", showExtensionModal);
});
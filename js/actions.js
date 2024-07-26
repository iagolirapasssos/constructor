function initializeActions() {
    populateActionList();
}

const defaultActions = [
    {
        name: "MoveObject",
        code: "function MoveObject(actionData) { const object = getObjectById(actionData.objectId); if (object) { moveObject(object, actionData.x, actionData.y); console.log('Object moved to:', actionData.x, actionData.y); } }",
        description: "Moves an object to the specified position.",
        inputs: [
            { label: "Object ID", name: "objectId", type: "text" },
            { label: "X Position", name: "x", type: "number" },
            { label: "Y Position", name: "y", type: "number" }
        ]
    },
    {
        name: "PlaySound",
        code: "function PlaySound(actionData) { playSound(actionData.soundFile); console.log('Playing sound:', actionData.soundFile); }",
        description: "Plays the specified sound file.",
        inputs: [
            { label: "Sound File", name: "soundFile", type: "text" }
        ]
    }
];

function createActionBlock(actionType, inputs) {
    const actionBlock = document.createElement("div");
    actionBlock.className = "action";

    // Header da ação com nome e botão de deletar
    let actionHeader = `
        <div class="action-header">
            <span class="action-type">${actionType}</span>
            <button onclick="deleteAction(this)">Delete</button>
        </div>
    `;

    // Adiciona os inputs para os parâmetros da ação
    let actionInputs = '';
    inputs.forEach(input => {
        actionInputs += `
            <div class="action-input">
                <label for="${input.name}">${input.label}:</label>
                <input type="${input.type}" id="${input.name}" name="${input.name}">
            </div>
        `;
    });

    actionBlock.innerHTML = actionHeader + actionInputs;
    return actionBlock;
}

function addAction(parentEvent, actionType) {
    const selectedAction = findActionByName(actionType);
    if (!selectedAction) {
        alert("Ação não encontrada.");
        return;
    }

    let actionsContainer = parentEvent.querySelector(".actions-container");
    if (!actionsContainer) {
        console.error("Container de ações não encontrado. Criando um novo container...");
        actionsContainer = document.createElement("div");
        actionsContainer.className = "actions-container";
        parentEvent.appendChild(actionsContainer);
    }

    const actionBlock = createActionBlock(actionType, selectedAction.inputs);
    actionsContainer.appendChild(actionBlock);
}

function deleteAction(button) {
    const actionBlock = button.parentElement.parentElement;
    actionBlock.remove();
}

function processActions(actionBlocks, e, targetObject, isLoop = false) {
    const delay = isLoop ? 100 : 0;
    Array.from(actionBlocks).forEach((actionBlock, index) => {
        setTimeout(() => {
            const actionType = actionBlock.querySelector(".action-type").textContent;
            const action = findActionByName(actionType);

            if (action) {
                const actionInputs = action.inputs.reduce((data, input) => {
                    data[input.name] = actionBlock.querySelector(`[name="${input.name}"]`).value;
                    return data;
                }, {});

                try {
                    const func = new Function('actionData', action.code.substring(action.code.indexOf('{') + 1, action.code.lastIndexOf('}')));
                    func(actionInputs);
                } catch (err) {
                    console.error(`Error executing action ${actionType}:`, err);
                }
            } else {
                console.error(`Ação não encontrada: ${actionType}`);
            }
        }, delay * index);
    });
}

function findActionByName(actionName) {
    const actions = defaultActions.concat(extensionActions);
    return actions.find(action => action.name === actionName);
}

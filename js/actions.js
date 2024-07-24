function initializeActions() {
    populateActionList();
}

function createActionBlock(actionType, objectId) {
    const actionBlock = document.createElement("div");
    actionBlock.className = "action";
    actionBlock.innerHTML = `
        <div class="action-header">
            <span class="action-type">${actionType}</span>
            <span class="action-object-id">Object ID: ${objectId}</span>
            <button onclick="deleteAction(this)">Delete</button>
        </div>
    `;
    return actionBlock;
}

function addAction(parentEvent, actionType) {
    const objectId = document.getElementById("action-object-id").value;
    if (!objectId) {
        alert("Please enter an Object ID");
        return;
    }
    const actionsContainer = parentEvent.querySelector(".actions-container");
    const actionBlock = createActionBlock(actionType, objectId);
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
            const objectId = actionBlock.querySelector(".action-object-id").textContent.split(": ")[1];
            if (targetObject.id !== objectId) return;

            if (actionType === "Move Right") {
                targetObject.x += 10;
            } else if (actionType === "Move Left") {
                targetObject.x -= 10;
            } else if (actionType === "Move Up") {
                targetObject.y -= 10;
            } else if (actionType === "Move Down") {
                targetObject.y += 10;
            } else if (actionType === "Change Color") {
                targetObject.color = '#' + Math.floor(Math.random() * 16777215).toString(16); // Random color
            } else if (actionType === "Play Sound") {
                const audio = new Audio('path/to/sound/file.mp3');
                audio.play();
            }
            drawObject(targetObject);
        }, delay * index);
    });
}

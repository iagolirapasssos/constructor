# Constructor

This project is a Constructor that allows users to create games using a visual event-based interface. The IDE supports adding objects, events, and actions to create interactive games. The project uses HTML, CSS, JavaScript, and the Fabric.js library to provide a canvas-based game development environment.

## Features

- Add, resize, and position objects on the canvas
- Change object properties such as color and shape
- Add images to objects
- Create events triggered by key presses, mouse clicks, collisions, loops, and timers
- Add actions to events such as moving objects, changing colors, and playing sounds
- Animate objects with bounce and rotate animations

## Project Structure

### HTML

`index.html`:
- Contains the structure of the IDE, including tabs for the viewer and event editor.
- Defines modals for adding events, actions, and objects.
- Includes context menus for object and default actions.

### CSS

`css/styles.css`:
- Defines the styles for the IDE, including the layout, colors, and appearance of the tabs, modals, and context menus.

### JavaScript

`js/main.js`:
- Initializes the application by setting up the UI, game, events, and actions.

`js/ui.js`:
- Handles the user interface interactions such as showing and hiding modals and context menus.
- Manages object properties and updates.
- Provides functions for adding images, resizing objects, changing positions, changing colors, changing shapes, and adding animations.

`js/game.js`:
- Manages the game objects and their properties.
- Contains functions for drawing objects on the canvas.
- Handles game execution by processing events and actions.

`js/events.js`:
- Manages the creation and handling of events.
- Provides functions for adding events and sub-events.
- Processes event actions based on user input.

`js/actions.js`:
- Manages the creation and handling of actions.
- Provides functions for adding actions to events.
- Processes actions such as moving objects, changing colors, and playing sounds.

### Modals

- **Event Modal**: Allows users to select and add events to objects.
- **Action Modal**: Allows users to select and add actions to events.
- **Object Selection Modal**: Allows users to select existing objects.
- **Insert Object Modal**: Allows users to add new objects with specific properties.

### Context Menus

- **Default Context Menu**: Appears when right-clicking on the canvas background, providing an option to insert new objects.
- **Object Context Menu**: Appears when right-clicking on an object, providing options to add images, delete objects, resize objects, position objects, add frames, change colors, change shapes, and add animations.

## Usage

1. Open `index.html` in a web browser to launch the IDE.
2. Use the tabs to switch between the viewer and event editor.
3. Right-click on the canvas background to insert a new object.
4. Right-click on an object to access context menu options for modifying the object.
5. Use the event editor to add events and actions to objects.
6. Click the "Execute Game" button to run the game and see the objects respond to the defined events and actions.

## Installation

1. Clone the repository: `git clone https://github.com/your-username/simple-game-ide.git`
2. Open the project directory: `cd simple-game-ide`
3. Open `index.html` in a web browser.

## Dependencies

- Fabric.js: Used for canvas manipulation and drawing objects.
- Sortable.js: Used for drag-and-drop functionality in the event editor.

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b my-feature-branch`
3. Make your changes and commit them: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin my-feature-branch`
5. Create a pull request on GitHub.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

This README provides a comprehensive overview of the Constructor, including its features, project structure, usage instructions, installation steps, dependencies, and contribution guidelines.

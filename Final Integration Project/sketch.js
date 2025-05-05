// Rhythm Garden - Main Sketch
// Created for CSC 2463

// UI Panel properties
let uiPanelHeight = 70;
let uiPanelColor;
let infoBoxColor;

// Garden variables
let plants = [];
let soil;
let sky;
let gardenHealth = 100;

// Sprite sheet
let spriteSheet;
const SPRITE_SIZE = 32; // Assuming each sprite is 32x32 pixels

let usedSpriteTypes = new Array(10).fill(0); // Count of each sprite type used
// UI states
let currentScene = "welcome"; // welcome, garden, info
let startButton;
let infoButton;
let backButton;

// Sound variables
let backgroundSynth;
let environmentalSounds;
let isAudioInitialized = false;

function preload() {
    // Load sprite sheet
    spriteSheet = loadImage('plant_sprites.png'); // Make sure the path is correct
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvasContainer');

    // Create UI colors
    uiPanelColor = color(40, 45, 60, 230);
    infoBoxColor = color(30, 35, 50);

    // Create Arduino connection button
    setupArduinoConnection();

    // Create UI elements
    startButton = createButton('Start Your Garden');
    startButton.position(width/2 - 100, height/2 + 100);
    startButton.mousePressed(startGarden);
    startButton.class('btn-primary');

    infoButton = createButton('How to Play');
    infoButton.position(width/2 - 100, height/2 + 150);
    infoButton.mousePressed(() => currentScene = "info");
    infoButton.class('btn-secondary');

    backButton = createButton('Back');
    backButton.position(50, height - 80);
    backButton.mousePressed(() => currentScene = "welcome");
    backButton.class('btn');
    backButton.hide();

    // Initialize background gradients
    soil = createSoilGradient();
    sky = createSkyGradient();

    // Initialize sound on user interaction
    document.addEventListener('click', initializeAudio, { once: true });

    // Set initial UI visibility
    updateUIVisibility();
}

function draw() {
    background(20);

    // Get the latest Arduino sensor values
    let sensorValues = getSensorValues();
    let moisture = sensorValues.moisture;
    let light = sensorValues.light;
    let planting = sensorValues.planting;

    switch(currentScene) {
        case "welcome":
            drawWelcomeScreen();
            break;
        case "garden":
            drawGarden(moisture, light, planting);
            break;
        case "info":
            drawInfoScreen();
            break;
    }

    // Update UI visibility if needed
    updateUIVisibility();
}

function drawWelcomeScreen() {
    // Sky gradient
    image(sky, 0, 0, width, height);

    // Decorative panel
    fill(40, 45, 60, 180);
    rect(width/2 - 350, height/3 - 100, 700, 230, 10);

    // Title
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(60);
    textStyle(BOLD);
    text("Rhythm Garden", width/2, height/3 - 30);

    // Subtitle
    textSize(24);
    textStyle(NORMAL);
    text("Nurture plants that create music together", width/2, height/3 + 40);
    text("Each plant contributes to a living composition", width/2, height/3 + 80);

    // Connection status
    let connectionStatus = getConnectionStatus();
    drawConnectionStatus(10, 20, connectionStatus);

    // Small decorative plants using sprites
    drawDecorativePlants();
}

function drawInfoScreen() {
    background(20, 30, 40);

    // Info panel
    fill(40, 45, 60);
    rect(width/2 - 400, 50, 800, height - 100, 10);

    fill(255);
    textAlign(CENTER, TOP);
    textSize(40);
    textStyle(BOLD);
    text("How to Play", width/2, 80);

    textAlign(LEFT, TOP);
    textSize(18);
    textStyle(NORMAL);
    let instructions = [
        "1. Connect to your Arduino using the button in the top-left",
        "2. Use the joystick to control your garden environment:",
        "   - Move UP/DOWN to adjust moisture (up = wet, down = dry)",
        "   - Move LEFT/RIGHT to adjust light (left = dark, right = bright)",
        "3. Press the joystick button to plant new plants",
        "4. Different types of plants create different sounds:",
        "   - Bass plants: Deep foundational tones (trees)",
        "   - Melody plants: Higher melodic patterns (flowers)",
        "   - Harmony plants: Rich chord structures (herbs)",
        "5. Each plant type has unique preferences:",
        "   - Trees prefer high moisture and moderate light",
        "   - Flowers prefer bright light and less moisture",
        "   - Herbs prefer balanced conditions",
        "6. Plants will grow and evolve over time based on your care",
        "7. Find the perfect balance to create a harmonious garden"
    ];

    let instructionsY = 160;
    for (let i = 0; i < instructions.length; i++) {
        text(instructions[i], width/2 - 350, instructionsY + i * 40);
    }

    // Connection status
    let connectionStatus = getConnectionStatus();
    drawConnectionStatus(10, 20, connectionStatus);
}

function drawGarden(moisture, light, planting) {
    // Calculate garden health based on plant health average
    updateGardenHealth();

    // Draw sky and soil gradients
    image(sky, 0, uiPanelHeight, width, height - 2 * uiPanelHeight);
    image(soil, 0, height/2, width, height/2 - uiPanelHeight);

    // Update gradients based on sensor values
    if (frameCount % 30 === 0) { // Update every 30 frames for performance
        updateSoilGradient(moisture);
        updateSkyGradient(light);
    }

    // Draw all plants
    for (let i = plants.length - 1; i >= 0; i--) {
        plants[i].grow(moisture, light);
        plants[i].display();

        if (isAudioInitialized) {
            plants[i].playSound();
        }
    }

    // Static variable to track planting state
    if (typeof drawGarden.lastPlantingState === 'undefined') {
        drawGarden.lastPlantingState = false;
    }

    // Add new plant if planting button is pressed (only on the rising edge)
    if (planting && !drawGarden.lastPlantingState) {
        addNewPlant(moisture, light, true); // Add just one plant
    }

    // Update the planting state for next frame
    drawGarden.lastPlantingState = planting;

    // Draw enhanced UI elements
    drawEnhancedUI(moisture, light);
}


function drawDecorativePlants() {
    // Direct mapping of plant sprites from the sheet
    // Starting positions for each plant type
    const startPositions = [
        { row: 0, col: 0 }, // Plant 1 (small green)
        { row: 0, col: 2 }, // Plant 2 (small red/pink)
        { row: 0, col: 4 }, // Plant 3 (small leafy plant)
        { row: 0, col: 6 }, // Plant 4 (small yellow flower)
        { row: 4, col: 0 }, // Plant 5 (small purple/pink flower)
        { row: 4, col: 2 }, // Plant 6 (small bush)
        { row: 4, col: 4 }, // Plant 7 (small tree)
        { row: 4, col: 6 }  // Plant 8 (small fruit tree)
    ];

// Display each plant type in mature form (7th growth stage - fully grown)
    for (let i = 0; i < startPositions.length; i++) {
        // Position plants evenly across the screen
        let x = width * 0.15 + (width * 0.7) * (i / (startPositions.length - 1));
        let y = height * 0.85;

        push();
        translate(x, y);

        // For fully grown plants (stage 6), we need row offset 3 and column offset 0
        let basePosition = startPositions[i];
        let rowOffset = 3; // Fully grown plants are in the 4th row (offset 3)
        let colOffset = 0; // Fully grown plants are in the 1st column (offset 0)

        // Calculate sprite position
        let spriteX = (basePosition.col + colOffset) * SPRITE_SIZE;
        let spriteY = (basePosition.row + rowOffset) * SPRITE_SIZE;

        // Draw the sprite with a good size for display
        let displaySize = SPRITE_SIZE * 3;
        image(
            spriteSheet,
            -displaySize/2,
            -displaySize/2,
            displaySize,
            displaySize,
            spriteX,
            spriteY,
            SPRITE_SIZE,
            SPRITE_SIZE
        );

        pop();
    }
}




// Function to update the UI with enhanced design
// Update the drawEnhancedUI function to move the joystick to center of sky
function drawEnhancedUI(moisture, light) {
    // Top panel
    fill(uiPanelColor);
    noStroke();
    rect(0, 0, width, uiPanelHeight);

    // Connection status at top left
    let connectionStatus = getConnectionStatus();
    drawConnectionStatus(10, 20, connectionStatus);

    // Garden Stats Panel - Top right
    drawGardenStatsPanel(width - 300, 10, 280, uiPanelHeight - 20, moisture, light);

    // Bottom panel
    fill(uiPanelColor);
    rect(0, height - uiPanelHeight, width, uiPanelHeight);

    // Draw joystick visualization in the middle of sky area - NEW POSITION
    drawJoystickIndicator(120, height/4, moisture, light);

    // Draw plant type key in bottom center
    drawPlantTypeKey(width/2, height - uiPanelHeight/2);
}


function drawConnectionStatus(x, y, status) {
    textAlign(LEFT, CENTER);

    // Status indicator
    let statusColor = status.isConnected ? color(0, 200, 0) : color(200, 0, 0);
    fill(statusColor);
    ellipse(x, y, 10, 10);

    // Status text
    fill(255);
    textSize(14);
    text(status.statusText, x + 15, y);
}

function drawGardenStatsPanel(x, y, w, h, moisture, light) {
    // Background
    fill(infoBoxColor);
    rect(x, y, w, h, 5);

    // Content
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(14);

    // Plant counts
    let bassCount = plants.filter(p => p.type === 0).length;
    let melodyCount = plants.filter(p => p.type === 1).length;
    let harmonyCount = plants.filter(p => p.type === 2).length;

    let col1 = x + 15;
    let col2 = x + 150;
    let row1 = y + h/4;
    let row2 = y + h*3/4;

    // First row
    text(`Total Plants: ${plants.length}`, col1, row1);

    // Make sure garden health is never 0 if there are plants
    let displayHealth = floor(gardenHealth);
    if (plants.length > 0 && displayHealth <= 0) {
        displayHealth = 1; // Ensure it's at least 1% if there are plants
    }
    text(`Garden Health: ${displayHealth}%`, col2, row1);

    // Second row - Fix spacing between plant counts
    text(`Bass: ${bassCount}`, col1, row2);
    text(`Melody: ${melodyCount}`, col1 + 85, row2); // Increased spacing
    text(`Harmony: ${harmonyCount}`, col2 + 25, row2); // Added offset
}


function drawPlantTypeKey(x, y) {
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(14);
    text("Plant Types:", x, y - 20);

    let spacing = 70;

    // Bass
    fill(30, 100, 200);
    ellipse(x - spacing, y, 15, 15);
    fill(255);
    textSize(10);
    text("B", x - spacing, y);
    textSize(14);
    text("Trees", x - spacing, y + 20);

    // Melody
    fill(200, 50, 150);
    ellipse(x, y, 15, 15);
    fill(255);
    textSize(10);
    text("M", x, y);
    textSize(14);
    text("Flowers", x, y + 20);

    // Harmony
    fill(100, 200, 50);
    ellipse(x + spacing, y, 15, 15);
    fill(255);
    textSize(10);
    text("H", x + spacing, y);
    textSize(14);
    text("Herbs", x + spacing, y + 20);
}


// Joystick visualization with corrected moisture labels
function drawJoystickIndicator(x, y, moisture, light) {
    // Draw joystick base
    fill(80, 80, 80);
    ellipse(x, y, 120, 120);

    // Draw joystick tracking area
    fill(50, 50, 50);
    ellipse(x, y, 100, 100);

    // Grid lines
    stroke(100, 100, 100);
    line(x - 50, y, x + 50, y);
    line(x, y - 50, x, y + 50);
    noStroke();

    // Map moisture and light values to joystick position
    // Note: We invert the Y axis since higher moisture is "down" on the joystick
    let joystickX = map(light, 0, 1023, x - 40, x + 40);
    let joystickY = map(moisture, 0, 1023, y + 40, y - 40);

    // Draw joystick handle shadow
    fill(0, 0, 0, 50);
    ellipse(joystickX + 2, joystickY + 2, 30, 30);

    // Draw joystick handle
    fill(200, 200, 200);
    ellipse(joystickX, joystickY, 30, 30);

    // Draw labels
    textAlign(CENTER);
    textSize(12);
    fill(255);

    // X-axis labels (Light)
    text("Dark", x - 60, y);
    text("Bright", x + 60, y);

    // Y-axis labels (Moisture) - FIXED: Switched positions
    text("Wet", x, y - 60);    // Up position is now "Wet"
    text("Dry", x, y + 60);    // Down position is now "Dry"

    // Values
    text("Light: " + floor(map(light, 0, 1023, 0, 100)) + "%", x, y + 75);
    text("Moisture: " + floor(map(moisture, 0, 1023, 0, 100)) + "%", x, y + 90);
}


function createSoilGradient() {
    let soilImg = createGraphics(width, height/2);

    // Create soil gradient color based on moisture
    let c1, c2;

    c1 = color(80, 50, 20); // Dry soil
    c2 = color(50, 30, 10); // Dark soil

    for (let y = 0; y < soilImg.height; y++) {
        let inter = map(y, 0, soilImg.height, 0, 1);
        let c = lerpColor(c1, c2, inter);
        soilImg.stroke(c);
        soilImg.line(0, y, soilImg.width, y);
    }

    return soilImg;
}

function updateSoilGradient(moisture) {
    // Update soil color based on moisture level
    let soilMoistureColor = color(
        map(moisture, 0, 1023, 80, 40),
        map(moisture, 0, 1023, 50, 30),
        map(moisture, 0, 1023, 20, 30)
    );

    let soilDarkColor = color(
        map(moisture, 0, 1023, 50, 30),
        map(moisture, 0, 1023, 30, 20),
        map(moisture, 0, 1023, 10, 20)
    );

    let soilImg = createGraphics(width, height/2);

    for (let y = 0; y < soilImg.height; y++) {
        let inter = map(y, 0, soilImg.height, 0, 1);
        let c = lerpColor(soilMoistureColor, soilDarkColor, inter);
        soilImg.stroke(c);
        soilImg.line(0, y, soilImg.width, y);
    }

    soil = soilImg;
}

function createSkyGradient() {
    let skyImg = createGraphics(width, height/2);
    let c1 = color(100, 150, 255); // Light blue
    let c2 = color(50, 100, 200); // Darker blue

    for (let y = 0; y < skyImg.height; y++) {
        let inter = map(y, 0, skyImg.height, 0, 1);
        let c = lerpColor(c1, c2, inter);
        skyImg.stroke(c);
        skyImg.line(0, y, skyImg.width, y);
    }

    return skyImg;
}

function updateSkyGradient(light) {
    // Update sky color based on light level
    let skyTopColor, skyBottomColor;

    if (light > 700) { // Bright day
        skyTopColor = color(100, 180, 255);
        skyBottomColor = color(80, 130, 220);
    } else if (light > 300) { // Normal day
        skyTopColor = color(80, 120, 200);
        skyBottomColor = color(40, 80, 160);
    } else { // Dusk/night
        skyTopColor = color(30, 40, 80);
        skyBottomColor = color(10, 20, 50);
    }

    let skyImg = createGraphics(width, height/2);

    for (let y = 0; y < skyImg.height; y++) {
        let inter = map(y, 0, skyImg.height, 0, 1);
        let c = lerpColor(skyTopColor, skyBottomColor, inter);
        skyImg.stroke(c);
        skyImg.line(0, y, skyImg.width, y);
    }

    sky = skyImg;
}

// Calculate garden health based on plant health
function updateGardenHealth() {
    if (plants.length === 0) {
        gardenHealth = 100; // Default for empty garden
        return;
    }

    let totalHealth = 0;
    for (let plant of plants) {
        totalHealth += plant.health;
    }

    gardenHealth = totalHealth / plants.length;

    // Ensure garden health is never displayed as 0 if there are plants
    if (gardenHealth < 1) {
        gardenHealth = 1; // Minimum 1% health if there are plants
    }
}

function findSuitablePlantPosition(minDistance = 80, maxAttempts = 20) {
    // Define planting area bounds - only in the soil area
    const plantingAreaTop = height * 0.6;
    const plantingAreaBottom = height - uiPanelHeight - 20;

    // Try using mouse position if in the garden
    if (mouseX > 0 && mouseY > plantingAreaTop && mouseY < plantingAreaBottom) {
        if (!isTooCloseToOtherPlants(mouseX, mouseY, minDistance)) {
            return { x: mouseX, y: mouseY };
        }
    }

    // If mouse position doesn't work, try random positions
    let attempts = 0;
    while (attempts < maxAttempts) {
        let x = random(width * 0.1, width * 0.9);
        let y = random(plantingAreaTop, plantingAreaBottom);

        if (!isTooCloseToOtherPlants(x, y, minDistance)) {
            return { x: x, y: y };
        }

        attempts++;
    }

    // If we still can't find a good position, use a position with the largest minimum distance
    let bestPosition = { x: width/2, y: (plantingAreaTop + plantingAreaBottom)/2 };
    let maxMinDistance = 0;

    for (let i = 0; i < 10; i++) {
        let x = random(width * 0.1, width * 0.9);
        let y = random(plantingAreaTop, plantingAreaBottom);
        let minDist = Infinity;

        for (let plant of plants) {
            let d = dist(x, y, plant.x, plant.y);
            if (d < minDist) minDist = d;
        }

        if (minDist > maxMinDistance) {
            maxMinDistance = minDist;
            bestPosition = { x: x, y: y };
        }
    }

    return bestPosition;
}

function isTooCloseToOtherPlants(x, y, minDistance = 80) {
    for (let plant of plants) {
        let d = dist(x, y, plant.x, plant.y);
        if (d < minDistance) {
            return true; // Position is too close
        }
    }
    return false; // Position is safe
}


function addNewPlant(moisture, light, forceDiversity = false) {
    // Find suitable position that doesn't overlap with existing plants
    let position = findSuitablePlantPosition();
    let x = position.x;
    let y = position.y;

    // Determine plant type based on environmental conditions
    let type;

    if (forceDiversity) {
        // Count existing plant types
        let bassCount = plants.filter(p => p.type === 0).length;
        let melodyCount = plants.filter(p => p.type === 1).length;
        let harmonyCount = plants.filter(p => p.type === 2).length;

        // Ensure at least one of each type
        if (bassCount === 0) {
            type = 0;
        } else if (melodyCount === 0) {
            type = 1;
        } else if (harmonyCount === 0) {
            type = 2;
        } else {
            // Choose based on environmental conditions if we have all types
            if (light > 700 && moisture < 400) {
                type = 1; // Melody plants prefer high light, lower moisture
            } else if (moisture > 700 && light < 400) {
                type = 0; // Bass plants prefer high moisture, lower light
            } else {
                type = 2; // Harmony plants prefer balanced conditions
            }
        }
    } else {
        // Environmental conditions determine plant type
        if (light > 700 && moisture < 400) {
            type = 1; // Melody plants prefer high light, lower moisture
        } else if (moisture > 700 && light < 400) {
            type = 0; // Bass plants prefer high moisture, lower light
        } else {
            type = 2; // Harmony plants prefer balanced conditions
        }
    }

    // Create and add just one new plant
    let newPlant = new Plant(x, y, type);
    plants.push(newPlant);

    // Send LED feedback to Arduino
    sendLED(true);
    setTimeout(() => sendLED(false), 500); // Turn off after 500ms

    // Return the plant that was added
    return newPlant;
}

// Update the initial plant creation in startGarden() function
function startGarden() {
    currentScene = "garden";

    // Reset plant tracking
    plants = [];

    // Start with one of each plant type, well-spaced
    let positions = [
        width * 0.25,
        width * 0.5,
        width * 0.75
    ];

    // Create a bass plant (tree)
    let bassPlant = new Plant(positions[0], height * 0.75 + random(-30, 30), 0);
    plants.push(bassPlant);

    // Create a melody plant (flower)
    let melodyPlant = new Plant(positions[1], height * 0.75 + random(-30, 30), 1);
    plants.push(melodyPlant);

    // Create a harmony plant (herb/small plant)
    let harmonyPlant = new Plant(positions[2], height * 0.75 + random(-30, 30), 2);
    plants.push(harmonyPlant);

    // Start the audio
    if (Tone.context.state !== "running") {
        Tone.start();
    }
    Tone.Transport.start();
    isAudioInitialized = true;
}




function initializeAudio() {
    // Initialize background ambient sound
    backgroundSynth = new Tone.PolySynth(Tone.AMSynth).toDestination();
    backgroundSynth.volume.value = -20;

    // Add soft ambient pad in the background
    let ambientLoop = new Tone.Loop(time => {
        // Play a soft C major chord
        backgroundSynth.triggerAttackRelease(["C3", "E3", "G3"], "4n", time, 0.1);
    }, "8m").start(0); // Very slow rhythm

    Tone.start();
    isAudioInitialized = true;
}

function updateUIVisibility() {
    // Show/hide UI elements based on current scene
    if (currentScene === "welcome") {
        startButton.show();
        infoButton.show();
        backButton.hide();
        connectButton.show();
    } else if (currentScene === "info") {
        startButton.hide();
        infoButton.hide();
        backButton.show();
        connectButton.show();
    } else if (currentScene === "garden") {
        startButton.hide();
        infoButton.hide();
        backButton.show();
        connectButton.show();
    }
}

// Handle window resizing
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    updateUIVisibility();

    // Update button positions
    startButton.position(width/2 - 100, height/2 + 100);
    infoButton.position(width/2 - 100, height/2 + 150);
    backButton.position(50, height - 80);

    // Update gradients
    soil = createSoilGradient();
    sky = createSkyGradient();
}

// For simulation without arduino - using mouse as joystick
function mouseDragged() {
    if (!getConnectionStatus().isConnected) {
        // Calculate distance from center of screen
        let centerX = width / 2;
        let centerY = height / 2;

        // Limit the drag range to a circle
        let dx = mouseX - centerX;
        let dy = mouseY - centerY;
        let distance = sqrt(dx*dx + dy*dy);
        let maxDistance = 300; // Maximum joystick range

        if (distance > maxDistance) {
            dx = dx * maxDistance / distance;
            dy = dy * maxDistance / distance;
        }

        // Map to moisture and light values
        let simulatedLight = map(dx, -maxDistance, maxDistance, 0, 1023);
        let simulatedMoisture = map(dy, -maxDistance, maxDistance, 0, 1023);

        // Update the values
        moisture = constrain(simulatedMoisture, 0, 1023);
        light = constrain(simulatedLight, 0, 1023);

        // Update gradients
        updateSoilGradient(moisture);
        updateSkyGradient(light);
    }
}

function mousePressed() {
    // Only allow planting in garden mode and if not connected to Arduino
    if (currentScene === "garden" && !getConnectionStatus().isConnected) {
        // Get current sensor values
        let sensorValues = getSensorValues();

        // Check if we're clicking in the planting area (lower half of screen)
        if (mouseY > height/2 && mouseY < height - uiPanelHeight) {
            // Add just one plant at the mouse position
            addNewPlant(sensorValues.moisture, sensorValues.light, true);
        }
    }
}

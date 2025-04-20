// p5.js sketch for Arduino communication

let port;
let connectButton;
let ledState = false;
let sensorValue = 0;
let maxSensorValue = 1023; // Arduino analog reads are 0-1023
let statusText = "Not connected";

function setup() {
    createCanvas(600, 400);

    // Create a button to connect to the serial port
    connectButton = createButton('Connect to Arduino');
    connectButton.position(10, 10);
    connectButton.mousePressed(connectToArduino);

    // Create text for instructions
    textSize(16);
    textAlign(CENTER, CENTER);
}

function draw() {
    // Map sensor value to background color (0-255)
    let bgValue = map(sensorValue, 0, maxSensorValue, 50, 200);
    background(bgValue, 150, 255 - bgValue);

    // Draw LED indicator
    fill(0);
    text("Click anywhere to toggle LED", width/2, 50);

    // Draw LED status
    fill(ledState ? color(255, 255, 0) : color(50));
    ellipse(width/2, height/2, 100, 100);
    fill(0);
    text(ledState ? "LED ON" : "LED OFF", width/2, height/2);

    // Display connection status
    fill(0);
    text(statusText, width/2, height - 50);

    // Show sensor value
    text("Sensor value: " + sensorValue, width/2, height - 80);
}

function mousePressed() {
    // Only toggle if not clicking on the connect button and if connected
    if (port && port.readable &&
        !(mouseX >= connectButton.x && mouseX <= connectButton.x + connectButton.width &&
            mouseY >= connectButton.y && mouseY <= connectButton.y + connectButton.height)) {

        // Toggle LED state
        ledState = !ledState;

        // Send command to Arduino
        if (port.writable) {
            const writer = port.writable.getWriter();
            // Send '1' for on, '0' for off
            writer.write(new Uint8Array([ledState ? 49 : 48])); // ASCII '1' or '0'
            writer.releaseLock();
        }
    }
}

async function connectToArduino() {
    try {
        // Request a serial port
        port = await navigator.serial.requestPort();

        // Open the port with the same baudrate as Arduino
        await port.open({ baudRate: 9600 });
        statusText = "Connected to Arduino";

        // Set up the reading loop
        readSerialData();

    } catch (error) {
        statusText = "Connection failed: " + error.message;
        console.error('Error connecting to Arduino:', error);
    }
}

async function readSerialData() {
    while (port && port.readable) {
        const reader = port.readable.getReader();

        try {
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();

                if (done) {
                    break;
                }

                // Convert the received bytes to string
                const textDecoder = new TextDecoder();
                const text = textDecoder.decode(value);
                buffer += text;

                // Process complete messages
                let lineBreakIndex;
                while ((lineBreakIndex = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.substring(0, lineBreakIndex).trim();
                    buffer = buffer.substring(lineBreakIndex + 1);

                    processMessage(line);
                }
            }
        } catch (error) {
            console.error('Error reading from serial port:', error);
        } finally {
            reader.releaseLock();
        }
    }
}

function processMessage(message) {
    // Process incoming messages from Arduino
    if (message.startsWith('SENSOR:')) {
        // Update sensor value
        const value = parseInt(message.substring(7));
        if (!isNaN(value)) {
            sensorValue = value;
        }
    } else if (message === 'LED:ON') {
        ledState = true;
    } else if (message === 'LED:OFF') {
        ledState = false;
    }
}


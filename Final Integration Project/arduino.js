// Arduino connection and communication functions
let port;
let connectButton;
let statusText = "Not connected";
let isConnected = false;

// Sensor values from Arduino
let moisture = 500; // Default midpoint value
let light = 500; // Default midpoint value
let planting = false;

// Create the connection button
function setupArduinoConnection() {
    connectButton = createButton('Connect to Arduino');
    connectButton.position(10, 25);
    connectButton.mousePressed(connectToArduino);

    return connectButton;
}

// Connect to the Arduino
async function connectToArduino() {
    try {
        // Request a serial port
        port = await navigator.serial.requestPort();

        // Open the port with the same baudrate as Arduino
        await port.open({ baudRate: 9600 });
        statusText = "Connected to Arduino";
        isConnected = true;

        // Set up the reading loop
        readSerialData();

    } catch (error) {
        statusText = "Connection failed: " + error.message;
        console.error('Error connecting to Arduino:', error);
        isConnected = false;
    }
}

// Continuously read data from Arduino
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

// Process messages received from Arduino
function processMessage(message) {
    // Parse the incoming Arduino data
    // Format expected: moisture,light,planting
    let data = message.split(',');
    if (data.length === 3) {
        moisture = parseInt(data[0]);
        light = parseInt(data[1]);
        planting = (parseInt(data[2]) === 1);
    }
}

// Send LED commands to Arduino
async function sendLED(state) {
    if (!port || !port.writable) {
        console.error('Serial port is not writable');
        return;
    }

    const writer = port.writable.getWriter();

    try {
        // Send a command to Arduino
        // 'L1' to turn LED on, 'L0' to turn it off
        const data = new TextEncoder().encode(state ? 'L1' : 'L0');
        await writer.write(data);
    } catch (error) {
        console.error('Error writing to serial port:', error);
    } finally {
        writer.releaseLock();
    }
}

// Get the current sensor values
function getSensorValues() {
    return {
        moisture: moisture,
        light: light,
        planting: planting
    };
}

// Get connection status
function getConnectionStatus() {
    return {
        isConnected: isConnected,
        statusText: statusText
    };
}

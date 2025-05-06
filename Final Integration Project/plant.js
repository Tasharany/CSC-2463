// Plant class to handle individual plant instances
class Plant {
    constructor(x, y, type) {
        // Position
        this.x = x;
        this.y = y;

        // Plant characteristics
        this.type = type; // 0: bass, 1: melody, 2: harmony
        this.growthStage = 0;
        this.maxGrowthStage = 7; // 8 frames total (0-7)
        this.health = 100;
        this.growthRate = 0.02;

        // Add planting animation properties
        this.isNew = true;
        this.plantingEffectSize = 50;
        this.plantingEffectAlpha = 255;

        // Determine which plant type to use based on musical type
        this.plantType = this.determinePlantType();

        // Other properties
        this.lastPlayedTime = 0;
        this.playInterval = 2000 + (type * 1000);
        this.size = 1.5;
        this.rotation = random(-0.1, 0.1);
        this.sizeVariation = random(0.9, 1.3);

        // Audio components
        this.initSound();
    }


    determinePlantType() {
        switch(this.type) {
            case 0: // Bass plants - ensure we're using trees (indices 6-7)
                // Get a random number between 6 and 7 inclusively
                return floor(random(6, 8)); // Equivalent to either 6 or 7

            case 1: // Melody plants - use flowers (indices 1, 3, 4)
                let melodyTypes = [1, 3, 4];
                return melodyTypes[floor(random(melodyTypes.length))];

            case 2: // Harmony plants - use small plants (indices 0, 2, 5)
                let harmonyTypes = [0, 2, 5];
                return harmonyTypes[floor(random(harmonyTypes.length))];

            default:
                return 0;
        }
    }



    initSound() {
        // Different synth setup based on plant type
        switch(this.type) {
            case 0: // Bass plants (Trees)
                // Create a rich, deep bass sound
                this.synth = new Tone.MonoSynth({
                    oscillator: {
                        type: "sine4" // Rich sine wave with harmonics
                    },
                    envelope: {
                        attack: 0.2,
                        decay: 0.3,
                        sustain: 0.8,
                        release: 1.5
                    },
                    filterEnvelope: {
                        attack: 0.1,
                        decay: 0.7,
                        sustain: 0.2,
                        release: 2.0,
                        baseFrequency: 200,
                        octaves: 2.5
                    }
                }).toDestination();

                // Add effects for bass
                this.filter = new Tone.Filter(400, "lowpass").toDestination();
                this.synth.connect(this.filter);

                // Deep, resonant notes for bass plants
                this.notes = ["C2", "G2", "A#2", "D3", "F2", "A2"];
                this.playInterval = 3500 + random(500); // Slower interval for bass
                break;

            case 1: // Melody plants (Flowers)
                // Create a bright, bell-like sound
                if (this.plantType === 3 || this.plantType === 4) { // Yellow or pink flowers
                    // Use FMSynth for brighter tones
                    this.synth = new Tone.FMSynth({
                        harmonicity: 3,
                        modulationIndex: 10,
                        oscillator: {
                            type: "sine"
                        },
                        envelope: {
                            attack: 0.01,
                            decay: 0.2,
                            sustain: 0.2,
                            release: 0.5
                        },
                        modulation: {
                            type: "triangle"
                        },
                        modulationEnvelope: {
                            attack: 0.2,
                            decay: 0.01,
                            sustain: 0.2,
                            release: 0.5
                        }
                    }).toDestination();
                } else {
                    // Use AMSynth for other flowers
                    this.synth = new Tone.AMSynth({
                        harmonicity: 2,
                        oscillator: {
                            type: "triangle"
                        },
                        envelope: {
                            attack: 0.03,
                            decay: 0.3,
                            sustain: 0.2,
                            release: 0.6
                        },
                        modulation: {
                            type: "square"
                        },
                        modulationEnvelope: {
                            attack: 0.01,
                            decay: 0.5,
                            sustain: 0.2,
                            release: 0.1
                        }
                    }).toDestination();
                }

                // Add effects for melody
                this.delay = new Tone.FeedbackDelay("8n", 0.3).toDestination();
                this.synth.connect(this.delay);

                // Higher, melodic notes
                this.notes = ["E4", "G4", "B4", "C5", "D5", "F#5", "A5"];
                this.playInterval = 2000 + random(500); // Medium interval for melody
                break;

            case 2: // Harmony plants (Small plants/herbs)
                // Create chord-like sounds
                this.synth = new Tone.PolySynth(Tone.Synth, {
                    oscillator: {
                        type: "sine"
                    },
                    envelope: {
                        attack: 0.05,
                        decay: 0.1,
                        sustain: 0.3,
                        release: 1.0
                    }
                }).toDestination();

                // Add effects for harmony
                this.reverb = new Tone.Reverb(1.5).toDestination();
                this.synth.connect(this.reverb);

                // Middle-range notes for harmony plants
                this.notes = ["A3", "C4", "E4", "G3", "B3", "D4"];
                this.playInterval = 2800 + random(400); // Variable interval for harmony
                break;
        }

        // Adjust volume based on plant type
        switch(this.type) {
            case 0: // Bass plants are a bit louder
                this.volume = -24;
                break;
            case 1: // Melody plants are medium volume
                this.volume = -15;
                break;
            case 2: // Harmony plants are softer
                this.volume = -18;
                break;
        }

        // Set the volume
        this.synth.volume.value = this.volume;
    }


    grow(moisture, light) {
        // Update growth based on environmental conditions
        if (this.growthStage < 6) { // Maximum growth is stage 6 (not 7)
            // Calculate ideal growing conditions based on plant type
            let idealMoisture, idealLight;

            switch(this.type) {
                case 0: // Bass plants like more moisture, low light
                    idealMoisture = 700;
                    idealLight = 400;
                    break;
                case 1: // Melody plants like more light, less moisture
                    idealMoisture = 300;
                    idealLight = 800;
                    break;
                case 2: // Harmony plants like balanced conditions
                    idealMoisture = 500;
                    idealLight = 500;
                    break;
            }

            // Calculate growth factor based on how close conditions are to ideal
            let moistureFactor = 1 - abs(moisture - idealMoisture) / 1023;
            let lightFactor = 1 - abs(light - idealLight) / 1023;

            // Plants grow best when conditions match their preferences
            let growthFactor = this.growthRate * moistureFactor * lightFactor * 2;
            this.growthStage += growthFactor;

            // Cap growth at maximum (stage 6)
            this.growthStage = constrain(this.growthStage, 0, 6);
        }

    // Update health based on conditions
        let idealMoisture = 500; // Middle value
        let moistureDiff = abs(moisture - idealMoisture) / 1023;

        let idealLight = 700; // Slightly bright
        let lightDiff = abs(light - idealLight) / 1023;

        // Health decreases if conditions are far from ideal
        this.health -= (moistureDiff + lightDiff) * 0.5;
        this.health = constrain(this.health, 1, 100); // Min health is 1

        // Make plant size respond to health
        this.size = map(this.health, 0, 100, 0.7, 1) * this.sizeVariation;
    }
    getSpritePosition() {
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

        // Get the base position for this plant type
        let basePosition = startPositions[this.plantType];

        // Calculate the row and column based on growth stage
        // Map growth stage to the actual sprite position
        let stage = Math.floor(this.growthStage);
        let rowOffset, colOffset;

        switch(stage) {
            case 0:
                rowOffset = 0; colOffset = 0;
                break;
            case 1:
                rowOffset = 0; colOffset = 1;
                break;
            case 2:
                rowOffset = 1; colOffset = 0;
                break;
            case 3:
                rowOffset = 1; colOffset = 1;
                break;
            case 4:
                rowOffset = 2; colOffset = 0;
                break;
            case 5:
                rowOffset = 2; colOffset = 1;
                break;
            case 6: // Fully grown stage
            case 7: // Cap at fully grown
                rowOffset = 3; colOffset = 0;
                break;
            default:
                rowOffset = 0; colOffset = 0;
        }

        // Return the sprite position
        return {
            x: (basePosition.col + colOffset) * SPRITE_SIZE,
            y: (basePosition.row + rowOffset) * SPRITE_SIZE
        };
    }
    playSound() {
        // Only play if enough time has passed
        if (millis() - this.lastPlayedTime > this.playInterval) {
            // Get a random note from the plant's available notes
            let note = this.notes[floor(random(this.notes.length))];

            // Modify note based on health and growth
            let detune = map(this.health, 0, 100, -200, 200);

            // Different sound behaviors based on plant type
            switch(this.type) {
                case 0: // Bass plants
                        // Bass plants play single low notes
                    this.synth.triggerAttackRelease(note, "2n");
                    break;

                case 1: // Melody plants
                        // Melody plants play single notes with longer decay
                    if (this.health > 70) {
                        // Healthy melody plants might play two notes in sequence
                        this.synth.triggerAttackRelease(note, "8n");

                        // Sometimes play a second note after a delay
                        if (random() < 0.3) {
                            setTimeout(() => {
                                let secondNote = this.notes[floor(random(this.notes.length))];
                                this.synth.triggerAttackRelease(secondNote, "8n");
                            }, 150 + random(100));
                        }
                    } else {
                        this.synth.triggerAttackRelease(note, "8n");
                    }
                    break;

                case 2: // Harmony plants
                        // Harmony plants can play chords
                    if (random() < 0.7 || this.health < 50) {
                        // Most of the time, play a single note
                        this.synth.triggerAttackRelease(note, "4n");
                    } else {
                        // Sometimes play a chord
                        let chordType = random() < 0.5 ? "4" : "M"; // Minor or major
                        let chordRoot = this.notes[floor(random(this.notes.length))];
                        this.synth.triggerAttackRelease([
                            chordRoot,
                            Tone.Frequency(chordRoot).transpose(chordType === "4" ? 3 : 4).toNote(),
                            Tone.Frequency(chordRoot).transpose(7).toNote()
                        ], "4n");
                    }
                    break;
            }

            // Update the last played time
            this.lastPlayedTime = millis();
        }
    }


    display() {
        push();
        translate(this.x, this.y);

        // Draw planting effect if this is a new plant
        if (this.isNew) {
            noFill();
            stroke(150, 255, 150, this.plantingEffectAlpha);
            strokeWeight(2);
            ellipse(0, 0, this.plantingEffectSize, this.plantingEffectSize);

            // Update planting effect
            this.plantingEffectSize += 2;
            this.plantingEffectAlpha -= 10;

            // Remove effect after it fades out
            if (this.plantingEffectAlpha <= 0) {
                this.isNew = false;
            }
        }
        // Apply slight rotation for variety
        rotate(this.rotation);

        // Scale based on health and growth - increased overall size
        scale(this.size * 1.5); // Make plants 50% larger

        // Draw the plant using sprite sheet
        this.drawSprite();

        // Draw health indicator and plant type indicator
        this.drawHealthIndicator();
        this.drawPlantTypeIndicator();

        pop();
    }


    drawSprite() {
        // Get sprite position
        let spritePos = this.getSpritePosition();

        // Draw the sprite
        let displaySize = SPRITE_SIZE * 3;

        // Add slight animation/movement
        let offsetY = sin(frameCount * 0.05) * 2;

        // Tint based on health
        let alpha = map(this.health, 0, 100, 100, 255);
        tint(255, alpha);

        // Draw the sprite
        image(
            spriteSheet,
            0, // Center x
            offsetY - displaySize/2, // Center y with movement
            displaySize, // Width
            displaySize, // Height
            spritePos.x, // Source x
            spritePos.y, // Source y
            SPRITE_SIZE, // Source width
            SPRITE_SIZE // Source height
        );

        noTint();
    }



    drawHealthIndicator() {
        // Small health indicator at the bottom
        noStroke();

        // Position below the plant
        let indicatorY = 30;

        // Background
        fill(0, 0, 0, 0.5);
        rect(-15, indicatorY, 30, 4, 2);

        // Health level
        if (this.health > 70) {
            fill(0, 255, 0); // Green
        } else if (this.health > 40) {
            fill(255, 255, 0); // Yellow
        } else {
            fill(255, 0, 0); // Red
        }

        let healthWidth = map(this.health, 0, 100, 0, 28);
        rect(-14, indicatorY + 1, healthWidth, 2, 1);
    }

    // New method to show plant type
    drawPlantTypeIndicator() {
        noStroke();
        let indicatorY = 38;

        // Plant type indicator
        let typeColor;
        let typeName;

        switch(this.type) {
            case 0: // Bass
                typeColor = color(30, 100, 200); // Blue
                typeName = "B";
                break;
            case 1: // Melody
                typeColor = color(200, 50, 150); // Pink
                typeName = "M";
                break;
            case 2: // Harmony
                typeColor = color(100, 200, 50); // Green
                typeName = "H";
                break;
        }

        // Draw indicator circle with shadow for better visibility
        fill(0, 0, 0, 100);
        ellipse(1, indicatorY + 1, 12, 12);

        fill(typeColor);
        ellipse(0, indicatorY, 12, 12);

        // Draw text
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(8);
        text(typeName, 0, indicatorY);
    }
}

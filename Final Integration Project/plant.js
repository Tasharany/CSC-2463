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
            case 0: // Bass plant

                this.synth = new Tone.MonoSynth({
                    oscillator: {
                        type: "sine"
                    },
                    envelope: {
                        attack: 0.1,
                        decay: 0.3,
                        sustain: 0.4,
                        release: 0.8
                    },
                    filterEnvelope: {
                        attack: 0.01,
                        decay: 0.7,
                        sustain: 0.1,
                        release: 0.8,
                        baseFrequency: 300,
                        octaves: 4
                    }
                }).toDestination();

                // Add effects
                this.filter = new Tone.Filter(800, "lowpass").toDestination();
                this.synth.connect(this.filter);

                // Notes in the key of C for bass plants (lower octave)
                this.notes = ["C2", "E2", "G2", "A2", "C3"];
                break;

            case 1: // Melody plant
                this.synth = new Tone.FMSynth({
                    harmonicity: 3,
                    modulationIndex: 10,
                    oscillator: {
                        type: "triangle"
                    },
                    envelope: {
                        attack: 0.01,
                        decay: 0.2,
                        sustain: 0.2,
                        release: 0.3
                    },
                    modulation: {
                        type: "square"
                    },
                    modulationEnvelope: {
                        attack: 0.5,
                        decay: 0.1,
                        sustain: 0.2,
                        release: 0.5
                    }
                }).toDestination();

                // Add reverb effect
                this.reverb = new Tone.Reverb(1.5).toDestination();
                this.synth.connect(this.reverb);

                // Notes in the key of C for melody plants (middle octave)
                this.notes = ["C4", "D4", "E4", "G4", "A4", "C5"];
                break;

            case 2: // Harmony plant
                this.synth = new Tone.PolySynth(Tone.AMSynth).toDestination();

                // Add chorus effect
                this.chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination();
                this.synth.connect(this.chorus);

                // Chord notes in the key of C
                this.notes = [
                    ["C3", "E3", "G3"], // C major
                    ["A2", "C3", "E3"], // A minor
                    ["F3", "A3", "C4"], // F major
                    ["G3", "B3", "D4"]  // G major
                ];
                break;
        }
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
        if (!Tone.Transport.state === "started") return;

        let currentTime = millis();
        // Play sound based on growth stage and health
        if (currentTime - this.lastPlayedTime > this.playInterval) {
            this.lastPlayedTime = currentTime;

            // Adjust volume based on health
            let volume = map(this.health, 0, 100, -30, -15);
            this.synth.volume.value = volume;

            // Plants make sound only when they reach a certain growth stage
            if (this.growthStage > 1) {
                // Select note based on growth stage
                let noteIndex = floor(map(this.growthStage, 1, this.maxGrowthStage, 0, this.notes.length - 1));

                // Play different patterns based on plant type
                switch(this.type) {
                    case 0: // Bass plant - single notes
                        this.synth.triggerAttackRelease(
                            this.notes[noteIndex],
                            "8n"
                        );
                        break;

                    case 1: // Melody plant - sequence of notes
                        if (this.growthStage > 2) {
                            // More complex pattern for mature plants
                            this.synth.triggerAttackRelease(
                                this.notes[noteIndex],
                                "16n"
                            );
                            // Schedule another note
                            setTimeout(() => {
                                let nextIndex = (noteIndex + 2) % this.notes.length;
                                this.synth.triggerAttackRelease(
                                    this.notes[nextIndex],
                                    "8n"
                                );
                            }, 200);
                        } else {
                            // Simple pattern for young plants
                            this.synth.triggerAttackRelease(
                                this.notes[noteIndex],
                                "8n"
                            );
                        }
                        break;

                    case 2: // Harmony plant - chords
                        // Play chord
                        this.synth.triggerAttackRelease(
                            this.notes[noteIndex],
                            "2n"
                        );
                        break;
                }

                // Modulate filter cutoff based on light for bass plants
                if (this.type === 0 && this.filter) {
                    let cutoff = map(light, 0, 1023, 200, 2000);
                    this.filter.frequency.rampTo(cutoff, 0.5);
                }
            }
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

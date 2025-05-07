[ Rhythm Garden Documentation ]

![Welcome Screen](https://github.com/user-attachments/assets/57ebd82f-b070-4791-a1cf-5bbc1dcbcbd8)

 Project Overview

Rhythm Garden is an interactive musical ecosystem where you grow a garden of plants that each contribute their unique sounds to create an evolving musical composition. The garden responds to real-world environmental conditions through Arduino sensors, creating a bridge between the physical and digital realms.

In this immersive audio-visual experience, plants grow, flourish, and create music based on light and moisture conditions. Each plant type serves a different musical role, and as they grow through various life stages, both their appearance and sound evolve.

 The Experience

When you first open Rhythm Garden, you're presented with an empty plot of soil beneath a dynamic sky. Using either the on-screen controls or a physical button connected to an Arduino, you plant seeds that grow into three distinct types of musical plants:

1. Bass Plants (Trees) - Provide deep, foundational tones
2. Melody Plants (Flowers) - Create bright, higher-pitched melodies
3. Harmony Plants (Small Herbs) - Fill in with middle-range notes

As you nurture your garden, a generative musical composition emerges. The composition continuously evolves as plants grow, respond to environmental conditions, and interact with each other. The result is an ever-changing soundscape that reflects the state and composition of your garden.

 How It Works

 Visual System

Plants in Rhythm Garden are brought to life through sprite animation. Each plant type has 8 distinct growth frames arranged in a sprite sheet. As plants grow, they progress through these frames, creating a smooth visual transition from seedling to mature plant.

![Growth Stages](https://github.com/user-attachments/assets/3fff4dfd-2ea9-433f-880a-84c0ddb104b3)


The garden background responds to environmental conditions:
- The sky changes color based on light levels
- The soil changes color based on moisture levels

 Audio System

The garden's music is generated using the Tone.js library, with different synthesizer types and effects for each plant category:

- Bass Plants: Use MonoSynth with low-pass filters to create deep, resonant tones
- Melody Plants: Use FMSynth or AMSynth with delay effects for bright, bell-like sounds
- Harmony Plants: Use PolySynth with reverb for chord-capable, textural sounds

Each plant plays notes from carefully selected musical scales that complement each other, ensuring the garden always creates harmonious combinations regardless of which plants are playing.

Plants decide when to play based on:
- Their type (bass plants play slower, melody plants faster)
- Their health (healthier plants play more frequently)
- Environmental conditions (affecting tone color and rhythm)

 Physical Computing Integration

![Arduino Setup]
![Screenshot_20250507_175703_Gallery](https://github.com/user-attachments/assets/523d4241-d72c-4000-8a6b-a2827bf5e948)

Rhythm Garden connects to the physical world through an Arduino setup with:

1. Joystick: Changes ambient light, affecting which plants thrive and tonal characteristics and soil moisture, influencing plant growth and sound parameters. It also allows physical planting of new seeds in the garden
2. RGB LED: Provides visual feedback about environmental conditions:
   - Red component indicates moisture levels
   - Blue component indicates light levels
   - Green component shows garden health

 Circuit Setup 

![Circuit Diagrams]
![Screenshot 2025-05-07 181317](https://github.com/user-attachments/assets/31481de8-ddb5-4e2f-930e-6f3066b97cca)
![Screenshot 2025-05-07 181457](https://github.com/user-attachments/assets/9d11bf06-5f7d-417e-bb46-9c2822cfa719)

 Technical Implementation

Rhythm Garden is built using:
- p5.js: For visuals, animation, and overall application structure
- Tone.js: For audio synthesis and effects
- p5.serialport: For communication with Arduino
- Arduino: For physical computing integration

The application runs in a web browser and connects to the Arduino through a serial connection.

 Video Demonstration

[View Rhythm Garden in action][(https://lsumail2-my.sharepoint.com/:v:/g/personal/tscrog1_lsu_edu/EXF7DgxavU5OokIJ56wgYowBFD0d4Qs-48HkyYvhfJXqgA)]

 User Guide

1. Starting the Garden:
   - Open the application and click "Start Garden"
   - Connect to Arduino if using sensors and physical controls

2. Planting:
   - Click in the soil area or press the physical button to plant a new seed
   - The type of plant depends on current environmental conditions:
     - High moisture favors bass plants (trees)
     - High light favors melody plants (flowers)
     - Balanced conditions favor harmony plants (herbs)

3. Influencing Growth:
   - Adjust light and moisture sensors to create different environmental conditions
   - Observe how plants respond to changing conditions

4. Controls:
   - Use the plant type buttons to force specific plant types
   - Click the Reset button to clear the garden and start over

 Future Development

Several enhancements are planned for future iterations of Rhythm Garden:

1. Extended Environmental Factors:
   - Temperature sensor for additional plant variation
   - Barometric pressure for influencing rhythm patterns
   - Air quality affecting audio effects and mixing

2. Enhanced Musical Features:
   - Rhythmic synchronization between plants
   - Additional synthesizer types and effects
   - Musical "seasons" that shift harmonies and scales

3. Collaborative Gardens:
   - Multiple gardens connecting over the internet
   - Plants that can "pollinate" across different gardens
   - Shared environmental conditions between remote systems

4. Machine Learning Integration:
   - Learning optimal environmental conditions for different compositions
   - Adapting to user preferences over time
   - Generating new plant types based on successful combinations

5. Expanded Visualization:
   - Weather effects (rain, wind, sun)
   - Day/night cycles affecting plant behavior
   - Visitor creatures (birds, insects) responding to the garden

 Reflections

Rhythm Garden explores the intersection between technology, nature, and music, creating an immersive experience that invites contemplation of how natural systems can inspire digital creativity.

The emergent properties of the garden—where simple rules create complex, beautiful outcomes—mirror many natural phenomena. As plants grow and contribute their voices, unpredictable yet harmonious patterns emerge, creating a unique musical composition with each planting session.

The physical computing aspect grounds the digital experience in the real world, allowing participants to engage with the garden through tangible interactions and real environmental conditions.

 Project Credits

Rhythm Garden was developed as part of [CSC 2463] at [LSU].

Assets:
- Sound synthesis using Tone.js library
- p5.js for visual rendering and animation

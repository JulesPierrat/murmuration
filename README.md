# Murmuration

Murmuration is an interactive web interface based on WebGL that simulates flocks of birds (boids) moving in dynamic environments. The simulation reacts in real time to sound input (microphone or MIDI) and features advanced scene management.

## Main Features

- **Boids simulation**: Birds move according to boids algorithms, reproducing realistic collective behaviors.
- **Dynamic scene management**:
	- Load scenes from JSON files.
	- Each scene describes a group of birds and an associated environment.
	- Smooth transitions between different scenes.
- **Sound control**:
	- Bird movements and behaviors react in real time to sound input (microphone or MIDI).
- **Admin interface**:
	- Switch scenes on the fly.
	- Control sound inputs.
	- Trigger events on bird groups or the environment via clicks in the admin interface.

## Usage

1. **Loading scenes**:
	 - Scenes are defined in JSON files, including the configuration of bird groups and the environment.
	 - The interface allows easy loading and switching between scenes.

2. **Real-time control**:
	 - Users can interact with the interface to change scenes, control audio inputs, or trigger specific events.

3. **Sound reactivity**:
	 - Bird behaviors and some environment elements react to the captured sound environment (microphone or MIDI).

## Goals

- Provide an immersive and interactive visual experience inspired by the phenomenon of murmuration (synchronized bird flight).
- Allow advanced customization of scenes and interactions, suitable for both artistic installations and technical demonstrations.

## Coming soon

- Technical documentation on the structure of scene JSON files.
- Tutorial for adding new scenes and customizing behaviors.

---
Project developed by Jules Pierrat.

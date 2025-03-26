# 🔥/❄️ Nav: The Hot or Cold Distance Tracker

## Overview

Ever played the "Hot or Cold" game as a kid? Well, this is it, but with a *geographical* twist! 🔥/❄️ Nav is a fun web app that tells you how close you are to a destination you choose. The catch? It doesn't show you the *direction*, just the *distance*. And to make things even more interesting, it gives you "hot" or "cold" visual cues as you get closer or further from your target!

## How it Works

1.  **Pick a Spot:** Type in any location in the world (thanks to Google Maps integration).
2.  **Start Tracking:** Hit the "Start Tracking" button.
3.  **Get Moving:** Start walking, running, driving, or even flying! The app will track your distance from the chosen destination.
4.  **Feel the Heat (or Cold):**
    *   Getting closer? The button turns fiery red! 🔥
    *   Moving away? You'll see a chilly blue. ❄️
    *   The distance updates in real-time, with smooth animations.
    *   Visual feedback fades after 10 seconds of inactivity.

## Features

*   **Smart Location Services:**
    *   Automatic retry mechanism for location initialization
    *   Graceful fallback to lower accuracy if high accuracy fails
    *   Intelligent error handling with user-friendly messages
*   **Responsive Design:**
    *   Adapts beautifully to all screen sizes
    *   Optimized for both portrait and landscape orientations
    *   Smooth animations and transitions
*   **Enhanced User Experience:**
    *   Real-time distance updates with smooth number animations
    *   Intelligent temperature-based color transitions
    *   Clear visual feedback for all user actions
*   **Robust Error Handling:**
    *   Comprehensive location service error management
    *   Clear user feedback for all potential issues
    *   Graceful degradation when services are unavailable

## Technical Details

*   **Frontend Stack:**
    *   HTML5 with modern semantic markup
    *   CSS3 with custom properties and responsive design
    *   Vanilla JavaScript with modern ES6+ features
*   **Dependencies:**
    *   Bulma CSS Framework (v0.9.4): For clean, responsive styling
    *   Google Maps JavaScript API:
        *   Places library: For location search and autocomplete
        *   Geometry library: For accurate distance calculations
        *   Marker library: For enhanced location features
*   **Key Technologies:**
    *   Geolocation API with high-accuracy support
    *   Google Maps Places Autocomplete
    *   Spherical geometry for precise distance calculations

## Getting Started

1.  Clone the repository
2.  Add your Google Maps API key in `config.js`
3.  Open `index.html` in a modern browser
4.  Grant location permissions when prompted
5.  Start exploring!


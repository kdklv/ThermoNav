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
    *   The distance updates in real-time, with a smooth animation.

## Core Concepts

*   **Geolocation:** The app uses your browser's geolocation API to pinpoint your current location. It needs permission to access this, so make sure to allow it!
*   **Google Maps Integration:**  We use the powerful Google Maps Places API for:
    *   **Autocomplete:**  That handy dropdown that helps you find places quickly.
    *   **Distance Calculation:**  Figuring out how far you are from your destination (using spherical geometry, because the Earth is round-ish!).
*   **Real-time Updates:** The app constantly watches your position and updates the distance and visual cues accordingly.
*   **State Management:**  The app keeps track of things like your destination, whether tracking is active, and your previous distance to determine if you're getting "hotter" or "colder."
*    **UI Interactions**: Uses Bulma CSS framework.

## Technical Details

*   **Frontend:** HTML, CSS (with Bulma), and JavaScript.
*   **Dependencies:**
    *   Bulma CSS Framework: For easy styling.
    *   Google Maps JavaScript API: With Places, Geometry, and Marker libraries.

## Getting Started

1.  Open the app in your browser.
2.  Make sure you have an internet connection (for Google Maps).
3.  Grant location permissions when prompted.
4.  Start exploring!

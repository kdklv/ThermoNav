// Configuration and Constants
const CONFIG = {
  MAX_RETRIES: 5,
  RETRY_DELAY: 2000,
  LOCATION_TIMEOUT: 10000,
  ANIMATION_DURATION: 800
};

// State Management
const state = {
  destination: null,
  watchId: null,
  previousDistance: null,
  locationInitialized: false,
  initRetries: 0,
  apiKey: window.GOOGLE_MAPS_API_KEY
};

// DOM Elements Cache
const elements = {
  destination: null,
  startButton: null,
  distanceDisplay: null,
  errorMessage: null
};

// UI Management
const ui = {
  showError: (message) => {
    if (!elements.errorMessage) return;
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.toggle("hidden", !message);
  },

  updateDistance: (distance) => {
    if (!elements.startButton) return;
    animateNumber(
      elements.startButton,
      parseInt(elements.startButton.textContent) || 0,
      Math.round(distance),
      CONFIG.ANIMATION_DURATION
    );
  },

  setTrackingMode: (isTracking) => {
    const { startButton: button, destination } = elements;
    if (!button || !destination) return;

    if (isTracking) {
      button.textContent = "0 meters";
      button.onclick = stopTracking;
      destination.style.display = 'none';
      document.querySelector('label').style.display = 'none';
    } else {
      button.textContent = "Start Tracking";
      button.onclick = startTracking;
      destination.style.display = 'block';
      document.querySelector('label').style.display = 'block';
      resetVisualEffects();
    }
  },

  updateTemperatureEffects: (newDistance) => {
    if (!state.previousDistance) {
      resetVisualEffects();
      return;
    }

    const distanceChange = newDistance - state.previousDistance;
    updateVisualEffects(distanceChange);
  }
};

// Core Location Functions
function calculateDistance(position) {
  if (!state.destination || !google.maps.geometry) return null;

  const userLocation = new google.maps.LatLng(
    position.coords.latitude,
    position.coords.longitude
  );

  return google.maps.geometry.spherical.computeDistanceBetween(
    userLocation,
    state.destination
  );
}

function startTracking() {
  if (!validateTrackingPrerequisites()) return;

  state.watchId = navigator.geolocation.watchPosition(
    handlePositionUpdate,
    handleGeolocationError,
    { 
      enableHighAccuracy: true, 
      timeout: CONFIG.LOCATION_TIMEOUT, 
      maximumAge: 0 
    }
  );

  ui.setTrackingMode(true);
}

function stopTracking() {
  if (state.watchId) {
    navigator.geolocation.clearWatch(state.watchId);
    state.watchId = null;
    state.previousDistance = null;
    ui.setTrackingMode(false);
  }
}

// Event Handlers
function handlePositionUpdate(position) {
  try {
    const distance = calculateDistance(position);
    if (distance !== null) {
      ui.updateDistance(distance);
      ui.updateTemperatureEffects(distance);
      state.previousDistance = distance;
    }
  } catch (error) {
    ui.showError(`Error calculating distance: ${error.message}`);
  }
}

function handleGeolocationError(error) {
  const errorMessages = {
    1: "Location permission denied. Please enable location services.",
    2: "Location information unavailable.",
    3: "Location request timed out.",
    default: "An error occurred while getting your location."
  };

  ui.showError(errorMessages[error.code] || errorMessages.default);
}

// Helper Functions
function resetVisualEffects() {
  document.body.className = '';
  if (elements.startButton) {
    elements.startButton.style = '';
    elements.startButton.className = 'button is-primary';
  }
}

function updateVisualEffects(distanceChange) {
  const button = elements.startButton;
  if (!button) return;

  button.style.backgroundColor = distanceChange < 0 ? '#ff6b6b' : '#63a4ff';
  button.style.borderColor = distanceChange < 0 ? '#ff5252' : '#1976d2';
  button.style.color = 'white';
}

function animateNumber(element, start, end, duration) {
  const startTime = performance.now();
  const difference = end - start;
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = Math.round(start + (difference * easing));
    
    element.textContent = `${current} m`;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Initialization
function initApp() {
  try {
    cacheElements();
    initAutocomplete();
    ui.showError("Initializing location services...");
    
    initializeLocationServices()
      .then(() => {
        ui.showError("");
        setupEventListeners();
      })
      .catch((error) => {
        console.error("Location services initialization failed:", error);
        ui.showError("Location services unavailable. Please check your device settings and try again.");
      });
  } catch (error) {
    ui.showError(`Error initializing application: ${error.message}`);
  }
}

// Make initApp available globally
window.initApp = initApp;

// Update the setupEventListeners function to handle all event bindings in one place
function setupEventListeners() {
  if (elements.startButton) {
    elements.startButton.onclick = startTracking;
  }

  // Setup single instance of event listeners for PAC container
  const handleResize = () => updatePacContainer();

  // Remove existing listeners before adding new ones
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleResize);

  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleResize);

  handleResize(); // Initial update
}

// Helper functions
function cacheElements() {
  elements.destination = document.getElementById("destination");
  elements.startButton = document.getElementById("startTracking");
  elements.distanceDisplay = document.getElementById("distanceDisplay");
  elements.errorMessage = document.getElementById("errorMessage");

  if (!elements.destination || !elements.startButton || 
      !elements.distanceDisplay || !elements.errorMessage) {
    throw new Error("Required DOM elements not found");
  }
}

// Initialize variables
let autocomplete = null;
let colorUpdateTimeout = null;

// DOM Elements
let distanceElement;

// Initialize Google Maps Autocomplete
function initAutocomplete() {
  try {
    if (!google.maps || !google.maps.places) {
      throw new Error("Google Maps Places API not loaded");
    }

    if (autocomplete) {
      // Autocomplete already initialized, exit to prevent duplicates
      return;
    }

    // Get DOM elements
    elements.destination = document.getElementById("destination");
    if (!elements.destination) {
      throw new Error("Destination input element not found");
    }

    autocomplete = new google.maps.places.Autocomplete(elements.destination, {
      types: ["geocode"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        state.destination = place.geometry.location;
        ui.showError("");
      } else {
        ui.showError("Please select a valid destination from the dropdown.");
      }
    });
  } catch (error) {
    ui.showError("Error initializing Google Maps: " + error.message);
  }
}

// Validate tracking prerequisites
function validateTrackingPrerequisites() {
  if (!state.locationInitialized) {
    ui.showError("Location services initializing... Please try again.");
    initializeLocationServices()
      .then(() => {
        ui.showError("");
        startTracking(); // Retry after initialization
      })
      .catch((error) => {
        ui.showError(`Location services error: ${error.message}`);
      });
    return false;
  }

  if (!state.destination) {
    ui.showError("Please select a destination first.");
    return false;
  }

  if (!navigator.geolocation) {
    ui.showError("Geolocation is not supported by your browser.");
    return false;
  }

  return true;
}

// Add PAC container positioning code from the old inline script
function updatePacContainer() {
  const input = document.getElementById('destination');
  if (!input) return;
  
  const rect = input.getBoundingClientRect();
  document.documentElement.style.setProperty('--pac-width', rect.width + 'px');
  document.documentElement.style.setProperty('--pac-left', rect.left + 'px');
  document.documentElement.style.setProperty('--pac-top', (rect.bottom + window.scrollY) + 'px');
}

// Start the application when the page loads
window.onload = initApp;

function initializeLocationServices() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: state.LOCATION_TIMEOUT,
      maximumAge: 0
    };

    const attemptLocationInit = (retryCount = 0) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          state.locationInitialized = true;
          resolve(position);
        },
        (error) => {
          console.warn(`Location init error (attempt ${retryCount + 1}/${state.MAX_RETRIES}):`, error);
          
          if (retryCount < state.MAX_RETRIES - 1) {
            setTimeout(() => {
              attemptLocationInit(retryCount + 1);
            }, state.RETRY_DELAY);
          } else {
            // If all retries failed, try with lower accuracy
            navigator.geolocation.getCurrentPosition(
              (position) => {
                state.locationInitialized = true;
                resolve(position);
              },
              (finalError) => {
                reject(new Error(`Location unavailable: ${finalError.message}`));
              },
              { enableHighAccuracy: false, timeout: state.LOCATION_TIMEOUT * 2, maximumAge: 30000 }
            );
          }
        },
        options
      );
    };

    attemptLocationInit();
  });
}
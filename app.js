// State management
const state = {
  destination: null,
  watchId: null,
  previousDistance: null,
  locationInitialized: false,
  initRetries: 0,
  MAX_RETRIES: window.appConfig.location.maxRetries,
  RETRY_DELAY: window.appConfig.location.retryDelay,
  LOCATION_TIMEOUT: window.appConfig.location.timeout,
  lastUpdateTime: null,
  colorResetTimeout: null
};

// DOM Elements cache
const elements = {
  destination: null,
  startButton: null,
  distanceDisplay: null,
  errorMessage: null
};

// UI Update functions
const ui = {
  showError: (message) => {
    if (elements.errorMessage) {
      elements.errorMessage.textContent = message;
      elements.errorMessage.classList.toggle("hidden", !message);
    }
  },

  updateDistance: (distance) => {
    if (elements.startButton) {
      animateNumber(elements.startButton, 
        parseInt(elements.startButton.textContent) || 0, 
        Math.round(distance), 
        800);
    }
  },

  setTrackingMode: (isTracking) => {
    const button = elements.startButton;
    if (!button) return;

    if (isTracking) {
      button.textContent = "0 meters";
      button.onclick = stopTracking;
      elements.destination.style.display = 'none';
      document.querySelector('label').style.display = 'none';
    } else {
      button.textContent = "Start Tracking";
      button.onclick = startTracking;
      elements.destination.style.display = 'block';
      document.querySelector('label').style.display = 'block';
      // Reset all visual effects
      document.body.className = '';
      button.style = '';
      button.className = 'button is-primary';
    }
  },

  resetColors: () => {
    document.body.className = '';
    elements.startButton.className = 'button is-primary';
  },

  updateTemperatureEffects: (newDistance) => {
    if (!state.previousDistance) {
      ui.resetColors();
      return;
    }

    const distanceChange = newDistance - state.previousDistance;
    const body = document.body;
    const button = elements.startButton;

    // Clear any existing timeout
    if (state.colorResetTimeout) {
      clearTimeout(state.colorResetTimeout);
    }

    // Remove all temperature classes first
    body.classList.remove('cold-bg', 'warm-bg');
    button.classList.remove('warm', 'cold');

    if (distanceChange < 0) { // Getting closer
      body.classList.add('warm-bg');
      button.classList.add('warm');
    } else { // Getting further
      body.classList.add('cold-bg');
      button.classList.add('cold');
    }

    // Set new timeout to reset colors after 10 seconds
    state.colorResetTimeout = setTimeout(() => {
      ui.resetColors();
    }, 10000);
  }
};

// Core logic functions
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
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
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

// Event handlers
function handlePositionUpdate(position) {
  try {
    const distance = calculateDistance(position);
    if (distance !== null) {
      ui.updateDistance(distance);
      ui.updateTemperatureEffects(distance);
      state.previousDistance = distance;
    }
  } catch (error) {
    ui.showError("Error calculating distance: " + error.message);
  }
}

// Initialize application
function initApp() {
  try {
    cacheElements();
    initAutocomplete();
    
    // Show loading state
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
    ui.showError("Error initializing application: " + error.message);
  }
}

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

function animateNumber(element, start, end, duration = 1000) {
  const startTime = performance.now();
  const difference = end - start;
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = Math.round(start + (difference * easing));
    
    element.textContent = `${current} m`;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

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

// Handle geolocation errors
function handleGeolocationError(error) {
  let message = "An error occurred while getting your location.";

  switch (error.code) {
    case error.PERMISSION_DENIED:
      message = "Location permission denied. Please enable location services.";
      break;
    case error.POSITION_UNAVAILABLE:
      message = "Location information unavailable.";
      break;
    case error.TIMEOUT:
      message = "Location request timed out.";
      break;
  }

  ui.showError(message);
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
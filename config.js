// Configuration settings
const config = {
    // Google Maps API configuration
    googleMaps: {
        apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
        libraries: ['places', 'geometry', 'marker']
    },
    
    // Location tracking settings
    location: {
        maxRetries: 5,
        retryDelay: 2000,
        timeout: 10000
    }
};

// Export the configuration
window.appConfig = config; 
const axios = require('axios');

module.exports.getAddressCoordinate = async (address) => {
    if (!address) {
        throw new Error('Address is required');
    }

    const url = 'https://nominatim.openstreetmap.org/search';

    try {
        const makeRequest = async (includeCountry) => {
            const params = {
                q: address,
                format: 'json',
                addressdetails: 1,
                limit: 1
            };

            if (includeCountry) {
                params.countrycodes = 'in';
            }

            const response = await axios.get(url, {
                params,
                headers: {
                    'User-Agent': 'my-app',
                    'Accept-Language': 'en'
                }
            });

            return response.data && response.data.length > 0 ? response.data[0] : null;
        };

        let location = await makeRequest(true);
        if (!location) {
            location = await makeRequest(false);
        }

        if (location) {
            return {
                ltd: parseFloat(location.lat),
                lng: parseFloat(location.lon)
            };
        }

        throw new Error('Unable to fetch coordinates - address not found');
    } catch (error) {
        console.error('Geocode error:', error.message || error);
        throw error;
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    try {
        // Get coordinates for both origin and destination
        const originCoords = await module.exports.getAddressCoordinate(origin);
        const destinationCoords = await module.exports.getAddressCoordinate(destination);

        // Simple calculation of distance using Haversine formula
        const distance = calculateDistance(
            originCoords.ltd,
            originCoords.lng,
            destinationCoords.ltd,
            destinationCoords.lng
        );

        // Estimate time (assuming average speed of 40 km/h)
        const estimatedTime = Math.ceil((distance / 40) * 60);

        return {
            distance: {
                text: `${distance.toFixed(2)} km`,
                value: distance * 1000 // in meters
            },
            duration: {
                text: `${estimatedTime} mins`,
                value: estimatedTime * 60 // in seconds
            },
            status: 'OK'
        };
    } catch (err) {
        console.error('Distance/Time calculation error:', err.message || err);
        throw err;
    }
}

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('Input is required');
    }

    const url = 'https://nominatim.openstreetmap.org/search';

    try {
        const response = await axios.get(url, {
            params: {
                q: input,
                format: 'json',
                addressdetails: 1,
                limit: 5
            },
            headers: {
                'User-Agent': 'my-app'
            }
        });

        if (!response.data || response.data.length === 0) {
            return [];
        }

        return response.data.map(result => ({
            displayName: result.display_name,
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon)
        }));
    } catch (error) {
        console.error('Autocomplete error:', error.message || error);
        throw error;
    }
}

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
    const captainModel = require('../models/captain.model');

    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, ltd], radius / 6371]
            }
        }
    });

    return captains;
}
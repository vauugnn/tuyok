const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap',
};

const geocoder = NodeGeocoder(options);

async function davaoCoords() {
  const result = await geocoder.geocode('Davao City');
  return result[0].latitude;
}

async function mapPoints(location1, location2) {
  const result1 = await geocoder.geocode(location1);
  const result2 = await geocoder.geocode(location2);

  if (result1.length > 0 && result2.length > 0) {
    return [
      [result1[0].latitude, result1[0].longitude],
      [result2[0].latitude, result2[0].longitude],
    ];
  } else {
    return null;
  }
}

module.exports = {
  davaoCoords,
  mapPoints,
};
const express = require('express');
const cors = require('cors');
const calculateFare = require('./utils/fareCalculator');
const { davaoCoords, mapPoints } = require('./utils/mapUtils');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/calculate_fare', (req, res) => {
  const { vehicle_type, distance, is_discount } = req.body;
  const fare = calculateFare(vehicle_type, distance, is_discount);
  res.json({ fare });
});

app.get('/map', (req, res) => {
  const davaoCityCoords = davaoCoords();
  res.json({ davao_city_coords: davaoCityCoords });
});

app.post('/map_points', (req, res) => {
  const { location1, location2 } = req.body;
  const coords = mapPoints(location1, location2);
  
  if (coords) {
    res.json({ coords });
  } else {
    res.status(400).json({ error: 'Unable to find one or both locations.' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const FareCalculator: React.FC = () => {
  const [fare, setFare] = useState<number | null>(null);
  const [vehicleType, setVehicleType] = useState<'jeep' | 'van'>('jeep');
  const [isDiscount, setIsDiscount] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [davaoCenter, setDavaoCenter] = useState<[number, number]>([7.0707, 125.6087]);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    axios.get('http://localhost:5000/map')
      .then(response => {
        setDavaoCenter(response.data.davao_city_coords);
      })
      .catch(error => console.error('Error fetching Davao coordinates:', error));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const searchLocations = async () => {
      if (searchQuery.length > 2) {
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=5&viewbox=125.2,7.5,125.9,6.7&bounded=1`
          );
          setSearchResults(response.data);
        } catch (error) {
          console.error('Error searching for locations:', error);
        }
      } else {
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(searchLocations, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const MapEvents = () => {
    const map = useMap();
    mapRef.current = map;

    useMapEvents({
      click(e) {
        setDestination([e.latlng.lat, e.latlng.lng]);
      },
    });

    useEffect(() => {
      if (userLocation) {
        map.setView(userLocation, 13);
      }
    }, [userLocation, map]);

    return null;
  };

  const handleSearchResultClick = (result: SearchResult) => {
    const [lat, lon] = [parseFloat(result.lat), parseFloat(result.lon)];
    setDestination([lat, lon]);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 15);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  const calculateFare = async () => {
    if (!userLocation || !destination) {
      alert('Please select a destination');
      return;
    }

    const distance = calculateDistance(
      userLocation[0], userLocation[1],
      destination[0], destination[1]
    );

    try {
      const response = await axios.post('http://localhost:5000/calculate_fare', {
        vehicle_type: vehicleType,
        distance: distance,
        is_discount: isDiscount,
      });
      if (response.status === 200) {
        setFare(response.data.fare);
      }
    } catch (error) {
      console.error('Error calculating fare:', error);
    }
  };

  return (
<div>
      <h1>Tuyok: Fare Calculator</h1>
      <p>Search for your destination or pin it on the map.</p>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a destination"
        />
        {searchResults.length > 0 && (
          <ul style={{
            position: 'absolute',
            zIndex: 1000,
            backgroundColor: 'white',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            border: '1px solid #ccc'
          }}>
            {searchResults.map((result) => (
              <li
                key={result.place_id}
                onClick={() => handleSearchResultClick(result)}
                style={{ padding: '5px', cursor: 'pointer' }}
              >
                {result.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ height: '700px', width: '100%' }}>
        <MapContainer center={davaoCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents />
          {userLocation && <Marker position={userLocation} />}
          {destination && <Marker position={destination} />}
        </MapContainer>
      </div>
      <div>
        <p>Select Vehicle Type:</p>
        <label>
          <input
            type="radio"
            value="jeep"
            checked={vehicleType === 'jeep'}
            onChange={() => setVehicleType('jeep')}
          />
          Jeep
        </label>
        <label>
          <input
            type="radio"
            value="van"
            checked={vehicleType === 'van'}
            onChange={() => setVehicleType('van')}
          />
          Van
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={isDiscount}
            onChange={(e) => setIsDiscount(e.target.checked)}
          />
          Are you a student, senior citizen, or PWD?
        </label>
      </div>
      <button onClick={calculateFare}>Calculate Fare</button>
      {fare !== null && (
        <p>Calculated Fare: ₱{fare.toFixed(2)}</p>
      )}
    </div>
  );
};

export default FareCalculator;
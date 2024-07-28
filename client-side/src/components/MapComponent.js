import React, { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { TextField, Button, Box, List, ListItem, ListItemText } from '@mui/material';
import debounce from 'lodash.debounce';

const libraries = ['places'];

const MapComponent = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAQZCDViWdWMZ8vm0D3u-VDbVdZaeRnTZQ', // Replace with your API key
    libraries,
  });

  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [markers, setMarkers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = useCallback(debounce((query) => {
    if (map && query) {
      const service = new window.google.maps.places.PlacesService(map);
      service.textSearch(
        { query, type: ['school', 'university', 'library', 'education'] },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            setSearchResults(results);
            setMarkers(results.map(place => ({
              position: place.geometry.location,
              name: place.name,
            })));
            map.setCenter(results[0].geometry.location);
          }
        }
      );
    }
  }, 300), [map]); // Debounce with a delay of 300ms

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleResultClick = (location) => {
    map.setCenter(location);
    map.setZoom(15);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Box>
      <TextField
        style={{width: '30vw', zIndex:20, background: '#ffffff', borderRadius: '0.5vw',}}
        label="Search for schools and educational places"
        value={searchQuery}
        onChange={handleChange}
        variant="outlined"
        margin="normal"
      />
      <List style={{ maxHeight: '100px', width:'30vw', position: 'fixed',top:'73px',zIndex: 20,  overflowY: 'scroll', }}>
        {searchResults.map((place, index) => (
          <ListItem style={{background: '#ffffff'}} button key={index} onClick={() => handleResultClick(place.geometry.location)}>
            <ListItemText primary={place.name} />
          </ListItem>
        ))}
      </List>
      <div style={{position: 'fixed', top:0, left:0,  height: '100vh', width: '100%' }}>
        <GoogleMap
          onLoad={map => setMap(map)}
          mapContainerStyle={{ height: '100%', width: '100%' }}
          zoom={10}
          center={{ lat: -34.397, lng: 150.644 }}
        >
          {markers.map((marker, index) => (
            <Marker key={index} position={marker.position} title={marker.name} />
          ))}
        </GoogleMap>
      </div>
    </Box>
  );
};

export default MapComponent;

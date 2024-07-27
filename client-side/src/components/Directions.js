import React, { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

function Directions({ origin, destination, travelMode, onTravelTimeChange }) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionService] = useState(null);
  const [directionsRenderer, setDirectionRenderer] = useState(null);

  useEffect(() => {
    if (map && routesLibrary) {
      const service = new routesLibrary.DirectionsService();
      const renderer = new routesLibrary.DirectionsRenderer();
      renderer.setMap(map);
      setDirectionService(service);
      setDirectionRenderer(renderer);
    }
  }, [map, routesLibrary]);

  useEffect(() => {
    if (directionsService && directionsRenderer && destination) {
      directionsService.route(
        {
          origin,
          destination,
          travelMode: travelMode,
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
            const duration = result.routes[0].legs[0].duration.text;
            onTravelTimeChange(duration);

            // Adjust the map's viewport to focus on the route and destination
            if (map) {
              const bounds = new window.google.maps.LatLngBounds();
              const route = result.routes[0];
              
              // Extend the bounds to include the origin and destination
              bounds.extend(origin);
              bounds.extend(destination);
              
              // Extend the bounds to include all route points
              route.legs.forEach(leg => {
                bounds.extend(leg.start_location);
                bounds.extend(leg.end_location);
              });

              // Center and zoom the map to fit the route
              map.fitBounds(bounds);
              map.setZoom(Math.min(map.getZoom(), 15)); // Set a reasonable zoom level
            }
          }
        }
      );
    }

    // Cleanup function to clear directions
    return () => {
      if (directionsRenderer) {
        directionsRenderer.setDirections({ routes: [] });
      }
    };
  }, [directionsService, directionsRenderer, origin, destination, travelMode, onTravelTimeChange, map]);

  return null;
}

export default Directions;

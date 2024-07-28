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

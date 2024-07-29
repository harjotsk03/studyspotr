import React, { useRef, useState, useEffect } from 'react';
import { FaMapPin, FaRegClock, FaRegIdCard, FaStar, FaStarHalfAlt, FaVolumeDown } from 'react-icons/fa';
import useGeocode from '../hooks/useGeocode';


function InfoCard({ info, onChangeMode }) {
  const [address, setAddress] = useState('');
  const cardRef = useRef(null);
  const getAddress = useGeocode();

  useEffect(() => {
    if (info.location) {
      getAddress(info.location.lat, info.location.long)
        .then(address => setAddress(address))
        .catch(error => console.error(error));
    }
  }, [info.location, getAddress]);

  const handleModeChange = (mode) => {
    if (onChangeMode) {
      onChangeMode(mode);
    }
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const totalStars = Array(fullStars).fill(<FaStar className="star-full" />);
    
    if (hasHalfStar) {
      totalStars.push(<FaStarHalfAlt className="star-full" />);
    }

    // Optionally add empty stars to reach a total of 5 stars
    while (totalStars.length < 5) {
      totalStars.push(<FaStar className="text-gray-200" />); // Use a different color for empty stars
    }

    return totalStars;
  };

  return (
    <div className="" ref={cardRef}>
      <p className='flex text-sm gap-1 flex-row items-center mb-1'>{getRatingStars(info.rating)}</p>
      <h2 className='text-2xl'>{info.name}</h2>
      <p className='text-xs mb-1 mt-1 flex flex-row items-center gap-1'>        <FaMapPin size={10}/> {address || 'Address not available'}</p>
      <p className='text-sm mb-1 mt-2 flex flex-row items-center gap-1'><FaRegIdCard /> Student ID: {info.requiresID ? 'Yes' : 'No'}</p>
      <p className='text-sm mb-1.5 flex flex-row items-center gap-1'><FaVolumeDown /> Silent Areas: {info.silentArea ? 'Yes' : 'No'}</p>
      <p className='text-sm mt-1 flex flex-row items-center gap-1'><FaRegClock /> Open Hours: {info.openHours}</p>
    </div>
  );
}

export default InfoCard;

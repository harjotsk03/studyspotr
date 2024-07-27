// src/App.js
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { APIProvider } from "@vis.gl/react-google-maps";
import FindStudySpot from './pages/FindStudySpot';
import CitySearch from './pages/CitySearch';

function App() {
  const apiKey = process.env.GOOGLE_API_KEY;

  return (
    <Router>
      <APIProvider apiKey={apiKey}>
        <div className="App">
          <Routes>
            <Route path="/" element={<CitySearch />} />
          </Routes>
        </div>
      </APIProvider>
    </Router>
  );
}

export default App;

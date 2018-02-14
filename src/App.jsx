import React, { Component } from 'react';
import './App.css';

import RouteTile from './RouteTile';
import WeatherTile from './WeatherTile';

import { destinations } from './config.json';

class App extends Component {
  render() {
    return (
        <div className="App">
            <div className="AppDate">Today's Date</div>
            <div className="AppMain">
                <div className="RouteWrapper">
                    {(destinations || []).map((destination, index) => (
                        <RouteTile key={`destination-${index}`} {...destination} />
                    ))}
                </div>
                <WeatherTile />
            </div>
        </div>
    );
  }
}

export default App;

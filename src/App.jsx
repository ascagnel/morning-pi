import React, { Component } from 'react';
import get from 'lodash.get';
import './App.css';

import RouteTile from './RouteTile';
import WeatherTile from './WeatherTile';

const destinations = get(window.SERVER_DATA, 'destinations') || [];

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

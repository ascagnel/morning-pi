import React, { Component } from 'react';
import './App.css';

import RouteTile from './RouteTile';
import WeatherTile from './WeatherTile';
import BusTile from './BusTile';

const DESTINATION_MAP = {
	route: RouteTile,
	bus: BusTile,
};

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			homeLocation: null,
			destinations: [],
		};
	}

	async componentWillMount() {
		const response = await fetch('/data');

		if (response.ok) {
			const config = await response.json();
			this.setState(Object.assign({}, config, { loaded: true }));
		}
	}

	render() {
		if (!this.state.loaded) {
			return <div>Loading...</div>;
		}
		return (
			<div className="App">
				<div className="AppDate">Today's Date</div>
				<div className="AppMain">
					<div className="RouteWrapper">
						{(this.state.destinations || []).map((destination, index) => {
							const ComponentType = DESTINATION_MAP[destination.type] || RouteTile;
							return (
								<ComponentType
									key={`destination-${index}`}
									homeLocation={this.state.homeLocation}
									{...destination}
								/>
							);
						})}
					</div>
					<WeatherTile homeLocation={this.state.homeLocation} />
				</div>
			</div>
		);
	}
}

export default App;

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
			timer: null,
			currentDate: null,
		};
		this.updateDate = this.updateDate.bind(this);
	}

	async componentWillMount() {
		const response = await fetch('/data');
		const timer = window.setInterval(this.updateDate, 200);

		if (response.ok) {
			const config = await response.json();
			this.setState(Object.assign({}, config, { loaded: true, timer, currentDate: new Date() }));
		}
	}

	componentWillUnmount() {
		if (this.state.timer) {
			window.clearInterval(this.state.timer);
		}
	}

	updateDate() {
		this.setState({ currentDate: new Date() });
	}

	render() {
		if (!this.state.loaded) {
			return <div>Loading...</div>;
		}
		return (
			<div className="App">
				<div className="AppDate">
					{this.state.currentDate ? this.state.currentDate.toDateString() + '' : 'Right Now'}
				</div>
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

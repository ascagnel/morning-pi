import React, { Component } from 'react';
import './RouteTile.css';

import qs from 'qs';
import get from 'lodash.get';

class RouteTile extends Component {
	constructor(props) {
		super(props);

		const callParams = {
			origin: props.homeLocation,
			destination: props.param,
			method: props.method || 'driving',
			traffic_model: 'pessimistic',
			departure_time: Date.now() + 30000,
			key: '$KEY',
		};

		if (props.method === 'transit') {
			callParams['transit_mode'] = 'bus|subway';
		}

		const lookupPath = `/maps/api/directions/json?${qs.stringify(callParams, { encode: false })}`;

		this.state = {
			travelTime: null,
			travelDestination: null,
			isLoading: true,
			lookupPath,
			displayAllowExtra: false,
			lastUpdate: null,
			timer: null,
		};

		this.updateDisplay = this.updateDisplay.bind(this);
	}

	componentWillMount() {
		const timer = window.setInterval(() => {
			this.updateDisplay();
		}, 300000);

		this.setState({ timer });
		this.updateDisplay();
	}

	componentWillUnmount() {
		if (this.state.timer) {
			window.clearInterval(this.state.timer);
		}
	}

	async updateDisplay() {
		this.setState({ isLoading: true });
		const response = await fetch(this.state.lookupPath);

		if (!response.ok) {
			this.setState({ isLoading: false });
			console.error(response.status, response.statusText);
			return;
		}

		let result = {};
		try {
			result = await response.json();
		} catch (e) {
			console.error(e);
			this.setState({ isLoading: false });
			return;
		}

		const travelTime = get(result, 'routes.0.legs.0.duration_in_traffic.text') || '0 mins';
		const travelDestination = get(result, 'routes.0.legs.0.end_address');
		const travelValue = get(result, 'routes.0.legs.0.duration.value') || 0;

		this.setState({
			isLoading: false,
			travelTime: travelDestination ? `${travelTime} to ${travelDestination}` : travelTime,
			travelDestination,
			displayAllowExtra: travelValue >= this.props.expected,
			lastUpdate: new Date(),
		});
	}

	render() {
		let travelTimeDisplay;
		if (this.state.isLoading) {
			travelTimeDisplay = <div className="TimeDisplayLoading">Loading...</div>;
		} else if (this.state.displayAllowExtra) {
			travelTimeDisplay = (
				<div className="TimeDisplayExtra">
					{this.state.travelTime}, <span>but allow extra time</span>
				</div>
			);
		} else {
			travelTimeDisplay = <div className="TimeDisplay">{this.state.travelTime}</div>;
		}

		let dateDisplay = 'Never';
		if (this.state.lastUpdate) {
			dateDisplay = this.state.lastUpdate.toTimeString() + '';
		}

		return (
			<div className="RouteItemWrapper">
				<h2>{this.props.title}</h2>
				{travelTimeDisplay}
				<div className="LastUpdate">Last Updated: {dateDisplay}</div>
			</div>
		);
	}
}

export default RouteTile;

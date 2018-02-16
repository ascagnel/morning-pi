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
			key: '$KEY',
		};

		if (props.method === 'transit') {
			callParams['transit_mode'] = 'bus|subway';
		}

		const lookupPath = `/maps/api/directions/json?${qs.stringify(callParams, { encode: false })}`;

		this.state = {
			travelTime: null,
			isLoading: true,
			lookupPath,
			displayAllowExtra: false,
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

		const travelTime = get(result, 'routes.0.legs.0.duration.text') || '0 mins';
		const travelValue = get(result, 'routes.0.legs.0.duration.value') || 0;

		this.setState({
			isLoading: false,
			travelTime,
			displayAllowExtra: travelValue >= this.props.expected,
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

		return (
			<div className="RouteItemWrapper">
				<h2>{this.props.title}</h2>
				{travelTimeDisplay}
			</div>
		);
	}
}

export default RouteTile;

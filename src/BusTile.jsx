import React, { Component } from 'react';
import get from 'lodash.get';

import './BusTile.css';

class BusTile extends Component {
	constructor(props) {
		super(props);
		this.state = {
			timer: null,
			lastUpdate: null,
			buses: [],
		};
		this.updateContent = this.updateContent.bind(this);
	}

	componentWillMount() {
		const timer = window.setInterval(this.updateContent, 30000);
		this.setState({ timer });
		this.updateContent();
	}

	componentWillUnmount() {
		if (this.state.timer) {
			window.clearInterval(this.state.timer);
		}
	}

	async updateContent() {
		const response = await fetch(`/bus?stop=${this.props.stop}`);
		if (!response.ok) {
			console.error(response.status, response.statusText);
			return;
		}

		let result = {};
		try {
			result = await response.json();
		} catch (e) {
			console.error('Could not parse response JSON', e);
		}

		const buses = (get(result, 'stop.pre') || []).map(bus => {
			let route = (get(bus, 'fd.0') || '')
				.split(' ')
				.map((str, index) => {
					if (index > 1) {
						return str.toLowerCase();
					}
					return str;
				})
				.join(' ');

			return {
				route,
				nextTime: get(bus, 'nextbusonroutetime.0'),
			};
		});
		this.setState({ buses, lastUpdate: new Date() });
	}

	render() {
		let body = <div>No buses currently scheduled</div>;

		if (this.state.buses && this.state.buses.length) {
			body = (
				<div>
					{this.state.buses.map((bus, index) => (
						<div key={`busDisplay-${index}`}>
							<span className="BusRoute">{bus.route}</span> at <span>{bus.nextTime}</span>
						</div>
					))}
				</div>
			);
		}

		let dateDisplay = 'Never';
		if (this.state.lastUpdate) {
			dateDisplay = this.state.lastUpdate.toTimeString() + '';
		}
		return (
			<div>
				<h2>Buses Arriving at {this.props.title}</h2>
				{body}
				<div className="LastUpdate">Last Updated: {dateDisplay}</div>
			</div>
		);
	}
}

export default BusTile;

import React, { Component } from 'react';
import get from 'lodash.get';

import './WeatherTile.css';

import clearDay from './icons/clearDay.svg';
import clearNight from './icons/clearNight.svg';
import rain from './icons/rain.svg';
import snow from './icons/snow.svg';
import sleet from './icons/sleet.svg';
import wind from './icons/wind.svg';
import fog from './icons/fog.svg';
import cloudy from './icons/cloudy.svg';
import partlyCloudyDay from './icons/partly-cloudy-day.svg';
import partlyCloudyNight from './icons/partly-cloudy-night.svg';
import hail from './icons/hail.svg';
import thunderstorm from './icons/thunderstorm.svg';
import tornado from './icons/tornado.svg';
import fallback from './icons/error.svg';

const ICON_MAP = {
    'clear-day': clearDay,
    'clear-night': clearNight,
    'rain': rain,
    'snow': snow,
    'sleet': sleet,
    'wind': wind,
    'fog': fog,
    'cloudy': cloudy,
    'partly-cloudy-day': partlyCloudyDay,
    'partly-cloudy-night': partlyCloudyNight,
    'hail': hail,
    'thunderstorm': thunderstorm,
    'tornado': tornado,
};

const WeatherHour = ({ time, summary, icon }) => {
    const currentHour = (new Date(time * 1000)).getHours();
    let displayHour = currentHour;
    if (currentHour === 0) {
        displayHour = '12am';
    } else if (currentHour < 12) {
        displayHour = `${currentHour}am`;
    } else if (currentHour === 12) {
        displayHour = '12pm';
    } else if (currentHour > 12) {
        displayHour = `${currentHour % 12}pm`;
    }

    const displayIcon = ICON_MAP[icon] || fallback;

    return (
        <div className="HourWrapper">
            <div className="HourLabel">{displayHour}</div>
            <img className="HourImage" src={displayIcon} alt={summary} />
            <div className="HourSummary">{summary}</div>
        </div>
    );
};

class WeatherTile extends Component {
    constructor(props) {
        super(props);

        const apiEndpoint = `/forecast/$KEY/${props.homeLocation}`;

        this.state = {
            isLoading: true,
            timer: null,
            apiEndpoint,
            summary: '',
            hours: []
        };

        this.updateContent = this.updateContent.bind(this);
    }

    componentWillMount() {
        const timer = window.setInterval(this.updateContent, 300000);
        this.setState({ timer });
        this.updateContent();
    }

    componentWillUnmount() {
        if (this.state.timer) {
            window.clearInterval(this.state.timer);
        }
    }

    async updateContent() {
        this.setState({ isLoading: true });
        const response = await fetch(this.state.apiEndpoint);

        if (!response.ok) {
            this.setState({ isLoading: false });
            console.error(response.status, response.statusText);
            return;
        }

        let result = {};
        try {
            result = await response.json();
        } catch (e) {
            this.setState({ isLoading: false });
            console.error(e);
        }

        const summary = get(result, 'hourly.summary');
        const hours = (get(result, 'hourly.data') || []).slice(0,9);
        this.setState({ summary, hours });
    }

    render() {
        return (
            <div className="WeatherWrapper">
                <div className="WeatherFlexWrapper">
                    {this.state.hours.map((hour, index) => (<WeatherHour key={`hour-${index}`} {...hour} />))}
                </div>
                <div className="WeatherSummary">{this.state.summary}</div>
            </div>
        );
    }
};

export default WeatherTile;

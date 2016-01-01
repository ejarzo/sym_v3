import React, { Component } from 'react';

import "./css/simple-grid.css";

// select
import './css/react-select/react-select-theme.css';
import './css/react-toggle/react-toggle.css';
// slider
import './css/react-range-slider/rangeslider.css';
import './css/react-range-slider/range-slider-theme.css';
// icons
import "./css/ionicons.min.css";

import './css/normalize.css';
import './css/main.css';

import Project from './Project.jsx'

const defaultState = {
    name: 'New Project',
    tempo: 50,
    tonic: "a",
    scale: "major"
}

class App extends Component {
    render() {
        return (
          <Project initState={defaultState} />
        );
    }
}

export default App;

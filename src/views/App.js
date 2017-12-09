import React, { Component } from 'react';

import "../static/css/simple-grid.css";

// select
import '../static/css/react-select/react-select-theme.css';
import '../static/css/react-toggle/react-toggle.css';
// slider
import '../static/css/react-range-slider/rangeslider.css';
import '../static/css/react-range-slider/range-slider-theme.css';
// icons
import "../static/css/ionicons.min.css";

import '../static/css/normalize.css';
import '../static/css/main.css';

import Project from '../components/Project'

const defaultState = {
    name: 'New Project',
    tempo: 50,
    tonic: "a",
    scale: "major"
}

/*
    Component Architecture:
        App
            Project
                ShapeCanvas
                    Shape
                        ShapeEditorPanel
                InstColorController
                    Knob
*/

class App extends Component {
    render() {
        return (
            <Project initState={defaultState} />
        );
    }
}

export default App;

import React, { Component } from 'react';

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

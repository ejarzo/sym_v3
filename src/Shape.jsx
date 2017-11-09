import React, { Component } from 'react';

// sliders
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'
import './css/rangeslider.css';

//import {Layer, Rect, Stage, Group} from 'react-konva';


class Shape extends React.Component {
  constructor (props) {
    super();

    this.state = {
      volume: -5
    };

    this.handleVolumeChange = this.handleVolumeChange.bind(this)
  }
  
  handleVolumeChange(value) {
    this.setState({
      volume: value
    });
  }

  render () {
    return (
      <div>
        <div>
          shape tempo: {this.props.tempo}
        </div>
        <ShapeEditorPanel 
          shapeState={this.state}
          //volume={this.state.volume}
          onVolumeChange={this.handleVolumeChange} 
        />
      </div>
    );
  }
}

class ShapeEditorPanel extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      return (
          <div className="shape-editor-panel">
              <Slider
                min={-18}
                max={0}
                value={this.props.shapeState.volume}
                orientation='vertical'
                onChange={this.props.onVolumeChange}
              />

              <div className="section">
                  Volume:
                  <input type="text" value={this.props.shapeState.volume} />
              </div>
          </div>
      );
    }
}

export default Shape
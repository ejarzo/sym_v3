import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// sliders
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'
import './css/rangeslider.css';

import {Line, Group} from 'react-konva';


class Shape extends React.Component {
    
    constructor (props) {
        super();
        this.state = {
          volume: -5,
          points: props.points,
          isComplete: false
        };
        
        //console.log(props)
        this.handleVolumeChange = this.handleVolumeChange.bind(this)
        this.handleShapeClick = this.handleShapeClick.bind(this)
        //this.getShapeComponent = this.getShapeComponent.bind(this)
        this.complete = this.complete.bind(this)
    }
    
    handleVolumeChange (val) {
        this.setState({
          volume: val
        });
    }

    handleShapeClick () {
        //ReactDOM.render(<ShapeEditorPanel shapeState={this.state} />, document.getElementById('holder'));
    }

    handleShapeDrag (e) {
        console.log(e.target.attrs.x);
    }

    complete () {
        console.log("complete shape");
        
        this.setState({
            isComplete: true
        })
    }

    render () {
        return (        
            <Group>
                <Line
                    points={this.state.points}
                    //points={[10,10,50,50,10,50]}
                    fill='#00D2FF'
                    stroke='black'
                    strokeWidth={5}
                    closed={true}
                    draggable={false}
                    onDragMove={this.handleShapeDrag}
                    onClick={this.handleShapeClick}
                />
            </Group>
        );
    }
}

class ShapeEditorPanel extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        console.log("shape tempo:", this.props.tempo)
        return (
            <div className="shape-editor-panel">
                <Slider
                    min={-18}
                    max={0}
                    value={this.props.shapeState.volume}
                    orientation='vertical'
                    onChange={this.props.onVolumeChange}
              />

              {/*<div className="section">
                  Volume:
                  <input type="text" value={this.props.shapeState.volume} />
              </div>*/}
            </div>
      );
    }
}

export default Shape
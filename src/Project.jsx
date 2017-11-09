import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Teoria from 'teoria'
import Select from 'react-select'
import './css/react-select/react-slider-theme.css';
import NumericInput from 'react-numeric-input'
import "./css/ionicons.min.css"
import Shape from './Shape.jsx'
import {Stage, Layer, Line, Circle, Group} from 'react-konva';

/* ========================================================================== */

const tonicsList = [
  {value:"a",  label: "A"},
  {value:"a#", label: "A#"},
  {value:"b",  label: "B"},
  {value:"c",  label: "C"},
  {value:"c#", label: "C#"},
  {value:"d",  label: "D"},
  {value:"d#", label: "D#"},
  {value:"e",  label: "E"},
  {value:"f",  label: "F"},
  {value:"f#", label: "F#"},
  {value:"g",  label: "G"},
  {value:"g#", label: "G#"}
];

const scalesList = [
  {value: "major", label: "Major"},
  {value: "minor", label: "Minor"},
  {value: "dorian", label: "Dorian"},
  {value: "phrygian", label: "Phrygian"},
  {value: "lydian", label: "Lydian"},
  {value: "mixolydian", label: "Mixolydian"},
  {value: "locrian", label: "Locrian"},
  {value: "majorpentatonic", label: "Major Pentatonic"},
  {value: "minorpentatonic", label: "Minor Pentatonic"},
  {value: "chromatic", label: "Chromatic"},
  {value: "blues", label: "Blues"},
  {value: "doubleharmonic", label: "Double Harmonic"},
  {value: "flamenco", label: "Flamenco"},
  {value: "harmonicminor", label: "Harmonic Minor"},
  {value: "melodicminor", label: "Melodic Minor"},
  {value: "wholetone", label: "Wholetone"}
];

/* ========================================================================== */

class Project extends Component {
  
    constructor(props) {
        super(props);

        this.state = {
            name: props.initState.name,
            tempo: props.initState.tempo,
            scaleObj: Teoria.note(props.initState.tonic).scale(props.initState.scale),
            //rootNote: scaleObj.tonic.name(),
            synthControllersList: [],
            shapesList: [],
            instColors: [],
            quantizeLength: 700,
            
            drawingState: 'drawing',
            mousePos: {x: 0, y: 0},
            currPoints: [],
            isPlaying: false,
        }

        this.handlePlayClick = this.handlePlayClick.bind(this)
        this.handleTempoChange = this.handleTempoChange.bind(this)
        this.handleTonicChange = this.handleTonicChange.bind(this)
        this.handleScaleChange = this.handleScaleChange.bind(this)
        
        this.handleClick = this.handleClick.bind(this)
        this.handleMouseMove = this.handleMouseMove.bind(this)
        
        this.testEl;
        
    }
    
    componentDidMount() {
      
    }

    appendShape() {
        let shapesList = this.state.shapesList.slice();
        console.log(this.state.shapesList);
        const points = this.state.currPoints.slice();
        
        const newShape = <Shape ref={el => this.testEl = el}
                            tempo={this.state.tempo} 
                            points={this.state.currPoints} 
                            //isCompleted={this.state.currShapeIsCompleted} 
                            />
        
        

        shapesList.push(newShape);
        
        this.setState({
            shapesList: shapesList,
            currPoints: []
        })
    }

    /* ============================== HANDLERS ============================== */
    handlePlayClick () {
        this.setState((prevState) => ({
            isPlaying: !prevState.isPlaying
        }));
    }
    
    handleTempoChange (val) {
        this.setState({
            tempo: val
        })
    }

    handleTonicChange (val){
        this.setState((prevState) => ({
            scaleObj: Teoria.note(val.value).scale(prevState.scaleObj.name),
        }));
    }

    handleScaleChange (val) {
        const tonic = this.state.scaleObj.tonic;
        this.setState({
            scaleObj: tonic.scale(val.value),
        })
    }

    handleClick (e) {
        // hovering over first point
        if (this.state.drawingState === 'preview') {
            this.appendShape();
        } else {
            let newPoints = this.state.currPoints.slice();
            console.log(newPoints)
            newPoints.push(this.state.mousePos.x, this.state.mousePos.y);
            this.setState({
                currPoints: newPoints
            })
        }
    }

    handleMouseMove (e) {
        let x = e.evt.offsetX;
        let y = e.evt.offsetY;
        const origin_x = this.state.currPoints[0];
        const origin_y = this.state.currPoints[1];
        
        const ORIGIN_RADIUS = 15;
        
        let drawingState = this.state.drawingState;

        // snap to origin
        if (this.state.currPoints.length && dist(x,y,origin_x,origin_y) < ORIGIN_RADIUS) {
            x = origin_x;
            y = origin_y;

            drawingState = 'preview';
        }
        else {
            drawingState = 'drawing';
        }

        this.setState({
            mousePos: {x: x, y: y},
            drawingState: drawingState
        })
    }

    /* =============================== RENDER =============================== */

    render() {    
        const playButtonClass = this.state.isPlaying ? "ion-stop" : "ion-play";
        //let points = this.state.currPoints.concat([this.state.mousePos.x, this.state.mousePos.y]);

        return (
        <div>
            <div className="controls">

            <div className="controls-section transport-controls">
                <button className="transport-icon play-stop-toggle" 
                        onClick={this.handlePlayClick} 
                        title="Play project (SPACE)">
                    <i className={playButtonClass}></i>
                </button>
                <button className="transport-icon record-toggle" title="Record to audio file">
                    <i className="ion-record"></i>
                </button>
            </div>

            <div className="divider"></div>

            <div className="controls-section music-controls">
                <span className="ctrl-elem small">
                <label>Tempo</label>
                <NumericInput 
                    className="numeric-input" 
                    min={1} 
                    max={100}
                    onChange={this.handleTempoChange}
                    value={this.state.tempo}
                    style={{
                        input: {
                            lineHeight: '10',
                            padding: 'none'
                        },
                        'input:focus' : {
                            border: '1px inset #222',
                            outline: 'none'
                        },
                        btn: {
                            boxShadow: 'none'
                        },
                        btnUp: {
                            color: '#ddd',
                            borderRadius: 'none',
                            background: 'none',
                            border: 'none',
                        },
                        btnDown: {
                            color: '#ddd',
                            borderRadius: 'none',
                            background: 'none',
                            border: 'none',
                        },
                        arrowUp: {
                            borderBottomColor: 'rgba(102, 102, 102, 1)'
                        },
                        arrowDown: {
                            borderTopColor: 'rgba(102, 102, 102, 1)'
                        }
                    }} 
                />
                </span>
                <span className="ctrl-elem small">
                    <label>Key</label>
                    <Select
                    searchable={false}
                    clearable={false}
                    name="Key Select"
                    value={this.state.scaleObj.tonic.toString(true)}
                    options={tonicsList}
                    onChange={this.handleTonicChange}
                    />
                </span>
                <span className="ctrl-elem large">
                    <label>Scale</label>
                    <Select
                    color="red"
                    searchable={false}
                    clearable={false}
                    name="Key Select"
                    value={this.state.scaleObj.name}
                    options={scalesList}
                    onChange={this.handleScaleChange}
                    />
                </span>
            </div>

            </div>
            <div id="holder">
                <Stage 
                    width={800} 
                    height={500}
                    onContentClick={this.handleClick}
                    onContentMouseMove={this.handleMouseMove}>
                    
                    <Layer>
                        <Group>
                            {this.state.shapesList}
                        </Group>    
                    </Layer>

                    <Layer>
                        <PhantomShape 
                            mousePos={this.state.mousePos} 
                            points={this.state.currPoints}
                        />
                    </Layer>

                </Stage>
            </div>  
        </div>        
      );
    }
}


class PhantomShape extends Component {
    
    constructor (props) {
      super(props);

      this.fillColor = "#000";
      this.radius = 5;
      this.strokeWidth = 2;
    }

    render(){
        return (
            <Group>
                <Circle 
                    x={this.props.mousePos.x} 
                    y={this.props.mousePos.y}
                    radius={this.radius}
                    fill={this.fillColor}
                />
                <Line
                    points={this.props.points.concat([this.props.mousePos.x, this.props.mousePos.y])}
                    strokeWidth={this.strokeWidth}
                    stroke={this.fillColor}
                />
            </Group>
        );
    }
}


export default Project

function dist(x0,y0,x1,y1) {
    return Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0));
}


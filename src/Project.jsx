import React, { Component } from 'react';

import Teoria from 'teoria'
import Select from 'react-select'
import './css/react-select/react-slider-theme.css';
import NumericInput from 'react-numeric-input'
import "./css/ionicons.min.css"
import ShapeCanvas from './ShapeCanvas.jsx'


/* ========================================================================== */

const colorsList = ["#c9563c", "#f4b549", "#2a548e", "#705498", "#33936b"];

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
            
            isPlaying: false,
            activeTool: 'draw',
            activeColor: colorsList[0],
        }

        this.handlePlayClick = this.handlePlayClick.bind(this);
        this.handleTempoChange = this.handleTempoChange.bind(this);
        this.handleTonicChange = this.handleTonicChange.bind(this);
        this.handleScaleChange = this.handleScaleChange.bind(this);
        
        this.toggleActiveTool = this.toggleActiveTool.bind(this);
        
    }
    
    componentWillMount(){
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    componentDidMount () {
        console.log(document.getElementById("holder").style.width)
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    }

    /* ============================== HANDLERS ============================== */
    
    /* --- Transport -------------------------------------------------------- */

    handlePlayClick () {
        this.setState((prevState) => ({
            isPlaying: !prevState.isPlaying
        }));
    }
    
    /* --- Tool ------------------------------------------------------------- */

    toggleActiveTool () {
        const newTool = this.shapeCanvas.toggleActiveTool();
        if (newTool) {
            this.setState({
                activeTool: newTool
            })
        }
    }

    /* --- Musical ---------------------------------------------------------- */

    handleTempoChange (val) {
        this.setState({
            tempo: val
        })
    }

    handleTonicChange (val) {
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

    /* --- Keyboard Shortcuts ----------------------------------------------- */

    handleKeyDown(event) {
        console.log(event.key);
        if(event.key === 'Tab') {
            event.preventDefault();
            this.toggleActiveTool();
        }
    }

    /* =============================== RENDER =============================== */

    render() {    
        const playButtonClass = this.state.isPlaying ? "ion-stop" : "ion-play";

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

                <ShapeCanvas 
                    ref={(c) => this.shapeCanvas = c}
                    activeTool={this.state.activeTool}
                    activeColor={this.state.activeColor}
                    tempo={this.state.tempo}
                />
            </div>        
        );
    }
}

export default Project

import React, { Component } from 'react';

import Teoria from 'teoria';
import Select from 'react-select';
import NumericInput from 'react-numeric-input';
import Toggle from 'react-toggle';

import './css/react-select/react-select-theme.css';
import './css/react-toggle/react-toggle.css';
import "./css/ionicons.min.css";

import ShapeCanvas from './ShapeCanvas.jsx';
import drawIcon from './img/draw-icon.svg'
import editIcon from './img/edit-icon.svg'

/* ========================================================================== */

const colorsList = [
    "#c9563c", // red
    "#f4b549", // yellow
    "#2a548e", // blue
    "#705498", // purple
    "#33936b"  // green
];

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
            //activeColor: colorsList[0],
            activeColorIndex: 0
        }

        this.activeColor = colorsList[this.state.activeColorIndex];
        
        this.handlePlayClick = this.handlePlayClick.bind(this);
        this.handleTempoChange = this.handleTempoChange.bind(this);
        this.handleTonicChange = this.handleTonicChange.bind(this);
        this.handleScaleChange = this.handleScaleChange.bind(this);
        
        this.toggleActiveTool = this.toggleActiveTool.bind(this);
        this.handleDrawToolClick = this.handleDrawToolClick.bind(this);
        this.handleEditToolClick = this.handleEditToolClick.bind(this);
        this.handleColorChange = this.handleColorChange.bind(this);
        this.handleClearButtonClick = this.handleClearButtonClick.bind(this);
        
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
        let newTool = 'draw'
        if(this.shapeCanvas.canChangeTool()) {
            if (this.state.activeTool === 'draw') {
                newTool = 'edit';
            }
            this.setState({
                activeTool: newTool
            })
        }
    }

    handleDrawToolClick () {
        this.setAciveTool('draw');
    }

    handleEditToolClick () {
        this.setAciveTool('edit');
    }

    setAciveTool (tool) {
        if(this.shapeCanvas.canChangeTool()) {
            this.setState({
                activeTool: tool
            })
        }
    }
    
    handleColorChange (val) {
        console.log(val.value);
        this.setState({
            activeColorIndex: val.value
        })
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

    handleClearButtonClick () {
        this.shapeCanvas.clearAll();
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
                    
                    <div className="controls-section">
                    <span className="ctrl-elem small">
                        <label>Color</label>
                        <Select
                        searchable={false}
                        clearable={false}
                        name="Key Select"
                        value={this.state.activeColorIndex}
                        options={[
                                {value: 0, label: 0},
                                {value: 1, label: 1},
                                {value: 2, label: 2},
                                {value: 3, label: 3},
                                {value: 4, label: 4},
                            ]}
                        onChange={this.handleColorChange}
                        />
                    </span>
                        <span
                            className={"tool-button " + (this.state.activeTool === 'draw' ? "selected" : "")}
                            onClick={this.handleDrawToolClick}
                            style={{marginRight: '5px'}}
                            title="Draw Tool (TAB to toggle)"
                        >
                            <img src={drawIcon} alt="draw tool"/>
                        </span>
                        <span 
                            className={"tool-button " + (this.state.activeTool === 'edit' ? "selected" : "")}
                            onClick={this.handleEditToolClick}
                            title="Edit Tool (TAB to toggle)"
                        >
                            <img src={editIcon} alt="edit tool"/>
                        </span>
                        {/*<Toggle
                            checked={this.state.activeTool == 'draw'}
                            icons={{
                              checked: "DRAW",
                              unchecked: "EDIT",
                            }}
                            onChange={this.toggleActiveTool} 
                        />*/}
                        
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
                    <div className="divider"></div>

                    <div className="controls-section canvas-controls">
                        <button onClick={this.handleClearButtonClick}>
                            Clear
                        </button>
                    </div>
                </div>

                <ShapeCanvas
                    ref={(c) => this.shapeCanvas = c}
                    colorsList={colorsList}
                    colorIndex={this.state.activeColorIndex}
                    activeTool={this.state.activeTool}
                    tempo={this.state.tempo}
                />
            </div>        
        );
    }
}

export default Project

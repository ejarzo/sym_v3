import React, { Component } from 'react';

import Teoria from 'teoria';
import Select from 'react-select';
import NumericInput from 'react-numeric-input';
import Toggle from 'react-toggle';


import ShapeCanvas from './ShapeCanvas.jsx';
import drawIcon from './img/draw-icon.svg'
import editIcon from './img/edit-icon.svg'
import drawIconWhite from './img/draw-icon-white.svg'
import editIconWhite from './img/edit-icon-white.svg'
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
            
            colorPickerIsOpen: false,
            
            gridIsActive: false,
            snapToGridIsActive: false,
            autoQuantizeIsActive: true,
            quantizeLength: 700,

            isPlaying: false,
            activeTool: 'draw',
            activeColorIndex: 0
        }

        this.activeColor = colorsList[this.state.activeColorIndex];
        
        this.handlePlayClick = this.handlePlayClick.bind(this);
        this.handleTempoChange = this.handleTempoChange.bind(this);
        this.handleTonicChange = this.handleTonicChange.bind(this);
        this.handleScaleChange = this.handleScaleChange.bind(this);
        this.handleColorPickerClick = this.handleColorPickerClick.bind(this);
        
        this.handleGridToggleChange = this.handleGridToggleChange.bind(this);
        this.handleSnapToGridToggleChange = this.handleSnapToGridToggleChange.bind(this);
        this.handleAutoQuantizeChange = this.handleAutoQuantizeChange.bind(this);
        
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
    
    handleColorChange (colorIndex) {
        return () => {
            this.setState({
                activeColorIndex: colorIndex
            })
        }
    }
    
    /* --- Canvas ----------------------------------------------------------- */

    handleGridToggleChange () {
        this.setState({
            gridIsActive: !this.state.gridIsActive
        })
    }

    handleSnapToGridToggleChange () {
        this.setState({
            snapToGridIsActive: !this.state.snapToGridIsActive
        })
    }

    handleAutoQuantizeChange () {
        this.setState({
            autoQuantizeIsActive: !this.state.autoQuantizeIsActive
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

    handleColorPickerClick () {
        this.setState({
            colorPickerOpen: !this.state.colorPickerOpen
        })
    }

    /* --- Keyboard Shortcuts ----------------------------------------------- */

    handleKeyDown(event) {
        console.log(event.key);
        
        /* tab toggles active tool */
        if(event.key === 'Tab') {
            event.preventDefault();
            this.toggleActiveTool();
        }
        
        /* numbers control draw color */
        if (event.key === '1' || event.key === '2' || event.key === '3' ||
            event.key === '4' || event.key === '5') {
            this.setState({
                activeColorIndex: parseInt(event.key) - 1
            })
        }

        /* backspace deletes the selected shape */
        if(event.key === 'Backspace') {
            this.shapeCanvas.deleteSelectedShape();
        }
    }

    /* =============================== RENDER =============================== */

    render() {    
        const playButtonClass = this.state.isPlaying ? "ion-stop" : "ion-play";

        return (
            <div>
                {/* The Controls */}
                <div className="controls">
                    
                    {/* Transport Controls */}
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

                    {/* Drawing Controls*/}
                    <div className="controls-section">
                        
                        {/* Color Select */}
                        <span className="ctrl-elem">
                            <ColorPicker 
                                activeColorIndex={this.state.activeColorIndex}
                                onColorChange={this.handleColorChange}
                            />
                        </span>

                        {/* Tool Select */}
                        <span
                            className={"tool-button " + (this.state.activeTool === 'draw' ? "selected" : "")}
                            onClick={this.handleDrawToolClick}
                            style={{marginRight: '10px'}}
                            title="Draw Tool (TAB to toggle)"
                        >
                            <img src={this.state.activeTool === 'draw' ? drawIconWhite : drawIcon} alt="draw tool"/>
                        </span>
                        <span 
                            className={"tool-button " + (this.state.activeTool === 'edit' ? "selected" : "")}
                            onClick={this.handleEditToolClick}
                            title="Edit Tool (TAB to toggle)"
                        >
                            <img src={this.state.activeTool === 'edit' ? editIconWhite : editIcon} alt="edit tool"/>
                        </span>                        
                    </div>
                    <div className="divider"></div>

                    <div className="controls-section">
                        <div className="ctrl-elem no-margin">
                            
                            <input 
                                id="grid-toggle" 
                                type="checkbox"
                                checked={this.state.gridIsActive}
                                onChange={this.handleGridToggleChange}
                            />
                            <label className="checkbox-label" htmlFor="grid-toggle">Grid</label>
                       
                            <input 
                                id="snap-to-grid-toggle" 
                                type="checkbox" 
                                checked={this.state.snapToGridIsActive}
                                onChange={this.handleSnapToGridToggleChange}
                                />
                            <label className="checkbox-label" htmlFor="snap-to-grid-toggle">Snap</label>
                        {/*</div>
                        <div className="ctrl-elem no-margin">*/}
                            <input 
                                id="auto-quantize-toggle" 
                                type="checkbox" 
                                checked={this.state.autoQuantizeIsActive}
                                onChange={this.handleAutoQuantizeChange}
                            />
                            <label className="checkbox-label" htmlFor="auto-quantize-toggle">Auto Quantize</label>
                        </div>
                    </div>
                    <div className="divider"></div>

                    {/* Music Controls */}
                    <div className="controls-section music-controls">
                        <span className="ctrl-elem small">
                            {/*<label>Tempo</label>*/}
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
                            {/*<label>Key</label>*/}
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
                            {/*<label>Scale</label>*/}
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
                
                {/* The Canvas */}
                <ShapeCanvas
                    ref={(c) => this.shapeCanvas = c}
                    colorsList={colorsList}
                    colorIndex={this.state.activeColorIndex}
                    activeTool={this.state.activeTool}
                    
                    autoQuantizeIsActive={this.state.autoQuantizeIsActive}
                    tempo={this.state.tempo}
                    quantizeLength={this.state.quantizeLength}

                    gridIsActive={this.state.gridIsActive}
                    snapToGridIsActive={this.state.snapToGridIsActive}
                />
            </div>        
        );
    }
}

class ColorPicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        }

        this.handleColorPickerClick = this.handleColorPickerClick.bind(this);
    }

    handleColorChange (colorIndex) {
        return () => {
            this.props.onColorChange(colorIndex);
        }
    }

    handleColorPickerClick () {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    render () {
        const colorPickercContent = this.state.isOpen ? (
            <div className="project-color-picker-options">
                {colorsList.map((color, i) => {
                    const style = { backgroundColor: color }       
                    return i === this.props.activeColorIndex ? null : (
                        <div 
                            className="color-option" 
                            style={style}
                            onClick={this.props.onColorChange(i)}
                        >
                        </div>);
                    })
                }
            </div>) : null;
        
        return (
                <div
                    title="Select Draw Color (Numbers 1-5)" 
                    className="project-color-picker"
                    onClick={this.handleColorPickerClick}
                >
                    <div className="color-picker-button"
                        style={{
                            backgroundColor: colorsList[this.props.activeColorIndex]
                        }}
                    >
                    </div>
                    {colorPickercContent}
                </div>
            );
    }
}

export default Project

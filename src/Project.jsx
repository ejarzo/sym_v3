import React, { Component } from 'react';

import Teoria from 'teoria';
import Select from 'react-select';
import NumericInput from 'react-numeric-input';
import Fullscreen from 'react-full-screen';
import Tone from 'tone';

import ShapeCanvas from './ShapeCanvas.jsx';
import InstColorController from './InstColorController.js';

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

const instNamesList = [
    {value: "keys", label: "Keys"},
    {value: "duo", label: "Duo"},
];

/* ========================================================================== */

class Project extends Component {
  
    constructor (props) {
        super(props);

        this.state = {
            name: props.initState.name,
            isFullscreenEnabled: false,

            isGridActive: false,
            isSnapToGridActive: false,
            isAutoQuantizeActive: false,
            
            quantizeLength: 700,
            tempo: props.initState.tempo,
            scaleObj: Teoria.note(props.initState.tonic).scale(props.initState.scale),
            
            isPlaying: false,
            activeTool: 'draw',
            activeColorIndex: 0
        }
        
        // transport
        this.handlePlayClick = this.handlePlayClick.bind(this);

        // color and tool
        this.handleColorChange = this.handleColorChange.bind(this);
        this.toggleActiveTool = this.toggleActiveTool.bind(this);
        this.handleDrawToolClick = this.handleDrawToolClick.bind(this);
        this.handleEditToolClick = this.handleEditToolClick.bind(this);
        this.closeColorPicker = this.closeColorPicker.bind(this);

        // toggles
        this.handleGridToggleChange = this.handleGridToggleChange.bind(this);
        this.handleSnapToGridToggleChange = this.handleSnapToGridToggleChange.bind(this);
        this.handleAutoQuantizeChange = this.handleAutoQuantizeChange.bind(this);

        // music options
        this.handleTempoChange = this.handleTempoChange.bind(this);
        this.handleTonicChange = this.handleTonicChange.bind(this);
        this.handleScaleChange = this.handleScaleChange.bind(this);
        
        // canvas
        this.handleClearButtonClick = this.handleClearButtonClick.bind(this);
        
    }
    
    /* ============================= LIFECYCLE ============================== */

    componentWillMount (){
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    componentDidMount () {
    }

    componentWillUnmount () {
        document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    }

    /* ============================== HANDLERS ============================== */
    
    /* --- Transport -------------------------------------------------------- */

    handlePlayClick () {
        if (this.state.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
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
            isGridActive: !this.state.isGridActive
        })
    }

    handleSnapToGridToggleChange () {
        this.setState({
            isSnapToGridActive: !this.state.isSnapToGridActive
        })
    }

    handleAutoQuantizeChange () {
        this.setState({
            isAutoQuantizeActive: !this.state.isAutoQuantizeActive
        })
    }

    /* --- Musical ---------------------------------------------------------- */
    
    play () {
        Tone.Transport.start("+0.1");
    }

    stop () {
        Tone.Transport.stop();
    }

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
        if (val) {
            const tonic = this.state.scaleObj.tonic;
            this.setState({
                scaleObj: tonic.scale(val.value),
            })
        }
    }

    handleClearButtonClick () {
        this.shapeCanvas.clearAll();
    }

    /* --- Keyboard Shortcuts ----------------------------------------------- */

    handleKeyDown (event) {
        console.log(event.key);
        /* Space toggles play */
        if(event.key === ' ') {
            //event.preventDefault(); // stop from clicking focused buttons
            this.handlePlayClick();
        }

        /* tab toggles active tool */
        if(event.key === 'Tab') {
            event.preventDefault(); 
            this.toggleActiveTool();
        }
        
        /* numbers control draw color */
        if (event.key === '1' || event.key === '2' || event.key === '3' ||
            event.key === '4' || event.key === '5') {
            this.setState({
                activeColorIndex: parseInt(event.key, 10) - 1
            })
        }

        /* backspace deletes the selected shape */
        if(event.key === 'Backspace') {
            this.shapeCanvas.deleteSelectedShape();
        }
    }

    closeColorPicker () {
        if (this.colorPicker.state.isOpen) {
            this.colorPicker.close();
        }
    }

    /* =============================== RENDER =============================== */

    render () {    
        const playButtonClass = this.state.isPlaying ? "ion-stop" : "ion-play";
        const fullscreenButtonClass = this.state.isFullscreenEnabled ? "ion-arrow-shrink" : "ion-arrow-expand";

        return (
            <Fullscreen
                enabled={this.state.isFullscreenEnabled}
                onChange={isFullscreenEnabled => this.setState({isFullscreenEnabled})}>

                {/* The Controls */}
                <div className="controls" onClick={this.closeColorPicker}>
                    
                    {/* Transport Controls */}
                    <div className="controls-section transport-controls">
                        <div className="ctrl-elem">
                            <button className="icon-button" 
                                    onClick={this.handlePlayClick} 
                                    title="Play project (SPACE)">
                                <i className={playButtonClass}></i>
                            </button>
                        </div>
                        <div className="ctrl-elem">
                            <button className="icon-button" title="Record to audio file">
                                <i className="ion-record"></i>
                            </button>
                        </div>
                    </div>

                    {/* Drawing Controls*/}
                    <div className="controls-section">
                        
                        {/* Color Select */}
                        <div className="ctrl-elem">
                            <ColorPicker 
                                ref={(c) => this.colorPicker = c}
                                activeColorIndex={this.state.activeColorIndex}
                                onColorChange={this.handleColorChange}
                            />
                        </div>

                        {/* Tool Select */}
                        <div className="ctrl-elem">
                            <span
                                className={"tool-button " + (this.state.activeTool === 'draw' ? "selected" : "")}
                                onClick={this.handleDrawToolClick}
                                title="Draw Tool (TAB to toggle)">
                                <img src={this.state.activeTool === 'draw' ? drawIconWhite : drawIcon} alt="draw tool"/>
                            </span>
                        </div>
                        <div className="ctrl-elem no-margin">
                            <span 
                                className={"tool-button " + (this.state.activeTool === 'edit' ? "selected" : "")}
                                onClick={this.handleEditToolClick}
                                title="Edit Tool (TAB to toggle)">
                                <img src={this.state.activeTool === 'edit' ? editIconWhite : editIcon} alt="edit tool"/>
                            </span>                        
                        </div>
                    </div>

                    {/* Toggle Controls */}
                    <div className="controls-section">
                        
                        <div className="ctrl-elem no-margin">
                            
                            {/* Grid */}
                            <input 
                                id="grid-toggle" 
                                type="checkbox"
                                checked={this.state.isGridActive}
                                onChange={this.handleGridToggleChange}/>
                            <label 
                                className="checkbox-label" 
                                htmlFor="grid-toggle"
                                style={{
                                    borderTopLeftRadius: "3px", 
                                    borderBottomLeftRadius: "3px"
                                }}>
                                Grid
                            </label>
                            
                            {/* Snap To Grid */}
                            <input 
                                id="snap-to-grid-toggle" 
                                type="checkbox" 
                                checked={this.state.isSnapToGridActive}
                                onChange={this.handleSnapToGridToggleChange}/>
                            <label className="checkbox-label" htmlFor="snap-to-grid-toggle">Snap</label>
                            
                            {/* Toggle Auto Quantize*/}
                            <input 
                                id="auto-quantize-toggle" 
                                type="checkbox" 
                                checked={this.state.isAutoQuantizeActive}
                                onChange={this.handleAutoQuantizeChange}/>
                            <label 
                                className="checkbox-label" 
                                style={{
                                    borderTopRightRadius: "3px", 
                                    borderBottomRightRadius: "3px"
                                }}
                                htmlFor="auto-quantize-toggle">
                                Sync
                            </label>
                        </div>
                    </div>

                    {/* Music Controls */}
                    <div className="controls-section music-controls">
                        <span className="ctrl-elem small">
                            <div className="full-width">
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
                            </div>
                        </span>
                        <span className="ctrl-elem small">
                            <div className="full-width">
                                <label>Key</label>
                                <Select
                                    searchable={false}
                                    clearable={false}
                                    name="Key Select"
                                    value={this.state.scaleObj.tonic.toString(true)}
                                    options={tonicsList}
                                    onChange={this.handleTonicChange}/>
                            </div>
                        </span>

                        <span className="ctrl-elem large">
                            <div className="full-width">
                                <label>Scale</label>
                                <Select
                                    color="red"
                                    searchable={false}
                                    clearable={false}
                                    name="Key Select"
                                    value={this.state.scaleObj.name}
                                    options={scalesList}
                                    onChange={this.handleScaleChange}/>
                            </div>
                        </span>
                    </div>
                    
                    {/* Canvas Controls */}
                    <div className="controls-section canvas-controls">
                        <div className="ctrl-elem">
                            <button className="icon-button" onClick={() => this.setState({isFullscreenEnabled: !this.state.isFullscreenEnabled})}>
                                <i className={fullscreenButtonClass}></i>
                            </button>
                        </div>
                        <div className="ctrl-elem">
                            <button onClick={this.handleClearButtonClick}>
                                Clear
                            </button>
                        </div>
                    </div>
                
                </div>
                
                {/* The Canvas */}
                <ShapeCanvas
                    ref={(c) => this.shapeCanvas = c}
                    colorsList={colorsList}
                    colorIndex={this.state.activeColorIndex}
                    activeTool={this.state.activeTool}
                    closeColorPicker={this.closeColorPicker}
                    
                    isAutoQuantizeActive={this.state.isAutoQuantizeActive}
                    isPlaying={this.state.isPlaying}
                    scaleObj={this.state.scaleObj}
                    tempo={this.state.tempo}
                    quantizeLength={this.state.quantizeLength}

                    isGridActive={this.state.isGridActive}
                    isSnapToGridActive={this.state.isSnapToGridActive}
                />
                
                {/* Instrument controller panels */}
                <div className="inst-selectors">
                    <ul className="inst-list">
                        {colorsList.map((color, i) => {
                            return (
                                <InstColorController 
                                    key={i}
                                    instNamesList={instNamesList}
                                    color={color}
                                />
                            )
                        })}
                    </ul>
                </div>

            </Fullscreen>        
        );
    }
}

/*
    A dropdown used to select the draw color.
*/
class ColorPicker extends Component {
    constructor (props) {
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

    close () {
       this.setState({
           isOpen: false
       }) 
    }

    render () {
        const colorPickercContent = this.state.isOpen ? (
            <div className="project-color-picker-options">
                {colorsList.map((color, i) => {
                    const style = { backgroundColor: color }       
                    return i === this.props.activeColorIndex ? null : (
                        <div 
                            key={i}
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
                    onClick={this.handleColorPickerClick}>
                    <div 
                        className="color-picker-button"
                        style={{
                            backgroundColor: colorsList[this.props.activeColorIndex]
                        }}>
                    </div>
                    {colorPickercContent}
                </div>
            );
    }
}

export default Project

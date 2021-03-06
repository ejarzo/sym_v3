import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Teoria from 'teoria';
import Select from 'react-select';
import NumericInput from 'react-numeric-input';
import Fullscreen from 'react-full-screen';
import Tone from 'tone';

import ShapeCanvas from '../ShapeCanvas';
import ColorPicker from '../ColorPicker';
import InstColorController from './InstColorController.jsx';
import InstrumentPresets from './InstrumentPresets.jsx';

import drawIcon from '../../static/img/draw-icon.svg';
import editIcon from '../../static/img/edit-icon.svg';
import drawIconWhite from '../../static/img/draw-icon-white.svg';
import editIconWhite from '../../static/img/edit-icon-white.svg';

/* ========================================================================== */

const colorsList = [
    '#c9563c', // red
    '#f4b549', // yellow
    '#2a548e', // blue
    '#705498', // purple
    '#33936b'  // green
];

const tonicsList = [
    { value: 'a',  label: 'A' },
    { value: 'a#', label: 'A#' },
    { value: 'b',  label: 'B' },
    { value: 'c',  label: 'C' },
    { value: 'c#', label: 'C#' },
    { value: 'd',  label: 'D' },
    { value: 'd#', label: 'D#' },
    { value: 'e',  label: 'E' },
    { value: 'f',  label: 'F' },
    { value: 'f#', label: 'F#' },
    { value: 'g',  label: 'G' },
    { value: 'g#', label: 'G#' }
];

const scalesList = [
    { value: 'major', label: 'Major' },
    { value: 'minor', label: 'Minor' },
    { value: 'dorian', label: 'Dorian' },
    { value: 'phrygian', label: 'Phrygian' },
    { value: 'lydian', label: 'Lydian' },
    { value: 'mixolydian', label: 'Mixolydian' },
    { value: 'locrian', label: 'Locrian' },
    { value: 'majorpentatonic', label: 'Major Pentatonic' },
    { value: 'minorpentatonic', label: 'Minor Pentatonic' },
    { value: 'chromatic', label: 'Chromatic' },
    { value: 'blues', label: 'Blues' },
    { value: 'doubleharmonic', label: 'Double Harmonic' },
    { value: 'flamenco', label: 'Flamenco' },
    { value: 'harmonicminor', label: 'Harmonic Minor' },
    { value: 'melodicminor', label: 'Melodic Minor' },
    { value: 'wholetone', label: 'Wholetone' }
];

const instNamesList = InstrumentPresets.map((preset) => {
    return {
        label: preset.name.label,
        value: preset.name.value,
    };
});

/* ========================================================================== */

const propTypes = {
    initState: PropTypes.shape({
        name: PropTypes.string.isRequired,
        tonic: PropTypes.string.isRequired,
        scale: PropTypes.string.isRequired,
        tempo: PropTypes.number.isRequired,
    }).isRequired,
};

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
            activeColorIndex: 0,
            selectedInstruments: [0,1,0,1,0],
            effectsVals: colorsList.map((color) => {
                return [0,0,0,0];
            })
        };
        console.log('effects vals', this.state.effectsVals);

        // transport
        this.handlePlayClick = this.handlePlayClick.bind(this);

        // color and tool
        this.handleColorChange = this.handleColorChange.bind(this);
        this.handleDrawToolClick = this.handleDrawToolClick.bind(this);
        this.handleEditToolClick = this.handleEditToolClick.bind(this);
        this.toggleActiveTool = this.toggleActiveTool.bind(this);
        this.closeColorPicker = this.closeColorPicker.bind(this);

        // toggles
        this.handleGridToggleChange = this.handleGridToggleChange.bind(this);
        this.handleSnapToGridToggleChange = this.handleSnapToGridToggleChange.bind(this);
        this.handleAutoQuantizeChange = this.handleAutoQuantizeChange.bind(this);

        // music options
        this.handleTempoChange = this.handleTempoChange.bind(this);
        this.handleTonicChange = this.handleTonicChange.bind(this);
        this.handleScaleChange = this.handleScaleChange.bind(this);

        // inst colors
        this.handleInstChange = this.handleInstChange.bind(this);

        // canvas
        this.handleClearButtonClick = this.handleClearButtonClick.bind(this);
    }
    
    /* ============================= LIFECYCLE ============================== */

    componentWillMount () {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    componentWillUnmount () {
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /* ============================== HANDLERS ============================== */
    
    /* --- Transport -------------------------------------------------------- */

    handlePlayClick () {
        Tone.Transport.toggle();
        this.setState((prevState) => ({
            isPlaying: !prevState.isPlaying
        }));
    }
    
    /* --- Tool ------------------------------------------------------------- */

    toggleActiveTool () {
        let newTool = 'draw';
        if(this.shapeCanvas.canChangeTool()) {
            if (this.state.activeTool === 'draw') {
                newTool = 'edit';
            }
            this.setState({
                activeTool: newTool
            });
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
            });
        }
    }
    
    handleColorChange (colorIndex) {
        return () => {
            this.setState({
                activeColorIndex: colorIndex
            });
        };
    }
    
    /* --- Canvas ----------------------------------------------------------- */

    handleGridToggleChange () {
        this.setState({
            isGridActive: !this.state.isGridActive
        });
    }

    handleSnapToGridToggleChange () {
        this.setState({
            isSnapToGridActive: !this.state.isSnapToGridActive
        });
    }

    handleAutoQuantizeChange () {
        this.setState({
            isAutoQuantizeActive: !this.state.isAutoQuantizeActive
        });
    }

    /* --- Musical ---------------------------------------------------------- */

    handleTempoChange (val) {
        this.setState({
            tempo: val
        });
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
            });
        }
    }

    handleClearButtonClick () {
        this.shapeCanvas.clearAll();
    }

    /* --- Instrument Colors ------------------------------------------------ */

    handleInstChange(colorIndex) {
        return (instrumentIndex) => {
            const selectedInstruments = this.state.selectedInstruments.slice();
            selectedInstruments[colorIndex] = instrumentIndex;
            this.setState({
                selectedInstruments,
            });
        };
    }

    handleKnobChange(colorIndex) {
        return (effectIndex, val) => {
            this.setState(
                (prevState) => {
                    const effectsVals = prevState.effectsVals.slice();
                    const colorEffectsVals = effectsVals[colorIndex].slice();
                    colorEffectsVals[effectIndex] = val;
                    effectsVals[colorIndex] = colorEffectsVals;
                    return {
                        effectsVals: effectsVals,
                    };
                }
            );
        };
    }

    /* --- Keyboard Shortcuts ----------------------------------------------- */

    handleKeyDown (event) {
        console.log('Keypress:', event.key);
        
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
            });
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
        const playButtonClass = this.state.isPlaying ? 'ion-stop' : 'ion-play';
        const fullscreenButtonClass = this.state.isFullscreenEnabled ? 'ion-arrow-shrink' : 'ion-arrow-expand';

        return (
            <Fullscreen
                enabled={this.state.isFullscreenEnabled}
                onChange={isFullscreenEnabled => this.setState({isFullscreenEnabled})}>

                {/* The Controls */}
                <div className="controls" onClick={this.closeColorPicker}>
                    
                    {/* Transport Controls */}
                    <div className="controls-section transport-controls">
                        <div className="ctrl-elem">
                            <button 
                                className="icon-button" 
                                onClick={this.handlePlayClick} 
                                title="Play project (SPACE)"
                            >
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
                                colorsList={colorsList}
                                activeColorIndex={this.state.activeColorIndex}
                                onColorChange={this.handleColorChange}
                            />
                        </div>

                        {/* Tool Select */}
                        <div className="ctrl-elem">
                            <span
                                className={'tool-button ' + (this.state.activeTool === 'draw' ? 'selected' : '')}
                                onClick={this.handleDrawToolClick}
                                title="Draw Tool (TAB to toggle)">
                                <img src={this.state.activeTool === 'draw' ? drawIconWhite : drawIcon} alt="draw tool"/>
                            </span>
                        </div>
                        <div className="ctrl-elem no-margin">
                            <span 
                                className={'tool-button ' + (this.state.activeTool === 'edit' ? 'selected' : '')}
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
                                    borderTopLeftRadius: '3px', 
                                    borderBottomLeftRadius: '3px'
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
                                    borderTopRightRadius: '3px', 
                                    borderBottomRightRadius: '3px'
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
                    selectedInstruments={this.state.selectedInstruments}
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
                            const selectedInstrumentIndex = this.state.selectedInstruments[i];
                            return (
                                <InstColorController 
                                    key={i}
                                    instNamesList={instNamesList}
                                    handleInstChange={this.handleInstChange(i)}
                                    onKnobChange={this.handleKnobChange(i)}
                                    dynamicParamVals={this.state.effectsVals[i]}
                                    color={color}
                                    synthParams={InstrumentPresets[selectedInstrumentIndex]}
                                />
                            );
                        })}
                    </ul>
                </div>

            </Fullscreen>        
        );
    }
}

Project.propTypes = propTypes;

export default Project;

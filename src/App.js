import React, { Component } from 'react';
import './css/normalize.css';


// sliders
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'
import './css/rangeslider.css';

// teoria
import Teoria from 'teoria'

// select
import Select from 'react-select'
//import 'react-select/dist/react-select.css'
//import 'react-select/scss/default.css'
import './css/react-select/react-slider-theme.css';

// numeric input
import NumericInput from 'react-numeric-input'


// ionicons
import "./css/ionicons.min.css"

// style
import './css/main.css';

/*
import styled from 'styled-components';

const styledSelect = styled(Select)`
  .Select-input {
    background-color: #f00
  }   
`
*/
//export (props) => <MultiSelect multi {...props} />


class App extends Component {
  render() {
    return (
        <Project name="New Project" tempo={5} tonic="A" scale="major"/>
    );
  }
}



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



class Project extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      name: props.name,
      tempo: props.tempo,
      scaleObj: Teoria.note(props.tonic).scale(props.scale),
      //rootNote: scaleObj.tonic.name(),
      synthControllersList: [],
      shapesList: [],
      instColors: [],
      quantizeLength: 700,

      isPlaying: false
    }


    this.handlePlayClick = this.handlePlayClick.bind(this)
    this.handleKeyChange = this.handleKeyChange.bind(this)
    this.handleScaleChange = this.handleScaleChange.bind(this)

  }

  handlePlayClick () {
    this.setState((prevState) => ({
      isPlaying: !prevState.isPlaying
    }));
  }

  handleKeyChange (val){
    const newTonic = val.value;

    this.setState((prevState) => ({
      scaleObj: Teoria.note(newTonic).scale(prevState.scaleObj.name),
    }));
  }

  handleScaleChange (val) {
    const tonic = this.state.scaleObj.tonic;
    const newScaleName = val.value;

    this.setState({
      scaleObj: tonic.scale(newScaleName),
    })
  }

  render() {    
    const playButtonClass = this.state.isPlaying ? "ion-stop" : "ion-play";

    return (
      <div>
        <div className="controls">
            
            <div className="controls-section transport-controls">
                <button className="transport-icon play-stop-toggle" onClick={this.handlePlayClick} title="Play project (SPACE)">
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
                      value={50}
                      style={{
                        // wrap: {
                        //     background: '#E2E2E2',
                        //     boxShadow: '0 0 1px 1px #fff inset, 1px 1px 5px -1px #000',
                        //     padding: '2px 2.26ex 2px 2px',
                        //     borderRadius: '6px 3px 3px 6px',
                        //     fontSize: 32
                        // },
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
                        arrowUp: {
                            borderColor: 'transparent transparent rgba(0, 0, 0, 0.1)',
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
                      onChange={this.handleKeyChange}
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

                {/*<span className="ctrl-elem">
                    <label>Scale:</label>
                </span>*/}
            </div>

           
           {/* <div class="controls-section tools-controls">
                <button class="ctrl-elem tool active" id="draw-tool" title="Draw Tool (TAB to toggle)">
                    <div class="color-palette dropdown">
                        <i class="ion-chevron-down"></i>
                        <div class="dropdown-content">
                            <div class="palette-background"></div>
                        </div>
                    </div>
                        <!-- <img class="tool-icon" src="img/cursor_draw.svg"> -->
                        <span>DRAW</span>
                </button><!-- 
                 --><button class="ctrl-elem tool" id="adjust-tool" title="Edit Tool (TAB to toggle)">
                   <!--  <img class="tool-icon" src="img/cursor_edit.svg"> -->
                   <span>EDIT</span>
                </button>
            </div>
            
            <!-- <div class="divider"></div> -->
            <div class="controls-section grid-controls">
                <div class="ctrl-elem">
                    <div>
                        <input class="checkbox" type="checkbox" name="grid" id="grid" title="Toggle Grid">
                        <label for="grid" title="Toggle Grid">Grid</label>    
                    </div>
                    <div>
                        <input class="checkbox" type="checkbox" name="snap" id="snap" title="Toggle Snap To Grid">
                        <label for="snap" title="Toggle Snap To Grid">Snap to Grid</label>
                    </div>
                </div>
                <div class="ctrl-elem">
                    <div>
                        <input class="checkbox" type="checkbox" name="auto-quantize" id="auto-quantize" title="Snaps shapes to the same length">
                        <label for="auto-quantize" title="Snaps shapes to the same length">Auto-Quantize</label>
                    </div>
                </div>
            </div>
            
            <div class="divider"></div>
            <div class="controls-section music-controls">
                <span class="ctrl-elem">
                    <label>Tempo:</label><br>
                    <input type="range" class="tempo-slider" min="-6" max="-1">
                </span>
                <span class="ctrl-elem">
                    <label>Key:</label><br>
                    <select class="tonic-select"></select>
                </span>
                <span class="ctrl-elem">
                    <label>Scale:</label><br>
                    <select class="scale-select"></select>
                </span>
            </div>

            <div class="divider"></div>
            <div class="controls-section canvas-controls">
                <button class="transport-icon enter-fullscreen" title="Toggle Fullscreen">
                    <i class="ion-arrow-expand"></i>
                </button>
                <button class="ctrl-elem clear" title="Clear All Shapes">Clear</button>
            </div>
            
           <!--  <div class="divider"></div> -->

            <!-- <div class="controls-section project-controls">
                <button class="ctrl-elem" onclick="project_dump()">Save Project</button>
                <button class="ctrl-elem" onclick="project_load()">Load Project</button>
            </div> -->

            <!-- <div class="controls-section project-controls">
                <button class="ctrl-elem" onclick="generate_random_shapes(1, 10)">Random Shape</button>
            </div> -->*/}
        </div>
        <div id="holder">
          
        </div>  
      </div>

      
    );
  }
}



class ShapeEditorPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          volume: 0
        };

        this.handleVolumeChange = this.handleVolumeChange.bind(this)
    }
    
    handleVolumeChange(value) {
      this.setState({
        volume: value
      });
    }

    render() {
        const value = this.state.volume

        return (
            <div className="shape-editor-panel">
                <Slider
                  min={-18}
                  max={0}
                  value={value}
                  orientation='vertical'
                  onChange={this.handleVolumeChange}
                />

                <div className="section">
                    Volume:
                    <input type="text" value={this.state.volume} />
                </div>
            </div>
        );

    }
}

export default App;

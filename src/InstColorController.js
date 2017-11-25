import React, { Component } from 'react';
import Select from 'react-select';
import Knob from './Knob.js';

class InstColorController extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount () {

    }

    render() {
        return (    
           <li id="inst-0" className="inst-option">
                <div className="inst-title">
                   <Select
                        className="inst-select"
                        searchable={true}
                        clearable={false}
                        name="Instrument Select"
                        value={"Bass"}
                        options={[]}
                        onChange={this.handleChange}/>
                    {/*<button className="show-hide show-hide-inst" data-target="inst-selectors" title="Show/Hide synth controls">
                        <i className="ion-arrow-left-b"></i>
                    </button>*/}
                </div>
                <ul className="inst-params">
                    <li>
                        <Knob 
                            paramName={"Decay"}
                        />
                    </li>
                    <li>
                        <Knob 
                            paramName={"Decay"}
                        />
                    </li>
                    <li>
                        <Knob 
                            paramName={"Decay"}
                        />
                    </li>
                    <li>
                        <Knob 
                            paramName={"Decay"}
                        />
                    </li>
                </ul>
           </li>
        );
    }
}

export default InstColorController
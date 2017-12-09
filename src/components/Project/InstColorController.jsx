import React, { Component } from 'react';
import Select from 'react-select';
import Color from 'color';

import Knob from '../Knob';

class InstColorController extends Component {
    constructor (props) {
        super(props);

        this.state = {
            instParams: [
                {name: "Decay", value: 50}, 
                {name: "Space", value: 50}, 
                {name: "Shine", value: 50}, 
                {name: "Shimmer", value: 50}, 
            ],
            instName: "keys"
        };

        this.handleInstChange = this.handleInstChange.bind(this);
    }

    componentDidMount () {

    }

    handleInstChange (val) {
        this.setState({
            instName: val.value,
            instParams: [
                {name: "Decay", value: 50}, 
                {name: "Space", value: 50}, 
                {name: "Shine", value: 50}, 
                {name: "Shimmer", value: 50}, 
            ],
        })
    }

    handleParamValueChange (i) {
        return (val) => {
            let instParams = this.state.instParams.slice();
            instParams[i] = {
                name: instParams[i].name,
                value: val
            }
            this.setState({
                instParams: instParams
            })
            console.log(this.state);
        }
    }

    render () {
        const titleBackgroundColor = this.props.color;
        const contentBackgroundColor = Color(this.props.color).lighten(0.1);
      
        return (    
           <li id="inst-0" className="inst-option">
                
                <div className="inst-title" style={{backgroundColor: titleBackgroundColor}}>
                    <div style={{width: "50%", backgroundColor: Color(this.props.color).darken(0.1)}}>
                       <Select
                            optionRenderer={(option) => {
                                return (
                                    <div style={{backgroundColor: titleBackgroundColor}}>{option.label}</div>
                                );
                            }}
                            menuStyle={{
                                background: titleBackgroundColor
                            }}
                            className="inst-select"
                            searchable={true}
                            clearable={false}
                            name="Instrument Select"
                            value={this.state.instName}
                            options={this.props.instNamesList}
                            onChange={this.handleInstChange}/>
                        {/*<button className="show-hide show-hide-inst" data-target="inst-selectors" title="Show/Hide synth controls">
                            <i className="ion-arrow-left-b"></i>
                        </button>*/}
                    </div>
                </div>
                <ul className="inst-params" style={{backgroundColor: contentBackgroundColor}}>
                    {this.state.instParams.map((paramObj, i) => {
                        return (
                            <li key={i}>
                                <Knob
                                    paramName={paramObj.name}
                                    value={paramObj.value}
                                    onChange={this.handleParamValueChange(i)}
                                />
                            </li>
                        );
                    })}
                </ul>
           </li>
        );
    }
}

export default InstColorController
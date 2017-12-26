import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Select from 'react-select';
import Color from 'color';

import Knob from '../Knob';

const propTypes = {
    color: PropTypes.string.isRequired,
    instNamesList: PropTypes.array.isRequired,
    
    synthParams: PropTypes.shape({
        name: PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.number.isRequired,
        }),
        baseSynth: PropTypes.func.isRequired,
        dynamicParams: PropTypes.array.isRequired,
        effects: PropTypes.array,
    }).isRequired,
    dynamicParamVals: PropTypes.array.isRequired,
    
    onKnobChange: PropTypes.func.isRequired,
    handleInstChange: PropTypes.func.isRequired,
};

class InstColorController extends Component {
    constructor (props) {
        super(props);

        this.setDefaults(props.synthParams.dynamicParams);
        this.handleInstChange = this.handleInstChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.synthParams.name.value !== this.props.synthParams.name.value) {
            this.setDefaults(nextProps.synthParams.dynamicParams);
        }
    }
    
    setDefaults (dynamicParams) {
        dynamicParams.forEach((param, i) => {
            this.props.onKnobChange(i, param.default);
        });
    }

    handleInstChange (val) {
        this.props.handleInstChange(val.value);
    }

    handleParamValueChange (i) {
        return (val) => {
            this.props.onKnobChange(i, val);
        };
    }

    render () {
        const titleBackgroundColor = this.props.color;
        const contentBackgroundColor = Color(this.props.color).lighten(0.1);
      
        return (    
            <li className="inst-option">
                <div className="inst-title" style={{backgroundColor: titleBackgroundColor}}>
                    <div style={{width: '50%', backgroundColor: Color(this.props.color).darken(0.1)}}>
                        <Select
                            optionRenderer={option => (
                                <div style={{backgroundColor: titleBackgroundColor}}>
                                    {option.label}
                                </div>
                            )}
                            menuStyle={{
                                background: titleBackgroundColor
                            }}
                            className="inst-select"
                            searchable={true}
                            clearable={false}
                            name="Instrument Select"
                            value={this.props.synthParams.name.value}
                            options={this.props.instNamesList}
                            onChange={this.handleInstChange}
                        />
                        {/*<button className="show-hide show-hide-inst" data-target="inst-selectors" title="Show/Hide synth controls">
                            <i className="ion-arrow-left-b"></i>
                        </button>*/}
                    </div>
                </div>
                <ul className="inst-params" style={{backgroundColor: contentBackgroundColor}}>
                    {this.props.synthParams.dynamicParams.map((effect, i) => {
                        return (
                            <li key={i}>
                                <Knob
                                    paramName={effect.name}
                                    value={this.props.dynamicParamVals[i]}
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

InstColorController.propTypes = propTypes;

export default InstColorController;
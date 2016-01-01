import React, { Component } from 'react';
import Select from 'react-select'

// sliders
import Slider from 'react-rangeslider'


/*
    Shape Editor Panel: appears when a shape is clicked on.
    Used to adjust/mix the shape
*/
class ShapeEditorPanel extends Component {
    constructor(props) {
        super(props);

        const width = 225;
        const height = 350;
        const xPad = 23;
        const yPad = 33;

        let x = this.props.position.x;
        let y = this.props.position.y + yPad;

        let arrowTop = 40
        
        let isLeft = true;

        if (x + width + xPad > window.innerWidth) {
            // editor shows to the left of the mouse
            // arrow on right
            isLeft = false;
            x = x - width - xPad;
        } else {
            x = x + xPad
            // editor shows on right of mosue
            // arrow on left
        }
        
        if (y + height > window.innerHeight) {
            y = window.innerHeight - height - 15;
            arrowTop = this.props.position.y - y + 70;
            if (arrowTop > height - 20) {
                arrowTop = height - 20
            }
        }

        this.divStyle = {
            width: width,
            height: height,
            left: x,
            top: y
        }

        this.arrowStyle = {
            top: arrowTop
        }

        this.state = {
            editorArrowIsLeft: isLeft
        }


        this.handleOverlayClick = this.handleOverlayClick.bind(this);
    }

    handleOverlayClick () {
        this.props.closePortal();
    }

    render() {
        const editorArrowClass = this.state.editorArrowIsLeft ? "arrow-left" : "arrow-right"
        
        const sliderStyle = {
            "background": "#000"
        }

        return(    
            <div className="shape-editor-panel" style={this.divStyle}>
                
           
                <div className="row section">
                    <div className="col col-12">
                        <div className="shape-color-picker">
                            {this.props.colorsList.map((color, i) => {
                                const isSelected = i === this.props.colorIndex;

                                const style = {
                                    backgroundColor: color,
                                    opacity: isSelected ? 1 : 0.4,
                                    //transform: isSelected ? "scale(1.2)" : "scale(1)",
                                    //zIndex: isSelected ? 1 : 0
                                }
                                return (
                                    <div 
                                        className="shape-color-option" 
                                        style={style}
                                        onClick={this.props.onColorChange(i)}>
                                        
                                    </div>
                                );
                            })}
                        </div>
                    </div>


                    <div className="col col-6 slider-container">
                        <Slider
                            className={"color-"+ this.props.colorIndex}
                            orientation='vertical'
                            min={-18}
                            max={0}
                            value={this.props.volume}
                            onChange={this.props.onVolumeChange}
                        />
                    </div>

                    <div className="col col-6">
                        <div className="col col-12">
                            <label>Mute</label>
                            <input type="checkbox" />
                        </div>
                        <div className="col col-12">
                            <label>Solo</label>
                            <input type="checkbox"/>
                        </div>
                        </div>
                </div>

                <div className="row section">   
                    <div className="col col-6">
                        <button>Quantize</button>
                    </div>                    
                    
                </div>

                <div className="row section">   
                    <div className="col col-6">
                        <button>To Front</button>
                    </div>
                    <div className="col col-6">
                        <button>To Back</button>
                    </div>
                </div>

                <div className="row section">   
                    <div className="col col-12">
                        <button onClick={this.props.onDeleteClick}>
                            Delete
                        </button>
                    </div>
                </div>
               
                <div className={"tooltip-arrow " + editorArrowClass} style={this.arrowStyle}></div>
            </div>
        );
    }
}

export default ShapeEditorPanel
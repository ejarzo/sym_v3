import React, { Component } from 'react';

// sliders
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'
import './css/rangeslider.css';


/*
    Shape Editor Panel: appears when a shape is clicked on.
    Used to adjust/mix the shape
*/
class ShapeEditorPanel extends Component {
    constructor(props) {
        super(props);

        const width = 225;
        const height = 250;
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
        
        if (y + height > window.innerHeight + 40) {
            y = window.innerHeight - height;
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
        return(    
            <div className="shape-editor-panel" style={this.divStyle}>
                <div>
                    Shape: {this.props.index}
                </div>
                <Slider
                    orientation='vertical'
                    min={-18}
                    max={0}
                    value={this.props.volume}
                    onChange={this.props.onVolumeChange}
                />
                <div>
                    Volume: {this.props.volume}
                </div>
                <div>
                    Tempo: {this.props.tempo}
                </div>
                <button onClick={this.props.onDeleteClick}>
                    Delete
                </button>
                <div className={"tooltip-arrow " + editorArrowClass} style={this.arrowStyle}></div>
            </div>
        );
    }
}

export default ShapeEditorPanel
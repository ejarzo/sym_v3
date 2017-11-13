import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Color from 'color';
import {Stage, Layer, Line, Circle, Group} from 'react-konva';
import Shape from './Shape.jsx'


/* ========================================================================== */

/* ========================================================================== */

class ShapeCanvas extends Component {
  
    constructor(props) {
        super(props);

        this.state = {
            shapesList: [],
            instColors: [],
            
            drawingState: 'pending',
            mousePos: {x: 0, y: 0},
            currPoints: [],

            selectedShapeIndex: -1
        }

        this.shapeRefs = [];
        this.handleClick = this.handleClick.bind(this);

        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleShapeClick = this.handleShapeClick.bind(this);
    }
       
    appendShape() {
        let shapesList = this.state.shapesList.slice();
        const points = this.state.currPoints.slice();
        shapesList.push(points);
        
        this.setState({
            shapesList: shapesList,
            currPoints: []
        })
    }

    toggleActiveTool () {
        // only change if not in the middle of a shape
        if(this.state.drawingState === 'pending') {
            let newTool = 'draw';
            if (this.props.activeTool === 'draw') {
                newTool = 'edit';
            }
            return newTool;
        }
    }

    /* ============================== HANDLERS ============================== */
        
    handleMouseDown () {
        console.log("MOUSE DOWN")
        this.setState({
            selectedShapeIndex: -1
        })
    }

    handleClick (e) {
        if (this.props.activeTool === 'draw') {
            // hovering over first point
            if (this.state.drawingState === 'preview') {
                this.appendShape();
                this.setState({
                    drawingState: 'pending'
                })
            } else {
                let newPoints = this.state.currPoints.slice();
                console.log(newPoints)
                newPoints.push(this.state.mousePos.x, this.state.mousePos.y);
                this.setState({
                    currPoints: newPoints,
                    drawingState: 'drawing'
                })
            }
        }
    }

    handleMouseMove (e) {
        let x = e.evt.offsetX;
        let y = e.evt.offsetY;
        const origin_x = this.state.currPoints[0];
        const origin_y = this.state.currPoints[1];
        
        const ORIGIN_RADIUS = 15;
        
        let drawingState = this.state.drawingState === 'pending' ? 'pending' : 'drawing';

        // snap to origin
        if (this.state.currPoints.length > 2 && dist(x, y, origin_x, origin_y) < ORIGIN_RADIUS) {
            x = origin_x;
            y = origin_y;

            drawingState = 'preview';
        }

        this.setState({
            mousePos: {x: x, y: y},
            drawingState: drawingState
        })
    }

    handleShapeClick (index) {
        console.log("shape clicked")
        this.setState({
            selectedShapeIndex: index
        })
    }

    /* =============================== RENDER =============================== */

    render() {    
        return (
            <div id="holder">
                <Stage 
                    width={window.innerWidth} 
                    height={window.innerHeight}
                    onContentClick={this.handleClick}
                    onContentMouseMove={this.handleMouseMove}
                    onContentMouseDown={this.handleMouseDown}
                >
                    <Layer>
                        <Group>
                            {this.state.shapesList.map((points, index) => {
                                return (
                                    <Shape
                                        isSelected={index === this.state.selectedShapeIndex}
                                        handleShapeClick={this.handleShapeClick}
                                        key={index}
                                        index={index}
                                        ref="shape"
                                        tempo={this.props.tempo} 
                                        points={points}
                                        activeTool={this.props.activeTool}
                                        color={this.props.activeColor}
                                        setEditorPanel={this.setEditorPanel}
                                    />  
                                );
                            })}
                        </Group>    
                    </Layer>

                    <Layer>
                        <PhantomShape 
                            mousePos={this.state.mousePos} 
                            points={this.state.currPoints}
                            activeTool={this.props.activeTool}
                            color={this.props.activeColor}
                            drawingState={this.state.drawingState}
                        />
                    </Layer>
                </Stage>
            </div>  
        );
    }
}

/*
    Used to show where the user's next point/line will fall. Shows the shape
    that is currently being drawn. A faint fill apears to indicate that the 
    the shape will be completed upon the next click.
*/
class PhantomShape extends Component {
    constructor (props) {
        super(props);

        this.radius = 4;
        this.strokeWidth = 2;
        this.previewFillOpacity = 0.1;
    }

    render(){
        let originPoint = null;
        if (this.props.points[0]) {
            originPoint = (<Circle // first points drawn
                x={this.props.points[0]} 
                y={this.props.points[1]}
                radius={this.radius}
                stroke={this.props.color}
                strokeWidth={this.strokeWidth}
                fill={this.props.color}
            />);
        }

        if (this.props.activeTool === 'draw') {
            return (
                <Group>
                    <Circle // circle beneath mouse
                        x={this.props.mousePos.x} 
                        y={this.props.mousePos.y}
                        radius={this.radius}
                        fill={Color(this.props.color).alpha(0.4)}
                        stroke={this.props.color}
                        strokeWidth={this.strokeWidth}
                    />
                    {originPoint}
                    <Line // shape so far
                        points={this.props.points}
                        strokeWidth={this.strokeWidth}
                        stroke={this.props.color}
                        fill={Color(this.props.color).alpha(this.previewFillOpacity)}
                        fillEnabled={true}
                        closed={this.props.drawingState === 'preview'}
                    />
                    <Line // line from previous point to mouse
                        points={this.props.points.slice(-2).concat([this.props.mousePos.x, this.props.mousePos.y])}
                        strokeWidth={this.strokeWidth}
                        stroke={this.props.color}
                        opacity={0.5}
                    />                
                </Group>
            );
        } else {
            return null
        }
    }
}


export default ShapeCanvas

function dist(x0,y0,x1,y1) {
    return Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0));
}

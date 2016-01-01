import React, { Component } from 'react';
import Color from 'color';
import {Stage, Layer, Line, Circle, Group} from 'react-konva';
import Shape from './Shape.jsx'

/*
    The ShapeCanvas is canvas where the shapes are drawn
*/
class ShapeCanvas extends Component {
  
    constructor(props) {
        super(props);

        this.state = {
            shapesList: [],
            deletedShapeIndeces: [],
            selectedShapeIndex: -1,

            currPoints: [],
            drawingState: 'pending',
            mousePos: {x: 0, y: 0},
        }
        
        this.originLockRadius = 15;

        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleShapeClick = this.handleShapeClick.bind(this);
        this.handleShapeDelete = this.handleShapeDelete.bind(this);
        
        this.clearAll = this.clearAll.bind(this);
    }
    
    componentWillReceiveProps(nextProps) {
        if (nextProps.activeTool === 'draw') {
            this.setState({
                selectedShapeIndex: -1
            })
        }
    }
    
    appendShape() {
        let shapesList = this.state.shapesList.slice();
        const points = this.state.currPoints.slice();
        shapesList.push(points);
        
        let deletedShapeIndeces = this.state.deletedShapeIndeces.slice();
        deletedShapeIndeces.push(0);

        this.setState({
            shapesList: shapesList,
            deletedShapeIndeces: deletedShapeIndeces,
            currPoints: []
        })
    }

    canChangeTool () {
        return this.state.drawingState === 'pending';
    }

    clearAll () {
        this.setState({
            shapesList: [],
            deletedShapeIndeces: []
        })
    }
    /* ============================== HANDLERS ============================== */
        
    handleMouseDown () {
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
        const originX = this.state.currPoints[0];
        const originY = this.state.currPoints[1];
        
        let drawingState = this.state.drawingState === 'pending' ? 'pending' : 'drawing';

        // snap to origin if within radius
        if (this.state.currPoints.length > 2 && dist(x, y, originX, originY) < this.originLockRadius) {
            x = originX;
            y = originY;
            drawingState = 'preview';
        }

        this.setState({
            mousePos: {x: x, y: y},
            drawingState: drawingState
        })
    }

    handleShapeClick (index) {
        this.setState({
            selectedShapeIndex: index
        })
    }

    handleShapeDelete (index) {
        let deletedShapeIndeces = this.state.deletedShapeIndeces.slice();
        deletedShapeIndeces[index] = true;
       
        this.setState({
            deletedShapeIndeces: deletedShapeIndeces
        });
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
                                if (!this.state.deletedShapeIndeces[index]) {
                                    return (
                                        <Shape
                                            key={index}
                                            index={index}
                                            points={points}

                                            isSelected={index === this.state.selectedShapeIndex}
                                            activeTool={this.props.activeTool}

                                            colorsList={this.props.colorsList}
                                            colorIndex={this.props.colorIndex}

                                            onShapeClick={this.handleShapeClick}
                                            onDelete={this.handleShapeDelete}
                                            tempo={this.props.tempo} 
                                        />  
                                    );
                                } else {
                                    return null;
                                }
                            })}
                        </Group>    
                    </Layer>

                    <Layer>
                        <PhantomShape 
                            mousePos={this.state.mousePos} 
                            points={this.state.currPoints}
                            activeTool={this.props.activeTool}
                            color={this.props.colorsList[this.props.colorIndex]}
                            drawingState={this.state.drawingState}
                        />
                    </Layer>
                </Stage>
                {/*<div id="monitor">
                    {this.state.shapesList.map((points, index) => {
                        return (
                           <div>
                               Shape: {index} <br/>
                               Points: {points.map((p) => p + ",")} <br/>
                           </div>
                        );
                    })}
                </div>*/}
            </div>  
        );
    }
}

/*
    Used to show the shape that is currently being drawn. 
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
            originPoint = (<Circle // first point drawn
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
                    <Circle // circle beneath cursor
                        x={this.props.mousePos.x} 
                        y={this.props.mousePos.y}
                        radius={this.radius}
                        fill={Color(this.props.color).alpha(0.4).toString()}
                        stroke={this.props.color}
                        strokeWidth={this.strokeWidth}
                    />
                    {originPoint}
                    <Line // shape so far
                        points={this.props.points}
                        strokeWidth={this.strokeWidth}
                        stroke={this.props.color}
                        fill={Color(this.props.color).alpha(this.previewFillOpacity).toString()}
                        fillEnabled={true}
                        closed={this.props.drawingState === 'preview'}
                    />
                    <Line // line from previous point to cursor
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

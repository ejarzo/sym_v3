import React, { Component } from 'react';
import Portal from 'react-portal';

import Color from 'color';

import {Group, Line, Circle} from 'react-konva';
import ShapeEditorPanel from './ShapeEditorPanel.jsx'

/*
    PROPS:
        index           the shape's index in the shapeCanvas's list of shapes
        points          the array of x,y coordinates are the shape's vertecies

        isSelected      bool representing whether the shape is selected (clicked on)
        activeTool      the project's active tool

        colorsList      the list of colors used in the project
        colorIndex      the index in the colorsList of the shape's color

        onShapeClick    function to run when shape is clicked
        onDelete        function to run when shape is deleted
        tempo           the project's tempo
*/
class Shape extends React.Component {
    constructor (props) {
        super();

        this.state = {
            volume: -5,
            points: props.points,
            colorIndex: props.colorIndex,
            isHoveredOver: false,
            isMuted: false,
            editorX: 0,
            editorY: 0,
            scaleRatio: 1,
            offsetX: 0,
            offsetY: 0
        };

        this.handleVolumeChange = this.handleVolumeChange.bind(this)
        this.handleShapeClick = this.handleShapeClick.bind(this)
        this.handleMouseOver = this.handleMouseOver.bind(this)
        this.handleMouseOut = this.handleMouseOut.bind(this)
        this.handleVertexDragMove = this.handleVertexDragMove.bind(this);
        this.handleShapeDrag = this.handleShapeDrag.bind(this);    
        this.handleColorChange = this.handleColorChange.bind(this);    
        
        this.handleMouseDown = this.handleMouseDown.bind(this);    
        this.handleDragStart = this.handleDragStart.bind(this);    
        this.handleDragEnd = this.handleDragEnd.bind(this);    
        this.dragBoundFunc = this.dragBoundFunc.bind(this);    
        this.getTotalLength = this.getTotalLength.bind(this);    
        this.setPerimeterLength = this.setPerimeterLength.bind(this);    

        this.handleDelete = this.handleDelete.bind(this);    
        this.handleMuteChange = this.handleMuteChange.bind(this);    
    }
    
    componentDidMount () {

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.activeTool === 'draw') {
            this.setState({
                isHoveredOver: false
            })
        }

        if (nextProps.autoQuantizeIsActive) {
            this.setPerimeterLength();
        }
    }


    /* ============================== HANDLERS ============================== */

    /* --- Shape ------------------------------------------------------------ */

    handleMouseDown (e) {
        this.setState({
            editorX: e.evt.offsetX,
            editorY: e.evt.offsetY,
        });
    }

    handleShapeClick (e) {
        this.props.onShapeClick(this.props.index);
    }

    hideEditorPanel () {
        if (this.refs.editorPortal) {
            this.refs.editorPortal.closePortal();
        }
    }

    handleDelete () {
        this.props.onDelete(this.props.index);
    }

    handleShapeDrag (e) {
        console.log(e.target.getAbsolutePosition());
    }

    handleDragStart (e) {
    
    }

    handleDragEnd (e) {

    }

    dragBoundFunc (pos) {
        return {
            x: this.props.snapToGrid(pos.x),
            y: this.props.snapToGrid(pos.y)
        };
    }
    handleMouseOver (e) {
        this.setState({
            isHoveredOver: true
        })
    }

    handleMouseOut () {
        this.setState({
            isHoveredOver: false
        })
    }

    /* --- Editor Panel ----------------------------------------------------- */

    handleVolumeChange (val) {
        this.setState({
            volume: val
        });
    }

    handleColorChange (colorIndex) {
        return () => {
            this.setState({
                colorIndex: colorIndex
            })
        }
    }

    handleMuteChange (event) {
        this.setState({
            isMuted: !this.state.isMuted
        })
    }

    /* --- Vertecies -------------------------------------------------------- */

    handleVertexDragMove(i) {
        return (e) => {
            console.log(e.target)
            const pos = e.target.position();
            let points = this.state.points.slice();
            points[i] = this.props.snapToGrid(pos.x);
            points[i+1] = this.props.snapToGrid(pos.y);

            this.setState({
                points: points
            })
            if (this.props.autoQuantizeIsActive) {
                this.setPerimeterLength();
            }
        };
    }

    /* --- Helper ----------------------------------------------------------- */

    getTotalLength () {
        let len = 0;
        const n = this.state.points.length;
        const ps = this.state.points;

        for (var i = 2; i < this.state.points.length; i+=2) {
            const x = ps[i];
            const y = ps[i+1];
            const prevX = ps[i-2];
            const prevY = ps[i-1];
            len += dist(x,y,prevX,prevY)
        }

        // last edge
        len += dist(ps[0], ps[1], ps[n-2], ps[n-1]);
        return len;
    }

    setPerimeterLength () {
        const len = 700;
        const currLen = this.getTotalLength();
        const rect = this.shapeElement.getClientRect();
        
        const oldScale = this.state.scaleRatio;
        const cx = (rect.x + rect.width / 2) / oldScale;
        const cy = (rect.y + rect.height / 2) / oldScale;

        const ratio = len / currLen;
        
        console.log("CENTER:", cx, cy);
        console.log("CURR LEN:", currLen);
        console.log("RATIO:", ratio);

        let newPoints = this.state.points.slice();

        for (var i = 0; i < newPoints.length; i += 2) {
            
            let x = newPoints[i];
            let y = newPoints[i+1];
            x *= ratio;
            y *= ratio;
            x += (1 - ratio) * cx;
            y += (1 - ratio) * cy;

            newPoints[i] = x;
            newPoints[i+1] = y;
        }
        
        this.setState({
            points: newPoints,
        })
    }

    /* =============================== RENDER =============================== */

    render () {
        const color = this.props.colorsList[this.state.colorIndex];
        const isEditMode = this.props.activeTool === 'edit';
        const alphaAmount = this.props.isSelected ? 0.8 : 0.4;
        
        const attrs = {
            strokeWidth: isEditMode ? (this.state.isHoveredOver ? 4 : 2) : 2,
            stroke: color,
            fill: Color(color).alpha(alphaAmount).toString(),
            opacity: this.state.isMuted ? 0.2 : 1
        }

       

        // show vertex handles if in edit mode, allow dragging to reshape
        if (isEditMode) {
            return (
                <Group 
                    draggable={true}
                    dragBoundFunc={this.dragBoundFunc}
                    onDragMove={this.handleShapeDrag}
                    onDragStart={this.handleDragStart}
                    onDragEnd={this.handleDragEnd}
                    opacity={attrs.opacity}
                    >
                    <Line
                        ref={c => this.shapeElement = c}
                        points={this.state.points}
                        fill={attrs.fill}
                        lineJoin='bevel'
                        stroke={attrs.stroke}
                        strokeWidth={attrs.strokeWidth}
                        closed={true}
                        strokeScaleEnabled={false}
                        // scale={{
                        //     x: this.state.scaleRatio,
                        //     y: this.state.scaleRatio
                        // }}
                        // offset={{
                        //     x: -1*this.state.offsetX,
                        //     y: -1*this.state.offsetY
                        // }}
                        onClick={this.handleShapeClick}
                        onMouseDown={this.handleMouseDown}
                        onMouseOver={this.handleMouseOver}
                        onMouseOut={this.handleMouseOut}
                    />
                    
                    {this.state.points.map((p, i, arr) => {
                        if (!(i % 2)) {
                            return (
                                <ShapeVertex 
                                    key={i}
                                    index={i}
                                    p={{
                                        x: p, 
                                        y: arr[i+1]
                                    }}
                                    onVertexDragMove={this.handleVertexDragMove(i)}
                                    color={color}
                                />);
                        } else {
                            return null
                        }
                    })}

                    <Portal isOpened={this.props.isSelected}> 
                        <ShapeEditorPanel
                            index={this.props.index}
                            ref="shapeEditorPanel"
                            position={{
                                x: this.state.editorX,
                                y: this.state.editorY
                            }}
                            
                            tempo={this.props.tempo} 
                            
                            volume={this.state.volume}
                            onVolumeChange={this.handleVolumeChange}
                            
                            isMuted={this.state.isMuted}
                            onMuteChange={this.handleMuteChange}

                            colorIndex={this.state.colorIndex}
                            colorsList={this.props.colorsList}
                            onColorChange={this.handleColorChange}
                            
                            onQuantizeClick={this.setPerimeterLength}
                            onDeleteClick={this.handleDelete}

                        />
                    </Portal>

                </Group>

            );
        } else {
            // if not in edit mode, show only the origin point
            return (   
                <Group 
                    draggable={false}
                    opacity={attrs.opacity}
                >   
                    <Line
                        ref={c => this.shapeElement = c}
                        strokeScaleEnabled={false}
                        // scale={{
                        //     x: this.state.scaleRatio,
                        //     y: this.state.scaleRatio
                        // }}
                        // offset={{
                        //     x: -1*this.state.offsetX,
                        //     y: -1*this.state.offsetY
                        // }}
                        points={this.state.points}
                        fill={attrs.fill}
                        lineJoin='miter'
                        stroke={color}
                        strokeWidth={attrs.strokeWidth}
                        closed={true}
                    />
                    
                    <ShapeVertex 
                        index={0}
                        color={color}
                        p={{
                            x: this.state.points[0], 
                            y: this.state.points[1]
                        }}
                        onVertexDragMove={this.handleVertexDragMove(0)}
                    />
                </Group>
            );
        }
        
    }
}

export default Shape

function dist(x0,y0,x1,y1) {
    return Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0));
}

/*
    The shape's vertecies. Can be dragged to edit the shape.
*/
class ShapeVertex extends Component {
    constructor(props) {
        super(props);

        const luminosity = Color(props.color).luminosity();
        this.lightenAmount = 1.8 * (1-luminosity);
        
        this.defaultRadius = 4;
        this.hoverRadius = 6;
        this.strokeWidth = 2;

        this.state = {
            radius: this.defaultRadius,
            color: props.color
        }

        this.handleMouseOver = this.handleMouseOver.bind(this)
        this.handleMouseOut = this.handleMouseOut.bind(this)
    }

    handleMouseOver () {
        this.setState({
            radius: this.hoverRadius
        })
    }

    handleMouseOut () {
        this.setState({
            radius: this.defaultRadius
        })
    }

    render () {
        // solid if first node, pale fill if not
        const fillColor = (this.props.index === 0) ? this.props.color : Color(this.props.color).lighten(this.lightenAmount).toString()

        return (
            <Circle 
                x={this.props.p.x}
                y={this.props.p.y}
                radius={this.state.radius}
                fill={fillColor}
                stroke={this.props.color}
                strokeWidth={this.strokeWidth}
                draggable={true}
                onDragMove={this.props.onVertexDragMove}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
            />
        );
    }
}

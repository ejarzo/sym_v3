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
            editorX: 0,
            editorY: 0,
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

        this.handleDelete = this.handleDelete.bind(this);    
    }
    
    componentDidMount () {

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.activeTool === 'draw') {
            this.setState({
                isHoveredOver: false
            })
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

    /* --- Vertecies -------------------------------------------------------- */

    handleVertexDragMove(i) {
        return (e) => {
            const pos = e.target.position()
            let points = this.state.points.slice();
            points[i] = pos.x;
            points[i+1] = pos.y;

            this.setState({
                points: points
            })
        };
    }

    /* =============================== RENDER =============================== */

    render () {
        const color = this.props.colorsList[this.state.colorIndex];
        const isEditMode = this.props.activeTool === 'edit';
        const alphaAmount = this.props.isSelected ? 0.8 : 0.4;

        const attrs = {
            strokeWidth: isEditMode ? (this.state.isHoveredOver ? 4 : 2) : 2,
            stroke: color,
            fill: Color(color).alpha(alphaAmount).toString()
        }

        // show vertex handles if in edit mode, allow dragging to reshape
        if (isEditMode) {
            return (
                <Group 
                    ref= {c => this.groupElement = c}
                    draggable={true}
                    onDragMove={this.handleShapeDrag}
                    onDragStart={this.handleDragStart}
                    onDragEnd={this.handleDragEnd}>
                    
                    <Line
                        points={this.state.points}
                        fill={attrs.fill}
                        lineJoin='bevel'
                        stroke={attrs.stroke}
                        strokeWidth={attrs.strokeWidth}
                        closed={true}
                        
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
                                    p={{x: p, y: arr[i+1]}}
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
                            volume={this.state.volume}
                            onVolumeChange={this.handleVolumeChange}
                            tempo={this.props.tempo} 
                            onDeleteClick={this.handleDelete}
                            colorIndex={this.state.colorIndex}
                            colorsList={this.props.colorsList}
                            onColorChange={this.handleColorChange}
                        />
                    </Portal>

                </Group>

            );
        } else {
            // if not in edit mode, show only the origin point
            return (   
                <Group 
                    draggable={false}
                    ref= {c => this.groupElement = c}>
                    
                    <Line
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
                        p={{x: this.state.points[0], y: this.state.points[1]}}
                        onVertexDragMove={this.handleVertexDragMove(0)}
                    />
                </Group>
            );
        }
        
    }
}

export default Shape


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

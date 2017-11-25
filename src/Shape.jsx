import React, { Component } from 'react';
import Portal from 'react-portal';
import Utils from './Utils.js';

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
        super(props);

        this.state = {
            points: props.points,
            colorIndex: props.colorIndex,
            
            volume: -5,
            isMuted: false,
            quantizeFactor: 1,

            isHoveredOver: false, 
            editorX: 0,
            editorY: 0,
        };
        
        this.quantizeLength = 700;
        
        // shape attribute changes
        this.handleVolumeChange = this.handleVolumeChange.bind(this)
        this.handleColorChange = this.handleColorChange.bind(this);    
        this.handleMuteChange = this.handleMuteChange.bind(this);    
        
        // shape events
        this.handleMouseDown = this.handleMouseDown.bind(this);    
        this.handleShapeClick = this.handleShapeClick.bind(this)
        this.handleMouseOver = this.handleMouseOver.bind(this)
        this.handleMouseOut = this.handleMouseOut.bind(this)
        this.handleShapeDrag = this.handleShapeDrag.bind(this);    
        this.dragBoundFunc = this.dragBoundFunc.bind(this);    
        
        // vertices
        this.handleVertexDragMove = this.handleVertexDragMove.bind(this);
        
        // perimeter 
        this.getTotalLength = this.getTotalLength.bind(this);    
        this.setPerimeterLength = this.setPerimeterLength.bind(this);    
        
        // shape editor handlers
        this.handleDelete = this.handleDelete.bind(this);    
        this.handleQuantizeClick = this.handleQuantizeClick.bind(this);    
        this.handleQuantizeFactorChange = this.handleQuantizeFactorChange.bind(this);    
        this.handleToTopClick = this.handleToTopClick.bind(this);    
        this.handleToBottomClick = this.handleToBottomClick.bind(this);    
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.activeTool === 'draw') {
            this.setState({
                isHoveredOver: false
            })
        }

        if (nextProps.isAutoQuantizeActive) {
            this.setState({
                points: this.setPerimeterLength(this.state.points, this.quantizeLength * this.state.quantizeFactor)
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
        //console.log(e.target.getAbsolutePosition());
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

    /* --- Color --- */
    handleColorChange (colorIndex) {
        return () => {
            this.setState({
                colorIndex: colorIndex
            })
        }
    }

    /* --- Volume --- */
    handleVolumeChange (val) {
        this.setState({
            volume: val
        });
    }

    handleMuteChange (event) {
        this.setState({
            isMuted: !this.state.isMuted
        })
    }

    /* --- Quantization --- */
    handleQuantizeClick () {
        this.setState({
            points: this.setPerimeterLength(this.state.points, this.quantizeLength * this.state.quantizeFactor)
        })
    }

    handleQuantizeFactorChange (factor) {
        return () => {
            if ((factor < 1 && this.state.quantizeFactor >= 0.25) || 
                (factor > 1 && this.state.quantizeFactor <= 4)) {
                const newPerim = this.props.isAutoQuantizeActive ? 
                                    factor * this.state.quantizeFactor * this.quantizeLength :
                                    this.getTotalLength(this.state.points) * factor
                    
                this.setState({
                    points: this.setPerimeterLength(this.state.points, newPerim),
                    quantizeFactor: factor * this.state.quantizeFactor
                })
            }
        }
    }

    /* --- Arrangement --- */
    handleToTopClick () {
        this.groupElement.moveToTop();
        // TODO way to hacky
        this.setState({
            isHoveredOver: true
        })
        this.setState({
            isHoveredOver: false
        })
    }

    handleToBottomClick () {
        this.groupElement.moveToBottom();
        // TODO way to hacky
        this.setState({
            isHoveredOver: true
        })
        this.setState({
            isHoveredOver: false
        })
    }
   
    /* --- Vertices --------------------------------------------------------- */

    handleVertexDragMove(i) {
        return (e) => {
            const pos = e.target.position();
            let points = this.state.points.slice();
            points[i] = this.props.snapToGrid(pos.x);
            points[i+1] = this.props.snapToGrid(pos.y);

            if (this.props.isAutoQuantizeActive) {
                points = this.setPerimeterLength(points, this.quantizeLength * this.state.quantizeFactor);
            }

            this.setState({
                points: points
            })
        };
    }

    /* --- Helper ----------------------------------------------------------- */

    getTotalLength (points) {
        let len = 0;
        const n = points.length;

        for (let i = 2; i < points.length; i+=2) {
            const x = points[i];
            const y = points[i+1];
            const prevX = points[i-2];
            const prevY = points[i-1];
            len += Utils.dist(x,y,prevX,prevY)
        }

        // last edge
        len += Utils.dist(points[0], points[1], points[n-2], points[n-1]);
        return len;
    }

    getAveragePoint (points) {
        let totalX = 0;
        let totalY = 0;
        
        this.forEachPoint(points, (p) => {
            totalX += p.x;
            totalY += p.y;
        })

        return {
            x: totalX / (points.length / 2),
            y: totalY / (points.length / 2)
        }
    }

    setPerimeterLength (points, length) {
        //const length = this.quantizeLength;

        const currLen = this.getTotalLength(points);
        const avgPoint = this.getAveragePoint(points);
        const ratio = length / currLen;

        let newPoints = points.slice();
        
        this.forEachPoint(points, (p, i) => {
            newPoints[i] = p.x * ratio + (1 - ratio) * avgPoint.x;;
            newPoints[i+1] =  p.y * ratio + (1 - ratio) * avgPoint.y;;
        })

        return newPoints;
    }

    forEachPoint(points, callback) {
        for (var i = 0; i < points.length; i += 2) {
            let p = {
                x: points[i],
                y: points[i+1]
            }
            callback(p, i)
        }
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

        const perimeter = this.getTotalLength(this.state.points);

        // show vertex handles if in edit mode, allow dragging to reshape
        if (isEditMode) {
            return (
                <Group 
                    ref={c => this.groupElement = c}
                    draggable={true}
                    dragBoundFunc={this.dragBoundFunc}
                    onDragMove={this.handleShapeDrag}
                    onDragStart={this.handleDragStart}
                    onDragEnd={this.handleDragEnd}
                    opacity={attrs.opacity}>
                    
                    <Line
                        ref={c => this.shapeElement = c}
                        points={this.state.points}
                        fill={attrs.fill}
                        lineJoin='bevel'
                        stroke={attrs.stroke}
                        strokeWidth={attrs.strokeWidth}
                        closed={true}
                        strokeScaleEnabled={false}
                        onClick={this.handleShapeClick}
                        onMouseDown={this.handleMouseDown}
                        onMouseOver={this.handleMouseOver}
                        onMouseOut={this.handleMouseOut}/>
                    
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
                            
                            onQuantizeClick={this.handleQuantizeClick}
                            onDeleteClick={this.handleDelete}
                            
                            onQuantizeFactorChange={this.handleQuantizeFactorChange}
                            perimeter={perimeter}

                            onToTopClick={this.handleToTopClick}
                            onToBottomClick={this.handleToBottomClick}

                        />
                    </Portal>

                </Group>

            );
        } else {
            // if not in edit mode, show only the origin point
            return (   
                <Group 
                    ref={c => this.groupElement = c}
                    draggable={false}
                    opacity={attrs.opacity}>
                    <Line
                        ref={c => this.shapeElement = c}
                        strokeScaleEnabled={false}
                        points={this.state.points}
                        fill={attrs.fill}
                        lineJoin='miter'
                        stroke={color}
                        strokeWidth={attrs.strokeWidth}
                        closed={true}/>
                    
                    <ShapeVertex 
                        index={0}
                        color={color}
                        p={{
                            x: this.state.points[0], 
                            y: this.state.points[1]
                        }}
                        onVertexDragMove={this.handleVertexDragMove(0)}/>
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

import React, { Component } from 'react';
import Portal from 'react-portal';

import Color from 'color';

import {Group, Line, Circle} from 'react-konva';
import ShapeEditorPanel from './ShapeEditorPanel.jsx'

class Shape extends React.Component {
    constructor (props) {
        super();
        
        const fillColor = Color(props.color).alpha(0.4);
        const strokeColor = Color(props.color);

        this.shapeDefaultAttrs = {
            strokeWidth: 2,
            stroke: strokeColor,
            fill: fillColor
        }

        this.shapeHoverAttrs = {
            strokeWidth: 3,
            stroke: strokeColor,
            fill: fillColor
        }

        this.state = {
            volume: -5,
            points: props.points,
            attrs: this.shapeDefaultAttrs,

            editorX: 0,
            editorY: 0,
            editorOpen: false
        };

        this.handleVolumeChange = this.handleVolumeChange.bind(this)
        this.handleShapeClick = this.handleShapeClick.bind(this)
        this.handleMouseOver = this.handleMouseOver.bind(this)
        this.handleMouseOut = this.handleMouseOut.bind(this)
        this.handleVertexDragMove = this.handleVertexDragMove.bind(this);
        this.handleShapeDrag = this.handleShapeDrag.bind(this);    
        
        this.handleMouseDown = this.handleMouseDown.bind(this);    
        this.handleDragStart = this.handleDragStart.bind(this);    
        this.handleDragEnd = this.handleDragEnd.bind(this);    
        this.handlePortalOutsideMouseClick = this.handlePortalOutsideMouseClick.bind(this);    
    }
    
    componentDidMount () {

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.activeTool === 'draw') {
            this.setState({
                attrs: this.shapeDefaultAttrs
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
        console.log(this.props.index)
        this.props.handleShapeClick(this.props.index);
    }

    hideEditorPanel () {
        if (this.refs.editorPortal) {
            this.refs.editorPortal.closePortal();
        }
    }

    handleShapeDrag (e) {

    }

    handleDragStart (e) {
        // this.setState({
        //     editorOpen: false
        // });
    }

    handleDragEnd (e) {
        // this.setState({
        //     editorX: e.evt.offsetX,
        //     editorY: e.evt.offsetY,
        //     editorOpen: false
        // });
    }

    handleMouseOver (e) {
        this.setState({
            attrs: this.shapeHoverAttrs
        })
    }

    handleMouseOut () {
        this.setState({
            attrs: this.shapeDefaultAttrs
        })
    }

    /* --- Editor ----------------------------------------------------------- */

    handleVolumeChange (val) {
        this.setState({
            volume: val
        });
    }

    handlePortalOpen () {
        console.log("portal open")
    }

    handlePortalOutsideMouseClick () {
        console.log("outside mouse click")
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
        // show vertex handles if in edit mode, allow dragging to reshape
        if (this.props.activeTool === 'edit') {
            return (        
                <Group 
                    ref= {c => this.groupElement = c}
                    draggable={true}
                    onDragMove={this.handleShapeDrag}
                    onDragStart={this.handleDragStart}
                    onDragEnd={this.handleDragEnd}
                >
                    <Line
                        points={this.state.points}
                        fill={this.state.attrs.fill}
                        lineJoin='bevel'
                        stroke={this.state.attrs.stroke}
                        strokeWidth={this.state.attrs.strokeWidth}
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
                                    p={{x: p, y: arr[i+1]}}
                                    onVertexDragMove={this.handleVertexDragMove(i)}
                                    color={this.props.color}
                                    index={i}
                                />);
                        } else {
                            return null
                        }
                    })}

                    <Portal isOpened={this.props.isSelected}> 
                        <ShapeEditorPanel
                            ref="shapeEditorPanel"
                            position={{
                                x: this.state.editorX,
                                y: this.state.editorY
                            }}
                            volume={this.state.volume}
                            onVolumeChange={this.handleVolumeChange}
                            tempo={this.props.tempo} 
                        />
                    </Portal>

                </Group>

            );
        } else {
            return (   
                <Group 
                    draggable={false}
                    ref= {c => this.groupElement = c}>
                    <Line
                        points={this.state.points}
                        fill={this.state.attrs.fill}
                        lineJoin='miter'
                        stroke={this.state.attrs.stroke}
                        strokeWidth={this.state.attrs.strokeWidth}
                        closed={true}
                    />
                    <ShapeVertex 
                        p={{x: this.state.points[0], y: this.state.points[1]}}
                        onVertexDragMove={this.handleVertexDragMove(0)}
                        color={this.props.color}
                        index={0}
                    />
                </Group>
            );
        }
        
    }
}


class ShapeVertex extends Component {
    constructor(props) {
        super(props);
        const fillColor = (props.index === 0) ? props.color : Color(props.color).lighten(1.3)
        
        this.defaultAttrs = {
            fill: fillColor,
            radius: 4,
            stroke: props.color,
            strokeWidth: 2
        }

        this.hoverAttrs = {
            fill: fillColor,
            radius: 6,
            stroke: props.color,
            strokeWidth: 2
        }

        this.state = {
            attrs: this.defaultAttrs
        }

        this.handleMouseOver = this.handleMouseOver.bind(this)
        this.handleMouseOut = this.handleMouseOut.bind(this)
    }

    handleMouseOver () {
        this.setState({
            attrs: this.hoverAttrs
        })
    }

    handleMouseOut () {
        this.setState({
            attrs: this.defaultAttrs
        })
    }

    render () {
        return (
            <Circle 
                x={this.props.p.x}
                y={this.props.p.y}
                radius={this.state.attrs.radius}
                fill={this.state.attrs.fill}
                stroke={this.state.attrs.stroke}
                strokeWidth={this.state.attrs.strokeWidth}
                draggable={true}
                onDragMove={this.props.onVertexDragMove}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
            />
        );
    }
}


export default Shape
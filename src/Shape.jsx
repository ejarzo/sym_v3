import React, { Component } from 'react';
import Portal from 'react-portal';
import Utils from './Utils.js';
import Color from 'color';
import Tone from 'tone';

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
            isSoloed: false,
            quantizeFactor: 1,
            
            averagePoint: {x: 0, y: 0},
            firstNoteIndex: 1,
            noteIndexModifier: 0,

            isHoveredOver: false, 
            editorX: 0,
            editorY: 0,
            
            animCircleX: 0,
            animCircleY: 0
        };
        this.quantizeLength = 700;

        // shape attribute changes
        this.handleVolumeChange = this.handleVolumeChange.bind(this)
        this.handleColorChange = this.handleColorChange.bind(this);    
        this.handleMuteChange = this.handleMuteChange.bind(this);    
        this.handleSoloChange = this.handleSoloChange.bind(this);    
        
        // shape events
        this.handleMouseDown = this.handleMouseDown.bind(this);    
        this.handleShapeClick = this.handleShapeClick.bind(this)
        this.handleMouseOver = this.handleMouseOver.bind(this)
        this.handleMouseOut = this.handleMouseOut.bind(this)
        this.handleDrag = this.handleDrag.bind(this);    
        this.handleDragStart = this.handleDragStart.bind(this);    
        this.handleDragEnd = this.handleDragEnd.bind(this);    
        this.dragBoundFunc = this.dragBoundFunc.bind(this);    
        
        // vertices
        this.handleVertexDragMove = this.handleVertexDragMove.bind(this);
        
        // perimeter 
        this.getPointsWithFixedPerimeterLength = this.getPointsWithFixedPerimeterLength.bind(this);    
        
        // shape editor handlers
        this.handleDelete = this.handleDelete.bind(this);    
        this.handleQuantizeClick = this.handleQuantizeClick.bind(this);    
        this.handleQuantizeFactorChange = this.handleQuantizeFactorChange.bind(this);    
        this.handleToTopClick = this.handleToTopClick.bind(this);    
        this.handleToBottomClick = this.handleToBottomClick.bind(this);  
    }

    componentWillMount () {
        this.synth = new Tone.Synth({
                "portamento": 0,
                "oscillator": {
                    "detune": 0,
                    "type": "custom",
                    "partials" : [2, 1, 2, 2],
                    "phase": 0,
                    "volume": -6
                },
                "envelope": {
                    "attack": 0.005,
                    "decay": 0.3,
                    "sustain": 0.2,
                    "release": 1,
                }
            });
        
        this.synth.volume.value = this.state.volume;
        
        this.panner = new Tone.Panner(0);
        this.solo = new Tone.Solo();
        this.synth.chain(this.panner, this.solo, Tone.Master);
        
        this.part = new Tone.Part((time, val) => {
            //console.log("Playing note", val.note, "for", val.duration, "INDEX:", val.pIndex);            
            const dur = val.duration / this.part.playbackRate;
            
            // animation
            Tone.Draw.schedule(() => {
                const xFrom = this.state.points[val.pIndex-2];
                const yFrom = this.state.points[val.pIndex-1];
                const xTo = val.pIndex >= this.state.points.length ? this.state.points[0] : this.state.points[val.pIndex];
                const yTo = val.pIndex >= this.state.points.length ? this.state.points[1] : this.state.points[val.pIndex+1];
                
                if (this.animCircle) {
                    // TODO smooth animations...

                    const shapeFill = this.getFillColor();
                    this.shapeElement.setAttrs({
                        fill: "#FFF",
                    });
                    this.shapeElement.to({
                        fill: shapeFill,
                        duration: 0.2
                    });

                    this.animCircle.setAttrs({
                        x: xFrom,
                        y: yFrom,
                        fill: "#FFF",
                        radius: 8
                    });
                    this.animCircle.to({
                        x: xTo,
                        y: yTo,
                        duration: dur
                    });
                    this.animCircle.to({
                        radius: 5,
                        fill: this.props.colorsList[this.state.colorIndex],
                        duration: 0.3
                    });
                }
            }, time)
            
            const noteIndex = val.noteIndex + this.state.noteIndexModifier;
            const noteString = this.props.scaleObj.get(noteIndex).toString();
            // trigger synth
            this.synth.triggerAttackRelease(noteString, dur, time);
        }, []).start(0);

        this.part.loop = true;
        this.part.playbackRate = this.props.tempo/50;

        // TODO ugly
        if (this.props.isAutoQuantizeActive) {
            const newPoints = this.getPointsWithFixedPerimeterLength(this.state.points, this.quantizeLength * this.state.quantizeFactor);
            this.setNoteEvents(this.props.scaleObj, newPoints);
            this.setState({
                points: newPoints
            })
        } else {
            this.setNoteEvents(this.props.scaleObj, this.state.points);
        }
    }
    
    componentDidMount () {
        this.handleDrag();
    }

    componentWillUnmount () {
        // todo mouse hover causes update to unmounted component
        this.shapeElement.destroy();
        this.part.dispose();
        this.synth.dispose();
    }

    componentWillReceiveProps (nextProps) {
        //console.log(nextProps);
        
        /* remove hover styles when switchin to draw mode */
        if (nextProps.activeTool === 'draw' && this.props.activeTool === 'edit') {
            this.setState({
                isHoveredOver: false
            })
        }

        if (nextProps.isAutoQuantizeActive && nextProps.isAutoQuantizeActive !== this.props.isAutoQuantizeActive) {
            const newPoints = this.getPointsWithFixedPerimeterLength(this.state.points, this.quantizeLength * this.state.quantizeFactor);
            this.setNoteEvents(nextProps.scaleObj, newPoints);
            this.setState({
                points: newPoints
            })
        }

        /* update note events if new scale or new tonic */
        if (this.props.scaleObj.name !== nextProps.scaleObj.name || 
                this.props.scaleObj.tonic.toString() !== nextProps.scaleObj.tonic.toString()) {
            this.setNoteEvents(nextProps.scaleObj, this.state.points)
        }

        /* on tempo update */
        if (this.props.tempo !== nextProps.tempo) {
            this.part.playbackRate = nextProps.tempo/50;
            //this.setNoteEvents(nextProps.scaleObj, this.state.points)
        }
    }
    
    shouldComponentUpdate (nextProps, nextState) {
        return !(this.isEquivalent(this.props, nextProps) && this.isEquivalent(this.state, nextState));
    }

    isEquivalent(a, b) {
        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false;
            }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true;
    }
    /* ================================ AUDIO =============================== */

    setNoteEvents (scaleObj, points) {
        this.part.removeAll();
        
        let delay = 0;
        let prevNoteIndex = this.state.firstNoteIndex;

        Utils.forEachPoint(points, (p, i) => {
            if (i >= 2) {
                const noteInfo = this.getNoteInfo(points, scaleObj, i, i-2, i-4, prevNoteIndex);
                this.part.add(delay, noteInfo);
                delay += noteInfo.duration;
                prevNoteIndex = noteInfo.noteIndex;
            }
        })

        // last edge
        const n = points.length;
        const lastNoteInfo = this.getNoteInfo(points, scaleObj, 0, n-2, n-4, prevNoteIndex);

        this.part.add(delay, lastNoteInfo)
        this.part.loopEnd = delay + lastNoteInfo.duration;
    }

    getNoteInfo (points, scaleObj, i, iPrev, iPrevPrev, prevNoteIndex) {
        const tempoModifier = 200;
        
        const p = {
            x: points[i],
            y: points[i+1]
        }
        const prev = {
            x: points[iPrev],
            y: points[iPrev+1]
        }
        const prevPrev = {
            x: points[iPrevPrev],
            y: points[iPrevPrev+1]
        }
        
        const edgeLength = Utils.dist(p.x, p.y, prev.x, prev.y) / tempoModifier;
        const theta = Utils.getAngle(p, prev, prevPrev)
        const degreeDiff = Utils.thetaToScaleDegree(theta, scaleObj);
        
        const noteIndex = prevNoteIndex + degreeDiff;
        
        return {
            duration: edgeLength, 
            noteIndex: noteIndex,
            pIndex: i === 0 ? points.length : i
        }
    }

    setPan (val) {
        this.panner.pan.value = val * 0.9;
    }

    /* ============================== HANDLERS ============================== */

    /* --- Shape ------------------------------------------------------------ */

    /* Click */
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
    
    /* Drag */
    handleDragStart (e) {
        this.setState({
            isDragging: true
        })
    }
    
    handleDrag (e) {
        const absPos = this.shapeElement.getAbsolutePosition();
        const avgPoint = Utils.getAveragePoint(this.state.points);

        const x = parseInt(absPos.x + avgPoint.x);
        const y = parseInt(absPos.y + avgPoint.y);

        const panVal = Utils.convertValToRange(x, 0, window.innerWidth, -1, 1);
        const noteIndexVal = parseInt(Utils.convertValToRange(y, 0, window.innerHeight, 5, -7));
        
        this.setPan(panVal);
        console.log(noteIndexVal);

        this.setState({
            averagePoint: {x: x, y: y},
            noteIndexModifier: noteIndexVal
        })
    }
    
    handleDragEnd (e) {
        this.setState({
            isDragging: false
        })    
    }

    dragBoundFunc (pos) {
        return {
            x: this.props.snapToGrid(pos.x),
            y: this.props.snapToGrid(pos.y)
        };
    }
    
    /* Hover */
    handleMouseOver () {
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
        this.synth.volume.value = val;
        this.setState({
            volume: val
        });
    }

    handleMuteChange (event) {
        this.part.mute = !this.state.isMuted;
        this.setState({
            isMuted: !this.state.isMuted
        })
    }

    handleSoloChange () {
        this.setState({
            isSoloed: !this.state.isSoloed
        })
        this.solo.solo = !this.solo.solo;
    }

    /* --- Quantization --- */
    handleQuantizeClick () {
        const newPoints = this.getPointsWithFixedPerimeterLength(this.state.points, 
                                this.quantizeLength * this.state.quantizeFactor);
        
        this.setNoteEvents(this.props.scaleObj, newPoints);
        this.setState({
            points: newPoints
        })
    }

    handleQuantizeFactorChange (factor) {
        return () => {
            if ((factor < 1 && this.state.quantizeFactor >= 0.25) || 
                (factor > 1 && this.state.quantizeFactor <= 4)) {
                const newPerim = this.props.isAutoQuantizeActive ? 
                                    factor * this.state.quantizeFactor * this.quantizeLength :
                                    Utils.getTotalLength(this.state.points) * factor
                const newPoints = this.getPointsWithFixedPerimeterLength(this.state.points, newPerim);
                
                this.setNoteEvents(this.props.scaleObj, newPoints);
                
                this.setState({
                    points: newPoints,
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

    handleVertexDragMove (i) {
        return (e) => {
            const pos = e.target.position();
            let points = this.state.points.slice();
            points[i] = this.props.snapToGrid(pos.x);
            points[i+1] = this.props.snapToGrid(pos.y);

            if (this.props.isAutoQuantizeActive) {
                points = this.getPointsWithFixedPerimeterLength(points, this.quantizeLength * this.state.quantizeFactor);
            }

            this.setNoteEvents(this.props.scaleObj, points);
            
            this.setState({
                points: points
            })
        };
    }

    /* --- Helper ----------------------------------------------------------- */

    getFillColor () {
        const color = this.props.colorsList[this.state.colorIndex];
        const alphaAmount = this.props.isSelected ? 0.8 : 0.4;
        return Color(color).alpha(alphaAmount).toString();
    }

    getPointsWithFixedPerimeterLength (points, length) {
        const currLen = Utils.getTotalLength(points);
        const avgPoint = Utils.getAveragePoint(points);
        const ratio = length / currLen;

        let newPoints = points.slice();
        
        Utils.forEachPoint(points, (p, i) => {
            newPoints[i] = p.x * ratio + (1 - ratio) * avgPoint.x;;
            newPoints[i+1] =  p.y * ratio + (1 - ratio) * avgPoint.y;;
        })

        return newPoints;
    }


    /* =============================== RENDER =============================== */

    render () {
        console.log("shape render");

        const color = this.props.colorsList[this.state.colorIndex];
        const isEditMode = this.props.activeTool === 'edit';
        const attrs = {
            strokeWidth: isEditMode ? (this.state.isHoveredOver ? 4 : 2) : 2,
            stroke: color,
            fill: this.getFillColor(),
            opacity: this.state.isMuted ? 0.2 : 1
        }

        const perimeter = Utils.getTotalLength(this.state.points);
        
        let panningVal = parseInt(Utils.convertValToRange(this.state.averagePoint.x, 0, window.innerWidth, -50, 50));
        if (panningVal > 0) {
            panningVal = panningVal + " R"
        } else if (panningVal < 0) {
            panningVal = Math.abs(panningVal) + " L"
        }

        const animCircle = this.props.isPlaying ? (
                <Circle
                    ref={c => this.animCircle = c}
                    hitGraphEnabled={false}
                    x={-999}
                    y={-999}
                    radius={6}
                    strokeWidth={2}
                    stroke={color}
                    fill={color}>
                </Circle>
            ) : null;

        // show vertex handles if in edit mode, allow dragging to reshape
        if (isEditMode) {
            return (
                <Group 
                    ref={c => this.groupElement = c}
                    draggable={true}
                    dragBoundFunc={this.dragBoundFunc}
                    onDragMove={this.handleDrag}
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

                    {animCircle}

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
                            isSoloed={this.state.isSoloed}
                            onSoloChange={this.handleSoloChange}

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

                    <Portal isOpened={this.state.isDragging}>
                        <div style={{
                            textTransform: 'capitalize',
                            backgroundColor: {color},
                            position: 'absolute',
                            top: this.state.averagePoint.y + 20,
                            left: this.state.averagePoint.x - 20,
                            fontSize: '0.8em'
                        }}>
                            PAN: {panningVal}<br/>
                            NOTE: {this.props.scaleObj.get(this.state.noteIndexModifier).toString()}
                        </div>
                    </Portal>
                </Group>
            );
        } else {
            // if not in edit mode, show only the origin point
            return (   
                <Group 
                    ref={c => this.groupElement = c}
                    hitGraphEnabled={false}
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

                    {animCircle}
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
    constructor (props) {
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

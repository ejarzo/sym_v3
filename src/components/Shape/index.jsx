import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Portal from 'react-portal';
import Color from 'color';
import Tone from 'tone';
import { Group, Line, Circle } from 'react-konva';

import Utils from '../../utils/Utils.js';
import ShapeVertex from './ShapeVertex';
import ShapeEditorPanel from './ShapeEditorPanel';
import InstrumentPresets from '../Project/InstrumentPresets';


const propTypes = {
    index: PropTypes.number.isRequired,
    colorIndex: PropTypes.number.isRequired,
    points: PropTypes.array.isRequired,
    isSelected: PropTypes.bool.isRequired,
    
    isPlaying: PropTypes.bool.isRequired,
    colorsList: PropTypes.array.isRequired,
    selectedInstruments: PropTypes.array.isRequired,
    
    isAutoQuantizeActive: PropTypes.bool.isRequired,
    activeTool: PropTypes.string.isRequired,
    tempo: PropTypes.number.isRequired,
    scaleObj: PropTypes.object.isRequired,
    
    onShapeClick: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    snapToGrid: PropTypes.func.isRequired,
};

class Shape extends Component {
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
        this.handleVolumeChange = this.handleVolumeChange.bind(this);
        this.handleColorChange = this.handleColorChange.bind(this);    
        this.handleMuteChange = this.handleMuteChange.bind(this);    
        this.handleSoloChange = this.handleSoloChange.bind(this);    
        
        // shape events
        this.handleMouseDown = this.handleMouseDown.bind(this);    
        this.handleShapeClick = this.handleShapeClick.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
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
        this.setSynth(this.props.selectedInstruments[this.state.colorIndex]);
       
        this.part = this.getPart();


        // TODO ugly
        if (this.props.isAutoQuantizeActive) {
            const newPoints = this.getPointsWithFixedPerimeterLength(this.state.points, this.quantizeLength * this.state.quantizeFactor);
            this.setNoteEvents(this.props.scaleObj, newPoints);
            this.setState({
                points: newPoints
            });
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
    
    componentWillUpdate(nextProps, nextState) {
        console.log('shape will update');
        
        /* change instrument */
        if (nextProps.selectedInstruments[this.state.colorIndex] !== this.props.selectedInstruments[this.state.colorIndex]) {
            console.log('changing inst');
            console.log('next instrument', nextProps.selectedInstruments[this.state.colorIndex]);
            console.log('current instrument', this.props.selectedInstruments[this.state.colorIndex]);
            this.setSynth(nextProps.selectedInstruments[this.state.colorIndex]);
        }

        if (nextState.colorIndex !== this.state.colorIndex) {
            this.setSynth(nextProps.selectedInstruments[nextState.colorIndex]);
        }
    }

    componentWillReceiveProps (nextProps) {

        /* remove hover styles when switchin to draw mode */
        if (nextProps.activeTool === 'draw' && this.props.activeTool === 'edit') {
            this.setState({
                isHoveredOver: false
            });
        }

        /* set to fixed perimeter */
        if (nextProps.isAutoQuantizeActive && nextProps.isAutoQuantizeActive !== this.props.isAutoQuantizeActive) {
            const newPoints = this.getPointsWithFixedPerimeterLength(this.state.points, this.quantizeLength * this.state.quantizeFactor);
            this.setNoteEvents(nextProps.scaleObj, newPoints);
            this.setState({
                points: newPoints
            });
        }

        /* update note events if new scale or new tonic */
        if (this.props.scaleObj.name !== nextProps.scaleObj.name || 
                this.props.scaleObj.tonic.toString() !== nextProps.scaleObj.tonic.toString()) {
            this.setNoteEvents(nextProps.scaleObj, this.state.points);
        }

        /* on tempo update */
        if (this.props.tempo !== nextProps.tempo) {
            this.part.playbackRate = nextProps.tempo/50;
            //this.setNoteEvents(nextProps.scaleObj, this.state.points)
        }
    }
    
    shouldComponentUpdate (nextProps, nextState) {
        return !(Utils.isEquivalent(this.props, nextProps) && Utils.isEquivalent(this.state, nextState));
    }

    /* ================================ AUDIO =============================== */
    
    getPart () {
        const part = new Tone.Part((time, val) => {
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
                        fill: '#FFF',
                    });
                    this.shapeElement.to({
                        fill: shapeFill,
                        duration: 0.2
                    });

                    this.animCircle.setAttrs({
                        x: xFrom,
                        y: yFrom,
                        fill: '#FFF',
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
            }, time);
            
            const noteIndex = val.noteIndex + this.state.noteIndexModifier;
            const noteString = this.props.scaleObj.get(noteIndex).toString();
            
            // trigger synth
            this.synth.triggerAttackRelease(noteString, dur, time);
        
        }, []).start(0);
        
        part.loop = true;
        part.playbackRate = this.props.tempo/50;
        
        return part;
    }

    getNoteInfo (points, scaleObj, i, iPrev, iPrevPrev, prevNoteIndex) {
        const tempoModifier = 200;
        
        const p = {
            x: points[i],
            y: points[i+1]
        };
        const prev = {
            x: points[iPrev],
            y: points[iPrev+1]
        };
        const prevPrev = {
            x: points[iPrevPrev],
            y: points[iPrevPrev+1]
        };
        
        const edgeLength = Utils.dist(p.x, p.y, prev.x, prev.y) / tempoModifier;
        const theta = Utils.getAngle(p, prev, prevPrev);
        const degreeDiff = Utils.thetaToScaleDegree(theta, scaleObj);
        
        const noteIndex = prevNoteIndex + degreeDiff;
        
        return {
            duration: edgeLength, 
            noteIndex: noteIndex,
            pIndex: i === 0 ? points.length : i
        };
    }

    setSynth (selectedInstrumentIndex) {
        console.log('selecting instrument:', selectedInstrumentIndex);
        if (this.synth) {
            this.synth.dispose();
        }

        const synthObj = InstrumentPresets[selectedInstrumentIndex];
        // console.log(synthObj);
        
        this.synth = new synthObj.baseSynth(synthObj.params);
        
        this.synth.volume.value = this.state.volume;
        
        this.panner = new Tone.Panner(0);
        this.solo = new Tone.Solo();
        this.synth.chain(this.panner, this.solo, Tone.Master);
    }

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
        });

        // last edge
        const n = points.length;
        const lastNoteInfo = this.getNoteInfo(points, scaleObj, 0, n-2, n-4, prevNoteIndex);

        this.part.add(delay, lastNoteInfo);
        this.part.loopEnd = delay + lastNoteInfo.duration;
    }

    setPan (val) {
        this.panner.pan.value = val * 0.9;
    }

    setEffectVal () {

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

    handleShapeClick () {
        this.props.onShapeClick(this.props.index);
    }

    handleDelete () {
        this.props.onDelete(this.props.index);
    }
    
    /* Drag */
    handleDragStart () {
        this.setState({
            isDragging: true
        });
    }
    
    handleDrag () {
        const absPos = this.shapeElement.getAbsolutePosition();
        const avgPoint = Utils.getAveragePoint(this.state.points);

        const x = parseInt(absPos.x + avgPoint.x, 10);
        const y = parseInt(absPos.y + avgPoint.y, 10);

        const panVal = Utils.convertValToRange(x, 0, window.innerWidth, -1, 1);
        const noteIndexVal = parseInt(Utils.convertValToRange(y, 0, window.innerHeight, 5, -7), 10);
        
        this.setPan(panVal);
        console.log(noteIndexVal);

        this.setState({
            averagePoint: {x: x, y: y},
            noteIndexModifier: noteIndexVal
        });
    }
    
    handleDragEnd () {
        this.setState({
            isDragging: false
        });  
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
        });
    }

    handleMouseOut () {
        this.setState({
            isHoveredOver: false
        });
    }

    /* --- Editor Panel ----------------------------------------------------- */

    /* --- Color --- */
    handleColorChange (colorIndex) {
        // this.setSynth(this.props.selectedInstruments[colorIndex])
        return () => {
            this.setState({
                colorIndex: colorIndex
            });
        };
    }

    /* --- Volume --- */
    handleVolumeChange (val) {
        this.synth.volume.value = val;
        this.setState({
            volume: val
        });
    }

    handleMuteChange () {
        this.part.mute = !this.state.isMuted;
        this.setState({
            isMuted: !this.state.isMuted
        });
    }

    handleSoloChange () {
        this.setState({
            isSoloed: !this.state.isSoloed
        });
        this.solo.solo = !this.solo.solo;
    }

    /* --- Quantization --- */
    handleQuantizeClick () {
        const newPoints = this.getPointsWithFixedPerimeterLength(this.state.points, 
            this.quantizeLength * this.state.quantizeFactor);
        
        this.setNoteEvents(this.props.scaleObj, newPoints);
        this.setState({
            points: newPoints
        });
    }

    handleQuantizeFactorChange (factor) {
        return () => {
            if ((factor < 1 && this.state.quantizeFactor >= 0.25) || 
                (factor > 1 && this.state.quantizeFactor <= 4)) {
                const newPerim = this.props.isAutoQuantizeActive ? 
                    factor * this.state.quantizeFactor * this.quantizeLength :
                    Utils.getTotalLength(this.state.points) * factor;
                const newPoints = this.getPointsWithFixedPerimeterLength(this.state.points, newPerim);
                
                this.setNoteEvents(this.props.scaleObj, newPoints);
                
                this.setState({
                    points: newPoints,
                    quantizeFactor: factor * this.state.quantizeFactor
                });
            }
        };
    }

    /* --- Arrangement --- */
    handleToTopClick () {
        this.groupElement.moveToTop();
        // TODO way to hacky
        this.setState({
            isHoveredOver: true
        });
        this.setState({
            isHoveredOver: false
        });
    }

    handleToBottomClick () {
        this.groupElement.moveToBottom();
        // TODO way to hacky
        this.setState({
            isHoveredOver: true
        });
        this.setState({
            isHoveredOver: false
        });
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
            });
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
            newPoints[i] = p.x * ratio + (1 - ratio) * avgPoint.x;
            newPoints[i+1] =  p.y * ratio + (1 - ratio) * avgPoint.y;
        });

        return newPoints;
    }


    /* =============================== RENDER =============================== */

    render () {
        console.log('shape render');

        const color = this.props.colorsList[this.state.colorIndex];
        const isEditMode = this.props.activeTool === 'edit';
        const attrs = {
            strokeWidth: isEditMode ? (this.state.isHoveredOver ? 4 : 2) : 2,
            stroke: color,
            fill: this.getFillColor(),
            opacity: this.state.isMuted ? 0.2 : 1
        };

        const perimeter = Utils.getTotalLength(this.state.points);
        
        let panningVal = parseInt(Utils.convertValToRange(this.state.averagePoint.x, 0, window.innerWidth, -50, 50), 10);
        if (panningVal > 0) {
            panningVal = `${panningVal} R`;
        } else if (panningVal < 0) {
            panningVal = `${Math.abs(panningVal)} L`;
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
                            return null;
                        }
                    })}

                    {animCircle}

                    <Portal isOpened={this.props.isSelected}> 
                        <ShapeEditorPanel
                            index={this.props.index}
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

Shape.propTypes = propTypes;

export default Shape;

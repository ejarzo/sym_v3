import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Color from 'color';
import { Group, Circle, Line } from 'react-konva';

const propTypes = {
    points: PropTypes.array.isRequired,
    color: PropTypes.string.isRequired,
    activeTool: PropTypes.string.isRequired,
    drawingState: PropTypes.string.isRequired,
    mousePos: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
};

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
            originPoint = (
                <Circle
                    x={this.props.points[0]} 
                    y={this.props.points[1]}
                    radius={this.radius}
                    stroke={this.props.color}
                    strokeWidth={this.strokeWidth}
                    fill={this.props.color}
                />
            );
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
            return null;
        }
    }
}

PhantomShape.propTypes = propTypes;

export default PhantomShape;

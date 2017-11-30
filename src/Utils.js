const Utils = {
    dist: (x0,y0,x1,y1) => {
        return Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0));
    },
    
    // knobs 
    describeArc: (x, y, radius, startAngle, endAngle) => {
        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);
        var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        var d = [
            "M", start.x, start.y, 
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
        return d;       
    },

    convertValToRange: (oldVal, oldMin, oldMax, newMin, newMax) => {
        return (((oldVal - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin
    },

    getAngle: (p1, p2, p3) => {
        var p12 = Math.sqrt(Math.pow((p1.x - p2.x),2) + Math.pow((p1.y - p2.y),2));
        var p13 = Math.sqrt(Math.pow((p1.x - p3.x),2) + Math.pow((p1.y - p3.y),2));
        var p23 = Math.sqrt(Math.pow((p2.x - p3.x),2) + Math.pow((p2.y - p3.y),2));

        //angle in radians
        //var resultRadian = Math.acos(((Math.pow(p12, 2)) + (Math.pow(p13, 2)) - (Math.pow(p23, 2))) / (2 * p12 * p13));

        //angle in degrees
        var resultDegree = Math.acos(((Math.pow(p12, 2)) + (Math.pow(p13, 2)) - (Math.pow(p23, 2))) / (2 * p12 * p13)) * 180 / Math.PI;

        return resultDegree;
    },

    isBetween: (val, a, b) => {
        return (val >= a && val <= b);
    }
}

function polarToCartesian (centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

export default Utils

const Utils = {
    dist: (x0,y0,x1,y1) => {
        return Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0));
    },

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

    convertValToRange (oldVal, oldMin, oldMax, newMin, newMax) {
        return (((oldVal - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin
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

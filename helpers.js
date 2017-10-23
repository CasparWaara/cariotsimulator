function angleConvert(angle) {
    const compass = { 
        north: {compass:'N', arrow:'\u2191'}, 
        north_east: {compass: 'NE', arrow: '\u2197'}, 
        east: {compass:'E', arrow:'\u2192'}, 
        south_east: {compass:'SE', arrow:'\u2198'}, 
        south: {compass:'S', arrow:'\u2193'}, 
        south_west: {compass:'SW', arrow:'\u2199'}, 
        west: {compass:'W', arrow:'\u2190'}, 
        north_west: {compass:'NW', arrow:'\u2196'}
    };
    const directions = Object.keys(compass);
    const degree = 360 / directions.length;
    angle = angle + degree / 2;
    for (let i = 0; i < directions.length; i++) {
      if (angle >= (i * degree) && angle < (i + 1) * degree){
        return compass[directions[i]];
      }
    }
    return compass['north'];
}

module.exports = {
    angleConvert
}
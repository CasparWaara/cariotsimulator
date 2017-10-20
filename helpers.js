function degreesToLetter(degree) {
    if (degree >= 0 && degree < 22.5) {
        return 'n';
    } else if (degree >= 22.5 && degree < 45) {
        return 'nne';
    } else if (degree >= 45 && degree < 67.5) {
        return 'ne';
    } else if (degree >= 67.5 && degree < 90) {
        return 'ene';
    } else if (degree >= 90 && degree < 112.5) {
        return 'e';
    } else if (degree >= 112.5 && degree < 135) {
        return 'ese';
    } else if (degree >= 135 && degree < 157.5) {
        return 'se';
    } else if (degree >= 157.5 && degree < 180) {
        return 'sse';
    } else if (degree >= 180 && degree < 202.5) {
        return 's';
    } else if (degree >= 202.5 && degree < 225) {
        return 'ssw';
    } else if (degree >= 225 && degree < 247.5) {
        return 'sw';
    } else if (degree >= 247.5 && degree < 270) {
        return 'wsw';
    } else if (degree >= 270 && degree < 292.5) {
        return 'w';
    } else if (degree >= 292.5 && degree < 315) {
        return 'wnw';
    } else if (degree >= 315 && degree < 337.5) {
        return 'nw';
    } else if (degree >= 337.5 && degree < 360) {
        return 'nnw';
    }

}

module.exports = {
    degreesToLetter
}
'use strict';
const conf = require('./app-config.json');
const dweetClient = require('node-dweetio');
const dweetio = new dweetClient();
const readline = require('readline');
const geo = require('geolib');
const helpers = require('./helpers');
let lastTrip = 0;

let carStatus = {
    "speed": 0,
    "power": 0,
    "consumption": 0,
    "totaltrip": 0,
    "fuelconsumed": 0,
    "compass": 'n',
    "heading": 0,
    "lat": 64.931223,
    "lon": 25.386698
}



// Allows us to listen for events from stdin
readline.emitKeypressEvents(process.stdin);

// Raw mode gets rid of standard keypress events and other
// functionality Node.js adds by default
process.stdin.setRawMode(true);

// Start the keypress listener for the process
process.stdin.on('keypress', (str, key) => {
    const pressedKey = key.sequence;

    // In "raw" mode so we do our own kill switch
    if (pressedKey === '\u0003') {
        process.exit();
        clearInterval(travelTimer);
    }
    if (!(/[^asdw]/i.test(pressedKey))) {
        updateCar(pressedKey);
    }

});

function updateCar(key) {
    if (key === 'w') {
        if (carStatus.power < 5) {
            carStatus.power += 1;
        }
    } else if (key === 's') {
        if (carStatus.power > 0) {
            carStatus.power -= 1;
        }
    } else if (key === 'd') {
        if (carStatus.heading < 359) {
            carStatus.heading += 1;
        } else {
            carStatus.heading = 0;
        }
    } else if (key === 'a') {
        if (carStatus.heading > 0) {
            carStatus.heading -= 1;
        } else {
            carStatus.heading = 359;
        }
    }
    carStatus.consumption = conf.carconfig.specs[carStatus.power].consumption;
    carStatus.speed = conf.carconfig.specs[carStatus.power].speed;
    carStatus.compass = helpers.degreesToLetter(carStatus.heading);
}

function travelAndConsumption() {
    // timer hits every second so calculate how much we have traveled
    carStatus.totaltrip += carStatus.speed * 0.277778;

    // calculate how much fuel we have used since last check
    const tempTrip = carStatus.totaltrip - lastTrip;

    carStatus.fuelconsumed += (carStatus.consumption / 100000) * tempTrip;

    lastTrip = carStatus.totaltrip;

    // if we have power, update the gps position
    if (carStatus.power > 0) {
        const lastPoint = {
            lat: carStatus.lat,
            lon: carStatus.lon
        };
        const newPosition = geo.computeDestinationPoint(lastPoint, tempTrip, carStatus.heading);
        carStatus.lat = newPosition.latitude;
        carStatus.lon = newPosition.longitude;
    }

    output();
}

function output() {
    console.log('\x1Bc');
    console.log('Power         : ' + carStatus.power + '\n' +
        'Speed         : ' + carStatus.speed + ' km/h\n' +
        'Consumption   : ' + carStatus.consumption + ' l/100km\n' +
        'Total trip    : ' + Math.round(carStatus.totaltrip) + ' m\n' +
        'Fuel consumed : ' + carStatus.fuelconsumed + ' l\n' +
        'Heading       : ' + carStatus.heading + '\n' +
        'Compass       : ' + carStatus.compass + '\n' +
        'Latitude      : ' + carStatus.lat + '\n' +
        'Longitude     : ' + carStatus.lon);
}


function dweet(message) {
    dweetio.dweet_for('casparwaaracariot', {
        some: 'data'
    }, function (err, dweet) {
        console.log(dweet.thing); // 'my-thing' 
        console.log(dweet.content); // The content of the dweet 
        console.log(dweet.created); // The create date of the dweet 

    });
}

const travelTimer = setInterval(travelAndConsumption, 1000);
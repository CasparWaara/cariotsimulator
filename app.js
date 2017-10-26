'use strict';
const conf = require('./app-config.json');
const dweetClient = require('node-dweetio');
const dweetio = new dweetClient();
const readline = require('readline');
const geo = require('geolib');
const helpers = require('./helpers');
const outTemp = 21;
let lastTrip = 0;
let lastSend = process.hrtime();
let lastRun = process.hrtime();
let updating = false;

let carStatus = {
    "speed": 0,
    "power": 0,
    "consumption": 0,
    "totaltrip": 0,
    "fuelconsumed": 0,
    "compass": 'n',
    "heading": 0,
    "lat": 64.931223,
    "lon": 25.386698,
    "time": 0,
    "averagespeed": 0,
    "drivingtime": 0,
    "temperature": 21,
    "averageconsumption": 0
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

    // check if the key is asdw
    if (!(/[^asdw]/i.test(pressedKey))) {
        if (!updating) {
            updating = true;
            updateCar(pressedKey);
            travelAndConsumption();
        }
    }

});

// function to update car status if key is pressed
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
    carStatus.compass = helpers.angleConvert(carStatus.heading).compass;
}

// calculate "everything"
function travelAndConsumption() {

    // check the diff from last run to update distance (and other parameters)
    const timediff = process.hrtime(lastRun);
    lastRun = process.hrtime();
    const timediffms = (timediff[0] * 1000) + (timediff[1] / 1000000);

    // calculate how much we have traveled
    carStatus.totaltrip += carStatus.speed * (0.277778 * (timediffms / 1000));

    // calculate how much fuel we have used since last check
    const tempTrip = carStatus.totaltrip - lastTrip;
    lastTrip = carStatus.totaltrip;
    carStatus.fuelconsumed += (carStatus.consumption / 100) * (tempTrip / 1000);

    // if we have moved, update the gps position
    if (carStatus.tempTrip > 0) {
        const lastPoint = {
            lat: carStatus.lat,
            lon: carStatus.lon
        };
        const newPosition = geo.computeDestinationPoint(lastPoint, tempTrip, carStatus.heading);
        carStatus.lat = newPosition.latitude;
        carStatus.lon = newPosition.longitude;
    }

    // check if we have moved -> update driving time...
    // also if driving time is > 0 we can assume that the car
    // is stopped for a light for example
    if(tempTrip > 0 || carStatus.drivingtime > 0){
        carStatus.drivingtime += timediffms / 1000;
        averageSpeed();    
    }

    averageConsumption();

    // lazy way of doing the temperature ;)
    carStatus.temperature = outTemp - carStatus.power;

    // when this was run at
    carStatus.time = Date.now();

    output();
    updating = false;
}

function output() {
    console.log('\x1Bc');
    console.log('Power               : ' + carStatus.power + '\n' +
        'Speed               : ' + carStatus.speed + ' km/h\n' +
        'Consumption         : ' + carStatus.consumption + ' l/100km\n' +
        'Total trip          : ' + Math.round(carStatus.totaltrip) + ' m\n' +
        'Fuel consumed       : ' + carStatus.fuelconsumed + ' l\n' +
        'Heading             : ' + carStatus.heading + '\n' +
        'Compass             : ' + carStatus.compass + ' ' + helpers.angleConvert(carStatus.heading).arrow + '\n' +
        'Latitude            : ' + carStatus.lat + '\n' +
        'Longitude           : ' + carStatus.lon + '\n' +
        'Average speed       : ' + carStatus.averagespeed + ' km/h\n' +
        'Average consumption : ' + carStatus.averageconsumption + ' l/100km\n' +
        'Temperature         : ' + carStatus.temperature + ' c\n\n' +
        'ctrl-c to quit');
    dweet();
}

function averageSpeed() {
    carStatus.averagespeed = Math.round((carStatus.totaltrip / carStatus.drivingtime) * 3.6);
}

function averageConsumption() {
    if(carStatus.totaltrip > 0){
        carStatus.averageconsumption = Math.round(100 / ((carStatus.totaltrip / 1000) / (carStatus.fuelconsumed)));        
    }else{
        carStatus.averageconsumption = 0;
    }
}

function dweet() {
    // don't choke the sending (1s delay). In real world, this should be buffered
    // but I think it's out of scope of this challenge
    const timediff = process.hrtime(lastSend);
    const timediffms = (timediff[0] * 1000) + (timediff[1] / 1000000);
    if (timediffms / 1000 > 5) {
        dweetio.dweet_for(conf.thingname, carStatus, function (err, dweet) {
            if (err) {
                console.log(err);
            }
            lastSend = process.hrtime();
        });
    }
}

const travelTimer = setInterval(travelAndConsumption, 1000);
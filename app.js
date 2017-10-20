'use strict';
const conf = require('./app-config.json');
const dweetClient = require('node-dweetio');
const dweetio = new dweetClient();
const readline = require('readline');

let carStatus = {
    "speed": 0,
    "power": 0,
    "consumption": 0,
    "totaltrip": 0,
    "fuelconsumed": 0
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
    if(pressedKey === '\u0003') {
        process.exit();
        clearInterval(travelTimer);
    }
    if (!(/[^asdw]/i.test(pressedKey))) {
        updateCar(pressedKey);
    }

});

function updateCar(key){
    if(key === 'w'){
        if(carStatus.power < 5){
            carStatus.power += 1;
        }
    }else if(key === 's'){
        if(carStatus.power > 0){
            carStatus.power -= 1;
        }
    }
    carStatus.consumption = conf.carconfig.specs[carStatus.power].consumption;
    carStatus.speed = conf.carconfig.specs[carStatus.power].speed;
    travelAndConsumption();
}

function travelAndConsumption() {
    // sure we loose a bit of precission but I think it's ok in this case.
    carStatus.totaltrip += Math.round(carStatus.speed * 0.277778);
    output();
}

function output(){
    console.log('\x1Bc');
    console.log('Power       : ' + carStatus.power + '\n' +
    'Speed       : ' + carStatus.speed + ' km/h\n' +
    'Consumption : ' + carStatus.consumption + ' l/100km\n' +
    'Total trip  : ' + carStatus.totaltrip + ' m');
   
}


function dweet(message){
    dweetio.dweet_for('casparwaaracariot', {some:'data'}, function(err, dweet){
        console.log(dweet.thing); // 'my-thing' 
        console.log(dweet.content); // The content of the dweet 
        console.log(dweet.created); // The create date of the dweet 
     
    });
}

const travelTimer = setInterval(travelAndConsumption, 1000);
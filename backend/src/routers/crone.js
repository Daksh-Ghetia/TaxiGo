const express = require('express');
const cron = require('node-cron');
const Setting = require('../models/setting');

let timeToAcceptRequest;
let expression;
let cronTask; // Declare the cron task variable

getSettingData();

async function getSettingData() {
    try {
        /**Find all the setting data and if not found return no data to display*/
        let setting = await Setting.find({});
        if (setting.length > 0) {
            timeToAcceptRequest = setting[0].timeToAcceptRequest;
            expression = `*/${timeToAcceptRequest} * * * * *`;
            let data = new Date().toUTCString();
            console.log(data);
            console.log(expression);


            cron.schedule(expression, function () {
                // let data = new Date().toUTCString();
                // console.log(data);

                const currentTime = new Date().toUTCString();
                const currentSecond = new Date().getSeconds();
                const timeDifference = Math.floor((Math.abs((new Date(currentTime))-(new Date(data)))) / 1000);


                
                if (typeof currentTime >= typeof timeDifference) {
                    console.log(typeof currentTime, typeof timeDifference);
                    console.log("difference is equal");
                }
                console.log(timeDifference);
                console.log(currentTime);
            });
        }
    } catch (error) {}
}

// module.exports = cronTask;

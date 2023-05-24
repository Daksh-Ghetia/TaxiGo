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
        }
    } catch (error) {}
}

cron.schedule('*/30 * * * * *', function () {
    
});

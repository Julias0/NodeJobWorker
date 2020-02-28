var q = require('bull');
var taskQ = q('taskQueue');
var eventQueue = q('eventQueue');
var redisClient = require('./db');

module.exports.init = function (jobId) {

    redisClient.keys('jobs:*', function (err, jobKeys) {
        // console.log(jobKeys);
        jobKeys.forEach(function (jobKey) {
            redisClient.get(jobKey, function (err, job) {
                var parsedJob = JSON.parse(job);
                taskQ.process(parsedJob.name, function (response) {
                    processJob(parsedJob);
                });
            });
        });
    });
};

let processJob = function (job) {
    eventQueue.add({ event: job.event, userId: job.userId});
};

module.exports.processJob = processJob;
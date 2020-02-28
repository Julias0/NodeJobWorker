var router = require('express').Router();
var redisClient = require('../db');
var uuid = require('uuid').v4;
var job = require('../models/job');
var q = require('bull');
var taskQ = q('taskQueue');
var processJob = require('../jobHandler').processJob;

router.get('/', function (req, res) {
    redisClient.keys('jobs:*', function (err, response) {
        if (err) {
            console.error('ERROR!');
            console.log(err);
        }
        redisClient.mget([...response], function (err, response) {
            res.json((response.map(r => JSON.parse(r))));
        });
    });
});


router.get('/:jobId', function (req, res) {
    redisClient.get(req.params.jobId, function (err, response) {
        if (err) {
            console.log(err);
        }
        res.json(JSON.parse(response));
    });
});

router.delete('/:jobId', function (req, res) {
    redisClient.get('jobs:' + req.params.jobId, function (err, response) {
        if (err) {
            console.log(err);
        }

        taskQ.getRepeatableJobs().then(function (jobs) {
            let jobMap = {};
            jobs.forEach(function (job) {
                jobMap[job.name] = job.key;
            });
            taskQ.removeRepeatableByKey(jobMap[JSON.parse(response).name]).then(function (response) {
                redisClient.del('jobs:' + req.params.jobId, function (err, response) {
                    res.json(response);
                });
            });
        });
    });
});

router.post('/', function (req, res) {
    let event = typeof (req.body.event) !== 'undefined' ? req.body.event : false;
    let userId = typeof (req.body.userId) !== 'undefined' ? req.body.userId : false;
    let limit = typeof (req.body.limit) !== 'undefined' ? req.body.limit : false;
    let cron = typeof (req.body.cron) !== 'undefined' ? req.body.cron : false;

    if (event && userId && limit && cron) {
        let jobName = uuid();
        let id = uuid();

        taskQ.process(jobName, function (response) {
            redisClient.get('jobs:' + id, function (err, response) {
                if (!err) {
                    processJob(JSON.parse(response.data));                    
                }
            });
        });

        taskQ.add(jobName, { id }, {
            repeat: {
                cron,
                limit
            }
        }).then(function (createdJob) {
            let newJob = job(id, jobName, createdJob.id, event, new Date(), userId);
            redisClient.set('jobs:' + id, JSON.stringify(newJob), function (err, response) {
                if (!err) {
                    res.json(newJob);
                } else {
                    res.status(500).json(err);
                }
            });
        }).catch(function (err) {
            res.status(500).json(err);
        });
    } else {
        res.status(401).json({
            error: 'required data is not provided'
        });
    }
});

module.exports = router;
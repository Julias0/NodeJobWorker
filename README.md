# Node Job Worker Boilerplate

This is a micro sized api which uses redis to create a job-worker setup.
You can schedule jobs using the /job endpoint on the api to create new cron jobs.

The required payload for the post call will be -
```json
    {
        "event": "eventName",
        "userId": "NaNqwe34NANA",
        "limit": 100,
        "cron": "* * * * *"
    }
```

This will create a job and also store it inside redis as job:id

The created job will contain the following details
```json
    {
        "id": "f1f9a89d-7d6c-4b28-a109-3fc65e29cfc4",
        "name": "61b2f21f-7056-4a9c-8755-947627ec3032",
        "jobId": "repeat:6e07896e4f3d1fd69471f9cab3812f66:1582876980000",
        "event": "111Naaa",
        "createdAt": "2020-02-28T08:02:34.448Z",
        "userId": "NaNqwe34NANA"
    }
```

You can use the id for fetching the job details, deleting the job etc.

Every time the cron job triggers, it will push out the event in a redis queue called `eventQueue`

check the jobHandler file inside node-job for more details.

The event is processed in a fashion as inside the index.js of the node-workers i.e. they listen for events on thw queue and call a function whenever they receive an event.
let q = require('bull');

var eventQueue = q('eventQueue');

eventQueue.process(function (response) {
    console.log('Handled by worker 1!!!!');
    console.log(response.data); 
    console.log('Handled by worker 1!!!!');
 });
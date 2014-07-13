'use strict';

var fs = require('fs'),
    express = require('express'),
    app = express(),
    voices;

app.engine('.html', require('jade').renderFile);
app.set('title', 'Power to the People');
app.use('/assets/', express.static(__dirname + '/public/assets/'));

app.use('/voices', function(req, res) {
  res.send(voices);
});

app.use('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

fs.readFile('output/processed_hackathon_server.csv', function(err, contents) {
  if (err) {
    console.error(err);
    process.exit();
  } else {
    console.log('Completed reading truncated voice data');
    voices = contents;
    console.log('Listening on port http://localhost:3000');
    app.listen(3000);
  }
});

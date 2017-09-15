var http = require('http'),
  fs = require('fs'),
  socketio = require('socket.io'),
  child_pty = require('child_pty'),
  ss = require('socket.io-stream'),
  debug = require('debug')('FlightTutorials');

var config = require('./config.json');

var server = http.createServer()
  .listen(config.port, config.interface);

var ptys = {};

server.on('request', function(req, res) {
  var file = null;
  debug('Request for %s', req.url);

  var asset_match = req.url.match(/^\/tutorials\/static\/(.*)/);
  var index_match = req.url.match(/^\/tutorials(\/(index.html)?)?/);

  if (asset_match) {
    file = '/public/static/' + asset_match[1];
  } else if (index_match) {
    file = '/public/static/index.html';
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404 Not Found');
    return;
  }
  fs.createReadStream(__dirname + file).pipe(res);
});

socketio(server, {path: config.socketIO.path}).of('pty').on('connection', function(socket) {
  // receives a bidirectional pipe from the client see index.html
  // for the client-side
  ss(socket).on('new', function(stream, options) {
    debug('New stream %o %o', stream, options);

    var pty = child_pty.spawn(
      '/usr/bin/ssh',
      [
        // The following two options prevent use of the SSH agent and require
        // the user to provide a password for each session started.
        '-o', 'IdentitiesOnly yes', '-F', '/dev/null',
        // The following two options prevent the annoying "The authenticity of
        // host...Are you sure you wish to continue?" message from appearing.
        '-o', 'UserKnownHostsFile=/dev/null', '-o', 'StrictHostKeyChecking=no',
        'localhost'
      ],
      options
    );

    pty.stdout.pipe(stream).pipe(pty.stdin);
    ptys[stream] = pty;
    stream.on('end', function() {
      debug('Stream ended (%o)', stream);
      pty.kill('SIGHUP');
      delete ptys[stream];
    });
  });
});

process.on('exit', function() {
  var k = Object.keys(ptys);
  var i;

  for(i = 0; i < k.length; i++) {
    ptys[k].kill('SIGHUP');
  }
});

debug('Listening on %s:%s', config.interface, config.port);

// Copyright 2012 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var WebSocket = require('faye-websocket');
var http      = require('http');
var fs        = require('fs');

// TODO: pickup from environment?
var HOSTROOEXP = '.localtunnel.net:8080';
var PORT = 8080;

var server = http.createServer();

function L() {
  if (console && console.log) {
    console.log.apply(console, arguments);
  }
}

var files = {
  'mirror.html': ['/mirror.html', 'text/html', null],
  'mirror.js': ['/mirror.js', 'text/javascript', null],
  'jquery-1.9.1.min.js': ['/jquery-1.9.1.min.js', 'text/javascript', null],
  'tree_mirror.js': ['/tree_mirror.js', 'text/javascript', null],
  'app.js': ['/app.js', 'text/javascript', null],
  'app.css': ['/app.css', 'text/css', null],
  'public/cursor.png': ['/cursor.png', 'image/png', null]
};

// TODO: if this doesn't finish before server gets a request, then we
// might have a problem.
for (var file in files) {
  (function (f) {
    fs.readFile(f, function (err, content) {
      files[f][2] = content;
      L('read file - ' + f);
    });
  })(file);
}

fs.readFile('index.html', function (err, indexHTML) {
  server.addListener('request', function (request, response) {
    for (var f in files) {
      if (request.url == files[f][0]) {
        response.writeHead(200, {'Content-Type': files[f][1]});
        response.end(files[f][2]);
        return;
      }
    }

    if (request.url == '/' || request.url == '/index.html') {
      response.writeHead(200, {'Content-Type': 'text/html'});
      if (! request.headers.host) {
        return;
      }
      L("host - ", request.headers.host, request.headers.host.split(":")[0]);
      response.end((indexHTML+"").replace("{{host}}", request.headers.host.split(":")[0]));
      return;
    }

    L('Unknown resource: ' + request.url);
  });
});

var projectors = [];

server.addListener('upgrade', function(request, rawsocket, head) {
  var socket = new WebSocket(request, rawsocket, head);
  var id = "",
      proj;

  if (request.headers.host) {
    id = request.headers.host.replace(HOSTROOEXP, '');
  }
  L("host: ", request.headers.host);

  // Projector.
  if (request.url == '/projector') {
    L('PROJ: connection initiating.', id);

    if (projectors[id]) {
      projectors[id].messages.length = 0;
    } else {
      projectors[id] = {messages: [], receivers: []};
    }

    proj = projectors[id];
    L("PROJ: receiver cnt: ", proj.receivers.length);

    proj.projector = socket;

    proj.messages.push(JSON.stringify({ clear: true }));

    proj.receivers.forEach(function(socket) {
      socket.send(proj.messages[0]);
    });


    socket.onmessage = function(event) {
      L('PROJ: message received. now at ' +
                  proj.messages.length +
                  ' . sending to ' + proj.receivers.length);
      proj.receivers.forEach(function(receiver) {
        receiver.send(event.data);
      });

      proj.messages.push(event.data);
    };

    socket.onclose = function() {
      L('PROJ: projector closing, clearing messages');
      proj.messages.length = 0;
    };

    L('PROJ: projector open completed.');
    return;
  }

  // Receivers.
  if (request.url == '/receiver') {
    L("RECV: receiver for id: ", id);
    if (!projectors[id]) {
      projectors[id] = {messages: [], receivers: []};
    }
    proj = projectors[id];

    proj.receivers.push(socket);

    L('RECV: receiver opened. now at ' + proj.receivers.length +
                ' sending ' + proj.messages.length + ' messages');
    socket.send(JSON.stringify(proj.messages));


    socket.onclose = function() {
      var index = proj.receivers.indexOf(socket);
      proj.receivers.splice(index, 1);
      L('RECV: closed. now at ' + proj.receivers.length);
    };
  }
});

// TODO: get the port from console
server.listen(PORT);
L("Server started on port " + PORT);

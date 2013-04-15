// Copyright 2011 Google Inc.
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

var socket;

function socketSend(msg) {
  socket.send(JSON.stringify(msg));
}

var xhr = new XMLHttpRequest();
xhr.open("GET", "http://localhost:17171", true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    // JSON.parse does not evaluate the attacker's scripts.
    var serverURL = xhr.responseText;

    serverURL = 'ws://'+serverURL+'/projector';
    window.addEventListener('load', function () {
      onLoad(serverURL);
    });
  }
};
xhr.send();

function onLoad(serverURL) {
  chrome.extension.sendMessage({ mirror : true}, function(response) {
    if (response.mirror)
      startMirroring(serverURL);
    else
      stopMirroring();
  });
}

function startMirroring(serverURL) {
  if (socket)
    return;

  socket = new WebSocket(serverURL);
  var mirrorClient;

  socket.onopen = function() {
    socketSend({ base: location.href.match(/^(.*\/)[^\/]*$/)[1] });
    mirrorClient = new TreeMirrorClient(document, {
      initialize: function(rootId, children) {
        socketSend({
          f: 'initialize',
          args: [rootId, children]
        });
      },

      applyChanged: function(removed, addedOrMoved, attributes, text) {
        socketSend({
          f: 'applyChanged',
          args: [removed, addedOrMoved, attributes, text]
        });
      }
    });

    recMouseScroll(function (arr) {
      socketSend({ mouse: arr });
    });
  };

  socket.onclose = function() {
    mirrorClient.disconnect();
    socket = undefined;
  };
}

function stopMirroring() {
  if (socket)
    socket.close();
  socket = undefined;
}

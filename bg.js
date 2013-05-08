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

var mirroring = true;
var activeTab;
var windowId;

function a(s) {
  // alert(s);
}

chrome.tabs.getCurrent(function (tab) {
  a("curr tab: " + tab.id + ' - ' + tab.active);
  if (!tab.active) return;
  a("mirroring "+ tab.id);
  windowId = tab.windowId;
  mirrorTab(tab.id, windowId);
});

function mirrorTab(tabId, wId, force) {
  a("mirroring " + tabId + ' ac ' + activeTab);

  if (tabId != activeTab)
    chrome.tabs.executeScript(activeTab, { code: 'stopMirroring();' });

  activeTab = tabId;
  windowId = wId;

  // chrome.tabs.executeScript(activeTab, { code: 'startMirroring();' });
}

chrome.tabs.onActivated.addListener(function(selectInfo) {
  a('onactivechange: mrr ' + mirroring + ' win ' +
        selectInfo.windowId + ' cmp ' + windowId +
        '  tab ' + selectInfo.tabId
       );

  mirrorTab(selectInfo.tabId, selectInfo.windowId);
});

chrome.tabs.onUpdated.addListener(function (tid, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
    a('updated ' + changeInfo.status);
    mirrorTab(tid, tab.windowId, true);
  }
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  var mirror = false, id = null;

  id = (sender && sender.tab && sender.tab.id) ? sender.tab.id : false;
  sendResponse({ mirror: (mirroring && id === activeTab)});
});

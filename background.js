chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var xhr = new XMLHttpRequest();
    xhr.open(request.method, request.url, true);
    xhr.setRequestHeader('Authorization', request.headers.Authorization);
    xhr.setRequestHeader('Content-Type', request.headers['Content-Type']);
    xhr.onload = function () {
      var response = JSON.parse(xhr.responseText);
      sendResponse(response);
    };
    xhr.onerror = function () {
      sendResponse({
        error: 'Unable to send request'
      });
    };
    xhr.send(request.data);
  
    return true; 
  });
  
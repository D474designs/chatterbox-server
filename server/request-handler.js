 /*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
// var storage = {};
// storage.results = [{username: 'fred', text: 'hello', objectId: '0' }];
var fs = require('fs');


var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log("Serving request type " + request.method + " for url " + request.url);

  //if it's a GET request, then return messages, which is your response

  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.

  headers['Content-Type'] = "application/json";
  console.log(__dirname);

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);

  if (request.url === '/classes/messages') {
    if (request.method === 'GET') {
      fs.readFile(__dirname + '/messages.txt', 'utf-8', function(err, data) {
        if (err) {
          response.writeHead(404);
          response.end();
        } else {
          data = JSON.parse('[' + data + ']');
          response.writeHead(200, headers);
          response.end(JSON.stringify({results: data}));
        }
      });
    } else if (request.method ==='POST') {
      request.on('data', function(message) {
        var message = JSON.parse(message);
        message.objectId = hashCode(message.text);
        fs.appendFile(__dirname + '/messages.txt', ',' + JSON.stringify(message), 'utf-8', function(err) {
          if(err) {
            response.writeHead(404);
          } else {
            response.writeHead(201, headers);
          }
        });
      });

      request.on('end', function() {
        response.end('{"success" : "Updated Successfully", "status" : 201}');
      });
    } else if (request.method === 'OPTIONS') {
      headers['Content-Type'] = 'httpd/unix-directory';
      response.end();
    }
  } else if (request.url) {
    if (request.url === '/') {
      request.url = '/client/index.html';
    }
    var filepath = '' + request.url;
    fs.readFile(filepath.slice(1), function(err, html) {
      if (err) {
        console.log(request.url);
        console.log(err);
      } else if (html) {
        headers['Content-Type'] = "text/html";
        response.writeHead(200, headers);
        response.write(html);
        response.end();
      }
    }); 
  } else {
    response.writeHead(404, headers);
    response.end();
  }
  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  //  response.end("Hello, World!");

};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

//credit to http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
var hashCode = function(str){
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

module.exports.requestHandler = requestHandler;
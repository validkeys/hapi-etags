var Hapi    = require('hapi');
var server  = new Hapi.Server();

server.connection({ port: 3000 });

var response = [0];

setInterval(function(){
  response.push(response[response.length - 1] + 1);
  console.log("ETag should now be invalidated");
}, 10000);

server.route([
  {
    path:   "/",
    method: "GET",
    config: {
      handler(req, reply) {
        reply({ response: response });
      },
      cache: {
        privacy:  "private",
        expiresIn: 100000 * 1000
      }
    }
  }
]);

server.register([
  {
    register: require('hapi-etags'),
    options:  {
      algo:         "sha1",
      encoding:     "base64",
      varieties:    ['plain'],
      etagOptions:  {}
    }
  },
  {
    register: require('good'),
    options: {
      opsInterval: 1000,
      reporters: [{
        reporter: require('good-console'),
        events: {
          response: '*',
          log:      '*',
          error:    '*',
          request:  '*'
        }
      }]
    }
  }
], (err) => {
  if (err) { console.log(err); }
  server.start((err) => {
    console.log("Server Started");
  });
})

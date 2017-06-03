import { server as WebSocketServer } from 'websocket';
import http from 'http';
import DeviceTerminal from './DeviceTerminal.js';
import connectionData from './data/connectionData.json';

var server = http.createServer(() => {});
//process.env.PORT takes settings from Heroku settings
server.listen(process.env.PORT || connectionData.webSocket.port, () => {});

var wsServer = new WebSocketServer({
  httpServer: server
});

wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  var terminal = new DeviceTerminal(connectionData.sshConnection.host, connectionData.sshConnection.port);

  terminal.connect(connectionData.sshConnection.user, connectionData.sshConnection.password);
  terminal.on('data', data => {
    connection.sendUTF(JSON.stringify(['stdout', data]));
  });
  terminal.on('close', data => {
    connection.sendUTF(JSON.stringify(['close']));
  });

  connection.on('message', message => {
    if (message.type === 'utf8') {
      var data = JSON.parse(message.utf8Data);

      switch (data[0]) {
        case 'stdin':
          terminal.send(data[1]);
          break;
        case 'set_size':
          terminal.setWindowSize(data[1], data[2]);
          break;
      }
    }
  });

  connection.on('close', connection => {
    terminal.disconnect();
  });
});

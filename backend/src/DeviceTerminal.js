import EventEmitter from 'events';
import Client from 'ssh2';

export default class DeviceTerminal extends EventEmitter {
  constructor(address, port) {
    super();
    this.address = address;
    this.port = port;
    this.defaultTtySettings = {};
  }

  connect(username, password) {
    this.sshClient = new Client();
    this.sshClient.on('ready', this._onSshClientReady.bind(this));
    this.sshClient.connect({
      host: this.address,
      port: this.port,
      username: username,
      password: password
    });
  }

  disconnect() {
    this.sshClient.end();
  }

  send(data) {
    if (this.sshStream) {
      this.sshStream.write(data);
    }
  }

  setWindowSize(rows, cols) {
    this.defaultTtySettings.rows = rows;
    this.defaultTtySettings.cols = cols;

    if (this.sshStream) {
      this.sshStream.setWindow(rows, cols);
    }
  }

  _onSshClientReady() {
    this.sshClient.shell(
      this.defaultTtySettings,
      {},
      (err, stream) => {
        if (err) {
          throw err;
        }
        this.sshStream = stream;
        this.sshStream.on('close', () => {
          delete this.sshStream;
          this.sshClient.end();
          this.emit('close');
        });
        this.sshStream.on('data', data => {
          this.emit('data', data.toString());
        });
    });
  }
}

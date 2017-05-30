import React from 'react';
import Xterm from 'xterm';
import className from 'classnames';
import 'xterm/dist/xterm.css';
import './TerminalWindow.css';
import connectionData from './data/connectionData.json';

export default class TerminalWindow extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isFocused: false
    };
  }

  componentDidMount() {
    Xterm.loadAddon('fit');
    Xterm.loadAddon('terminado');
    this.xterm = new Xterm(this.props.options);
    this.xterm.open(this.refs.container, {focus: false});
    this.xterm.on('focus', this.handleFocusChange.bind(this, true));
    this.xterm.on('blur', this.handleFocusChange.bind(this, false));
  }

  componentWillUnmount() {
    this.disconnect();
    this.xterm.destroy();
    this.xterm = null;
  }

  connect() {
    this.connection = new window.WebSocket(connectionData.webSocket.host + ':' + connectionData.webSocket.port);

    this.connection.addEventListener('open', () => {
      this.xterm.terminadoAttach(this.connection);

      if (this.props.onConnectedChange) {
        this.props.onConnectedChange(true);
      }
    });

    this.connection.addEventListener('close', () => {
      if (this.props.onConnectedChange) {
        this.props.onConnectedChange(false);
      }
    });

    this.connection.addEventListener('error', event => {
      if (this.props.onError) {
        this.props.onError(event.error);
      }
    });

    this.connection.addEventListener('message', (event) => {
      var data = JSON.parse(event.data);

      if (data[0] === 'close') {
        this.disconnect();
      }
    });
  }

  disconnect() {
    if (this.connection) {
      this.xterm.terminadoDetach(this.connection);
      this.connection.close();
    }
  }

  focus() {
    this.xterm.focus();
  }

  fit() {
    this.xterm.fit();
  }

  resize(cols, rows) {
    this.xterm.resize(cols, rows);
  }

  setCursorBlink(blink) {
    if (this.xterm && this.xterm.cursorBlink !== blink) {
      this.xterm.cursorBlink = blink;
      this.xterm.refresh(0, this.xterm.rows - 1);
    }
  }

  render() {
    const terminalClassName = className('reactXterm', this.state.isFocused ? 'focused' : null, this.props.className);
    return (React.createElement("div", { ref: "container", className: terminalClassName }));
  }

  handleFocusChange(focused) {
    this.setState({
        isFocused: focused,
    });

    if (this.props.onFocusChange) {
      this.props.onFocusChange(focused);
    }
  }
}

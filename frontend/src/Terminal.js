import React from 'react';
import TerminalWindow from './TerminalWindow';

const TERMINAL_CONNECTING = Symbol();
const TERMINAL_CONNECTED = Symbol();
const TERMINAL_CLOSED = Symbol();

export default class Terminal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      terminalState: TERMINAL_CLOSED
    };

    this.handleConnectButtonClick = this.handleConnectButtonClick.bind(this);
    this.handleConnectedChange = this.handleConnectedChange.bind(this);
  }

  componentDidUpdate() {
    if (this.state.terminalState === TERMINAL_CONNECTING) {
      this.terminalWindow.connect();
    }
  }

  componentWillUnmount() {
    if (this.terminalWindow) {
      this.terminalWindow.disconnect();
    }
  }

  handleConnectButtonClick() {
    this.setState({
      terminalState: TERMINAL_CONNECTING
    });
  }

  handleConnectedChange(connected) {
    if (connected) {
      this.setState({
        terminalState: TERMINAL_CONNECTED
      });
      this.terminalWindow.fit();
      this.terminalWindow.focus();
    } else {
      this.setState({
        terminalState: TERMINAL_CLOSED
      });
    }
  }

  render() {
    let notConnected = this.state.terminalState !== TERMINAL_CLOSED;

    return (
      <div>
        { notConnected ? (
          <TerminalWindow
            ref={(terminalWindow) => { this.terminalWindow = terminalWindow; }}
            onConnectedChange={this.handleConnectedChange} />
        ) : (
          <button type="button" onClick={this.handleConnectButtonClick}>Connect</button>
        )}
      </div>
    );
  }
}

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  TextInput,
  ListView,
  Platform
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import SocketUtils from '../SocketUtils';
import Utils from '../Utils';

class App extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => true });
    this.state = {
      info: 'Initializing',
      status: 'init',
      roomID: '',
      isFront: true,
      selfViewSrc: Utils.getLocalStream().toURL(),
      remoteList: {},
      textRoomConnected: false,
      textRoomData: [],
      textRoomValue: ''
    };
  }
  componentDidMount = () => {
    console.log('componentDidMount');
    Utils.setContainer(this);
    SocketUtils.join('A', 'Sieu Thai');
  };
  _press = event => {
    this.refs.roomID.blur();
    this.setState({ status: 'connect', info: 'Connecting' });
    join(this.state.roomID);
  };
  receiveTextData = data => {
    const textRoomData = this.state.textRoomData.slice();
    textRoomData.push(data);
    this.setState({ textRoomData, textRoomValue: '' });
  };
  _textRoomPress = () => {
    if (!this.state.textRoomValue) {
      return;
    }
    const textRoomData = this.state.textRoomData.slice();
    textRoomData.push({ user: 'Me', message: this.state.textRoomValue });
    for (const key in pcPeers) {
      const pc = pcPeers[key];
      pc.textDataChannel.send(this.state.textRoomValue);
    }
    this.setState({ textRoomData, textRoomValue: '' });
  };
  _renderTextRoom = () => {
    return (
      <View style={styles.listViewContainer}>
        <ListView
          dataSource={this.ds.cloneWithRows(this.state.textRoomData)}
          renderRow={rowData => (
            <Text>{`${rowData.user}: ${rowData.message}`}</Text>
          )}
        />
        <TextInput
          style={{
            width: 200,
            height: 30,
            borderColor: 'gray',
            borderWidth: 1
          }}
          onChangeText={value => this.setState({ textRoomValue: value })}
          value={this.state.textRoomValue}
        />
        <TouchableHighlight onPress={this._textRoomPress}>
          <Text>Send</Text>
        </TouchableHighlight>
      </View>
    );
  };
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>{this.state.info}</Text>
        {this.state.textRoomConnected && this._renderTextRoom()}
        {this.state.status == 'ready' ? (
          <View>
            <TextInput
              ref="roomID"
              autoCorrect={false}
              style={{
                width: 200,
                height: 40,
                borderColor: 'gray',
                borderWidth: 1
              }}
              onChangeText={text => this.setState({ roomID: text })}
              value={this.state.roomID}
            />
            <TouchableHighlight onPress={this._press}>
              <Text>Enter room</Text>
            </TouchableHighlight>
          </View>
        ) : null}
        <RTCView streamURL={this.state.selfViewSrc} style={styles.selfView} />
        {Utils.mapHash(this.state.remoteList, function(remote, index) {
          return (
            <RTCView key={index} streamURL={remote} style={styles.remoteView} />
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  selfView: {
    width: 200,
    height: 150
  },
  remoteView: {
    width: 200,
    height: 150
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  listViewContainer: {
    height: 150
  }
});

export default App;

import React, { Component } from 'react';
import { RTCView } from 'react-native-webrtc';
import { View, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import Prompt from './Prompt';
import SocketUtils from '../SocketUtils';
import Utils from '../Utils';

export default class ListScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerRight: (
        <Button
          title="Begin live stream"
          onPress={() => params.onPressInputRoomName()}
        />
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      visiblePrompt: false,
      visibleLoading: false,
      listServer: []
    };
  }

  onPressInputRoomName = () => {
    this.setState({ visiblePrompt: true });
  };

  onCancelInput = () => {
    this.setState({ visiblePrompt: false });
  };

  onFinishInputRoomName = roomName => {
    Utils.setCurrentType('STREAMER');
    this.setState({ visiblePrompt: false });
    this.props.navigation.navigate('NewLiveStream', {
      isSelf: true,
      roomName,
      countViewer: 0
    });
  };

  componentDidMount = () => {
    Utils.setListContainer(this);
    SocketUtils.emitListServer();
    this.props.navigation.setParams({
      onPressInputRoomName: this.onPressInputRoomName
    });
  };

  onPressListItem = (roomName, countViewer) => {
    Utils.setCurrentType('VIEWER');
    this.props.navigation.navigate('NewLiveStream', {
      isSelf: false,
      roomName,
      countViewer
    });
  };

  renderList = () => {
    const { listServer } = this.state;
    const viewData = [];
    for (let key in listServer) {
      console.log(listServer[key]);
      const countPeople = listServer[key].participant.length;
      viewData.push(
        <TouchableOpacity
          key={key}
          style={styles.item}
          onPress={() => this.onPressListItem(key, countPeople)}
        >
          <Text>{key}</Text>
          <Text>{countPeople} peoples</Text>
        </TouchableOpacity>
      );
    }
    return viewData;
  };

  // this.setState({ visibleLoading: true });
  // SocketUtils.emitJoinServer(key, Utils.getRandomUsername(), () => {
  //   setTimeout(() => {
  //     this.setState({ visibleLoading: false });
  //     this.props.navigation.navigate('LiveStream', {
  //       isSelf: false,
  //       countViewer: countPeople
  //     });
  //   }, 0);
  // });

  render() {
    return (
      <View style={StyleSheet.container}>
        {this.renderList()}
        <Prompt
          title="Input your room name"
          placeholder="Sale quần áo giảm 30%"
          defaultValue=""
          visible={this.state.visiblePrompt}
          onSubmit={this.onFinishInputRoomName}
          onCancel={this.onCancelInput}
        />
        <Spinner
          visible={this.state.visibleLoading}
          textContent={'Loading...'}
          textStyle={{ color: '#FFF' }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  item: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginVertical: 15
  }
});

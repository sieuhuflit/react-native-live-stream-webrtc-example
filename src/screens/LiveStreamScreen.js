import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Platform
} from 'react-native';
import SocketUtils from '../SocketUtils';
import KeyboardAccessory from 'react-native-sticky-keyboard-accessory';
import { RTCView } from 'react-native-webrtc';
import FloatingHearts from '../components/FloatingHearts';
import Utils from '../Utils';
import PeerConnectionsUtils from '../PeerConnectionsUtils';
const { width, height } = Dimensions.get('window');
import { getStatusBarHeight } from 'react-native-status-bar-height';

export default class LiveStreamScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: null
  });
  constructor(props) {
    super(props);
    const isSelf = props.navigation.getParam('isSelf');
    const countViewer = props.navigation.getParam('countViewer');
    this.state = {
      isSelf,
      selfViewSrc:
        Utils.getLocalStream() !== undefined
          ? Utils.getLocalStream().toURL()
          : undefined,
      otherViewSrc:
        Utils.getOtherStream() !== undefined
          ? Utils.getOtherStream().toURL()
          : undefined,
      listMessages: Utils.getListMessages(),
      message: '',
      countHeart: 0,
      countViewer,
      isStreamerLeave: false
    };
  }

  componentDidMount = () => {
    console.log('did mount');
    Utils.setLiveStreamScreen(this);
    const roomName = this.props.navigation.getParam('roomName');
    SocketUtils.emitJoinServer(roomName, Utils.getRandomUsername(), () => {});
  };

  componentDidUpdate(prevProps, prevState) {
    // if (prevState.isStreamerLeave !== this.state.isStreamerLeave) {
    //   return Alert.alert('Alert', 'Streamer disconnected', [
    //     { text: 'Close', onPress: () => this.props.navigation.goBack() }
    //   ]);
    // }
  }

  onPressSend = () => {
    const { message } = this.state;
    if (message === '') {
      return;
    }
    PeerConnectionsUtils.broadcastMessage({
      name: Utils.getRandomUsername(),
      content: message
    });
    Utils.addMessage({ name: Utils.getRandomUsername(), content: message });
    this.setState({
      listMessages: Utils.getListMessages(),
      message: ''
    });
    Keyboard.dismiss();
  };

  onPressHeart = () => {
    const { countHeart } = this.state;
    this.setState({ countHeart: countHeart + 1 });
    PeerConnectionsUtils.broadcastMessage({
      name: Utils.getRandomUsername(),
      content: '#<3'
    });
  };

  renderMessageItem = ({ item, index }) => {
    console.log('renderMessageItem');
  };

  renderWrapBottom = () => {
    const { message } = this.state;
    if (Platform.OS === 'ios') {
      return (
        <KeyboardAccessory>
          <View style={styles.wrapBottom}>
            <TextInput
              style={styles.textInput}
              placeholder="Comment input"
              underlineColorAndroid="transparent"
              onChangeText={value => this.setState({ message: value })}
              value={message}
            />
            <TouchableOpacity
              style={styles.wrapIconSend}
              onPress={this.onPressSend}
            >
              <Image
                source={require('../assets/ico_send.png')}
                style={styles.iconSend}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.wrapIconHeart}
              onPress={this.onPressHeart}
            >
              <Image
                source={require('../assets/ico_heart.png')}
                style={styles.iconHeart}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAccessory>
      );
    } else {
      return (
        <View style={styles.wrapBottom}>
          <TextInput
            style={styles.textInput}
            placeholder="Comment input"
            underlineColorAndroid="transparent"
            onChangeText={value => this.setState({ message: value })}
            value={message}
          />
          <TouchableOpacity
            style={styles.wrapIconSend}
            onPress={this.onPressSend}
          >
            <Image
              source={require('../assets/ico_send.png')}
              style={styles.iconSend}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.wrapIconHeart}
            onPress={this.onPressHeart}
          >
            <Image
              source={require('../assets/ico_heart.png')}
              style={styles.iconHeart}
            />
          </TouchableOpacity>
        </View>
      );
    }
  };

  renderVideo = () => {
    console.log('+++++++++++ renderVideo');
    const { isSelf, selfViewSrc, otherViewSrc } = this.state;
    if (isSelf && selfViewSrc !== undefined) {
      console.log('isSelf');
      return <RTCView streamURL={selfViewSrc} style={styles.selfView} />;
    } else if (!isSelf && otherViewSrc !== undefined) {
      console.log('not isSelf');
      return <RTCView streamURL={otherViewSrc} style={styles.selfView} />;
    }
  };
  // <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>

  render() {
    const { listMessages, countHeart, countViewer } = this.state;
    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <View style={styles.wrapLiveText}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <View style={styles.wrapIconView}>
              <Image
                source={require('../assets/ico_view.png')}
                style={styles.iconView}
              />
              <View style={styles.wrapTextViewer}>
                <Text style={styles.textViewer}>{countViewer}</Text>
              </View>
            </View>
            <FloatingHearts count={countHeart} />
            {this.renderVideo()}
            {this.renderWrapBottom()}
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.wrapListMessages}>
          <ScrollView
            ref={ref => (this.scrollView = ref)}
            onContentSizeChange={(contentWidth, contentHeight) => {
              this.scrollView.scrollToEnd({ animated: true });
            }}
          >
            {listMessages.map(item => {
              return (
                <View style={styles.chatItem}>
                  <View style={styles.wrapAvatar}>
                    <Image source={item.avatar} style={styles.iconAvatar} />
                  </View>
                  <View style={styles.messageItem}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.content}>{item.content}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center'
  },
  selfView: {
    width: width,
    height: height,
    zIndex: -1
  },
  remoteView: {
    width: 200,
    height: 150
  },
  listMessages: {
    flex: 1
  },
  wrapBottom: {
    zIndex: 50,
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    height: height / 2,
    width: width
  },
  wrapListMessages: {
    zIndex: 10000,
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    height: height / 3,
    width: width
  },
  chatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 5
  },
  messageItem: {
    flexDirection: 'column',
    marginHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15
  },
  heartButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },
  textInput: {
    position: 'absolute',
    bottom: 4,
    left: 15,
    right: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 42
  },
  wrapIconHeart: {
    position: 'absolute',
    bottom: 5,
    right: 12,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconHeart: {
    width: 42,
    height: 42
  },
  wrapAvatar: {
    width: 44,
    height: 44,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconAvatar: {
    width: 44,
    height: 44
  },
  name: {
    fontSize: 15,
    fontWeight: '700'
  },
  content: {
    fontSize: 13
  },
  wrapIconSend: {
    position: 'absolute',
    bottom: 5,
    right: 65,
    width: 42,
    height: 42,
    borderRadius: 42,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconSend: {
    width: 33,
    height: 33
  },
  wrapLiveText: {
    position: 'absolute',
    top: getStatusBarHeight() + 10,
    left: 15,
    backgroundColor: 'rgba(231, 76, 60, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  liveText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white'
  },
  wrapIconView: {
    height: 40,
    flexDirection: 'row',
    position: 'absolute',
    top: getStatusBarHeight() + 10,
    left: 80,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconView: {
    width: 25,
    height: 25,
    tintColor: 'white'
  },
  wrapTextViewer: {
    marginLeft: 5
  },
  textViewer: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500'
  }
});

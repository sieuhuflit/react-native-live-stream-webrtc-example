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
import PeerConnectionUtils from '../PeerConnectionUtils';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const { width, height } = Utils.getDimensions();

class NewLiveStreamScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: null
  });
  constructor(props) {
    super(props);
    const isSelf = props.navigation.getParam('isSelf');
    const countViewer = props.navigation.getParam('countViewer');
    this.state = {
      isSelf,
      countViewer,
      selfViewSrc: !Utils.isNullOrUndefined(Utils.getLocalStream())
        ? Utils.getLocalStream().toURL()
        : undefined,
      otherViewSrc: !Utils.isNullOrUndefined(Utils.getOtherStream())
        ? Utils.getOtherStream().toURL()
        : undefined,
      countHeart: 0,
      listMessages: [],
      message: ''
    };
  }
  componentDidMount = () => {
    console.log('componentDidMount');
    Utils.setContainer(this);
    const roomName = this.props.navigation.getParam('roomName');
    SocketUtils.join(roomName, Utils.getRandomUsername());
  };

  onPressSend = () => {
    const roomName = this.props.navigation.getParam('roomName');
    const { message, listMessages } = this.state;
    if (message === '') {
      return;
    }
    SocketUtils.emitSendMessage(roomName, Utils.getRandomUsername(), message);
    const data = {
      roomId: roomName,
      displayName: Utils.getRandomUsername(),
      message,
      avatar: Utils.getRandomAvatar()
    };
    const newListMessages = listMessages.slice();
    newListMessages.push(data);
    this.setState({
      message: '',
      listMessages: newListMessages
    });
    Keyboard.dismiss();
  };

  onPressHeart = () => {
    const { countHeart } = this.state;
    const roomName = this.props.navigation.getParam('roomName');
    SocketUtils.emitSendMessage(roomName, Utils.getRandomUsername(), '#<3');
    this.setState({
      countHeart: countHeart + 1
    });
  };

  renderVideo = () => {
    const { isSelf, selfViewSrc, otherViewSrc } = this.state;
    if (isSelf && !Utils.isNullOrUndefined(selfViewSrc)) {
      return <RTCView streamURL={selfViewSrc} style={styles.selfView} />;
    } else if (!isSelf && !Utils.isNullOrUndefined(otherViewSrc)) {
      return <RTCView streamURL={otherViewSrc} style={styles.selfView} />;
    }
  };

  onChangeMessageText = value => {
    this.setState({ message: value });
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
              onChangeText={this.onChangeMessageText}
              value={message}
            />
            <TouchableOpacity
              style={styles.wrapIconSend}
              onPress={this.onPressSend}
              activeOpacity={0.6}
            >
              <Image
                source={require('../assets/ico_send.png')}
                style={styles.iconSend}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.wrapIconHeart}
              onPress={this.onPressHeart}
              activeOpacity={0.6}
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
            onChangeText={this.onChangeMessageText}
            value={message}
          />
          <TouchableOpacity
            style={styles.wrapIconSend}
            onPress={this.onPressSend}
            activeOpacity={0.6}
          >
            <Image
              source={require('../assets/ico_send.png')}
              style={styles.iconSend}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.wrapIconHeart}
            onPress={this.onPressHeart}
            activeOpacity={0.6}
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
  render() {
    const { countViewer, countHeart, listMessages } = this.state;
    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
          style={styles.container}
        >
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
            <FloatingHearts count={countHeart} style={styles.wrapGroupHeart} />
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
            {listMessages.length > 0 &&
              listMessages.map(item => {
                return (
                  <View style={styles.chatItem}>
                    <View style={styles.wrapAvatar}>
                      <Image source={item.avatar} style={styles.iconAvatar} />
                    </View>
                    <View style={styles.messageItem}>
                      <Text style={styles.name}>{item.displayName}</Text>
                      <Text style={styles.content}>{item.message}</Text>
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
  wrapGroupHeart: {
    marginBottom: 70
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

export default NewLiveStreamScreen;

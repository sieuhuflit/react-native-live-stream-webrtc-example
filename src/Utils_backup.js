import { Platform } from 'react-native';
import { MediaStreamTrack, getUserMedia } from 'react-native-webrtc';

let liveStreamScreen = null;
let localStream;
let otherStream;
let currentType = null;
// let listMessages = [];
let listMessages = [
  // { name: 'test', content: 'content' },
  // { name: 'test', content: 'content' },
  // { name: 'test', content: 'content' },
  // { name: 'test', content: 'content' },
  // { name: 'test', content: 'content' },
  // { name: 'test', content: 'content' },
  // { name: 'test', content: 'content' },
  // { name: 'test', content: 'content' },
  // { name: 'test', content: 'content' },
  // { name: 'test', content: 'content' },
  // { name: 'test', content: 'content' },
  // { name: 'test', content: 'content' }
];

const setCurrentType = type => {
  currentType = type;
};

const getCurrentType = () => {
  return currentType;
};

const getListMessages = () => {
  return listMessages;
};
const getLiveStreamScreen = () => {
  return liveStreamScreen;
};

const setLiveStreamScreen = data => {
  liveStreamScreen = data;
};

const addMessage = data => {
  data.avatar = getRandomAvatar();
  listMessages.push(data);
};

const getLocalStream = () => {
  return localStream;
};

const setLocalStream = stream => {
  localStream = stream;
};

const getOtherStream = () => {
  return otherStream;
};

const setOtherStream = stream => {
  otherStream = stream;
};

/**
 * Get Local Stream
 * @param {boolean} isFront true if Front camera , false if Back camera
 * @param {function} callback Callback after get stream finish
 */
const getLocalStreamDevice = (isFront, callback) => {
  let videoSourceId;
  if (Platform.OS === 'ios') {
    MediaStreamTrack.getSources(sourceInfos => {
      console.log('sourceInfos: ', sourceInfos);

      for (const i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (
          sourceInfo.kind == 'video' &&
          sourceInfo.facing == (isFront ? 'front' : 'back')
        ) {
          videoSourceId = sourceInfo.id;
        }
      }
    });
  }
  getUserMedia(
    {
      audio: true,
      video: {
        mandatory: {
          minWidth: 640, // Provide your own width, height and frame rate here
          minHeight: 360,
          minFrameRate: 30
        },
        facingMode: isFront ? 'user' : 'environment',
        optional: videoSourceId ? [{ sourceId: videoSourceId }] : []
      }
    },
    function(stream) {
      // stream.getAudioTracks()[0].enabled = false;
      // stream.getVideoTracks()[0].enabled = false;
      console.log('getUserMedia success', stream);
      callback(stream);
    },
    error => console.log('error ', error)
  );
};

const getRandomUsername = () => {
  const arrUsername = ['Michel Bay', 'Johnson Baby', 'Barack Obama'];
  const username = arrUsername[Math.floor(Math.random() * arrUsername.length)];
  return username;
};
const getRandomAvatar = () => {
  const arrAvatar = [
    require('./assets/avatar_1.png'),
    require('./assets/avatar_2.png'),
    require('./assets/avatar_3.png'),
    require('./assets/avatar_4.png')
  ];
  const avatar = arrAvatar[Math.floor(Math.random() * arrAvatar.length)];
  return avatar;
};

const Utils = {
  getLocalStream,
  setLocalStream,
  getLiveStreamScreen,
  setLiveStreamScreen,
  getOtherStream,
  setOtherStream,
  getCurrentType,
  setCurrentType,
  getLocalStreamDevice,
  addMessage,
  getListMessages,
  getRandomAvatar,
  getRandomUsername
};

export default Utils;

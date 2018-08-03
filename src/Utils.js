import { Platform, Dimensions } from 'react-native';
import { MediaStreamTrack, getUserMedia } from 'react-native-webrtc';

let localStream;
let otherStream;
let container;
let listContainer;
let currentType = null;
let streamerSocketId = null;
let randomDisplayName = null;

const setStreamerSocketId = socketId => {
  streamerSocketId = socketId;
};

const getStreamerSocketId = () => {
  return streamerSocketId;
};

const setCurrentType = type => {
  currentType = type;
};

const getCurrentType = () => {
  return currentType;
};

const setListContainer = container => {
  listContainer = container;
};

const getListContainer = () => {
  return listContainer;
};

const getContainer = () => {
  return container;
};

const setContainer = newContainer => {
  container = newContainer;
};

const setLocalStream = stream => {
  localStream = stream;
};

const getLocalStream = () => {
  return localStream;
};

const setOtherStream = stream => {
  otherStream = stream;
};

const getOtherStream = () => {
  return otherStream;
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
          minWidth: 640,
          minHeight: 360,
          minFrameRate: 30
        },
        facingMode: isFront ? 'user' : 'environment',
        optional: videoSourceId ? [{ sourceId: videoSourceId }] : []
      }
    },
    function(stream) {
      console.log('getUserMedia success', stream);
      callback(stream);
    },
    error => console.log('error : ' + error)
  );
};

const mapHash = (hash, func) => {
  const array = [];
  for (const key in hash) {
    const obj = hash[key];
    array.push(func(obj, key));
  }
  return array;
};

const getRandomUsername = () => {
  const arrUsername = ['Michel Bay', 'Johnson Baby', 'Barack Obama'];
  const username = arrUsername[Math.floor(Math.random() * arrUsername.length)];
  return username;
};

const isNullOrUndefined = value => {
  return value === null || value === undefined;
};

const getDimensions = () => {
  return Dimensions.get('window');
};

const Utils = {
  getLocalStreamDevice,
  setLocalStream,
  getLocalStream,
  getContainer,
  setContainer,
  mapHash,
  getRandomUsername,
  isNullOrUndefined,
  getDimensions,
  setOtherStream,
  getOtherStream,
  getListContainer,
  setListContainer,
  getCurrentType,
  setCurrentType,
  getStreamerSocketId,
  setStreamerSocketId,
  getRandomAvatar
};

export default Utils;

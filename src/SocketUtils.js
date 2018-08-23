import io from 'socket.io-client';
import {
  RTCPeerConnection,
  RTCMediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStreamTrack,
  getUserMedia
} from 'react-native-webrtc';
import PeerConnectionUtils from './PeerConnectionUtils';
import Utils from './Utils';

const socket = null;
const friends = [];
const listServer = [];

const getSocket = () => {
  return socket;
};

const getListServer = () => {
  return listServer;
};

const emitListServer = () => {
  socket.emit('list-server', {}, responseListServer => {
    console.log('list-server', responseListServer);
    Utils.getListContainer().setState({ listServer: responseListServer });
  });
};

const connect = () => {
  socket = io.connect(
    'https://live-stream-webrtc-server.herokuapp.com',
    // 'http://localhost:4443',
    { transports: ['websocket'] }
  );
};

const join = (roomId, displayName) => {
  socket.emit('join-server', { roomId, displayName }, friendList => {
    console.log('join-server', friendList);
    friends = friendList;
    if (friendList.length > 0) {
      const friend = friendList[0];
      const socketId = friend.socketId;
      Utils.setStreamerSocketId(socketId);
      PeerConnectionUtils.createPC(socketId, true);
    }
    // for (const i in friendList) {
    //   const friend = friendList[i];
    //   const socketId = friend.socketId;
    //   PeerConnectionUtils.createPC(socketId, true);
    // }
  });
};

const leave = socketId => {
  console.log('leave', socketId);
  const container = Utils.getContainer();
  const pcPeers = PeerConnectionUtils.getPeers();
  const pc = pcPeers[socketId];
  if (pc !== undefined) {
    const viewIndex = pc.viewIndex;
    pc.close();
    delete pcPeers[socketId];

    const remoteList = container.state.remoteList;
    delete remoteList[socketId];
    container.setState({ remoteList: remoteList });
    container.setState({ info: 'One peer leave!' });
  }
};

const handleOnExchange = () => {
  socket.on('exchange-client', data => {
    console.log('exchange-client ', data);
    PeerConnectionUtils.exchange(data);
  });
};

const handleOnLeave = () => {
  socket.on('leave-client', socketId => {
    leave(socketId);
  });
};

const handleOnConnect = () => {
  socket.on('connect', data => {
    console.log('connect');
    Utils.getLocalStreamDevice(true, stream => {
      Utils.setLocalStream(stream);
    });
  });
};

const emitExchangeServerSdp = (to, sdp) => {
  socket.emit('exchange-server', {
    to,
    sdp
  });
};

const emitExchangeServerCandidate = (to, candidate) => {
  socket.emit('exchange-server', {
    to,
    candidate
  });
};

const handleOnJoinClient = () => {
  socket.on('join-client', friend => {
    friends.push(friend);
    Utils.getContainer().setState({
      countViewer: Utils.getContainer().state.countViewer + 1
    });
  });
};

const handleOnLeaveClient = participant => {
  socket.on('leave-client', participant => {
    console.log('leave-client :', participant);
    const socketId = participant.socketId;
    if (PeerConnectionUtils.getPeers(socketId)) {
      let pc = PeerConnectionUtils.getPeers[socketId];
      if (pc !== null && pc !== undefined) {
        pc.close();
        delete PeerConnectionUtils.getPeers[socketId];
      }
      if (!Utils.isNullOrUndefined(Utils.getContainer())) {
        const newCountViewer = Utils.getContainer().state.countViewer - 1;
        Utils.getContainer().setState({
          countViewer: newCountViewer
        });
      }
    }
  });
};

const emitSendMessage = (roomId, displayName, message) => {
  socket.emit(
    'send-message',
    {
      roomId,
      displayName,
      message
    },
    data => {}
  );
};

const handleOnMessage = () => {
  socket.on('send-message', data => {
    if (data.message === '#<3') {
      const { countHeart } = Utils.getContainer().state;
      Utils.getContainer().setState({ countHeart: countHeart + 1 });
    } else {
      const { listMessages } = Utils.getContainer().state;
      data.avatar = Utils.getRandomAvatar();
      const newListMessages = listMessages.slice();
      newListMessages.push(data);
      Utils.getContainer().setState({ listMessages: newListMessages });
    }
  });
};

const SocketUtils = {
  getSocket,
  connect,
  join,
  handleOnConnect,
  handleOnExchange,
  handleOnLeave,
  handleOnJoinClient,
  handleOnLeaveClient,
  emitExchangeServerSdp,
  emitExchangeServerCandidate,
  emitListServer,
  getListServer,
  handleOnMessage,
  emitSendMessage
};
export default SocketUtils;

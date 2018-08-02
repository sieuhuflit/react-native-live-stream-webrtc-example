import PeerConnectionsUtils from './PeerConnectionsUtils';
import Utils from './Utils';
import SocketIOClient from 'socket.io-client';

const socket = null;
const listServer = [];
let peerConnections = {};
let friends = null;
let me = null;

const getFriendsList = () => {
  return friends;
};

const getSocket = () => {
  return socket;
};

const getListServer = () => {
  return listServer;
};

const connect = () => {
  socket = SocketIOClient.connect(
    'http://192.168.10.155:4443',
    { transports: ['websocket'] }
  );
};

const emitJoinServer = (roomId, displayName, callback) => {
  socket.emit('join-server', { roomId, displayName }, friendsList => {
    friends = friendsList;
    console.log('Joins', friends);
    friends.forEach(friend => {
      PeerConnectionsUtils.createPeerConnection(friend, true);
    });
    if (callback !== null) {
      me = {
        socketId: socket.id,
        displayName: displayName
      };
      callback();
    }
  });
};

const emitListServer = () => {
  socket.emit('list-server', {}, responseListServer => {
    console.log('list-server', responseListServer);
    listServer = responseListServer;
  });
};

const emitCountServer = (roomId, callback) => {
  socket.emit('count-server', roomId, count => {
    console.log('Count friends result: ', count);
  });
};

const handleOnConnect = () => {
  socket.on('connect', data => {
    console.log('connect');
    emitListServer(data => {});
    Utils.getLocalStreamDevice(true, stream => {
      Utils.setLocalStream(stream);
    });
  });
};

const handleOnExchangeClient = data => {
  socket.on('exchange-client', data => {
    console.log('exchange-client :', data);
    PeerConnectionsUtils.exchange(data);
  });
};

const handleOnLeaveClient = participant => {
  socket.on('leave-client', participant => {
    console.log('leave-client :', participant);
    const socketId = participant.socketId;
    if (PeerConnectionsUtils.getPeerConnections(socketId)) {
      let pc = peerConnections[socketId];
      if (pc !== null && pc !== undefined) {
        pc.close();
        delete peerConnections[socketId];
      }
      if (
        Utils.getLiveStreamScreen() !== null &&
        Utils.getLiveStreamScreen() !== undefined
      ) {
        const newCountViewer =
          Utils.getLiveStreamScreen().state.countViewer - 1;
        Utils.getLiveStreamScreen().setState({
          countViewer: newCountViewer
        });
        // if (Utils.getCurrentType() === 'VIEWER' && newCountViewer <= 0) {
        //   Utils.getLiveStreamScreen().setState({
        //     isStreamerLeave: true
        //   });
        // }
      }
    }
  });
};

const handleOnJoinClient = friend => {
  socket.on('join-client', friend => {
    friends.push(friend);
    Utils.getLiveStreamScreen().setState({
      countViewer: Utils.getLiveStreamScreen().state.countViewer + 1
    });
  });
};

const SocketUtils = {
  getSocket,
  getFriendsList,
  connect,
  emitListServer,
  emitJoinServer,
  emitCountServer,
  getListServer,
  handleOnConnect,
  handleOnExchangeClient,
  handleOnJoinClient,
  handleOnLeaveClient,
  handleOnLeaveClient
};

export default SocketUtils;

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription
} from 'react-native-webrtc';
import Utils from './Utils';
import SocketUtils from './SocketUtils';
let configuration = { iceServers: [{ url: 'stun:stun.l.google.com:19302' }] };
let peerConnections = {};

const getPeerConnections = () => {
  return peerConnections;
};

const createPeerConnection = (friend, isOffer) => {
  let socketId = friend.socketId;
  let retVal = new RTCPeerConnection(configuration);
  let socket = SocketUtils.getSocket();

  peerConnections[socketId] = retVal;

  retVal.onicecandidate = event => {
    console.log('onicecandidate', event);
    if (event.candidate) {
      socket.emit('exchange-server', {
        to: socketId,
        candidate: event.candidate
      });
    }
  };

  const createOffer = () => {
    retVal.createOffer(desc => {
      console.log('createOffer', desc);
      retVal.setLocalDescription(
        desc,
        () => {
          console.log('setLocalDescription', retVal.localDescription);
          socket.emit('exchange-server', {
            to: socketId,
            sdp: retVal.localDescription
          });
        },
        logError
      );
    }, logError);
  };

  retVal.onnegotiationneeded = () => {
    console.log('onnegotiationneeded');
    if (isOffer) {
      createOffer();
    }
  };

  retVal.oniceconnectionstatechange = event => {
    console.log('oniceconnectionstatechange', event);
    if (event.target.iceConnectionState === 'connected' && isOffer) {
      createDataChannel(isOffer, null);
    }
  };

  retVal.onsignalingstatechange = event => {
    console.log('onsignalingstatechange', event);
  };

  retVal.onaddstream = event => {
    console.log('onaddstream', event);
    if (event !== undefined) {
      console.log('----------------- onaddstream');
      console.log(event.stream);
      Utils.getLiveStreamScreen().setState({
        otherViewSrc: event.stream.toURL()
      });

      // let friend = SocketUtils.getFriendsList().filter(
      //   friend => friend.socketId == socketId
      // )[0];
      // Utils.setOtherStream(event.stream);
      // if (Utils.getLiveStreamScreen() !== null) {
      //   Utils.getLiveStreamScreen().forceUpdate();
      // }
    }
  };

  retVal.ondatachannel = event => {
    console.log('ondatachannel', event);
    createDataChannel(isOffer, event);
  };

  if (Utils.getCurrentType() === 'STREAMER') {
    Utils.getLocalStream().getAudioTracks()[0].enabled = true;
    Utils.getLocalStream().getVideoTracks()[0].enabled = true;
  }
  if (Utils.getCurrentType() === 'VIEWER') {
    Utils.getLocalStream().getAudioTracks()[0].enabled = false;
    Utils.getLocalStream().getVideoTracks()[0].enabled = false;
  }
  retVal.addStream(Utils.getLocalStream());

  const createDataChannel = (isOffer, _event) => {
    if (retVal.textDataChannel) {
      return;
    }
    var dataChannel = null;
    if (isOffer) {
      dataChannel = retVal.createDataChannel('text');
    } else {
      dataChannel = _event.channel;
    }

    dataChannel.onerror = error => {
      console.log('dataChannel.onerror', error);
    };

    dataChannel.onmessage = event => {
      console.log('dataChannel.onmessage:', event.data);
      if (JSON.parse(event.data).content === '#<3') {
        Utils.getLiveStreamScreen().setState({
          countHeart: Utils.getLiveStreamScreen().state.countHeart + 1
        });
      } else {
        Utils.addMessage(JSON.parse(event.data));
        Utils.getLiveStreamScreen().setState({
          listMessages: Utils.getListMessages()
        });
      }
    };

    dataChannel.onopen = () => {
      console.log('dataChannel.onopen');
    };

    dataChannel.onclose = () => {
      console.log('dataChannel.onclose');
    };

    retVal.textDataChannel = dataChannel;
  };

  return retVal;
};

const exchange = data => {
  let fromId = data.from;
  const socket = SocketUtils.getSocket();
  let pc;
  if (fromId in peerConnections) {
    pc = peerConnections[fromId];
  } else {
    let friend = SocketUtils.getFriendsList().filter(
      friend => friend.socketId == fromId
    )[0];
    if (friend === null) {
      friend = {
        socketId: fromId,
        displayName: ''
      };
    }
    pc = createPeerConnection(friend, false);
  }

  if (data.sdp) {
    console.log('exchange sdp', data);
    pc.setRemoteDescription(
      new RTCSessionDescription(data.sdp),
      () => {
        if (pc.remoteDescription.type == 'offer')
          pc.createAnswer(desc => {
            console.log('createAnswer', desc);
            pc.setLocalDescription(
              desc,
              () => {
                console.log('setLocalDescription', pc.localDescription);
                socket.emit('exchange-server', {
                  to: fromId,
                  sdp: pc.localDescription
                });
              },
              logError
            );
          }, logError);
      },
      logError
    );
  } else {
    console.log('exchange candidate', data);
    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
};

const broadcastMessage = message => {
  for (let key in peerConnections) {
    let pc = peerConnections[key];
    if (pc !== null && pc !== undefined) {
      if (pc.textDataChannel !== undefined && pc.textDataChannel !== null) {
        pc.textDataChannel.send(JSON.stringify(message));
      }
    }
  }
};

const logError = error => {
  console.log('logError', error);
};

const PeerConnectionsUtils = {
  getPeerConnections,
  createPeerConnection,
  exchange,
  broadcastMessage
};

export default PeerConnectionsUtils;

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription
} from 'react-native-webrtc';
import Utils from './Utils';
import SocketUtils from './SocketUtils';
const configuration = { iceServers: [{ url: 'stun:stun.l.google.com:19302' }] };

const peers = {};

const getPeers = () => {
  return peers;
};

const createPC = (socketId, isOffer) => {
  const pc = new RTCPeerConnection(configuration);
  const container = Utils.getContainer();
  const localStream = Utils.getLocalStream();
  peers[socketId] = pc;

  pc.onicecandidate = event => {
    console.log('onicecandidate', event.candidate);
    if (event.candidate) {
      SocketUtils.emitExchangeServerCandidate(socketId, event.candidate);
    }
  };

  const createOffer = () => {
    pc.createOffer(
      desc => {
        console.log('createOffer', desc);
        pc.setLocalDescription(
          desc,
          () => {
            console.log('setLocalDescription', pc.localDescription);
            SocketUtils.emitExchangeServerSdp(socketId, pc.localDescription);
          },
          error => console.log('error : ' + error)
        );
      },
      error => console.log('error : ' + error)
    );
  };

  pc.onnegotiationneeded = () => {
    console.log('onnegotiationneeded');
    if (isOffer) {
      createOffer();
    }
  };

  pc.oniceconnectionstatechange = event => {
    console.log('oniceconnectionstatechange', event.target.iceConnectionState);
    if (event.target.iceConnectionState === 'completed') {
      setTimeout(() => {
        getStats();
      }, 1000);
    }
    if (event.target.iceConnectionState === 'connected') {
      createDataChannel();
    }
  };
  pc.onsignalingstatechange = event => {
    console.log('onsignalingstatechange', event.target.signalingState);
  };

  pc.onaddstream = event => {
    console.log('onaddstream', event.stream);
    container.setState({ otherViewSrc: event.stream.toURL() });
  };
  pc.onremovestream = event => {
    console.log('onremovestream', event.stream);
  };

  if (Utils.getCurrentType() === 'STREAMER') {
    Utils.getLocalStream().getAudioTracks()[0].enabled = true;
    Utils.getLocalStream().getVideoTracks()[0].enabled = true;
  }
  if (Utils.getCurrentType() === 'VIEWER') {
    Utils.getLocalStream().getAudioTracks()[0].enabled = false;
    Utils.getLocalStream().getVideoTracks()[0].enabled = false;
  }

  pc.addStream(localStream);

  const createDataChannel = () => {
    if (pc.textDataChannel) {
      return;
    }
    const dataChannel = pc.createDataChannel('text');

    dataChannel.onerror = error => {
      console.log('dataChannel.onerror', error);
    };

    dataChannel.onmessage = event => {
      console.log('dataChannel.onmessage:', event.data);

      if (JSON.parse(event.data).content === '#<3') {
        Utils.getContainer().setState({
          countHeart: Utils.getContainer().state.countHeart + 1
        });
      } else {
        Utils.addMessage(JSON.parse(event.data));
        Utils.getContainer().setState({
          listMessages: Utils.getListMessages()
        });
      }
    };

    dataChannel.onopen = () => {
      console.log('dataChannel.onopen');
      container.setState({ textRoomConnected: true });
    };

    dataChannel.onclose = () => {
      console.log('dataChannel.onclose');
    };

    pc.textDataChannel = dataChannel;
  };
  return pc;
};

const exchange = data => {
  const pcPeers = PeerConnectionUtils.getPeers();
  const fromId = data.from;
  let pc;
  if (
    fromId === Utils.getStreamerSocketId() ||
    Utils.getStreamerSocketId() === null
  ) {
    if (fromId in pcPeers) {
      pc = pcPeers[fromId];
    } else {
      pc = createPC(fromId, false);
    }
    if (data.sdp) {
      console.log('exchange sdp', data);
      pc.setRemoteDescription(
        new RTCSessionDescription(data.sdp),
        () => {
          if (pc.remoteDescription.type == 'offer')
            pc.createAnswer(
              desc => {
                console.log('createAnswer', desc);
                pc.setLocalDescription(
                  desc,
                  () => {
                    console.log('setLocalDescription', pc.localDescription);
                    SocketUtils.emitExchangeServerSdp(
                      fromId,
                      pc.localDescription
                    );
                  },
                  error => console.log('error : ' + error)
                );
              },
              error => console.log('error : ' + error)
            );
        },
        error => console.log('error : ' + error)
      );
    } else {
      console.log('exchange candidate', data);
      pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }
};

const getStats = () => {
  const pcPeers = PeerConnectionUtils.getPeers();
  const pc = pcPeers[Object.keys(pcPeers)[0]];
  if (
    pc.getRemoteStreams()[0] &&
    pc.getRemoteStreams()[0].getAudioTracks()[0]
  ) {
    const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
    console.log('track', track);
    pc.getStats(
      track,
      function(report) {
        console.log('getStats report', report);
      },
      error => console.log('error : ', error)
    );
  }
};

const broadcastMessage = message => {
  for (let key in peers) {
    let pc = peers[key];
    if (!Utils.isNullOrUndefined(pc)) {
      if (pc.textDataChannel !== undefined && pc.textDataChannel !== null) {
        pc.textDataChannel.send(JSON.stringify(message));
      }
    }
  }
};

const PeerConnectionUtils = {
  getPeers,
  exchange,
  createPC,
  broadcastMessage
};

export default PeerConnectionUtils;

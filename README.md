# react-native-live-stream-webrtc-example

Server page: http://live-stream-webrtc-server.herokuapp.com

Server github : https://github.com/sieuhuflit/live-stream-webrtc-server

# Update config

```js
const connect = () => {
  socket = io.connect(
    'https://live-stream-webrtc-server.herokuapp.com',
    // 'http://192.168.10.155:4443',
    { transports: ['websocket'] }
  );
};
```

# Get started

1.  `npm install`
2.  `node app.js`
3.  Run iOS `react-native run-ios`
    Run Android `react-native run-android`

- Note : Just run on device, not working on simulator

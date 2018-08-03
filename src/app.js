import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { createStackNavigator } from 'react-navigation';
// import Permissions from 'react-native-permissions';
import SocketUtils from './SocketUtils';
import HomeScreen from './screens/HomeScreen';
import ListScreen from './screens/ListScreen';
// import LiveStreamScreen from './screens/LiveStreamScreen';
import TestScreen from './screens/TestScreen';
import NewLiveStreamScreen from './screens/NewLiveStreamScreen';

SocketUtils.connect();
SocketUtils.handleOnConnect();
SocketUtils.handleOnExchange();
SocketUtils.handleOnLeave();
SocketUtils.handleOnJoinClient();
SocketUtils.handleOnLeaveClient();
SocketUtils.handleOnMessage();

// SocketUtils.connect();
// SocketUtils.handleOnConnect();
// SocketUtils.handleOnExchangeClient();
// SocketUtils.handleOnJoinClient();
// SocketUtils.handleOnLeaveClient();

const RootStack = createStackNavigator(
  {
    Home: HomeScreen,
    List: ListScreen,
    NewLiveStream: NewLiveStreamScreen,
    Test: TestScreen
  },
  {
    initialRouteName: 'Home'
  }
);

export default class App extends Component {
  componentDidMount = () => {};

  render() {
    return <RootStack />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  }
});

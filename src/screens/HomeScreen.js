import React, { Component } from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default class HomeScreen extends Component {
  onPressBeginLiveStream = () => {
    this.props.navigation.navigate('List');
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.wrapButtonLiveStream}>
          <Button title="Live Stream" onPress={this.onPressBeginLiveStream} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  wrapButtonLiveStream: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    borderRadius: 15
  }
});

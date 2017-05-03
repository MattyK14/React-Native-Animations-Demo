import Expo from 'expo';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Circle from './src/Circle';

class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Circle />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

Expo.registerRootComponent(App);

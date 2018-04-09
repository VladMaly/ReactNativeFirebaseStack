import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Rename this file to Main.android.js to limit 
// the app to be only for ios purposes in the case
// team starts using libraries specific for ios, and
// are leaving android development to a future date.

class Main extends React.Component {
  render() {
    return (
      <View style={styles.container}> 
        <Text style={styles.text}>Android Version of App!</Text>
      </View>
    ); 
  }
}
export default Main;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'purple',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 75
    },
    text: {
      flex: 1,
      color: 'white',
      fontSize: 30
    }
  
});
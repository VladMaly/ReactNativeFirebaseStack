import React from 'react';
import Header from '../components/Header';
import { Text, StyleSheet, View } from 'react-native';
import { StackNavigator } from "react-navigation";
import { FormLabel, FormInput, Button, CheckBox, SocialIcon } from 'react-native-elements';
import ReadyForNavigation from '../services/navigatingAccountType';

import firebase from 'firebase';
import colors from '../styles/color';
const firebaseConstant = require('../constants/firebase');
const appConstant = require('../constants/appConstants');

firebase.initializeApp(firebaseConstant.FIREBASE_CONFIG);

class LogInPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { email: '', password: '', name: '', status: '', loading: false, isAccountTypeClient: true };
    console.ignoredYellowBox = ['Setting a timer'];
  }
  onSignUp() {
    // this.setState({ status: '', loading: true });
    // const { email, password } = this.state;
    // firebase.auth().createUserWithEmailAndPassword(email, password)
    //   .then((user) => {
    //     // Upload name change
    //     const rootRef = firebase.database().ref().child("users");
    //     const infoRef = rootRef.child('info');
    //     const uidRef = infoRef.child(user.uid);
    //     // https://firebase.google.com/docs/reference/js/firebase.User
    //     // nameRef.push();
    //     uidRef.set({
    //       email: this.state.email,
    //       name: this.state.name,
    //       isAccountTypeClient: this.state.isAccountTypeClient
    //     })
    //     .then((user) => {
    //       this.setState({ status: 'Success. Welcome!', loading: false });
    //       this.props.navigation.navigate('TabIndexPage');
    //     })
    //     .catch((error) => {
    //       this.setState({ status: error.message });
    //     })
    //   })
    //   .catch((error) => {
    //     this.setState({ status: error.message, loading: false});
    //   })
    // this.props.navigation.navigate('RegisterPage');
    this.props.navigation.dispatch({ type: 'Register' });
  }
  onSignIn() {
    this.setState({ status: '', loading: true });
    const { email, password } = this.state;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((user) => {
        this.setState({ status: 'Success. Welcome back!', loading: false });
        ReadyForNavigation.readyForNavigation(user.uid, this.props.navigation);
      })
      .catch((error) => {
        this.setState({ status: error.message, loading: false });
      })
  }
  onPass() {
    // this.props.navigation.navigate('TabIndexPage');
    firebase
      .auth()
      .signInWithEmailAndPassword("testSim@gmail.com", "Password1")
      .then(user => {
        this.setState({ status: "Success. Welcome!", loading: false });
        ReadyForNavigation.readyForNavigation(user.uid, this.props.navigation);
    })
    .catch(error => {
        this.setState({ status: error.message, loading: false });
    });
  }
  onPassServiceProvider() {
    firebase
    .auth()
    .signInWithEmailAndPassword("BartenderPro@gmail.com", "Password1")
    .then(user => {
      this.setState({ status: "Success. Welcome!", loading: false });
      ReadyForNavigation.readyForNavigation(user.uid, this.props.navigation);
  })
  .catch(error => {
      this.setState({ status: error.message, loading: false });
  });
  }
  onChangeAccountState() {
    this.setState({ isAccountTypeClient: !this.state.isAccountTypeClient });
  }
  onFacebookSignIn() {

  }
  //  {/* User/Client by default, and give ability to choose Cater Personell */}
  render() {
    return (
      <View style={styles.container}>
        <View style={[{ width:'95%', marginTop:'8%' }, styles.headerContainer]}>
          <Text style={styles.headerStyle}>{appConstant.APP_NAME}</Text>
          {/* <Text style={styles.headerStyle}>Clients catoring to your needs.</Text> */}
        </View>
        <View style={{ width:'95%', marginTop:'15%' }}>
          <FormLabel labelStyle={styles.textColor}>Email</FormLabel>
          <FormInput 
            value={this.state.email}
            onChangeText={email => this.setState({ email })}
            />
          <FormLabel labelStyle={styles.textColor}>Password</FormLabel>
          <FormInput 
            secureTextEntry={true}
            value={this.state.password}
            onChangeText={password => this.setState({ password })}
            />
        </View>
        <View><Text>{this.state.status}</Text></View>
        <View style={styles.buttonContainer}>
          <View>
            <Button 
              buttonStyle={styles.buttonColor}
              title="Sign Up"
              onPress={this.onSignUp.bind(this)}
              borderRadius={5}
              />
          </View>
          <View>
            <Button 
              buttonStyle={styles.buttonColor}
              title="Log In"
              onPress={this.onSignIn.bind(this)}
              borderRadius={5}
              />
          </View>
        </View>
        {/* <View>
          <SocialIcon
            style={{ padding: 20}}
            title='Sign In With Facebook'
            button
            onPress={this.onFacebookSignIn.bind(this)}
            type='facebook'
          />
        </View> */}
        {/* <View style={{alignItems: 'center', marginBottom: 15 }}>
            <FormLabel>Account Type</FormLabel>
            <CheckBox
              title={this.state.isAccountTypeClient ? 'Client Account' : 'Catoring Account'}
              onPress={this.onChangeAccountState.bind(this)}
              checked={this.state.isAccountTypeClient}
            />
        </View> */}
        <View style={styles.accountContainer}>
          <View style={{marginTop:20}}>
            <Button
              buttonStyle={styles.buttonColor}
              title="By-pass login. Button for test purposes Only. Client"
              onPress={this.onPass.bind(this)}
            />
            <Button
              buttonStyle={styles.buttonColor}
              title="By-pass login. Button for test purposes Only. Service Provider"
              onPress={this.onPassServiceProvider.bind(this)}
            />
          </View>
        </View>
      </View>
    ); 
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundColor
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  accountContainer: {
    flex: 1
  },
  buttonColor: {
    backgroundColor: colors.alternatePurple
  },
  textColor: {
    color: 'black'
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStyle: {
    // color: colors.backgroundColor,
    fontSize: 36, 
    fontWeight: 'bold'
  }

});

export default LogInPage;
import React from 'react';
//import Header from '../components/Header';
import { StyleSheet, View, Alert, Text, TouchableOpacity,KeyboardAvoidingView, Platform } from 'react-native';
import colors from '../styles/color';
import defaultStyles from '../../src/styles/default';
import { NavigationActions } from "react-navigation";
import { Header, Icon, Button, FormLabel, FormInput} from 'react-native-elements';
import firebase from 'firebase';
import NavigatorService from '../services/navigator';
import { connect } from 'react-redux';
import DateTimePicker from 'react-native-modal-datetime-picker';

class MessageForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {cuisine: '', date: '', dateShow: '', partySize: '', price: '', isDatePickerVisible: false, datePicked: ''}; 
    if (this.props && this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      this.userUidPassedIn = this.props.navigation.state.params.selectedUserUid;
      this.loggedInClient = this.props.navigation.state.params.loggedInClient;
    }
    this.unsubscribe = null;
    this.numOfRequests = 0;
    this.formFilled = false;
    this.user = null;
  }


  componentWillMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged( user => {
      if (user) {
        this.user = user;
      }

    });
    const rootRef = firebase.database().ref().child("users");
    const infoRef = rootRef.child('info');
    const userRef = infoRef.child(this.userUidPassedIn);

    userRef.once('value')
    .then((snapshot) => {
      //if no jobReq exist, create the folder for this user.
      if(!snapshot.hasChild('jobRequests')){
        userRef.update({
          jobRequests: this.numOfRequests
        })
        // userRef.set({jobRequests: this.numOfRequests});
      }
      else{ //otherwise check how many requests already exist
        const jobRef = userRef.child('jobRequests');
        jobRef.once('value')
        .then((snapshot) => {
          this.numOfRequests = snapshot.numChildren();
        })
        .catch((error) => {
          this.setState({ status: error.message });
        })
      }
    })

    
  }

  backButton() {
    this.props.navigation.dispatch(NavigationActions.back());
  }

  _showDatePicker = () => this.setState({ isDatePickerVisible: true });

  _hideDatePicker = () => this.setState({ isDatePickerVisible: false });

  _handleDatePicked = (date) => {
    this.setState({date: date.getTime(), dateShow: date.toDateString()});
    //alert(this.state.date);
    this._hideDatePicker();
  };

  //uploads to firebase 
  sendMessage(){
    //alert('hello');
    //this.formFilled = true;

    if(this.state.date == ''){     
        Alert.alert(
          'Missing date',
          'Please provide a date.',
          [
            {text: 'OK', onPress: () => {}}
          ]
        )
    }
    else{
      this.formFilled = true;
    }
    const rootRef = firebase.database().ref().child("users");
    const infoRef = rootRef.child('info');
    const userRef = infoRef.child(this.userUidPassedIn); //user id of chef who gets the job request
    const jobRef = userRef.child('jobRequests');

    let jobNum = this.numOfRequests + 1; //increases the number of jobs
    this.numOfRequests = this.numOfRequests + 1; //update number of requests.
    let jobName = 'requestNum'+jobNum; //creates the name of the folder

    jobRef.update({
      jobName: null
    })
    //create the path to the next job.
    // const jobPath = jobRef.child(jobName);

    if (this.formFilled){
      
      jobRef.push({
        cuisine: this.state.cuisine, 
        date: this.state.date,
        partySize: this.state.partySize,
        price: this.state.price,
        userPassedUid: this.user.uid,
        isAccepted: false
      })

      .then((stuff) => {
        Alert.alert(
          'Success',
          'Job Request Sent!',
          [
            {text: 'OK', onPress: () => {this.backButton()}}
          ]
        )
      })
      .catch((error) => {
        Alert.alert(
          'Notification',
          'Failed to send request.',
          [
            {text: 'OK', onPress: () => {}}
          ]
        )
      })
    }
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.boxAround}>
          <Header
            leftComponent={<Icon
              name='arrow-back'
              color='#fff'
              size={40}
              onPress={this.backButton.bind(this)}
            />}
            centerComponent={{ text: 'Message Form', style: { color: '#fff', fontSize: 30, fontStyle: "italic" } }}
            outerContainerStyles={{ backgroundColor: colors.tabNavBackground }}
         />
        </View>

        <View style={styles.buttonContainer}>

            {/* date picker */}
            <View>
              <Button 
                buttonStyle={styles.buttonColor}
                title="Pick Date and Time"
                onPress={this._showDatePicker}
                borderRadius={5}
              />

              <DateTimePicker
                isVisible={this.state.isDatePickerVisible}
                mode='datetime'
                onConfirm={this._handleDatePicked}
                onCancel={this._hideDatePicker}
              />
            </View>

        </View>
        {/* <KeyboardAvoidingView behavior="padding" style={styles.form} keyboardVerticalOffset={
              Platform.select({
                  ios: () => 5,
                  android: () => 7
              })()
          }> */}
        {/* <View><Text>Date:</Text></View>
        <View><Text>{this.state.date}</Text></View> */}
        <View style={{width:'95%'}}>
          <FormLabel labelStyle={styles.textColor}>Date</FormLabel>
          <View><FormLabel style={styles.dateText}>{this.state.dateShow}</FormLabel></View>
            {/* <FormInput 
                value={this.state.date.toString()}
                //onChangeText={date => this.setState({ date })}
                /> */}
          <FormLabel labelStyle={styles.textColor}>Cuisine</FormLabel>
            <FormInput 
              //secureTextEntry={true}
              value={this.state.cuisine}
              onChangeText={cuisine => this.setState({ cuisine })}
              />
          <FormLabel labelStyle={styles.textColor}>Number of people</FormLabel>
            <FormInput
              value={this.state.partySize}
              onChangeText={partySize => this.setState({ partySize })}
              />
          <FormLabel labelStyle={styles.textColor}>Price</FormLabel>
            <FormInput
              value={this.state.price}
              onChangeText={price => this.setState({ price })}
              />
        </View>

        <View style={styles.buttonContainer}>
          
          <View>
            <Button 
              buttonStyle={styles.buttonColor}
              title="Send"
              onPress={this.sendMessage.bind(this)}
              borderRadius={5}
            />
          </View>
        </View>

      {/* </KeyboardAvoidingView> */}
      </View>


      


    ); 
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: colors.background
    },
    dateText : {
      backgroundColor: colors.background,
      fontSize: 12,
      justifyContent: 'center',
      //padding: 20,
      color: colors.text,
    },
    form: {
      flex: 1,
      justifyContent: 'space-between',
    },
    buttonColor: {
      backgroundColor: colors.alternatePurple
    },
    buttonContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row'
    },
    boxAround: {
      margin: 10,
      borderRadius: 4,
      borderWidth: 0.5,
      borderColor: '#d6d7da',
    }
});

export default MessageForm;
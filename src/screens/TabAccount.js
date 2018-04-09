import React from 'react';
import { Modal, Text, InputField, StyleSheet, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import defaultStyles from '../../src/styles/default';
import colors from '../styles/color';
import { FormLabel, FormInput, Button, Avatar, Icon, Header } from 'react-native-elements';
import firebase from 'firebase';
import { StackNavigator, NavigationActions } from "react-navigation";
import TimerMixin from 'react-timer-mixin';
import NavigatorService from '../services/navigator';
import ImagePicker from 'react-native-image-crop-picker';

import RNFetchBlob from 'react-native-fetch-blob';

const Blob = RNFetchBlob.polyfill.Blob;
const fs = RNFetchBlob.fs;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;

class TabAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {name: '', tempName: '', email: '', tempEmail: '',
      userUid: null, isEditNameMode: false, isEditEmailMode: false,
      status: '', profilePic: null, tempprofilePic: null, modalVisible: false};
    this.user = null;
  }
  onUpdateName() {
    if (this.state.isEditNameMode) {
      if (this.state.tempName != this.state.name) {
        // this.user.updateProfile({
        //   displayName: this.state.tempName,
        // }).then((user) => {
        //   this.setState({ status: 'Updated User Display Name!' });
        // })
        // .catch((error) => {
        //     this.setState({ status: error.message });
        // })
        const rootRef = firebase.database().ref().child("users");
        const infoRef = rootRef.child('info');
        const userRef = infoRef.child(this.user.uid);
        // https://firebase.google.com/docs/reference/js/firebase.User
        // nameRef.push();
        userRef.update({
          name: this.state.tempName
        })
        .then((user) => {
          this.setState({ status: 'Status: Updated User Name!' });
        })
        .catch((error) => {
          this.setState({ status: error.message });
        })

        this.setState({ name: this.state.tempName, isEditNameMode: false });
      } else {
        this.setState({ isEditNameMode: false });
      }
    } else {
      this.setState({ isEditNameMode: true });
    }
  }
  onCancelUpdateName() {
    this.setState({ isEditNameMode: false });
  }
  onUpdateEmail() {
    if (this.state.isEditEmailMode) {
      if (this.state.tempEmail != this.state.email) {
        this.user.updateEmail(this.state.tempEmail)
        .then((user) => {
          this.setState({ status: 'Updated User Email!' });
        })
        .catch((error) => {
            this.setState({ status: error.message });
        })
        const rootRef = firebase.database().ref().child("users");
        const infoRef = rootRef.child('info');
        const userRef = infoRef.child(this.user.uid);
        userRef.update({
          email: this.state.tempEmail
        })
        .then((user) => {
          this.setState({ status: 'Status: Updated Email!' });
        })
        .catch((error) => {
          this.setState({ status: error.message });
        })
        
        this.setState({ email: this.state.tempEmail, isEditEmailMode: false });
      } else {
        this.setState({ isEditEmailMode: false });
      }
    } else {
      this.setState({ isEditEmailMode: true });
    }

    // this.setState({ email: this.state.tempEmail, isEditEmailMode: !this.state.isEditEmailMode });
  }
  onCancelUpdateEmail() {
    this.setState({ isEditEmailMode: false });
  }
  uploadImageToStorage(uri, imageName, mime = 'image/jpg') {
    return new Promise((resolve, reject) => {
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
        let uploadBlob = null
        // // Save the collected image as the 
        const rootRef = firebase.storage().ref('Data');
        const userRef = rootRef.child(this.user.uid);
        const profilePicRef = userRef.child('ProfilePictures');
        const imageRef = profilePicRef.child(imageName);
        // const imageRef = firebaseApp.storage().ref('posts').child(imageName)
        fs.readFile(uploadUri, 'base64')
        .then((data) => {
          return Blob.build(data, { type: `${mime};BASE64` })
        })
        .then((blob) => {
          uploadBlob = blob
          return imageRef.put(blob, { contentType: mime })
        })
        .then(() => {
          uploadBlob.close()
          // return imageRef.getDownloadURL()
        })
        .then((url) => {
          resolve(url)
        })
        // .catch((error) => {
        //   reject(error)
        // })
    })
  }
  onUpdateProfilePic() {
    // Get image either from a third part 
    // program such as facebook/instragram or local images.
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    }).then(image => {
      // Set image as current photo locally in interface.
      this.setState({profilePic: image.path})
      this.uploadImageToStorage(image.path, 'profilePic');
    }).catch((error) => {
      this.setState({ status: error.message });
    })
  }
  logOut() {
    firebase.auth().signOut()
    .then(() => {
      this.props.navigation.dispatch({ type: 'Logout' });
    })
    .catch((error) => {
        this.setState({ status: error.message });
    })
  }
  navigateOut() {
    NavigatorService.navigate('LogInPage');
  }
  emailVerification() {
    this.user.sendEmailVerification()
    .then((user) => {
      this.setState({ status: 'Email Sent.' });
    })
    .catch((error) => {
        this.setState({ status: error.message });
    })
  }
  passwordReset() {
    firebase.auth().sendPasswordResetEmail(this.state.email)
    .then((user) => {
      this.setState({ status: 'Email Sent.' });
      Alert.alert(
        'Notification',
        'Password reset message has been sent!',
        [
          {text: 'OK', onPress: () => {}}
        ]
      )
    })
    .catch((error) => {
        this.setState({ status: error.message });
        Alert.alert(
          'Notification',
          error.message,
          [
            {text: 'OK', onPress: () => {}}
          ]
        )
    })
  }
  componentWillMount() {
    // firebase.database().ref()
    this.unsubscribe = firebase.auth().onAuthStateChanged( user => {
      if (user) {
        // this.setState({ email: user.email, userInfo: user });
        this.setState({ userUid: user.uid, email: user.email, tempEmail: user.email });
        this.user = user;

        const rootRef = firebase.database().ref().child("users");
        const infoRef = rootRef.child('info');
        const userRef = infoRef.child(user.uid);
        // const picRef = userRef.child('picFolder');

        userRef.once('value')
        .then((snapshot) => {
          if (snapshot.val() && snapshot.val().name) {
            this.setState({ name: snapshot.val().name, tempName: snapshot.val().name });
          }
        })
        .catch((error) => {
          this.setState({ status: error.message });
        })

        const rootRefStorage = firebase.storage().ref('Data');
        const userRefStorage = rootRefStorage.child(user.uid);
        const profilePicRefStorage = userRefStorage.child('ProfilePictures');
        const imageRefStorage = profilePicRefStorage.child('profilePic');
        imageRefStorage.getDownloadURL().then((url) => { 
          this.setState({ profilePic: url });
        })
        .catch((error) =>{
          this.setState({ profilePic: '' });
        });
      }

    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  _renderNameConfirm() {
    if (this.state.isEditNameMode) {
      return (
      <View style={this.state.isEditNameMode ? styles.centerRow : {}}>
        <Icon
          reverse
          raised
          name={!this.state.isEditNameMode ? 'edit' : 'check-square-o'}
          type='font-awesome'
          onPress={this.onUpdateName.bind(this)}
          color='#f3753f' />
        <Icon
          reverse
          raised
          name={!this.state.isEditNameMode ? 'cancel' : 'times'}
          type='font-awesome'
          onPress={this.onCancelUpdateName.bind(this)}
          color='#f3753f' />
      </View>
      );
    } else {
      return null;
    }
  }
  _renderEmailConfirm() {
    if (this.state.isEditEmailMode) {
      return (
      <View style={this.state.isEditEmailMode ? styles.centerRow : {}}>
        <Icon
          reverse
          raised
          name={!this.state.isEditEmailMode ? 'edit' : 'check-square-o'}
          type='font-awesome'
          onPress={this.onUpdateEmail.bind(this)}
          color='#f3753f' />
        <Icon
          reverse
          raised
          name={!this.state.isEditEmailMode ? 'cancel' : 'times'}
          type='font-awesome'
          onPress={this.onCancelUpdateEmail.bind(this)}
          color='#f3753f' />
      </View>
      );
    } else {
      return null;
    }
  }

  setModalVisible(visible) {
    // this.setState({modalVisible: visible});
    this.onUpdateProfilePic();
  }
 
  render() {
    return (
        <View style={styles.container}>
        {/* <View style={styles.boxAround}> */}
        {/* <Header
        centerComponent={{ text: 'Account Setting', style: {color: '#fff', fontSize: 30, fontStyle: "italic" }}}
        outerContainerStyles={{ backgroundColor: colors.tabNavBackground }}
        /> */}
        {/* </View> */}
        <ScrollView>
          <View style={styles.dividerView}>
            {/* <Text style={[defaultStyles.marginSidesIndent, styles.labelText]}>Account Setting</Text> */}
            {/*------------------------------------------Avatar settings starts here--------------------------------------*/}
            <View style={[styles.center, styles.paddingImage]}>
            {!this.state.profilePic ?
              <Avatar
                xlarge
                rounded
                containerStyle={[styles.center, styles.paddingImage]}
                icon={{name: 'user', type: 'font-awesome'}}
                onPress={this.onUpdateProfilePic.bind(this)}
                activeOpacity={0.7}
              />
            :
              <Avatar
                xlarge
                rounded
                containerStyle={[styles.center, styles.paddingImage]}
                source={{uri: this.state.profilePic}}
                onPress={this.onUpdateProfilePic.bind(this)}
                activeOpacity={0.7}
              />
            }

            </View>
          </View>
          <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              alert('Modal has been closed.');
            }}>
            <View style={{height: '100%', width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
              <View style={styles.centeredDialog}>
                <Text style={[styles.labelText, {fontSize: 14}]}>Please enter the direct link of your desire profile picture:</Text>
                <FormInput
                  placeholder='Tap here to edit'
                  value={this.state.tempprofilePic ? this.state.tempprofilePic : ''}
                  onChangeText={(tempEnter) => this.setState({ tempprofilePic: tempEnter })}
                >
                </FormInput>
                <View style={[{display: 'flex'}, {flexDirection: 'row'}, {justifyContent: 'space-between'}]}>
                <TouchableOpacity
                    style={[styles.myButton]}
                    onPress={this.onUpdateProfilePic.bind(this)}>
                    <Text style={{color: '#7E8F7C'}}> Confirm </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.myButton}
                    onPress={() => {
                      this.setModalVisible(!this.state.modalVisible);
                    }}>
                    <Text style={{color: '#7E8F7C'}}> Cancel </Text>
                </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* ------------------------------------------------Names components start here-------------------------------------------------*/}
          <View style={styles.dividerView}>
            <View style={this.state.isEditNameMode ? {} : [styles.row, styles.center]}>
              <View>
                {!this.state.isEditNameMode &&
                  <View style={defaultStyles.marginSides}>
                    <TouchableOpacity
                      onPress={this.onUpdateName.bind(this)}
                    >
                                            
                    <FormLabel labelStyle={styles.labelText}>{this.state.name == '' ? 'No Name Given' : this.state.name}</FormLabel>
                    </TouchableOpacity>
                  </View>
                }
                {this.state.isEditNameMode &&
                  <View style={[styles.row, styles.center, {borderColor: "#f3753f", borderWidth: 2}]}>
                    <FormInput
                      placeholder='Account Name'
                      value={this.state.tempName}
                      onChangeText={(tempNameEnter) => this.setState({ tempName: tempNameEnter })}
                    >
                    </FormInput>
                    
                  </View>
                }
                </View>
                {this._renderNameConfirm.bind(this)()}
            </View>
          </View>

          <View style={styles.dividerView}>
            {/*--------------------------------------------Emails components starts here------------------------------------*/}
            <View style={this.state.isEditEmailMode ? {} : [styles.row, styles.center]}>
                <View>
                  {!this.state.isEditEmailMode &&
                  <View style={defaultStyles.marginSides}>
                    <TouchableOpacity
                        onPress={this.onUpdateEmail.bind(this)}
                      >                       
                      <FormLabel labelStyle={styles.labelText}>{this.state.email}</FormLabel>
                      </TouchableOpacity>
                  </View>
                  }
                  {this.state.isEditEmailMode &&
                    <View style={[styles.row, styles.center, {borderColor: "#f3753f", borderWidth: 2}]}>
                      <FormInput
                        placeholder='Email'
                        value={this.state.tempEmail}
                        onChangeText={(tempEnter) => this.setState({ tempEmail: tempEnter })}
                      >
                      </FormInput>
                    </View>
                  }
                </View>

            {this._renderEmailConfirm.bind(this)()}
        
            </View>
          </View>

          {/* <View style={[styles.center, styles.extraSettings]}>
            <FormLabel>Tags Here</FormLabel>
          </View> */}


          <View style={[styles.center, styles.extraSettings]}>
            
            <View style={[{paddingTop: 10}]}>
              <TouchableOpacity
                style={styles.myButton}
                onPress={() => {this.passwordReset()}}
              >
                <Text style={{color: '#FFF'}}> Reset Password Via Email </Text>
              </TouchableOpacity>
            </View>
            <View style={{paddingTop: 10, paddingBottom: 10}}>
              <TouchableOpacity
                style={styles.myButton}
                onPress={() => {this.logOut()}}
              >
                <Text style={{color: '#FFF'}}> Log Out </Text>
              </TouchableOpacity>

            </View>
          </View>
          </ScrollView>
        </View>
    ); 
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row:{
    flexDirection: 'row',
  },
  alignRight: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  paddingImage: {
    paddingTop: 30,
    paddingBottom: 5
  },
  dividerView: {
    paddingBottom: 20
  },
  labelText: {
    color: '#7E8F7C', 
    fontSize: 20
  },
  myButton: {
    alignItems: 'center',
    padding: 10,
    // borderWidth:2,
    backgroundColor:colors.alternatePurple,
    // borderColor:"#f3753f",
    borderRadius: 15

  },
  centeredDialog: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: '30%',
    backgroundColor: '#FDF3E7',
    borderWidth:2,
    borderColor:"#f3753f",
    borderRadius: 10
  },
  boxAround: {
    margin: 10,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
  },
  extraSettings: {
    marginTop: 50
  }


});

export default TabAccount;

// <Button
//   medium
//   icon={{name: !this.state.isEditMode ? 'edit' : 'check-square-o', type: 'font-awesome'}}
//   onPress={this.onUpdateName.bind(this)}
//   backgroundColor='#517fa4'
//   title={!this.state.isEditMode ? 'Edit' : 'Save'} />

//   <View style={styles.dividerView}>
//   <Text style={[defaultStyles.marginSidesIndent, defaultStyles.text]}>Location</Text>
//   <View style={defaultStyles.marginSidesFormInput}>
//     <FormInput
//       placeholder='Location'
//       value={this.state.location}
//     >
//     </FormInput>
//   </View>
// </View>



  // Upload name change
  // const rootRef = firebase.database().ref().child("users");
  // const infoRef = rootRef.child('info');
  // const nameRef = infoRef.child(this.state.userUid);
  // // https://firebase.google.com/docs/reference/js/firebase.User
  // // nameRef.push();
  // nameRef.set({
  //   uid: this.state.userUid,
  //   name: this.state.tempName
  // })
  // .then((user) => {
  //   this.setState({ status: 'Status: Updated User Info!' });
  // })
  // .catch((error) => {
  //   this.setState({ status: error.message });
  // })
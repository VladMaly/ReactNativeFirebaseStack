import React from 'react';
import { Text, StyleSheet, View, ScrollView, TextInput, FlatList,
   Modal, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import defaultStyles from '../../src/styles/default';
import colors from '../styles/color';
import { NavigationActions } from "react-navigation";
import { Card, Header, Icon, Button, FormInput, ButtonGroup, Avatar } from 'react-native-elements';
import firebase from 'firebase';
import NavigatorService from '../services/navigator';
import { connect } from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';

import RNFetchBlob from 'react-native-fetch-blob';

const Blob = RNFetchBlob.polyfill.Blob;
const fs = RNFetchBlob.fs;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;

class TabPortfolioServiceProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = { picFolders: [], tagList: [], modalVisible: false, isModalAddTags: false, tagStatus: '',
      tempUrl: '', chatRequestAlreadySend: false, addingImageUri: '',
      tempDescription: '', descriptionModalVisible: false, isChefFav: false }; //folder has text + picUrl 
    this.isViewMode = false;
    this.userUidPassedIn = '';
    this.currentUser = '';
    this.tempFolders = [];
    // this.numPicFolders = 0;
    if (this.props && this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      this.isViewMode = this.props.navigation.state.params.isView ? true : false;
      this.userUidPassedIn = this.props.navigation.state.params.selectedUserUid;
      //this.loggedInClient = this.props.navigation.state.params.loggedInClient;
      this.loggedInClient = firebase.auth().currentUser;
    }
    this.unsubscribe = null;
  }
  loadImagesForPosts() {
    this.counter = 0;
    for (let i = 0; i < this.tempFolders.length; i++) {
      const rootRefStorage = firebase.storage().ref('Data');
      let userRefStorage;
      if (!this.isViewMode) {
        userRefStorage = rootRefStorage.child(this.currentUser.uid);
      } else {
        userRefStorage = rootRefStorage.child(this.userUidPassedIn);
      }
      const profilePicRefStorage = userRefStorage.child('PostPictures');
      const imageRefStorage = profilePicRefStorage.child(this.tempFolders[i].pictureUid);
      imageRefStorage.getDownloadURL()
      .then((url) => {
        // this.setState({ profilePic: url });
        this.tempFolders[i].pictureUri = url;
        this.counter++;
        if (this.counter == this.tempFolders.length) {
          this.finishLoadingImages();
        }
      })
      .catch(() =>{
        // this.setState({ profilePic: '' });
        this.tempFolders[i].pictureUri = '';
        this.counter++;
        if (this.counter == this.tempFolders.length) {
          this.finishLoadingImages();
        }
      });
    }
  }
  loadLikes() {
    this.counter2 = 0;
    for (let i = 0; i < this.tempFolders.length; i++) {
      const rootRef = firebase.database().ref().child("users");
      const infoRef = rootRef.child('info');
      let userRef;
      if (!this.isViewMode) {
        userRef = infoRef.child(this.currentUser.uid);
      } else {
        userRef = infoRef.child(this.userUidPassedIn);
      }
      // const userRef = infoRef.child(user.uid);
      const picRef = userRef.child('picFolder2');
      const postRef = picRef.child(this.tempFolders[i].folderUid);
      const likesRef = postRef.child('likesFolder');
      likesRef.once('value')
      .then((snapshot) => {
        // if (snapshot.exists()) {
          // this.numPicFolders = snapshot.numChildren();
          // console.log(this.numPicFolders);
          var likesTemp = [];
          if (snapshot.val()) {
            snapshot.forEach((item) => {
              likesTemp.push(item.val()
                // uid: item.key,
                // user: item.val()
              );
            });
            
            this.tempFolders[i].likes = likesTemp;
            this.tempFolders[i].numLikes = likesTemp.length.toString();
            // this.loadImagesForPosts();
            // this.setState({ picFolders: picTemp });
          } else {
            this.tempFolders[i].likes = likesTemp;
            this.tempFolders[i].numLikes = likesTemp.length.toString();
          }
          this.counter2++;
          if (this.counter2 == this.tempFolders.length) {
            this.finishLoadingImages();
          }
        // }
      })
      .catch((error) => {
        // this.setState({ status: error.message });
        this.counter2++;
        this.tempFolders[i].numLikes = 0;
        if (this.counter2 == this.tempFolders.length) {
          this.finishLoadingImages();
        }
      })
    }
  }
  finishLoadingImages() {
    this.setState({ picFolders: this.tempFolders });
    // this.setState({ status: '4' });
  }
  componentWillMount() {
    if (!this.isViewMode) {
      this.unsubscribe = firebase.auth().onAuthStateChanged( user => {
        if (user) {
          this.currentUser = user;
          const rootRef = firebase.database().ref().child("users");
          const infoRef = rootRef.child('info');
          const userRef = infoRef.child(user.uid);
          const picRef = userRef.child('picFolder2');
          picRef.once('value')
          .then((snapshot) => {
            // this.numPicFolders = snapshot.numChildren();
            // console.log(this.numPicFolders);
            var picTemp = [];
            if (snapshot.val()) {
              snapshot.forEach((item) => {
                picTemp.push({
                  folderUid: item.key,
                  description: item.val().text,
                  pictureUid: item.val().picUid,
                  pictureUri: '',
                  likes: [],
                  numLikes: ''
                  // pictureUri: item.val().
                });
              });
              this.tempFolders = picTemp;
              this.loadImagesForPosts();
              this.loadLikes();
              // this.setState({ picFolders: picTemp });
              
            }
          })
          .catch((error) => {
            this.setState({ status: error.message });
          })

          const rootRef2 = firebase.database().ref().child("users");
          const infoRef2 = rootRef2.child('info');
          const userRef2 = infoRef2.child(user.uid);
          const picRef2 = userRef2.child('tags');
          picRef2.once('value')
          .then((snapshot) => {
            // this.numPicFolders = snapshot.numChildren();
            // console.log(this.numPicFolders);
            var tagTempList = [];
            if (snapshot.val()) {
              snapshot.forEach((item) => {
                tagTempList.push({
                  tagName: item.val().tagName,
                  // pictureUri: item.val().
                });
              });
              this.setState({ tagList: tagTempList });
              
            }
          })
          .catch((error) => {
            this.setState({ status: error.message });
          })
        }

      });
    } else {
      const rootRef = firebase.database().ref().child("users");
      const infoRef = rootRef.child('info');
      const userRef = infoRef.child(this.userUidPassedIn);
      const picRef = userRef.child('picFolder2');
      picRef.once('value')
      .then((snapshot) => {
        var picTemp = [];
        if (snapshot.val()) {
          snapshot.forEach((item) => {
            picTemp.push({
              folderUid: item.key,
              description: item.val().text,
              pictureUid: item.val().picUid,
              pictureUri: '',
              likes: [],
              numLikes: ''
            });
          });
          this.tempFolders = picTemp;
          this.loadImagesForPosts();
          this.loadLikes();
          // this.setState({ picFolders: picTemp });
        }
      })
      .catch((error) => {
        this.setState({ status: error.message });
      })
      
      this.unsubscribe = firebase.auth().onAuthStateChanged( user => {
        this.currentUser = user;
        this.checkChatRequest();
        const rootRef2 = firebase.database().ref().child("users");
        const infoRef2 = rootRef2.child('info');
        const userRef2 = infoRef2.child(user.uid);
        const favRef2 = userRef2.child('Favourites');
        const thisChefRef2 = favRef2.child(this.userUidPassedIn);

        thisChefRef2.once('value', (snapshot) => {
          // check if this chef has not been favoured
          if (snapshot.exists() && snapshot.val() == true) {
            this.setState({ isChefFav: true });
          }
        });

        const rootRef3 = firebase.database().ref().child("users");
        const infoRef3 = rootRef3.child('info');
        const userRef3 = infoRef3.child(this.userUidPassedIn);
        const picRef3 = userRef3.child('tags');
        picRef3.once('value')
        .then((snapshot) => {
          // this.numPicFolders = snapshot.numChildren();
          // console.log(this.numPicFolders);
          var tagTempList = [];
          if (snapshot.val()) {
            snapshot.forEach((item) => {
              tagTempList.push({
                tagName: item.val().tagName,
                // pictureUri: item.val().
              });
            });
            this.setState({ tagList: tagTempList });
            
          }
        })
        .catch((error) => {
          this.setState({ status: error.message });
        })
      });
    }
  }
  
  // onTextChange(pic, returnText) {
  //   // this.setState({ testDescription: returnText });
  //   var tempPicFolders = this.state.picFolders;
  //   for (let i = 0; i < tempPicFolders.length; i++) {
  //     if (tempPicFolders[i].picture == pic) {
  //         tempPicFolders[i].description = returnText;
  //         this.setState({picFolders: tempPicFolders});
  //     }
  //   }
  // }

  componentWillUnmount() {
    if (this.unsubscribe != null) {
      this.unsubscribe();
    }
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  //Uploads picture+description on firebase and the screen.
  uploadPictureAndDescription() {
    const rootRef = firebase.database().ref().child("users");
    const infoRef = rootRef.child('info');
    const userRef = infoRef.child(this.currentUser.uid);
    const picRef = userRef.child('picFolder2');

    // let folderNum = this.numPicFolders + 1; //increases the number of folders
    // this.numPicFolders = this.numPicFolders + 1;

    //console.log(folderNum);
    // let folderName = 'picFolder' + folderNum; //creates the name of the folder
    //console.log(folderName);
    // picRef.update({
    //   folderName: null
    // })
    //create the path to the next picture.
    // const picPath = picRef.child(folderName);
    //console.log(picPath);
    if (this.state.addingImageUri != '') {
      // addingImageUri
      
      let newUid = this.uuidv4();

      picRef.push({
        // picUrl: this.state.tempUrl,
        picUid: newUid,
        text: this.state.tempDescription,
        // likes: []
      })
      .then((user) => {
        this.setState({ status: 'Status: Uploaded post!', descriptionModalVisible: true });
      })
      .catch((error) => {
        this.setState({ status: error.message });
      })

      this.uploadImageToStorage(this.state.addingImageUri, newUid);

      this.setState({ modalVisible: false, picFolders: 
        [...this.state.picFolders,{ pictureUri: this.state.addingImageUri, description: this.state.tempDescription} ]}, () => {
         this.setState({ tempUrl : '' , tempDescription: '', addingImageUri: ''});
      });

      // Alert.alert(
      //   'Notification',
      //   'Added Post',
      //   [
      //     {text: 'OK', onPress: () => {}}
      //   ]
      // )
    }
    
  }

  uploadImageToStorage(uri, imageUid, mime = 'image/jpg') {
    return new Promise((resolve, reject) => {
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
        let uploadBlob = null
        // // Save the collected image as the 
        const rootRef = firebase.storage().ref('Data');
        const userRef = rootRef.child(this.currentUser.uid);
        const profilePicRef = userRef.child('PostPictures');
        const imageRef = profilePicRef.child(imageUid);
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

  setModalVisibleFalse() {
    this.setState({modalVisible: false});
  }

  backButton() {
    this.props.navigation.dispatch(NavigationActions.back());
  }

  favThisChef() {
    this.setState((prevState) => {
      return {isChefFav: !prevState.isChefFav};
    });

    //this.userUidPassedIn is the id of the user that is going to be favoured
    const currentUser = firebase.auth().currentUser;
    
    const rootRef = firebase.database().ref().child("users");
    const infoRef = rootRef.child('info');
    const userRef = infoRef.child(currentUser.uid);
    const favRef = userRef.child('Favourites');
    const thisChefRef = favRef.child(this.userUidPassedIn);

    thisChefRef.once('value', (snapshot) => {
      // check if this chef has not been favoured
      if (!(snapshot.exists() && snapshot.val() == true)){
        let updates = {};
        updates[this.userUidPassedIn] = true;
        favRef.update(updates)
        .then((stuff) => {
          // Alert.alert(
          //   'Notification',
          //   'This chef is now in your Favourites!',
          //   [
          //     {text: 'OK', onPress: () => {}}
          //   ]
          // )
        })
        .catch((error) => {
          // Alert.alert(
          //   'Notification',
          //   'Failed to add to favourites.',
          //   [
          //     {text: 'OK', onPress: () => {}}
          //   ]
          // )
        })
      }
      else {
        let updates = {};
        updates[this.userUidPassedIn] = false;
        favRef.update(updates)
        .then((stuff) => {
          // Alert.alert(
          //   'Notification',
          //   'This chef is no longer your favourite.',
          //   [
          //     {text: 'OK', onPress: () => {}}
          //   ]
          // )
        })
        .catch((error) => {
          // Alert.alert(
          //   'Notification',
          //   'Failed to remove from Favourites.',
          //   [
          //     {text: 'OK', onPress: () => {}}
          //   ]
          // )
        })
      }
     })
  }

  sendMessageRequest(){
    this.props.navigation.dispatch({ type: 'ViewMessageForm', selectedUserUid: this.userUidPassedIn, 
    loggedInClient: this.loggedInClient });
    //alert(this.loggedInClient.uid);

    //console.log('in message');
  }

  viewReviews(){
    //alert('Viewing Reviews.');
    this.props.navigation.dispatch({ type: 'ViewReviewPage', selectedUserUid: this.userUidPassedIn, loggedInClient: this.loggedInClient });
  }

  checkChatRequest() {
    const rootRef = firebase.database().ref().child("users");
    const infoRef = rootRef.child('info');
    const userRef = infoRef.child(this.currentUser.uid);
    const favRef = userRef.child('requests');
    const thisChefRef = favRef.child(this.userUidPassedIn);

    thisChefRef.once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        this.setState({chatRequestAlreadySend: true});
      }
    })
    .catch((error) => {
    })
  }

  chatRequest() {
    const currentUser = firebase.auth().currentUser;

    const rootRef = firebase.database().ref().child("users");
    const infoRef = rootRef.child('info');
    const userRef = infoRef.child(currentUser.uid);
    const favRef = userRef.child('requests');
    const thisChefRef = favRef.child(this.userUidPassedIn);

    thisChefRef.once('value')
    .then((snapshot) => {
      if (!snapshot.exists()) {
        let obj = {
          requestDate: new Date().getTime(),
          approval: true,
          isMsgKeeper: true
        }
        thisChefRef.update(obj);
        this.setState({chatRequestAlreadySend: true});
      }
    })
    .catch((error) => {
    })

    const rootRef3 = firebase.database().ref().child("users");
    const infoRef3 = rootRef3.child('info');
    const userRef3 = infoRef3.child(this.userUidPassedIn);
    const favRef3 = userRef3.child('requests');
    const thisChefRef3 = favRef3.child(currentUser.uid);

    thisChefRef3.once('value')
    .then((snapshot) => {
      if (!snapshot.exists()) {
        let obj = {
          requestDate: new Date().getTime(),
          approval: false,
          isMsgKeeper: false
        }
        thisChefRef3.update(obj);
      }
    })
    .catch((error) => {
    })

  }

  addImageFromLocal() {
  // Get image either from a third part 
    // program such as facebook/instragram or local images.
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    }).then(image => {
      // Set image as current photo locally in interface.
      this.setState({ addingImageUri: image.path });
      // this.setState({profilePic: image.path})
      // this.uploadImageToStorage(image.path, 'profilePic');
    }).catch((error) => {
      // this.setState({ status: error.message });
    })

    // this.setState({addingImageUri: image.path});
  }

  likePost(item) {
    let isFoundItemUidInLikesFolder = false;
    let currentItemAt = 0;
    let currentLikeOfCurrentUserAt = 0;
    let tempFolderPosts = this.state.picFolders;
    let uidToDestroy = '';

    for (let i = 0; i < tempFolderPosts.length; i++) {
      if (tempFolderPosts[i].folderUid == item.folderUid) {
        currentItemAt = i;
      }
    }

    for (let i = 0; i < tempFolderPosts[currentItemAt].likes.length; i++) {
      if (tempFolderPosts[currentItemAt].likes[i] == this.currentUser.uid) {
        isFoundItemUidInLikesFolder = true;
        currentLikeOfCurrentUserAt = i;
        uidToDestroy = item.likes[i].uid;
      }
    }

    if (isFoundItemUidInLikesFolder) {
      tempFolderPosts[currentItemAt].likes.splice(currentLikeOfCurrentUserAt, 1);
      tempFolderPosts[currentItemAt].numLikes = tempFolderPosts[currentItemAt].likes.length.toString();
    } else {
      tempFolderPosts[currentItemAt].likes.push(this.currentUser.uid);
      tempFolderPosts[currentItemAt].numLikes = tempFolderPosts[currentItemAt].likes.length.toString();
    }

    this.setState({ picFolders: tempFolderPosts });

    if (isFoundItemUidInLikesFolder) {
      const rootRef = firebase.database().ref().child("users");
      const infoRef = rootRef.child('info');
      let userRef;
      if (!this.isViewMode) {
        userRef = infoRef.child(this.currentUser.uid);
      } else {
        userRef = infoRef.child(this.userUidPassedIn);
      }
      // const userRef = infoRef.child(user.uid);
      const picRef = userRef.child('picFolder2');
      const postRef = picRef.child(item.folderUid);
      const likesRef = postRef.child('likesFolder');
      likesRef.once('value')
      .then((snapshot) => {
        // if (snapshot.exists()) {
          // this.numPicFolders = snapshot.numChildren();
          // console.log(this.numPicFolders);
          var likesTemp = [];
          if (snapshot.val()) {
            snapshot.forEach((item2) => {
              // likesTemp.push(item.val()
                // uid: item.key,
                // user: item.val()
              // ); () || (isViewMode && item2.val() == this.currentUser.uid)
              if (item2.val() == this.currentUser.uid) {
                const rootRef3 = firebase.database().ref().child("users");
                const infoRef3 = rootRef3.child('info');
                const userRef3 = infoRef3.child(this.userUidPassedIn);
                const favRef3 = userRef3.child('picFolder2');
                const postRef3 = favRef3.child(item.folderUid);
                const postLikesFolder3 = postRef3.child("likesFolder");
                const postLikesUser3 = postLikesFolder3.child(item2.key);

                // Remove item in folder that has this.currentUser.uid
                postLikesUser3.remove()
                .then(() => {
                })
                .catch((error) => {
                })
              }
            });
            // this.tempFolders[i].likes = likesTemp;
            // this.tempFolders[i].numLikes = likesTemp.length.toString();
            // this.loadImagesForPosts();
            // this.setState({ picFolders: picTemp });
          }
          // this.counter2++;
          // if (this.counter2 == this.tempFolders.length) {
          //   this.finishLoadingImages();
          // }
        // }
      })
      .catch((error) => {
      })
    } else {
      const rootRef3 = firebase.database().ref().child("users");
      const infoRef3 = rootRef3.child('info');
      const userRef3 = infoRef3.child(this.userUidPassedIn);
      const favRef3 = userRef3.child('picFolder2');
      const postRef3 = favRef3.child(item.folderUid);
      const postLikesFolder3 = postRef3.child("likesFolder");

      // postLikesFolder3.once('value')
      postLikesFolder3.push(this.currentUser.uid)
      .then(() => {
      })
      .catch((error) => {
      })
    }
  }

  addTagToUser() {
    // tagList
    let currAddedTag = this.state.tempTag;
    let tempList = this.state.tagList;
    tempList.push(currAddedTag);
    this.setState({ tagList: tempList, tempTag: '' });

    // Add tag to user's account
    const rootRef2 = firebase.database().ref().child("users");
    const infoRef2 = rootRef2.child('info');
    const userRef2 = infoRef2.child(this.currentUser.uid);
    const picRef2 = userRef2.child('tags');
    picRef2.push({
      tagName: currAddedTag
    })
    .then(() => {
      // this.numPicFolders = snapshot.numChildren();
      // // console.log(this.numPicFolders);
      // var tagTempList = [];
      // if (snapshot.val()) {
      //   snapshot.forEach((item) => {
      //     tagTempList.push({
      //       tagName: item.val().tagName,
      //       // pictureUri: item.val().
      //     });
      //   });
      //   this.setState({ tagList: tagTempList });
        
      // }
    })
    .catch((error) => {
      this.setState({ status: error.message });
    })
  }

  render() {
    return (
      <View style={styles.container}>
        {!this.isViewMode && //view mode false = chef user
          <View style={styles.boxAround}>
              <Header
                centerComponent={{ text: 'My Portfolio', style: { color: "#fff", fontSize: 30, fontStyle: "italic" } }}
                rightComponent={<Icon
                  name='control-point'
                  color="#fff"
                  size={40}
                  onPress={() => {this.setState({ modalVisible: true })}}
                />}
                outerContainerStyles={{ backgroundColor: colors.tabNavBackground }}
              />
          </View>
        }
        {this.isViewMode && //view mode true = client user
          <View style={styles.boxAround}>
              <Header
                leftComponent={<Icon
                  name='arrow-back'
                  color='#fff'
                  size={40}
                  onPress={this.backButton.bind(this)}
                />}
                centerComponent={{ text:"Chef's Portfolio", style: { color: "#fff", fontSize: 30, fontStyle: "italic" } }}
                rightComponent={<Icon
                  name='star'
                  color={this.state.isChefFav ? '#000080' : '#fff'}
                  size={40}
                  onPress={this.favThisChef.bind(this)}
                />}
                outerContainerStyles={{ backgroundColor: colors.tabNavBackground }}
              />
              <View style={[{display: 'flex'}, {flexDirection: 'row'}, {justifyContent: 'space-around'},{backgroundColor: colors.alternatePurple}]}>

                <View>
                  <TouchableOpacity
                    style={[styles.myButton]}
                    onPress={this.sendMessageRequest.bind(this)}>
                    <Text style={{color: '#fff'}}> Message Chef </Text>
                  </TouchableOpacity>
                </View>
                {!this.state.chatRequestAlreadySend &&
                  <View>
                    <TouchableOpacity
                      style={[styles.myButton]}
                      onPress={this.chatRequest.bind(this)}>
                      <Text style={{color: '#fff'}}> Send Chat Request </Text>
                    </TouchableOpacity>
                  </View>
                }
                <View>
                  <TouchableOpacity
                    style={[styles.myButton]}
                    onPress={this.viewReviews.bind(this)}>
                    <Text style={{color: '#fff'}}> All Reviews </Text>
                  </TouchableOpacity>
                </View>
                
              </View> 
            </View>
          }
          {/* closing client view */}
       
        {/* <View> */}
        {/* <Animated.View style={{ marginBottom: this.keyboardHeight }}> */}
        <KeyboardAvoidingView behavior="padding" style={styles.form} keyboardVerticalOffset={
            Platform.select({
                ios: () => 5,
                android: () => 7
            })()
        }>
        <View style={styles.tagContrainer}>
          {/* <View> */}
            <FlatList
              horizontal={true}
              data={this.state.tagList}
              extraData={this.state}
              keyExtractor={(item, index) => index}
              renderItem={({item}) =>
                <View style={styles.tagItem}>
                  <Text stlye={styles.tagTextColor}>{item.tagName}</Text>
                </View>
              }
            />
          {/* </View> */}
          {!this.isViewMode &&
            <View style={styles.alignNearEnd}>
              <Icon
                name='control-point'
                color={colors.tag}
                size={40}
                onPress={() => {this.setState({ isModalAddTags: true, tagStatus: '' })}}
              />
            </View>
          }
        </View>

        <ScrollView style={{marginBottom: 20}} keyboardShouldPersistTaps='always'>
          {/* <Animated.View style={[{ paddingBottom: this.keyboardHeight }]}> */}
          {/* <Text>{this.isViewMode ? 'ViewMode' : 'EditMode, Erase this after.'}</Text> */}
          <View>     
            {!this.isViewMode && //view mode false = chef user  
              <FlatList
                data={this.state.picFolders}
                extraData={this.state}
                keyExtractor={(item, index) => index}
                renderItem={({item}) =>
                <View style={styles.container}>
                  {item.pictureUri != '' ? 
                  <Card
                    image={{uri: item.pictureUri}}>
                    <View style={styles.rowButtons}>
                      <View style={styles.leftContainer}>
                        <Text>{item.description}</Text>
                      </View>
                      <View style={styles.rightContainer}>
                        <Text>Likes: {item.numLikes}</Text>
                      </View>
                    </View>
                    {/* <TextInput //only for editing the description
                      style={{height: 40}}
                      placeholder=""
                      value={item.description} //original text 
                      //returnText is the new one, and we assign it back to item.description
                      onChangeText={this.onTextChange.bind(this, item.picture)}
                    /> */}
                  </Card>
                  : 
                  <Card
                  image={{}}>
                  <View style={styles.rowButtons}>
                    <View style={styles.leftContainer}>
                      <Text>{item.description}</Text>
                    </View>
                    <View style={styles.rightContainer}>
                      <Text>Likes: {item.numLikes}</Text>
                    </View>
                  </View>
                  {/* <TextInput //only for editing the description
                    style={{height: 40}}
                    placeholder=""
                    value={item.description} //original text 
                    //returnText is the new one, and we assign it back to item.description
                    onChangeText={this.onTextChange.bind(this, item.picture)}
                  /> */}
                </Card>}
                </View>}  
              />
            }
          </View> 
          <View>
            {!this.isViewMode &&
            <View>
              <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.isModalAddTags}
                onRequestClose={() => {
                  alert('Modal has been closed.');
                }}
              >
              <View style={{height: '100%', width: '100%', backgroundColor: colors.clear}}>
                <View style={styles.centeredDialog}>
                  <FormInput
                    placeholder='Enter in a tag'
                    value={this.state.tempTag ? this.state.tempTag : ''}
                    onChangeText={(newTag) => this.setState({tempTag: newTag})}
                  >
                  </FormInput>
                  <Text>{this.state.tagStatus}</Text>
                  <View style={[{display: 'flex'}, {flexDirection: 'row'}, {justifyContent: 'space-between'}]}>
                    <Button
                      buttonStyle={styles.buttonColor}
                      title="Add Tag"
                      onPress={this.addTagToUser.bind(this)}
                    />
                    <Button
                      buttonStyle={styles.buttonColor}
                      title="Exit"
                      onPress={() => {this.setState({ isModalAddTags: false })}}
                    />
                  </View>
                </View>
              </View>
            </Modal>
            <Modal
              animationType="fade"
              transparent={true}
              visible={this.state.modalVisible}
              onRequestClose={() => {
                alert('Modal has been closed.');
              }}>
              <View style={{height: '100%', width: '100%', backgroundColor: colors.clear}}>
                <View style={styles.centeredDialog}>
                  {/* <Text style={[styles.labelText, {fontSize: 16}]}></Text> */}
                  {/* <FormInput
                    //backgroundColor= {colors.tabNavIconOn}
                    placeholder='Tap to add URL of image'
                    value={this.state.tempUrl ? this.state.tempUrl : ''}
                    onChangeText={(newUrl) => this.setState({ tempUrl: newUrl })}
                  >
                  </FormInput> */}
                  {/* <Button
                    buttonStyle={styles.buttonColor}
                    title="Add Image"
                    onPress={this.onPassServiceProvider.bind(this)}
                  /> */}
                  {this.state.addingImageUri == '' ?
                    <Avatar
                      xlarge
                      containerStyle={[styles.center, styles.paddingImage]}
                      icon={{name: 'plus', type: 'font-awesome'}}
                      onPress={this.addImageFromLocal.bind(this)}
                      activeOpacity={0.7}
                    />
                  :
                    <Avatar
                      xlarge
                      containerStyle={[styles.center, styles.paddingImage]}
                      source={{uri: this.state.addingImageUri}}
                      onPress={this.addImageFromLocal.bind(this)}
                      activeOpacity={0.7}
                    />
                  }
                  <FormInput
                    placeholder='Tap to add description'
                    value={this.state.tempDescription ? this.state.tempDescription : ''}
                    onChangeText={(newDescription) => this.setState({tempDescription: newDescription})}
                  >
                  </FormInput>
                  <View style={[{display: 'flex'}, {flexDirection: 'row'}, {justifyContent: 'space-between'}]}>
                    <Button
                      buttonStyle={styles.buttonColor}
                      title="Add Post"
                      onPress={this.uploadPictureAndDescription.bind(this)}
                    />
                    <Button
                      buttonStyle={styles.buttonColor}
                      title="Cancel"
                      onPress={this.setModalVisibleFalse.bind(this)}
                    />
                    {/* <TouchableOpacity
                        style={[styles.myButton]}
                        onPress={this.uploadPictureAndDescription.bind(this)}>
                        <Text style={{color: '#7E8F7C'}}> Confirm </Text> */}
                    {/* </TouchableOpacity> */}
                    {/* <TouchableOpacity
                        style={styles.myButton}
                        onPress={this.setModalVisibleFalse.bind(this)}>
                        <Text style={{color: '#7E8F7C'}}> Cancel </Text>
                    </TouchableOpacity> */}
                  </View>
                </View>
              </View>
            </Modal>
            </View>
            }
            </View>
          <View>
            {this.isViewMode && //view mode true = client user  
            <View>
              {/* Needs a passed unique UID from the search page to be passed in order for this to show data. */}
              <FlatList
                data={this.state.picFolders}
                extraData={this.state}
                keyExtractor={(item, index) => index}
                renderItem={({item}) =>
                <View style={styles.container}>
                {item.pictureUri != '' ? 
                  <Card
                    image={{uri:item.pictureUri}}>
                    <View style={styles.rowButtons}>
                      <View style={styles.rowButtons}>
                        <Text>
                          {item.description}
                        </Text>
                      </View>
                      <View style={styles.rightContainer}>
                        <Button
                          buttonStyle={styles.buttonColor}
                          title={item.numLikes}
                          onPress={this.likePost.bind(this, item)}
                        />
                      </View>
                    </View>
                  </Card>
                  :
                  <Card
                    image={{}}>
                    <View style={styles.rowButtons}>
                      <View style={styles.leftContainer}>
                        <Text>
                          {item.description}
                        </Text>
                      </View>
                      <View style={styles.rightContainer}>
                        <Button
                          buttonStyle={styles.buttonColor}
                          title={item.numLikes}
                          onPress={this.likePost.bind(this, item)}
                        />
                      </View>
                    </View>
                  </Card>
                  }
                </View>}  
            />
            </View>
            } 
          </View>                   

          {/* </Animated.View> */}
        </ScrollView>
        </KeyboardAvoidingView>
        {/* </View> */}
        {/* </Animated.View> */}
      </View>
    ); 
  }
} 

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  myButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 5,
    borderWidth: 2,
    backgroundColor: colors.alternatePurple,
    borderColor: colors.alternatePurple,
    borderRadius: 2
  },
  paddingImage: {
    paddingTop: 30,
    paddingBottom: 5
  },
  centeredDialog: {
    padding: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    top: '30%',
    backgroundColor: colors.background,
    borderWidth:2,
    borderColor: colors.tabNavIconOn,
    borderRadius: 10
  },
  textRight: {    
    alignSelf: 'flex-end',  
  },
  form: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rowButtons: {
    flexDirection: 'row'
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  buttonColor: {
    backgroundColor: colors.alternatePurple
  },
  boxAround: {
    margin: 10,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
  },
  tagItem: {
    marginLeft: 4,
    marginRight: 4,
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 9,
    borderWidth: 1.3,
    borderColor: colors.tag,
  },
  tagTextColor: {
    color: colors.navyBlue
  },
  tagsListContainer: {
    // flexDirection: 'row',
    // display: 'flex', 
    // flex: 1,
    // justifyContent: 'flex-start'
  },
  tagContrainer: {
    // flex: 1,
    flexDirection: 'row',
    // alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    // paddingTop: 10,
    // paddingBottom: 10,
    // display: 'flex', 
    // justifyContent: 'space-between'
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  alignNearEnd: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 15
    // flex: 1,
    // flexDirection: 'row',
    // justifyContent: 'flex-end',
    // alignItems: 'center',
  }
});

export default TabPortfolioServiceProvider;
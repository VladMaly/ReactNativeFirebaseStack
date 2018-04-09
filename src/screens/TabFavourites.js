import React from 'react';
import { Text, StyleSheet, View, ScrollView, TextInput, FlatList, TouchableHighlight, Modal, Alert } from 'react-native';
import defaultStyles from '../../src/styles/default';
import colors from '../styles/color';
import { Divider, Avatar, List, ListItem, Header, Card, PricingCard,Button } from 'react-native-elements';
import NavigatorService from '../services/navigator';
import firebase from 'firebase';

class TabFavourites extends React.Component {
  constructor(props){
    super(props);
    this.state = { favsArray: [], user: {uid: 'null'}};
    this.backUp = [];
    this.mounted = false;
  }
  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged( user => {
      if (user) {
        this.user = user;
        this.getListOfFav();
      }

    });
    
    this.mounted = true;
  }
  componentWillUnmount(){
    this.mounted = false;
    this.unsubscribe();
  }
  loadFinalDest() {
    this.setState({ favsArray: this.backUp });
  }
  loadImages() {
    this.counter2 = 0;
    for (let t = 0; t < this.backUp.length; t++) {
      const rootRefStorage = firebase.storage().ref('Data');
      const userRefStorage = rootRefStorage.child(this.backUp[t].uid);
      const profilePicRefStorage = userRefStorage.child('ProfilePictures');
      const imageRefStorage = profilePicRefStorage.child('profilePic');
      imageRefStorage.getDownloadURL()
      .then((url) => {
        this.counter2++;
        this.backUp[t].portfolioUri = url;

        if (this.counter2 == this.backUp.length) {
          this.loadFinalDest();
        }
      })
      .catch((error) => {
        
        let initials = this.backUp[t].name;
        initials = initials.match(/\b\w/g) || [];
        initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
        this.backUp[t].nickname = initials;

        this.counter2++;
        if (this.counter2 == this.backUp.length) {
          this.loadFinalDest();
        }
      });
    }
  }
  getListOfFav(){
      const rootRef = firebase.database().ref().child("users");
      const infoRef = rootRef.child('info');
      const userRef = infoRef.child(this.user.uid);
      const favourites = userRef.child('Favourites');
      // Retrieve the favourite list for the user
      let favIDsTemp = [];
      favourites.once('value')
      .then((snapshot) => {
        snapshot.forEach((item) => {
          favIDsTemp.push({
            favID: item.key,
            fav: item.val()
          });
        });
          // For each id that is stored in a user's favourite, find the corresponding name and email for that user
        let favTemp = [];
        let usersTemp = [];
        infoRef.once('value')
        .then((snapshot2) => {
          snapshot2.forEach((item) =>{
            usersTemp.push({
              uid: item.key,
              name: item.val().name,
              email: item.val().email,
              portfolioUri: '',
              nickname: ''
            })
          })

          for (i=0; i < usersTemp.length; i++){
            for (j=0; j < favIDsTemp.length; j++){
              if (usersTemp[i].uid == favIDsTemp[j].favID && favIDsTemp[j].fav){
                favTemp.push(usersTemp[i]);
              }
            }
          }
          // if (this.mounted){
          this.backUp = favTemp;
          this.setState({ favsArray: favTemp });  
          this.loadImages();
          // } 
        })
        .catch((error) => {
          Alert.alert(
            'Notification',
            error.message,
            [
              {text: 'OK', onPress: () => {}}
            ]
          )
        })
          
        })
        .catch((error) => {
          Alert.alert(
            'Notification',
            error.message,
            [
              {text: 'OK', onPress: () => {}}
            ]
          )
        })
  }
  onClickView(item){
    var tempData = this.state.favsArray;
    let selectedUserUid = '';
    for (let i = 0; i < tempData.length; i++) {
      if (tempData[i].uid == item.uid) {
        selectedUserUid = tempData[i].uid;
      }
    }
    // this.props.navigation.state
    this.props.navigation.dispatch({ type: 'ViewPortfolio', selectedUserUid: selectedUserUid });
  }
  render() {
    return (
        <View style={[styles.container, {backgroundColor: colors.backgroundSecondary}]}>
        <View style={styles.boxAround}>
          <Header
            centerComponent={{ text: 'Favourites', style: {color: '#fff', fontSize: 30, fontStyle: "italic" }}}
            outerContainerStyles={{ backgroundColor: colors.tabNavBackground }}
          />
        </View>
          <View style={styles.boxAround}>
          <ScrollView>
          <FlatList
                data={this.state.favsArray}
                keyExtractor={(item, index) => index}
                extraData={this.state}
                renderItem={({item}) =>
                <TouchableHighlight onPress={this.onClickView.bind(this, item)}>
                  <ListItem
                    large
                    roundAvatar
                    title={item.name}
                    avatar={item.portfolioUri != '' ?
                      <Avatar rounded source={{uri: item.portfolioUri }} /> :
                      <Avatar rounded title={item.nickname} />
                    }
                    // subtitle={item.email}
                  />
                </TouchableHighlight>
                }
              />
          </ScrollView>
          </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
     boxAround: {
       margin: 10,
       borderRadius: 4,
       borderWidth: 0.5,
       borderColor: '#d6d7da',
     }

});

export default TabFavourites;
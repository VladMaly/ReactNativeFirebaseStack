import React from 'react';
import { Text, View, FlatList, ScrollView, StyleSheet, TouchableHighlight } from 'react-native';
import { Button, ButtonGroup, ListItem, Avatar, FormLabel } from 'react-native-elements';
import defaultStyles from '../../src/styles/default';
import colors from '../styles/color';
import firebase from 'firebase';
import { NavigationActions } from "react-navigation";

class TabMessages extends React.Component {
  constructor(props) {
    super(props);
    this.state = { msgData: [], requestData: [], isViewType: 'chat', selectedIndex: 0, isClient: true };
    this.dataBackup = [];
    this.dataBackupRequests = [];
  }
  onChangeView(selectedIndex) {
    this.setState({selectedIndex});
    if (selectedIndex == 0) {
      this.setState({ isViewType: 'chat' });
    }
    else if (selectedIndex == 1) {
      this.setState({ isViewType: 'request' });
    }
  }
  loadNameForRequests() {
    this.counter = 0;
    for (let i = 0; i < this.dataBackupRequests.length; i++) {
      const rootRef = firebase.database().ref().child("users");
      const infoRef = rootRef.child('info');
      const userRef = infoRef.child(this.dataBackupRequests[i].uid);

      userRef.once('value')
        .then((snapshot) => {
          if (snapshot.val()) {
            // this.setState({ name: snapshot.val().name, tempName: snapshot.val().name });
            // var dataTemp = [];
            // snapshot.forEach((item) => {
              // dataTemp.push({
            this.dataBackupRequests[i].name = snapshot.val().name;
            let initials = snapshot.val().name.match(/\b\w/g) || [];
            initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
            this.dataBackupRequests[i].nickname = initials;
            this.counter++;
            if (this.counter == this.dataBackupRequests.length) {
              this.loadFinalDest();
            }
          }
        })
        .catch((error) => {
          this.counter++;
          if (this.counter == this.dataBackupRequests.length) {
            this.loadFinalDest();
          }
        })
    }
  }
  loadFinalDest() {
    // filter into two lists based on if approved.
    let requestList = [];
    let msgList = [];
    for (let i = 0; i < this.dataBackupRequests.length; i++) {
      if (this.dataBackupRequests[i].approval) {
        msgList.push(this.dataBackupRequests[i]);
      } else {
        requestList.push(this.dataBackupRequests[i]);
      }
    }
    this.setState({ requestData: requestList, msgData: msgList });
  }
  loadImages() {
    this.counter2 = 0;
    for (let t = 0; t < this.dataBackupRequests.length; t++) {
      const rootRefStorage = firebase.storage().ref('Data');
      const userRefStorage = rootRefStorage.child(this.dataBackupRequests[t].uid);
      const profilePicRefStorage = userRefStorage.child('ProfilePictures');
      const imageRefStorage = profilePicRefStorage.child('profilePic');
      imageRefStorage.getDownloadURL()
      .then((url) => {
        this.counter2++;
        this.dataBackupRequests[t].portfolioUri = url;
        if (this.counter2 == this.dataBackupRequests.length) {
          this.loadFinalDest();
        }
      })
      .catch((error) => {
        this.counter2++;
        if (this.counter2 == this.dataBackupRequests.length) {
          this.loadFinalDest();
        }
      });
    }
  }
  // loadJobRequests() {
  //   const rootRef = firebase.database().ref().child("users");
  //   const infoRef = rootRef.child('info');
  //   const userRef = infoRef.child(this.user.uid);
  //   const requestRef = userRef.child('jobRequests');
  //   // const picRef = userRef.child('picFolder');

  //   requestRef.on('value', (snapshot) => {
  //   // .then((snapshot) => {
  //     if (snapshot.val()) {
  //       // this.setState({ name: snapshot.val().name, tempName: snapshot.val().name });
  //       var dataTemp = [];
  //       snapshot.forEach((item) => {
  //         dataTemp.push({
  //           uidFolder: item.key,
  //           cuisine: item.val().cuisine,
  //           date: new Date(item.val().date),
  //           partySize: item.val().partySize,
  //           price: item.val().price,
  //           userPassedUid: item.val().userPassedUid,
  //           isAccepted: item.val().isAccepted
  //         });
  //       });
  //       this.setState({ itineraryData: dataTemp });
        
  //       // this.setState({ msgData: dataTemp });
  //       // this.setState({ requestData: dataTemp });
  //     }
  //   })
  // }
  componentWillUnmount() {
    this.unsubscribe();
  }
  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged( user => {
      if (user) {
        this.user = user;

        const rootRef2 = firebase.database().ref().child("users");
        const infoRef2 = rootRef2.child('info');
        const userRef2 = infoRef2.child(user.uid);
        const isAccountTypeRef2 = userRef2.child('isAccountTypeClient');
        isAccountTypeRef2.once('value')
        .then((snapshot) => {
          if (!(snapshot.exists() && snapshot.val())) {
            this.setState({ isClient: false });
            // this.loadJobRequests();
          }
        })
        .catch((error) => {
        })

        const rootRef = firebase.database().ref().child("users");
        const infoRef = rootRef.child('info');
        const userRef = infoRef.child(user.uid);
        const requestRef = userRef.child('requests');
        // const picRef = userRef.child('picFolder');

        requestRef.on('value', (snapshot) => {
        // .then((snapshot) => {
          if (snapshot.val()) {
            // this.setState({ name: snapshot.val().name, tempName: snapshot.val().name });
            var dataTemp = [];
            snapshot.forEach((item) => {
              dataTemp.push({
                uid: item.key,
                dateRequest: new Date(item.val().requestDate),
                name: '',
                nickname: '',
                approval: item.val().approval,
                isMsgKeeper: item.val().isMsgKeeper,
                portfolioUri: ''
              });
            });
            this.dataBackupRequests = dataTemp;
            this.loadImages();
            this.loadNameForRequests();
            
            // this.setState({ msgData: dataTemp });
            // this.setState({ requestData: dataTemp });
          }
        })
      }

    });
  }
  acceptRequest(item) {
    const rootRef = firebase.database().ref().child("users");
    const infoRef = rootRef.child('info');
    const uidRef = infoRef.child(this.user.uid);
    const requestRef = uidRef.child('requests');
    const requestUserRef = requestRef.child(item.uid);
    requestUserRef.update({
      approval: true
    })
    .then((userReturn) => {
    })
    .catch((error) => {
    })


    let requestList = this.state.requestData;
    let msgList = this.state.msgData;
    for (let i = 0; i < requestList.length; i++) {
      if (requestList[i].uid == item.uid) {
        requestList.splice(i, 1);
      }
    }
    msgList.push(item);
    this.setState({ requestData: requestList, msgData: msgList });
  }
  onOpenMsg(item) {
    // this.props.navigation.dispatch(NavigationActions.back());

    // var tempData = this.state.data;
    // let selectedUserUid = '';
    // for (let i = 0; i < tempData.length; i++) {
    //   if (tempData[i].uid == item.uid) {
    //     selectedUserUid = tempData[i].uid;
    //   }
    // }

    this.props.navigation.dispatch({ type: 'ViewConversation',
     selectedUserUid: item.uid, isMsgKeeper: item.isMsgKeeper == true });
  }
  // onCancel() {

  // }
  // onAccept(item) {
  //   // NavigatorService.navigate('ViewPortfolio');
  //   var tempData = this.state.itineraryData;
  //   for (let i = 0; i < tempData.length; i++) {
  //     if (tempData[i].date == item.date) {
  //       // selectedUserUid = tempData[i].uid;
  //       // userPassedUid
        
  //       const rootRef = firebase.database().ref().child("users");
  //       const infoRef = rootRef.child('info');
  //       const uidRef = infoRef.child(item.userPassedUid);
  //       const requestRef = uidRef.child('pastOrders');
  //       // const requestUserRef = requestRef.child(item.uid);

  //       let ordersTemp = {
  //         chef: this.user.uid,
  //         cuisine: item.cuisine,
  //         date: item.date.getTime(),
  //         price:  '$' + item.price,
  //         guests: item.partySize,
  //         reviewed: false,
  //       };
        
  //       requestRef.push(ordersTemp)
  //       .then(() => {
  //       })
  //       .catch((error) => {
  //       })

  //       // tempData.splice(i, 1);
  //       tempData[i].isAccepted = true;
  //       this.setState({ itineraryData: tempData });


  //       const rootRef2 = firebase.database().ref().child("users");
  //       const infoRef2 = rootRef2.child('info');
  //       const userRef2 = infoRef2.child(this.user.uid);
  //       const requestRef2 = userRef2.child('jobRequests');
  //       const specificRequestRef2 = requestRef2.child(item.uidFolder);
  //       // const picRef = userRef.child('picFolder');

  //       specificRequestRef2.update({
  //         isAccepted: true
  //       })
  //       .then(() => {
  //         // this.setState({ status: 'Status: Updated User Name!' });
  //       })
  //       .catch((error) => {
  //         // this.setState({ status: error.message });
  //       })
  //       // requestRef.on('value', (snapshot) => {
  //       // .then((snapshot) => {
  //       //   if (snapshot.val()) {
  //       //     // this.setState({ name: snapshot.val().name, tempName: snapshot.val().name });
  //       //     var dataTemp = [];
  //       //     snapshot.forEach((item) => {
  //       //       dataTemp.push({
  //       //         cuisine: item.val().cuisine,
  //       //         date: new Date(item.val().date),
  //       //         partySize: item.val().partySize,
  //       //         price: item.val().price,
  //       //         userPassedUid: item.val().userPassedUid
  //       //       });
  //       //     });
  //       //     this.setState({ itineraryData: dataTemp });
            
  //       //     // this.setState({ msgData: dataTemp });
  //       //     // this.setState({ requestData: dataTemp });
  //       //   }
  //       // })

  //     }
  //   }
  //   // this.props.navigation.state
  //   // this.props.navigation.dispatch({ type: 'ViewPortfolio', selectedUserUid: selectedUserUid, 
  //   // loggedInClient: this.loggedInClient });
  // }
  render() {
    return (
      <View style={styles.container}>
        {!this.state.isClient && 
          <ButtonGroup
            onPress={this.onChangeView.bind(this)}
            selectedIndex={this.state.selectedIndex}
            buttons={['Chat', 'Requests']}
            disableSelected= {true}
            containerStyle={{ height: 60, backgroundColor:'white' }}
            selectedButtonStyle={{ backgroundColor: colors.navyBlue }}
            selectedTextStyle={{ color: 'white' }}
            />
        }
            <View style={styles.boxAround}>
              <ScrollView>
                <View>
                  {this.state.isViewType == 'chat' && 
                    <View>
                      <FlatList
                        data={this.state.msgData}
                        extraData={this.state}
                        keyExtractor={(item, index) => index}
                        renderItem={({item}) =>
                        <TouchableHighlight onPress={this.onOpenMsg.bind(this, item)}>
                          <ListItem
                            large
                            roundAvatar
                            avatar={item.portfolioUri != '' ?
                              <Avatar rounded source={{uri: item.portfolioUri }} /> :
                              <Avatar rounded title={item.nickname} />
                            }
                            title={item.name}
                            // subtitle={item.isMsgKeeper == true ? 'true' : 'false'}
                          />
                        </TouchableHighlight>
                        }
                      />
                    </View>
                  }
                  {this.state.isViewType == 'request' &&
                    <View>
                        <FlatList
                          data={this.state.requestData}
                          extraData={this.state}
                          keyExtractor={(item, index) => index}
                          renderItem={({item}) =>
                          <TouchableHighlight onPress={this.acceptRequest.bind(this, item)}>
                            <ListItem
                              large
                              roundAvatar
                              avatar={item.portfolioUri != '' ?
                                <Avatar rounded source={{uri: item.portfolioUri }} /> :
                                <Avatar rounded title={item.nickname} />
                              }
                              title={item.name}
                              subtitle={item.dateRequest.toDateString()}
                            />
                          </TouchableHighlight>
                          }
                        />
                    </View>
                  }
                </View>
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
    paddingBottom: 80
    // borderRadius: 4,
    // borderWidth: 0.5,
    // borderColor: '#d6d7da',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  acceptButton: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonColor: {
    backgroundColor: colors.alternatePurple
  },
  boxStyle: {
    margin: 10,
    padding: 5,
    borderRadius: 4,
    borderWidth: 0.7,
    borderColor: '#d6d7da',
  }

});

export default TabMessages;
import React from 'react';
import { Text, View, FlatList, ScrollView, StyleSheet, TouchableHighlight } from 'react-native';
import { Button, ButtonGroup, ListItem, Header, Icon } from 'react-native-elements';
import defaultStyles from '../../src/styles/default';
import colors from '../styles/color';
import firebase from 'firebase';
import { NavigationActions } from "react-navigation";
import { GiftedChat, Actions } from 'react-native-gifted-chat';

import ChatActions from '../components/ChatActions.js'
import CustomView from '../components/CustomView.js'

class Conversation extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: [], contactName: '', contactName: '', currentUserName: '', test: '' };
        this.dataBackup = [];
        this.userUri = '';
        this.selectedUserUri = '';
        if (this.props && this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
            this.selectedUserUid = this.props.navigation.state.params.selectedUserUid;
            this.isMsgKeeper = this.props.navigation.state.params.isMsgKeeper == true;
        }
        this.user = {uid: ''};

        this.renderChatActions = this.renderChatActions.bind(this);
        this.renderCustomView = this.renderCustomView.bind(this);

    }

    renderCustomView(props) {
    return (
      <CustomView
        {...props}
      /> 
      );
    }

    renderChatActions(props) {
    //if (Platform.OS === 'ios') {
      return (
        <ChatActions
          {...props}
        />
      );
    //}
    // const options = {
    //   'Action 1': (props) => {
    //     alert('option 1');
    //   },
    //   'Cancel': () => {},
    // };
    // return (
    //   <Actions
    //     {...props}
    //     options={options}
    //   />
    // );
  }

    loadImages() {
        this.counter = 0;
          const rootRefStorage = firebase.storage().ref('Data');
          const userRefStorage = rootRefStorage.child(this.selectedUserUid);
          const profilePicRefStorage = userRefStorage.child('ProfilePictures');
          const imageRefStorage = profilePicRefStorage.child('profilePic');
          imageRefStorage.getDownloadURL()
          .then((url) => {
            this.counter++;
            this.selectedUserUri = url;
            if (this.counter == 2) {
              this.loadImagesFinalDestination();
            }
          })
          .catch((error) => {
            this.counter++;
            this.setState({ status: error.message });
            if (this.counter == 2) {
              this.loadImagesFinalDestination();
            }
          });

          const rootRefStorage2 = firebase.storage().ref('Data');
          const userRefStorage2 = rootRefStorage2.child(this.user.uid);
          const profilePicRefStorage2 = userRefStorage2.child('ProfilePictures');
          const imageRefStorage2 = profilePicRefStorage2.child('profilePic');
          imageRefStorage2.getDownloadURL()
          .then((url) => {
            this.counter++;
            this.userUri = url;
            if (this.counter == 2) {
              this.loadImagesFinalDestination();
            }
          })
          .catch((error) => {
            this.counter++;
            this.setState({ status: error.message });
            if (this.counter == 2) {
              this.loadImagesFinalDestination();
            }
          });
    }
    loadImagesFinalDestination() {
        for (let t = 0; t < this.dataBackup.length; t++) {
            if (this.dataBackup[t].user._id == 1) {
                this.dataBackup[t].user.avatar = this.userUri;
            } else {
                this.dataBackup[t].user.avatar = this.selectedUserUri;
            }
        }
        this.setState({ data: this.dataBackup });
    }
    componentDidMount() {
        const rootRef = firebase.database().ref().child("users");
        const infoRef = rootRef.child('info');
        const userRef = infoRef.child(this.selectedUserUid);

        userRef.once('value')
        .then((snapshot) => {
            if (snapshot.val()) {
                this.setState({ contactName: snapshot.val().name });
            }
        })
        .catch((error) => {
        })

        this.unsubscribe = firebase.auth().onAuthStateChanged( user => {
            if (user) {
                this.user = user;
                const rootRef3 = firebase.database().ref().child("users");
                const infoRef3 = rootRef3.child('info');
                const userRef3 = infoRef3.child(user.uid);
                // const picRef = userRef.child('picFolder');
        
                userRef3.once('value')
                .then((snapshot) => {
                  if (snapshot.val() && snapshot.val().name) {
                    this.setState({ currentUserName: snapshot.val().name });
                  }
                })
                .catch((error) => {
                })

                const rootRef2 = firebase.database().ref().child("users");
                const infoRef2 = rootRef2.child('info');
                let userRef2;
                if (this.isMsgKeeper) {
                    userRef2 = infoRef2.child(this.user.uid);
                } else {
                    userRef2 = infoRef2.child(this.selectedUserUid);
                }
                const msgRef2 = userRef2.child("messages");

                let specificUserMsg2;
                if (this.isMsgKeeper) {
                    specificUserMsg2 = msgRef2.child(this.selectedUserUid);
                } else {
                    specificUserMsg2 = msgRef2.child(this.user.uid);
                }

                const messages2 = specificUserMsg2.child("conversation3");

                messages2.on('value', (snapshot) => {
                // .then((snapshot) => {
                    if (snapshot.val()) {
                        // if (snapshot.val().isMsgKeeper) {
                            let dataTemp = [];
                            snapshot.forEach((item) => {
                                if (item.val().author == this.selectedUserUid) {
                                    let obj = {
                                        _id: item.val()._id,
                                        text: item.val().text,
                                        createdAt: item.val().date,
                                        user: {
                                            _id: 2,
                                            name: this.state.contactName
                                        },
                                    };
                                    if(item.val().isLocation == true){
                                        let location = {
                                            latitude : item.val().location.latitude,
                                            longitude : item.val().location.longitude,
                                        };
                                        obj.location = location;
                                        
                                    }
                                    dataTemp.push(obj);
                                } else if (item.val().author == this.user.uid) {
                                    let obj = {
                                        _id: item.val()._id,
                                        text: item.val().text,
                                        createdAt: item.val().date,
                                        user: {
                                            _id: 1,
                                            name: this.state.currentUserName
                                        },
                                    };
                                    if(item.val().isLocation){
                                        let location = {
                                            latitude : item.val().location.latitude,
                                            longitude : item.val().location.longitude,
                                        };
                                        obj.location = location;
                                        
                                    }
                                    dataTemp.push(obj);
                                }
                                // })
                

                                // }
                            });
                            this.dataBackup = dataTemp;
                            // Wait for images to load till populating chat. or not.
                            // this.setState({ data: dataTemp });
                            this.loadImages();
                        // }
                    }
                })
            }
        });
    }
    componentWillUnmount() {
        this.unsubscribe();
    }
    onSend(messages = []) {
        // let obj = {
        //     _id: Math.round(Math.random() * 1000000),
        //     text: messages[0].text,
        //     createdAt: new Date(),
        //     user: {
        //         _id: 1,
        //         name: this.state.currentUserName
        //     },
        // };
        // this.dataBackup.push(obj);
        // this.setState({ data: this.dataBackup });

        messages[0].createdAt = new Date();
        if (messages[0].user._id == 1) {
            messages[0].user.avatar = this.userUri;
        } else {
            messages[0].user.avatar = this.selectedUserUri;
        }

        this.setState((previousState) => ({
            data: GiftedChat.prepend(previousState.data, messages),
        }));

        const rootRef2 = firebase.database().ref().child("users");
        const infoRef2 = rootRef2.child('info');
        let userRef2;
        if (this.isMsgKeeper) {
            userRef2 = infoRef2.child(this.user.uid);
        } else {
            userRef2 = infoRef2.child(this.selectedUserUid);
        }
        const msgRef2 = userRef2.child("messages");
        
        let specificUserMsg2;
        if (this.isMsgKeeper) {
            specificUserMsg2 = msgRef2.child(this.selectedUserUid);
        } else {
            specificUserMsg2 = msgRef2.child(this.user.uid);
        }

        const messages2 = specificUserMsg2.child("conversation3");

        let obj = {};
        console.log("+++++++++++++++++++++");
        console.log(messages[0]._id);
        obj._id = messages[0]._id;
        obj.author = messages[0].author;
        // obj.date = messages[0].date;
        obj.date = new Date().getTime();
        obj.text = messages[0].text ? messages[0].text : "";

        if(messages[0].location){
            console.log("This is a location");
            obj.isLocation = true;
            let location = {
                latitude : messages[0].location.latitude,
                longitude : messages[0].location.longitude,
            };

            console.log(location.latitude);
            console.log(location.longitude);
            obj.location = location;
        }
        else{
            obj.isLocation = false;
        }

        if (messages[0].user._id == 1) {
            obj.author = this.user.uid;
            // obj.user.name = this.state.currentUserName;
        } else if (messages[0].user._id == 2) {
            obj.author = this.selectedUserUid;
            // obj.user.name = this.state.contactName;
        }
        messages2.push(obj)
        .then(() => {
        })
        .catch((error) => {
        })

    }
    backButton() {
        this.props.navigation.dispatch(NavigationActions.back());
    }
    render() {
        return (
        <View style={styles.container}>
            {/* <Text>{this.state.currentUserName} - {this.state.contactName}</Text> */}
            <Header
                leftComponent={<Icon
                    name='arrow-back'
                    color='#fff'
                    size={30}
                    onPress={this.backButton.bind(this)}
                />}
                // this.state.contactName
                centerComponent={{ text: this.state.contactName, style: { color: '#fff', fontSize: 30 } }}
                // rightComponent={<Icon
                // name='control-point'
                // color='#fff'
                // size={40}
                // onPress={() => {this.setState({ modalVisible: true})}}
                // /> }
                outerContainerStyles={{ backgroundColor: colors.tabNavBackground }}
            />
            {/* <ScrollView> */}
                    <View style={styles.chat}>
                        {/* <FlatList
                            data={this.state.data}
                            extraData={this.state}
                            keyExtractor={(item, index) => index}
                            renderItem={({item}) =>
                            <ListItem
                                large
                                roundAvatar
                                avatar={item.portfolioUri != '' ? {uri: item.portfolioUri} : {}}
                                title={item.msg}
                                subtitle={item.date}
                            />
                            }
                        /> */}
                        <GiftedChat
                            inverted={false}
                            messages={this.state.data}
                            onSend={messages => this.onSend(messages)}
                            user={{
                                _id: 1,
                            }}

                            renderActions={this.renderChatActions}
                            renderCustomView={this.renderCustomView}
                        />
                    </View>
            {/* </ScrollView> */}
            
        </View>
        ); 
    }
} 

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  chat: {
    flex: 1,
    // paddingTop: 5,
    backgroundColor: colors.background,
  }

});

export default Conversation;
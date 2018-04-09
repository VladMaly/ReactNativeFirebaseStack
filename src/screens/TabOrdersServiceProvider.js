import React from 'react';
import { Text, View, FlatList, ScrollView, StyleSheet, TouchableHighlight } from 'react-native';
import { Button, ButtonGroup, ListItem, Avatar, FormLabel } from 'react-native-elements';
import defaultStyles from '../../src/styles/default';
import colors from '../styles/color';
import firebase from 'firebase';
import { NavigationActions } from "react-navigation";

class TabOrdersServiceProvider extends React.Component {
    constructor(props) {
        super(props);
        this.state = { itineraryDataActive: [], itineraryDataRequests: [], itineraryDataPastOrders: [], selectedIndex: 0, isViewType: 'Active' };
        this.user = null;
    }
    onChangeView(selectedIndex) {
        this.setState({selectedIndex});
        if (selectedIndex == 0) {
          this.setState({ isViewType: 'Active' });
        }
        else if (selectedIndex == 1) {
          this.setState({ isViewType: 'Job Requests' });
        }
        else if (selectedIndex == 2) {
          this.setState({ isViewType: 'Past Jobs' });
        }
    }
    loadJobRequests() {
        const rootRef = firebase.database().ref().child("users");
        const infoRef = rootRef.child('info');
        const userRef = infoRef.child(this.user.uid);
        const requestRef = userRef.child('jobRequests');
        // const picRef = userRef.child('picFolder');
    
        requestRef.on('value', (snapshot) => {
        // .then((snapshot) => {
          if (snapshot.val()) {
            // this.setState({ name: snapshot.val().name, tempName: snapshot.val().name });
            let dataTempActive = [];
            let dataTempRequests = [];
            let dataTempPastOrders = [];
            snapshot.forEach((item) => {
                let tempObj = {
                    uidFolder: item.key,
                    cuisine: item.val().cuisine,
                    date: new Date(item.val().date),
                    partySize: item.val().partySize,
                    price: item.val().price,
                    userPassedUid: item.val().userPassedUid,
                    isAccepted: item.val().isAccepted
                };
                let dateObj = new Date(item.val().date);
                // dateObj.setMonth(5);
                let currDate = new Date();
                let result = currDate >= dateObj;
                if (tempObj.isAccepted == true) {
                    if (result == true) {
                        dataTempPastOrders.push(tempObj);
                    } else {
                        dataTempActive.push(tempObj);
                    }
                } else if (tempObj.isAccepted == false && result == false) {
                    dataTempRequests.push(tempObj);
                }
            });
            this.setState({ itineraryDataActive: dataTempActive, itineraryDataRequests: dataTempRequests, itineraryDataPastOrders: dataTempPastOrders });
            
            // this.setState({ msgData: dataTemp });
            // this.setState({ requestData: dataTemp });
          }
        })
    }
    componentWillUnmount() {
        this.unsubscribe();
    }
    componentDidMount() {
        this.unsubscribe = firebase.auth().onAuthStateChanged( user => {
            if (user) {
                this.user = user;

                this.loadJobRequests();
                // const rootRef2 = firebase.database().ref().child("users");
                // const infoRef2 = rootRef2.child('info');
                // const userRef2 = infoRef2.child(user.uid);
                // const isAccountTypeRef2 = userRef2.child('isAccountTypeClient');
                // isAccountTypeRef2.once('value')
                // .then((snapshot) => {
                //     if (!(snapshot.exists() && snapshot.val())) {
                //         this.setState({ isClient: false });
                //         this.loadJobRequests();
                //     }
                // })
                // .catch((error) => {
                // })
            }
        });
    }
    onCancel(item) {
    }
    onAccept(item) {
        // NavigatorService.navigate('ViewPortfolio');
        let tempData = [];
        switch (this.state.isViewType) {
            case 'Active' : 
                tempData = this.state.itineraryDataActive;
                break;
            case 'Job Requests' : 
                tempData = this.state.itineraryDataRequests;
                break;
            case 'Past Jobs' : 
                tempData = this.state.itineraryDataPastOrders;
                break;
        }
        let viewType = this.state.isViewType;
        for (let i = 0; i < tempData.length; i++) {
          if (tempData[i].uidFolder == item.uidFolder) {
            
            const rootRef = firebase.database().ref().child("users");
            const infoRef = rootRef.child('info');
            const uidRef = infoRef.child(item.userPassedUid);
            const requestRef = uidRef.child('pastOrders');
            // const requestUserRef = requestRef.child(item.uid);
    
            let ordersTemp = {
              chef: this.user.uid,
              cuisine: item.cuisine,
              date: item.date.getTime(),
              price:  '$' + item.price,
              guests: item.partySize,
              reviewed: false,
            };
            
            requestRef.push(ordersTemp)
            .then(() => {
            })
            .catch((error) => {
            })
    
            // tempData.splice(i, 1);
            tempData[i].isAccepted = true;
            switch (viewType) {
                case 'Active' : 
                    this.setState({ itineraryDataActive: tempData });
                    break;
                case 'Job Requests' : 
                    this.setState({ itineraryDataRequests: tempData });
                    break;
                case 'Past Orders' : 
                    this.setState({ itineraryDataPastOrders: tempData });
                    break;
            }
    
            const rootRef2 = firebase.database().ref().child("users");
            const infoRef2 = rootRef2.child('info');
            const userRef2 = infoRef2.child(this.user.uid);
            const requestRef2 = userRef2.child('jobRequests');
            const specificRequestRef2 = requestRef2.child(item.uidFolder);
            // const picRef = userRef.child('picFolder');
    
            specificRequestRef2.update({
              isAccepted: true
            })
            .then(() => {
              // this.setState({ status: 'Status: Updated User Name!' });
            })
            .catch((error) => {
              // this.setState({ status: error.message });
            })
    
          }
        }
    }
    onOpenMsg(item) {
        // Do look up, for isMsgKeeper value.
        const rootRef = firebase.database().ref().child("users");
        const infoRef = rootRef.child('info');
        const userRef = infoRef.child(this.user.uid);
        const requestRef = userRef.child('requests');
        const specificUserRef = requestRef.child(item.userPassedUid);

        specificUserRef.once('value', (snapshot) => {
        // .then((snapshot) => {
          if (snapshot.val()) {
            let isMsgKeeperLocalVar = snapshot.val().isMsgKeeper;

            if (snapshot.val().approval == false) {
                const rootRef2 = firebase.database().ref().child("users");
                const infoRef2 = rootRef2.child('info');
                const uidRef2 = infoRef2.child(this.user.uid);
                const requestRef2 = uidRef2.child('requests');
                const requestUserRef2 = requestRef2.child(item.uid);
                requestUserRef2.update({
                    approval: true
                })
                .then(() => {
                    this.props.navigation.dispatch({ type: 'ViewConversation',
                        selectedUserUid: item.userPassedUid, isMsgKeeper: isMsgKeeperLocalVar == true });
                })
                .catch((error) => {
                })

            } else {
                this.props.navigation.dispatch({ type: 'ViewConversation',
                    selectedUserUid: item.userPassedUid, isMsgKeeper: isMsgKeeperLocalVar == true });
            }
          }
        })
    }
    render() {
        return (
            <View>
                <ButtonGroup
                    onPress={this.onChangeView.bind(this)}
                    selectedIndex={this.state.selectedIndex}
                    buttons={['Active', 'Job Requests', 'Past Jobs']}
                    disableSelected= {true}
                    containerStyle={{ height: 60, backgroundColor:'white' }}
                    selectedButtonStyle={{ backgroundColor: colors.navyBlue }}
                    selectedTextStyle={{ color: 'white' }}
                />
                <View style={styles.boxAround}>
                    <ScrollView>
                        {this.state.isViewType == 'Active' &&
                            <View>
                                <FlatList
                                    data={this.state.itineraryDataActive}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => index}
                                    renderItem={({item}) =>
                                        <View style={styles.boxStyle}>
                                            <FormLabel labelStyle={styles.textColor}>Date: {item.date.toDateString()}</FormLabel>
                                            <FormLabel labelStyle={styles.textColor}>Cuisine: {item.cuisine}</FormLabel>
                                            <FormLabel labelStyle={styles.textColor}>Party Size: {item.partySize}</FormLabel>
                                            <FormLabel labelStyle={styles.textColor}>Price: ${item.price}</FormLabel>
                                            <View style={styles.buttonContainer}>
                                                <Button
                                                    buttonStyle={styles.buttonColor}
                                                    title="Open Chat"
                                                    onPress={this.onOpenMsg.bind(this, item)}
                                                />
                                            </View>
                                        </View>
                                    }
                                />
                            </View>
                        }
                        {this.state.isViewType == 'Job Requests' &&
                            <View>
                                <FlatList
                                    data={this.state.itineraryDataRequests}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => index}
                                    renderItem={({item}) =>
                                        <View style={styles.boxStyle}>
                                            <FormLabel labelStyle={styles.textColor}>Date: {item.date.toDateString()}</FormLabel>
                                            <FormLabel labelStyle={styles.textColor}>Cuisine: {item.cuisine}</FormLabel>
                                            <FormLabel labelStyle={styles.textColor}>Party Size: {item.partySize}</FormLabel>
                                            <FormLabel labelStyle={styles.textColor}>Price: ${item.price}</FormLabel>
                                            <View style={styles.buttonContainer}>
                                                <Button
                                                    buttonStyle={styles.buttonColor}
                                                    title="Open Chat"
                                                    onPress={this.onOpenMsg.bind(this)}
                                                />
                                                <View style={styles.acceptButton}>
                                                    <Button
                                                        buttonStyle={styles.buttonColor}
                                                        title="Accept"
                                                        onPress={this.onAccept.bind(this, item)}
                                                        borderRadius={5}
                                                        />
                                                </View>
                                            </View>
                                        </View>
                                    }
                                />
                            </View>
                        }
                        {this.state.isViewType == 'Past Orders' &&
                            <View>
                                <FlatList
                                    data={this.state.itineraryDataPastOrders}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => index}
                                    renderItem={({item}) =>
                                        <View style={styles.boxStyle}>
                                            <FormLabel labelStyle={styles.textColor}>Date: {item.date.toDateString()}</FormLabel>
                                            <FormLabel labelStyle={styles.textColor}>Cuisine: {item.cuisine}</FormLabel>
                                            <FormLabel labelStyle={styles.textColor}>Party Size: {item.partySize}</FormLabel>
                                            <FormLabel labelStyle={styles.textColor}>Price: ${item.price}</FormLabel>
                                            <View style={styles.buttonContainer}>
                                                <Button
                                                    buttonStyle={styles.buttonColor}
                                                    title="Open Chat"
                                                    onPress={this.onOpenMsg.bind(this)}
                                                />
                                            </View>
                                        </View>
                                    }
                                />
                            </View>
                        }
                    </ScrollView>
                </View>
            </View>

        )
    }
}
    
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    boxAround: {
        margin: 10,
        paddingBottom: 140
    },
    boxStyle: {
        margin: 10,
        padding: 5,
        borderRadius: 4,
        borderWidth: 0.7,
        borderColor: '#d6d7da',
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonColor: {
      backgroundColor: colors.alternatePurple
    },
    
});
      
export default TabOrdersServiceProvider;
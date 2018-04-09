import React from 'react';
import Header from '../components/Header';
import { Text, View, FlatList, ScrollView, StyleSheet, TouchableHighlight, Picker } from 'react-native';
import { FormLabel, FormInput, Button, Avatar, SearchBar, ListItem } from 'react-native-elements';
import NavigatorService from '../services/navigator';
import colors from '../styles/color';
import defaultStyles from '../../src/styles/default';
// import appConstants from '../constants/appConstants';
import firebase from 'firebase';
import { connect } from 'react-redux';

const mockData1 = require('../data/data1');

class TabSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = { searchParam : '', data: [], selectedService: 'All', status: '' };
    this.dataBackup = [];
    this.loggedInClient = null;
  }
  loadImages() {
    this.counter = 0;
    for (let i = 0; i < this.dataBackup.length; i++) {
      const rootRefStorage = firebase.storage().ref('Data');
      const userRefStorage = rootRefStorage.child(this.dataBackup[i].uid);
      const profilePicRefStorage = userRefStorage.child('ProfilePictures');
      const imageRefStorage = profilePicRefStorage.child('profilePic');
      imageRefStorage.getDownloadURL()
      .then((url) => {
        this.counter++;
        this.dataBackup[i].portfolioUri = url;
        if (this.counter == this.dataBackup.length) {
          this.loadImagesFinalDestination();
        }
      })
      .catch((error) => {
        this.counter++;
        this.setState({ status: error.message });
        if (this.counter == this.dataBackup.length) {
          this.loadImagesFinalDestination();
        }
      });
    }
  }
  loadImagesFinalDestination() {
    this.setState({ data: this.dataBackup }, () => {
      this.onChangeSearchText(this.state.searchParam);
    })
  }
  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged( user => {
      if (user) {
        // this.setState({ email: user.email, userInfo: user });
        //this.setState({ userUid: user.uid, email: user.email, tempEmail: user.email });
        this.loggedInClient = user;
      }
    })
      const rootRef = firebase.database().ref().child("users");
      const infoRef = rootRef.child('info');
      const filterData = infoRef.orderByChild("isAccountTypeClient").equalTo(false).limitToLast(100);
      filterData.once('value')
      .then((snapshot) => {
        var dataTemp = [];
        snapshot.forEach((item) => {
          let initials = item.val().name.match(/\b\w/g) || [];
          initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
          dataTemp.push({
            uid: item.key,
            name: item.val().name,
            nickname: initials,
            email: item.val().email,
            portfolioUri: ''
          });
        });
        this.dataBackup = dataTemp;
        this.loadImages();
        this.setState({ data: dataTemp });
      })
      .catch((error) => {
        this.setState({ status: error.message });
      })
  }
  onChangeSelectedFilter(itemValue, itemIndex) {
    if (itemValue != this.state.selectedService) {
      this.setState({ selectedService: itemValue });
      if (itemValue != 'All') {
        // take new value, and search by it
        const rootRef = firebase.database().ref().child("users");
        const infoRef = rootRef.child('info');
        // const filterData = infoRef.orderByChild("isAccountTypeClient").equalTo(false).limitToLast(10);
        const filteredDataByServiceType = infoRef.orderByChild("serviceType").equalTo(itemValue);
        filteredDataByServiceType.once('value')
        .then((snapshot) => {
          // A more ideal way would be to filter the snapshot then make copy.
          let dataTemp = [];
          snapshot.forEach((item) => {
            let initials = item.val().name.match(/\b\w/g) || [];
            initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
            dataTemp.push({
              uid: item.key,
              name: item.val().name,
              nickname: initials,
              email: item.val().email
            });
          });

          this.dataBackup = dataTemp;
          this.loadImages();
          // this.setState({ data: dataTemp}, () => {
          //   this.onChangeSearchText(this.state.searchParam);
          // });
        })
        .catch((error) => {
          this.setState({ status: error.message });
        })
      } else {
        const rootRef = firebase.database().ref().child("users");
        const infoRef = rootRef.child('info');
        const filterData = infoRef.orderByChild("isAccountTypeClient").equalTo(false).limitToLast(10);
        filterData.once('value')
        .then((snapshot) => {
          let dataTemp = [];
          snapshot.forEach((item) => {
            let initials = item.val().name.match(/\b\w/g) || [];
            initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
            dataTemp.push({
              uid: item.key,
              name: item.val().name,
              nickname: initials,
              email: item.val().email
            });
          });

          this.dataBackup = dataTemp;
          this.loadImages();
          // this.setState({ data: dataTemp}, () => {
          //   this.onChangeSearchText(this.state.searchParam);
          // });
        })
        .catch((error) => {
          this.setState({ status: error.message });
        })
        // if (this.state.searchParam != '') {
        //   this.newData = [];
        //   let searchStr = this.state.searchParam;
        //   this.newData = this.dataTemp.filter(function (el) {
        //     return el.name.toLowerCase().indexOf(searchStr.toLowerCase()) > -1 ||
        //             el.email.toLowerCase().indexOf(searchStr.toLowerCase()) > -1;
        //   });
        //   this.setState({ data: this.newData });
        // } else {
          // this.setState({ data: this.dataTemp });
        // }
      }
      // this.onChangeSearchText(this.state.searchParam);
    }
  }
  // onClearText() {
    // this.onChangeSearchText("");
    // this.setState({data : this.state.dataBackup, searchParam: ''});
  // }
  onClickView(item) {
    // NavigatorService.navigate('ViewPortfolio');
    var tempData = this.state.data;
    let selectedUserUid = '';
    for (let i = 0; i < tempData.length; i++) {
      if (tempData[i].uid == item.uid) {
        selectedUserUid = tempData[i].uid;
      }
    }
    // this.props.navigation.state
    this.props.navigation.dispatch({ type: 'ViewPortfolio', selectedUserUid: selectedUserUid, 
    loggedInClient: this.loggedInClient });
  }
  onChangeSearchText(newSearchString) {
    // Needs no server call. Essentially just filtering the data from the available filters.
    // Applying filtration without server call would appear to be almost instantenous,
    // with bigger data sets which would only involve fetching a limited number instead of
    // all the data, such as the first 100 users, might require an additional query and 
    // hence additional server calls.
    let newData = [];
    newData = this.dataBackup.filter(function (el) {
      return el.name.toLowerCase().indexOf(newSearchString.toLowerCase()) > -1 ||
             el.email.toLowerCase().indexOf(newSearchString.toLowerCase()) > -1;
    });
    this.setState({ data: newData, searchParam: newSearchString});

  }
  render() {
    return (
        <View style={styles.container}>
        <View style={styles.boxAround}>
          <SearchBar
            round
            // underlineColorAndroid='dark'
            containerStyle={{ backgroundColor: colors.backgroundColor, borderColor: colors.backgroundColor }}
            inputStyle={{ backgroundColor: colors.backgroundColor, borderColor: colors.backgroundColor }}
            // clearIcon={this.state.searchParam.length > 0 ? true : false}
            clearIcon={true}
            noIcon={false}
            // icon={{ type: 'font-awesome', name: 'search' }}
            onChangeText={this.onChangeSearchText.bind(this)}
            // onClearText={this.onClearText.bind(this)}
            placeholder='Seach by name or email...' />
          <View>
            <Picker
              selectedValue={this.state.selectedService}
              onValueChange={this.onChangeSelectedFilter.bind(this)}
              >
              <Picker.Item label="View All" value="All" />
              <Picker.Item label="Bartender" value="Bartender" />
              <Picker.Item label="Chef" value="Chef" />
            </Picker>
            {/* <FormLabel labelStyle={styles.textColor}>Add Tags to Search:</FormLabel> */}
          </View>
          <View style={styles.paddingScroll}>
            <ScrollView>
              <View style={[{backgroundColor: colors.backgroundSecondary}, styles.list]}>
                <FlatList
                  data={this.state.data}
                  extraData={this.state}
                  keyExtractor={(item, index) => index}
                  renderItem={({item}) =>
                  <TouchableHighlight onPress={this.onClickView.bind(this, item)}>
                  {/* <View style={[styles.border, styles.rowAlign]}>
                      <View style={styles.avatar}>
                        <Avatar
                          large
                          rounded
                          source={{uri: "https://s3.amazonaws.com/uifaces/faces/twitter/kfriedson/128.jpg"}}
                          activeOpacity={0.7}
                        />
                      </View>
                      <View style={{flex: 1, flexWrap: 'wrap'}}>
                        <Text style={[styles.bigText]}>Name: {item.name}</Text>
                        <Text style={[styles.bigText]}>Speciality:</Text>
                        <Text style={[styles.bigText]}>Email: {item.email}</Text>
                      </View>
                    </View> */}
                      <ListItem
                        large
                        roundAvatar
                        avatar={item.portfolioUri != '' ?
                        <Avatar rounded source={{uri: item.portfolioUri }} /> :
                        <Avatar rounded title={item.nickname} />
                        }
                        title={item.name}
                        subtitle={item.email}
                      />
                  </TouchableHighlight>
                  }
                />
              </View>
            </ScrollView>
          </View>
        </View>
        </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  rowAlign: {
    flexDirection: 'row',
    // alignItems: 'flex-start',
    // justifyContent: 'flex-end'
  },
  list: {
    marginBottom: 1
  },
  textColor: {
    color: 'black'
  },
  border: {
    borderBottomColor: 'black',
    borderBottomWidth: 1
  },
  avatar: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 15,
    paddingRight: 5,
  },
  bigText : {
    backgroundColor: colors.background,
    fontSize: 20,
    padding: 20,
    color: colors.text,
  },
  boxAround: {
    margin: 10,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
  },
  paddingScroll: {
    paddingBottom: 100
  }

});

export default (TabSearch);
import React from 'react';
import { Text, StyleSheet, View, ScrollView, TextInput, FlatList, TouchableHighlight, Modal } from 'react-native';
import defaultStyles from '../../src/styles/default';
import colors from '../styles/color';
import { Divider, Avatar, List, ListItem, Header, Card, PricingCard,Button,Input, Icon} from 'react-native-elements';
import StarRating from 'react-native-star-rating';
import NavigatorService from '../services/navigator';
import firebase from 'firebase';

class TabPortfolio extends React.Component {
  constructor(props) {
    super(props);
    this.state = { pastOrdersArray: [], chefsArray: [], user: {uid: 'null'}, modalVisible: false, reviewVisible:false,
    chef: '', cuisine: '' , date: '', price: '', chef_name: '', client_name:'',guests: '',review:[], rating:0,
    num_rating:0 ,starCount:0,text:'',};
    this.user = null;
  }

  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged( user => {
      if (user) {
        this.setState({ user: user });
        this.getClientName(user.uid);

        const rootRef = firebase.database().ref().child("users");
        const infoRef = rootRef.child('info');
        const userRef = infoRef.child(user.uid);
        const pastOrders = userRef.child('pastOrders');
        const chefs = infoRef.orderByChild("isAccountTypeClient").equalTo(false).limitToLast(100);

        pastOrders.once('value')
        .then((snapshot) => {
          let ordersTemp = [];
            snapshot.forEach((item) => {
              let dateObj = new Date(item.val().date);
              // dateObj.setMonth(5);
              let currDate = new Date();
              let result = currDate >= dateObj;

              ordersTemp.push({
                chefID: item.val().chef,
                cuisineName: item.val().cuisine,
                orderDate: dateObj.toDateString(),
                priceAmount: item.val().price,
                guestNumber: item.val().guests,
                reviewedFlag: item.val().reviewed,
                isCompletedStatus: result
              });
            });
            this.setState({ pastOrdersArray: ordersTemp });
        })

        chefs.once('value')
        .then((snapshot) => {
          let chefsTemp = [];
            snapshot.forEach((item) => {
              chefsTemp.push({
                chefIDOfficial: item.val().uid,
                chefName: item.val().name
              });
            });
            this.setState({ chefsArray: chefsTemp });
        })
        .catch((error) => {
          this.setState({ status: error.message });
        })
      }
      

    });
  }
// Gets Chef info based on uid 
  getChefName(chefID) {
    const rootRef = firebase.database().ref().child("users");
    const infoRef = rootRef.child('info');
    const chefRef = infoRef.child(chefID);
    const chefName = chefRef.child('name');
    
    var chefsActualName = '';

    chefName.once('value')
    .then((snapshot) => {
      if  (snapshot.val()) {
        chefsActualName = snapshot.val();
        this.setState({chef_name: chefsActualName});
      }
    })
  }

  //gets client name based on uid
  getClientName(cID) {
    const rootRef = firebase.database().ref().child("users");
    const infoRef = rootRef.child('info');
    const cRef = infoRef.child(cID);
    const cName = cRef.child('name');
    
    var clientActualName = '';

    cName.once('value')
    .then((snapshot) => {
      if  (snapshot.val()) {
        clientActualName = snapshot.val();
        this.setState({client_name: clientActualName});
      }
    })
  }

  //remove modal and go to chef portfolio
    viewChefPortfolio() {
        // NavigatorService.navigate('ViewPortfolio');
        this.setModalVisible(!this.state.modalVisible);
        this.props.navigation.dispatch({ type: 'ViewPortfolio', selectedUserUid: this.state.chef,
        loggedInClient: firebase.auth().currentUser });
      }

  setModalVisible(visible, chefUID, cuisineInfo, dateInfo, priceInfo, guestAmount,flag) {
    this.setState({modalVisible: visible, chef: chefUID, cuisine: cuisineInfo, date: dateInfo, 
      price: priceInfo, guests: guestAmount, reviewedFlag:flag});
  }
  componentWillUnmount() {
    this.unsubscribe();
  }

  // Should send be able to click on chef name and send to portfolio
  onClickView() {
    NavigatorService.navigate('ViewPortfolio');
  }
  //switches view between price card and review text input
  toggleInput(visible){
    this.setState({reviewVisible:visible});
  }
  //a function that is supposed to append a new review to given chef to database
  sendReview(){
      const rootRef = firebase.database().ref().child("users");
      const infoRef = rootRef.child('info');
      const chefRef = infoRef.child(this.state.chef);
      const reviewRef = chefRef.child('reviews');
      const ratingRef = chefRef.child('rating');
      const num_ratingRef = chefRef.child('num_rating');
      var cur_rating = 0;
      var num_rating = 0;
      ratingRef.once('value')
      .then((snapshot) => {
        if  (snapshot.val()) {
          cur_rating = snapshot.val();
          this.setState({rating: cur_rating});
        }
      })
      num_ratingRef.once('value')
      .then((snapshot) => {
        if  (snapshot.val()) {
          num_rating = snapshot.val();
          this.setState({num_rating:num_rating});
        }
      })
      var newReview = reviewRef.push();
      var reviewobj = {reviewer:this.state.client_name, date:this.state.date, review:this.state.text};
      newReview.set(JSON.parse( JSON.stringify(reviewobj) ));
      ratingRef.set(this.state.rating + this.state.starCount);
      num_ratingRef.set(this.state.num_rating + 1);
      alert("Review send");
  }
  onStarRatingPress(rating) {
    this.setState({
      starCount: rating
    });
  }

  render() {
    return (
      <View style={styles.container}>
      <View style={styles.boxAround}>
        <Header
        centerComponent={{ text: 'Orders', style: {color: '#fff', fontSize: 30, fontStyle: "italic" }}}
        outerContainerStyles={{ backgroundColor: colors.tabNavBackground }}
        />
      </View>
      <View style={[styles.boxAround, styles.paddingScroll]}>
        <ScrollView>
          <View>
            <Modal
              animationType="fade"
              transparent={true}
              visible={this.state.modalVisible}
              onRequestClose={() => {
                alert('Modal has been closed.');
              }}>
              <View style={{ height: '100%', width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>

                <View style={styles.centeredModal}>
                  {(! this.state.reviewVisible)? 
                    <PricingCard
                      color= {colors.tabNavBackground}
                      containerStyle= {styles.containerBorder}
                      title={this.state.date}
                      price={this.state.price}
                      info={[this.state.cuisine + ' cuisine','With ' + this.state.chef_name, this.state.guests + ' guests']}
                      button={{ title: 'Write Review', icon: 'rate-review' }}
                      onButtonPress={()=>{
                        this.toggleInput(true);
                        }}
                    />
                  :null}
                
                {(this.state.reviewVisible)?
                  <View style={{alignItems:'center'}}>
                    <View style={{marginBottom:10}}><Text style={{fontSize: 20, color:'rgba(255,255,255,0.9)'}}>Give a review</Text></View>
                    <View>
                      <StarRating
                        disabled={false}
                        maxStars={5}
                        rating={this.state.starCount}
                        selectedStar={(rating) => this.onStarRatingPress(rating)}
                        emptyStarColor={'#fff'}
                        fullStarColor={'#fff'}
                      />
                    </View>
                    <View style={{height:'50%',width:'80%',borderRadius:5,backgroundColor:'rgba(255,255,255,0.9)'}}>
                    
                      <View>
                      <TextInput
                        style={{width:300}}
                        onChangeText={(text) => this.setState({text})}
                        value={this.state.text}
                      />
                    </View>
                    </View>  
                    <View style={{marginTop:10}}>
                    <Button
                      title="Send Review"
                      borderRadius={5}

                      onPress={()=>{
                        this.sendReview();
                        this.toggleInput(false);
                        this.setModalVisible(!this.state.modalVisible);}}
                    />
                    </View>
                  </View>

                :null}
                <View style={[{display: 'flex'}, {flexDirection: 'row'}, {justifyContent: 'space-around'}]}>
                                <View>
                                  <Button
                                    title="Back To Orders"
                                    onPress={()=>{
                                      if (this.reviewVisible){this.toggleInput(!this.reviewVisible);}
                                      this.setModalVisible(!this.state.modalVisible);
                                    }}
                                    borderRadius={5}
                                  />
                                </View>
                                <View>
                                  <Button
                                    title="Chef Portfolio"
                                    onPress={this.viewChefPortfolio.bind(this)}
                                    borderRadius={5}
                                  />
                                </View>
                                </View>
                </View>
                
                  
              </View>
            </Modal>

            <FlatList
              data={this.state.pastOrdersArray}
              keyExtractor={(item, index) => index}
              renderItem={ ({item}) =>
              
                <View style={styles.container}>
                  <TouchableHighlight onPress={() => {
                    this.setModalVisible(true, item.chefID, item.cuisineName, item.orderDate, item.priceAmount, item.guestNumber,item.reviewedFlag);
                    this.getChefName(item.chefID);
                    }}
                  >{
                    <ListItem
                        title={item.orderDate}
                        subtitle={`Status: ${item.isCompletedStatus == true ? 'Order Completed' : 'Order is in progress'}`}
                    />
                    }
                  </TouchableHighlight>
                </View>
              } 
            />
          </View>
        </ScrollView>
        </View>
      </View>
    ); 
  }
} 

styles = StyleSheet.create({ 
  container: {
    flex: 1
  },
  subtitleView: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 5
  },
  ratingImage: {
    height: 19.21,
    width: 100
  },
  ratingText: {
    paddingLeft: 10,
    color: 'grey'
  },
  font: {
    fontSize: 30
  },
  avatar: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 15,
    paddingRight: 5,
  }, 
  rowAlign: {
    flexDirection: 'row',
    // alignItems: 'flex-start',
    // justifyContent: 'flex-end'
  },
  border: {
    borderBottomColor: 'black',
    borderBottomWidth: 1
  }, center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  paddingImage: {
    paddingTop: 30,
    paddingBottom: 5
  },
  bigText : {
    backgroundColor: colors.background,
    fontSize: 20,
    padding: 20,
    color: colors.text,
  },
  centeredModal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: '13%',
  }, 
  containerBorder: {
    borderRadius: 10
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
})

export default TabPortfolio;
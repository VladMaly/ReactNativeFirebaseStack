import React from 'react';
import AppWithNavigationState from '../routing/router';
import { StyleSheet, View, Platform, StatusBar, StatusBarIOS } from 'react-native';
// import NavigatorService from '../services/navigator';

// Styles
import defaultStyles from '../styles/default';
import colors from '../styles/color';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import AppReducer from '../reducers';
import { middleware } from '../utils/redux';

// import { AppRegistry } from 'react-native';
// import { Provider } from 'react-redux';
// import { createStore, applyMiddleware } from 'redux';

// import AppReducer from './src/reducers';
// import AppWithNavigationState from './src/navigators/AppNavigator';
// import { middleware } from './src/utils/redux';

// const store = createStore(
//   AppReducer,
//   applyMiddleware(middleware),
// );


const store = createStore(
  AppReducer,
  applyMiddleware(middleware),
);
class Main extends React.Component {
  render() {
    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
          <Provider store={store}>
            {/* <AppWithNavigationState ref={navigatorRef => {
                    NavigatorService.setContainer(navigatorRef); 
                    }} /> */}
            <AppWithNavigationState  />
          </Provider>
        </View> 
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //  ...Platform.select({
    //    ios: {
    //      paddingTop: StatusBarIOS.currentHeight ? StatusBarIOS.currentHeight : 20,
    //    },
    //    android: {
    //      paddingTop: StatusBar.currentHeight
    //    },
    //  }),
  }
});

export default Main;
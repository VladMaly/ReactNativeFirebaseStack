import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addNavigationHelpers, StackNavigator, NavigationActions } from 'react-navigation';
import { addListener } from '../utils/redux';

import LogInPage from '../screens/LogInPage';
import RegisterPage from '../screens/RegisterPage';
import TabPortfolioServiceProvider from '../screens/TabPortfolioServiceProvider';
import Conversation from '../screens/Conversation';
// import TabIndex from '../screens/TabIndex';
// import TabIndexServiceProvider from '../screens/TabIndexServiceProvider';
// import MiddleManPortfolioServiceProvider from '../screens/MiddleManPortfolioServiceProvider';
//import OrderPage from '../screens/OrderPage';

import { Root } from './tabRouter';
import { RootServiceProvider } from './tabRouterServiceProvider';

import ReviewPage from '../screens/ReviewPage';
import MessageForm from '../screens/MessageForm';


export const AppNavigator = StackNavigator({
        LogInPage: {
            screen: LogInPage
        },
        RegisterPage: {
            screen: RegisterPage
        },
        TabIndexServiceProvider: {
            screen: RootServiceProvider
        },
        TabIndexPageClient: {
            screen: Root
        },
        ViewPortfolio: {
            screen: TabPortfolioServiceProvider
        },
        ViewConversation: {
            screen: Conversation
        },
        ViewReviewPage: {
            screen: ReviewPage
        },
        ViewMessageForm: {
            screen: MessageForm
        }
    }, {
        initialRouteName:  'LogInPage',
        headerMode: 'none',
    }
);

class AppWithNavigationState extends React.Component {
    static propTypes = {
      dispatch: PropTypes.func.isRequired,
      nav: PropTypes.object.isRequired,
    };

    // Back Button Functionality. Note that should remove this eventually,
    // as a signed in user, needs to log out before seeing the log in screen again.
    // componentDidMount() {
    //     BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
    // }
    // componentWillUnmount() {
    //     BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
    // }
    // onBackPress = () => {
    //     const { dispatch, nav } = this.props;
    //     if (nav.index === 0) {
    //         return false;
    //     }
    //     dispatch(NavigationActions.back());
    //         return true;
    // };

    // Back Button functionality ends here.
    render() {
      const { dispatch, nav } = this.props;
      return (
        <AppNavigator
          navigation={addNavigationHelpers({
            dispatch,
            state: nav,
            addListener,
          })}
        />
      );
    }
}

const mapStateToProps = state => ({
    nav: state.nav,
});

export default connect(mapStateToProps)(AppWithNavigationState);

// export default LogIn;
// import { combineReducers } from 'redux';
 
// // import { DATA_AVAILABLE } from "../actions/" //Import the actions types constant we defined in our actions
// import { DATA_AVAILABLE } from "../constants/actionTypes";

// let dataState = { data: [], loading: true };
 
// const dataReducer = (state = dataState, action) => {
//     switch (action.type) {
//         case DATA_AVAILABLE:
//             state = Object.assign({}, state, { data: action.data, loading: false });
//             return state;
//         default:
//             return state;
//     }
// };
 
// // Combine all the reducers
// const rootReducer = combineReducers({
//     dataReducer
//     // ,[ANOTHER REDUCER], [ANOTHER REDUCER] ....
// })
 
// export default rootReducer;

import { combineReducers } from 'redux';
import { NavigationActions } from 'react-navigation';

import { AppNavigator } from '../routing/router';

// Start with two routes: The Main screen, with the Login screen on top.
// const firstAction = AppNavigator.router.getActionForPathAndParams('TabIndexPageClient');
// const secondAction = AppNavigator.router.getActionForPathAndParams('LogInPage');

// const tempNavState = AppNavigator.router.getStateForAction('TabIndexPageClient');
const initialState = AppNavigator.router.getActionForPathAndParams('LogInPage');
const initialNavState = AppNavigator.router.getStateForAction(
    initialState
    // tempNavState
    // AppNavigator.router.getActionForPathAndParams('RegisterPage'),
    // AppNavigator.router.getActionForPathAndParams('TabIndexServiceProvider'),
    // AppNavigator.router.getActionForPathAndParams('TabIndexPageClient'),
    // AppNavigator.router.getActionForPathAndParams('ViewPortfolio')
);

// const initialNavState = { data: [], loading:true };

function nav(state = initialNavState, action) {
  let nextState;
  switch (action.type) {
    case 'Login':
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.back(),
        state
      );
      break;
    case 'LogInClient':
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'TabIndexPageClient' }),
        state
      );
      break;
    case 'LogInServiceProvider':
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'TabIndexServiceProvider' }),
        state
      );
      break;
    case 'Register':
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'RegisterPage' }),
        state
      );
      break;
    case 'ViewPortfolio':
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'ViewPortfolio',
        params: { isView: true,
            selectedUserUid: action.selectedUserUid ? action.selectedUserUid: 'Test' } }),
        state
      );
      nextState
      break;
    case 'Logout':
      nextState = AppNavigator.router.getStateForAction(
        ...state,
        NavigationActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'LogInPage'})]
        })
        // NavigationActions.navigate({ routeName: 'LogInPage' }),
        // state
      );
      break;

    case 'ViewMessageForm':
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'ViewMessageForm',
        params: { 
          loggedInClient: action.loggedInClient ? action.loggedInClient: 'Test',
          selectedUserUid: action.selectedUserUid ? action.selectedUserUid: 'Test'} }),
        state
        );
      nextState;
      break;

    case 'ViewReviewPage':
          nextState = AppNavigator.router.getStateForAction(
            NavigationActions.navigate({ routeName: 'ViewReviewPage',
            params: {
              loggedInClient: action.loggedInClient ? action.loggedInClient: 'Test',
              selectedUserUid: action.selectedUserUid ? action.selectedUserUid: 'Test'} }),
            state
            );
          nextState;
          break;

    case 'ViewConversation':
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'ViewConversation',
        params: { 
          selectedUserUid: action.selectedUserUid ? action.selectedUserUid: 'Test' ,
          isMsgKeeper: action.isMsgKeeper ? action.isMsgKeeper: 'Test' }
        }),
        state
      );
      nextState
      break;
    default:
      nextState = AppNavigator.router.getStateForAction(action, state);
      break;
  }

  // Simply return the original `state` if `nextState` is null or undefined.
  return nextState || state;
}

const initialAuthState = { isLoggedIn: false };

function auth(state = initialAuthState, action) {
  switch (action.type) {
    case 'Login':
      return { ...state, isLoggedIn: true };
    case 'Logout':
      return { ...state, isLoggedIn: false };
    default:
      return state;
  }
}

const AppReducer = combineReducers({
  nav,
  auth,
});

export default AppReducer;
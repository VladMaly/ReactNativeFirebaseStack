import React from 'react';
import firebase from 'firebase';
import NavigatorService from '../services/navigator';
  
// Needs user.uid
// Access to this.props.navigation.navigate, or just call the NavigatorService service.
function readyForNavigation(userUid, navigator, skipLookUp) {
    const rootRef = firebase.database().ref().child("users");
    const infoRef = rootRef.child('info');
    const userRef = infoRef.child(userUid);

    userRef.once('value')
    .then((snapshot) => {
        if (snapshot.val()) {
            if (snapshot.val().isAccountTypeClient) {
                navigator.dispatch({ type: 'LogInClient' });
                // navigator.navigate("TabIndexPageClient");
            } else {
                navigator.dispatch({ type: 'LogInServiceProvider' });
                // navigator.navigate("TabIndexServiceProvider");
            }
        }
    })
    .catch((error) => {
        
    })
}
// }

export default {
    readyForNavigation
};

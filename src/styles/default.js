import { StyleSheet } from 'react-native';
import colors from './color';

module.exports = StyleSheet.create({
    text: {
        color: colors.textWhite,
        fontSize: 16, 
        fontWeight: 'bold'
    },
    title: {
        color: colors.textWhite,
        fontSize: 35, 
        fontWeight: 'bold',
        paddingLeft: 25,
        paddingBottom: 10,
        paddingTop: 10,
        paddingRight: 15,
        backgroundColor: colors.backgroundTitle
    },
    marginSides: { 
        marginLeft: 10,
        marginRight: 10
    },
    marginSidesFormInput: {
        marginLeft: 15,
        marginRight: 10
    },
    marginSidesIndent: { 
        marginLeft: 25,
        marginRight: 15
    },
    buttonFace: {
        backgroundColor: colors.cloud,
    },
    buttonText: {
        color: colors.facebook,
    }
});
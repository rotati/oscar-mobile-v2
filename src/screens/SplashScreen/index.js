import React, { Component }                 from 'react'
import { connect }                          from 'react-redux'
import i18n                                 from '../../i18n'
import logo                                 from '../../assets/oscar-logo.png'
import styles                               from './styles'
import CryptoJS                             from 'crypto-js'
import Database                             from '../../config/Database'
import RNExitApp                            from 'react-native-exit-app'
import KeyboardManager                      from 'react-native-keyboard-manager'
import { LANGUAGE_TYPES }                   from '../../redux/types'
import { startNgoScreen, startScreen }      from '../../navigation/config'
import { setDefaultHeader, verifyUser }     from '../../redux/actions/auth'
import {
  View,
  Image,
  Platform,
  NetInfo,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native'
class SplashScreen extends Component {
  state = { noInternet: false }

  static options(passProps) {
    return {
      statusBar: {
        style: Platform.OS === 'ios' ? 'dark' : 'light'
      }
    }
  }

  constructor(props) {
    super(props)
    if (Platform.OS == 'ios') {
      KeyboardManager.setEnableAutoToolbar(false)
    }
  }

  componentDidMount() {
    this.setLanguage()
    setTimeout(() => this.authenticateUser(), 1500)
  }

  setLanguage = () => {
    const languageSetting = Database.objects('Setting').filtered('key = $0', 'language')[0]
    if (languageSetting.value !== null) {
      this.props.setLanguage(languageSetting.value)
    }
  }

  alertNoInternet = () => {
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        this.authenticateUser()
      } else {
        this.setState({noInternet: true})
        setTimeout(() => this.authenticateUser(), 5000)
      }
    })
  }

  goToPinScreen = pinCode => {
    startScreen('oscar.pin', {
      pinTitle: pinCode ? i18n.t('auth.enter_pin') : i18n.t('auth.set_pin'),
      pinMode: pinCode ? 'compare' : 'set',
      pinCode: pinCode
    })
  }

  authenticateUser = () => {
    const { user, verifyUser } = this.props
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        if (user == null) {
          startNgoScreen()
        } else {
          if (isConnected) {
            verifyUser(this.goToPinScreen)
          } else {
            const pinCode = CryptoJS.SHA3(user.pin_code)
            this.goToPinScreen(pinCode)
          }
        }
      } else {
        Alert.alert(i18n.t('warning'), i18n.t('no_internet_connection'), [
          {
            text: i18n.t('language.yes'), onPress: () => RNExitApp.exitApp()
          },
          { text: i18n.t('language.no'), onPress: () =>  this.alertNoInternet()}
        ])
      }
    })
  }

  render() {
    const { noInternet } = this.state
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.container}>
          <Image style={styles.logo} source={logo} />
        </View>
        {noInternet && (<ActivityIndicator style={{flexDirection: 'row', alignItems: 'flex-end'}}/>)}
      </SafeAreaView>
    )
  }
}

const mapState = state => ({
  user: state.auth.data,
})

const mapDispatch = dispatch => ({
  setLanguage: language =>
    dispatch({
      type: LANGUAGE_TYPES.SET_LANGUAGE,
      language
    }),
  verifyUser: action => dispatch(verifyUser(action)),
  setDefaultHeader: () => dispatch(setDefaultHeader())
})

export default connect(
  mapState,
  mapDispatch
)(SplashScreen)

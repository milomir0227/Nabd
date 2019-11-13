import React, { Component } from 'react';
import { Linking, Share, NativeModules, Alert } from 'react-native';
import ReactNativeSettingsPage, {
  SectionRow,
  NavigateRow
} from 'react-native-settings-page';
import { connect } from 'react-redux';
import RNRestart from 'react-native-restart';
import { switchLanguage, resetSignInReducerState } from '../../actions';
import { Actions } from 'react-native-router-flux';
import TextDisplay from './TextDisplay';
import { View, Picker } from 'react-native';
import t from '../../I18n';
import email from 'react-native-email';
import axios from 'axios';
import Err from '../../ErrorHandler';

class UserSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: this.props.language.lang
    };
  }

  langSelection = lang => {
    if (lang !== this.props.language.lang) {
      const isRtl = lang === 'ar';
      NativeModules.I18nManager.forceRTL(isRtl);
      this.props.switchLanguage({
        lang
      });
      setTimeout(() => {
        RNRestart.Restart();
      }, 500);
    }
  };

  logoutButtonPressed() {
    axios
      .delete(`logout/${this.props.userType}`)
      .then(() => {
        axios.defaults.headers.common['TOKEN'] = '';
        this.props.resetSignInReducerState();
        Actions.reset('languageSelection');
      })
      .catch(err => {
        Err.errorHandler(err);
        Alert.alert(t.logoutFailed, t.ServerError, [
          {
            text: t.OK
          }
        ]);
      });
  }

  userTypeDisplay() {
    switch (this.props.userType) {
      case 'user':
        return <TextDisplay iconName="user" text={t.User} />;
      case 'doctor':
        return <TextDisplay iconName="user" text={t.Doctor} />;
      case 'paramedic':
        return <TextDisplay iconName="user" text={t.Paramedic} />;
      case 'ambulance':
        return <TextDisplay iconName="user" text={t.Ambulance} />;
    }
  }

  render() {
    return (
      <ReactNativeSettingsPage>
        <SectionRow text={t.Profile}>
          <TextDisplay iconName="user" text={this.props.userName} />
          <TextDisplay iconName="phone" text={this.props.phone} />
          {this.userTypeDisplay()}
        </SectionRow>
        <SectionRow text={t.Language}>
          <View style={{ flex: 1 }}>
            <Picker
              selectedValue={this.state.selectedOption}
              // style={styles.languagePicker}
              // mode="dialog"
              onValueChange={(itemValue, itemIndex) =>
                this.langSelection(itemValue)
              }
            >
              <Picker.Item label="🇪🇬 العربية" value="ar" />
              <Picker.Item label="🇬🇧 English" value="en" />
            </Picker>
          </View>
        </SectionRow>

        <SectionRow text={t.ContactWithUs}>
          <NavigateRow
            text={t.Facebook}
            iconName="facebook"
            onPressCallback={() =>
              Linking.openURL(
                'https://www.facebook.com/تطبيق-نبض-Nabd-App-108933110525150/'
              )
            }
          />
          <NavigateRow
            text={t.Twitter}
            iconName="twitter"
            onPressCallback={() =>
              Linking.openURL('https://twitter.com/NabdEmergApp')
            }
          />
        </SectionRow>
        <SectionRow text={t.HelpUs}>
          <NavigateRow
            text={t.SendUsFeedback}
            iconName="envelope"
            onPressCallback={() => {
              const to = ['nabd_app@hotmail.com'];
              email(to, {
                subject: t.EmailTitle
              }).catch(console.error);
            }}
          />
          <NavigateRow
            text={t.ShareNabd}
            iconName="share-square"
            onPressCallback={() => {
              Share.share({
                message: t.ShareMsg
              });
            }}
          />
        </SectionRow>
        <View style={{ backgroundColor: '#fff', marginBottom: 10 }}>
          <NavigateRow
            onPressCallback={this.logoutButtonPressed.bind(this)}
            iconName="sign-out"
            text={t.LogOut}
          />
        </View>
      </ReactNativeSettingsPage>
    );
  }
}

const mapStateToProps = state => {
  const { userType, userName, phone } = state.signin;
  return { userType, userName, phone, language: state.language };
};

export default connect(
  mapStateToProps,
  { switchLanguage, resetSignInReducerState }
)(UserSettings);

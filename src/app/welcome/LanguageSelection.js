import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  I18nManager,
  Picker,
  TouchableOpacity,
  TouchableNativeFeedback,
  NativeModules,
} from 'react-native';
import { connect } from 'react-redux';
import RNRestart from 'react-native-restart';
import { Colors, Images } from '../../constants';
import { switchLanguage } from '../../actions';
import { Icon } from '../../components';
import t from '../../I18n';
import { Actions } from 'react-native-router-flux';
import { Button, SwitchButton } from '../../components';
import { theme } from 'galio-framework';
import { FAB } from 'react-native-paper';

class LanguageSelection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: "ar",
    };
  }
  _renderDoneButton = () => {
    return (
      <View style={styles.buttonContainer}>
        <Button
          color="white"
          textStyle={{ color: Colors.BLACK }}
          onPress={this._handlePress}
        >
          {t.GetStarted}
        </Button>
      </View>
    );
  };

  _handlePress = () => {
    const { switchLanguage, language } = this.props;
    const { selectedOption } = this.state;
    if (selectedOption !== language.lang) {
      const isRtl = selectedOption === 'ar';
      NativeModules.I18nManager.forceRTL(isRtl);
      switchLanguage({
        lang: this.state.selectedOption
      });
      setTimeout(() => {
        RNRestart.Restart();
      }, 500);
      return;
    }
    Actions.typeSelection();
  };

  render() {
    const isRtl = this.props.language.lang === 'ar' ? 'rtl' : 'ltr';
    return (
      // <View style={styles.mainContent}>
      //   <Image
      //     source={require('../../assets/imgs/white-logo.png')}
      //     style={styles.image}
      //     resizeMode="contain"
      //   />
      //   <Text style={styles.title}>{t.LanguageScreenTitle}</Text>
      //   <View style={{ flex: 1 }}>
      //     <Picker
      //       selectedValue={this.state.selectedOption}
      //       style={styles.languagePicker}
      //       mode="dropdown"
      //       onValueChange={(itemValue, itemIndex) =>
      //         this.setState({ selectedOption: itemValue })
      //       }
      //     >
      //       <Picker.Item label="🇪🇬 العربية" value="ar" />
      //       <Picker.Item label="🇬🇧 English" value="en" />
      //     </Picker>
      //   </View>
      //   {this._renderDoneButton()}
      // </View>
      <View style={styles.mainContainer}>
        <Image
          style={styles.image}
          source={Images.language}
          resizeMode="contain"
        />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t.LanguageScreenTitle}</Text>
          <Text style={styles.description}>
            You can also change it later in Settings
          </Text>
        </View>
        <View style={styles.switch}>
          <SwitchButton
            text1="Arabic"
            text2="English"
            onValueChange={val => this.setState({ selectedOption: val == 1 ? "ar" : "en" })}
            fontColor="#817d84"
            activeFontColor="black"
            switchdirection={isRtl}
          />
        </View>
        <FAB
          style={styles.nextButton}
          icon={isRtl === 'ltr' ? "chevron-right" : "chevron-left"}
          onPress={this._handlePress}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: 200,
    height: 200,
    margin: 12,
    flex: 1,
  },
  titleContainer: {
    flex: 0.5,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    fontFamily: 'Manjari-Regular',
    marginLeft: theme.SIZES.BASE * 2,
    marginRight: theme.SIZES.BASE * 2
  },
  description: {
    fontSize: 15,
    color: 'gray',
    textAlign: 'center',
    fontFamily: 'Manjari-Regular',
    marginLeft: theme.SIZES.BASE * 2,
    marginRight: theme.SIZES.BASE * 2
  },
  switch: {
    flex: 1
  },
  nextButton: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.APP
  },
});

const mapStateToProps = state => ({ language: state.language });

export default connect(
  mapStateToProps,
  { switchLanguage }
)(LanguageSelection);

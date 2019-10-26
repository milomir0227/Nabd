'use strict';
import React, { Component } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  YellowBox,
  Dimensions,
  Image
} from 'react-native';
import { Icon, Card } from '../../../components';
import AsyncStorage from '@react-native-community/async-storage';
import LoginManager from '../manager/LoginManager';
import CallManager from '../manager/CallManager';
import RadioForm, { RadioButton } from 'react-native-simple-radio-button';
import { CustomPicker } from 'react-native-custom-picker';
import { Voximplant } from 'react-native-voximplant';
import { Actions } from 'react-native-router-flux';
import axios from 'axios';
import { Block, Text, Button as GaButton, theme } from 'galio-framework';
import { argonTheme, Images, info } from '../../../constants';
import { connect } from 'react-redux';
import { selectHelperType, requestHelp } from '../../../actions';

const { width, height } = Dimensions.get('screen');

class MainScreen extends React.Component {
  constructor(props) {
    super(props);
    super();
    this.state = {
      type: [
        { label: 'Doctor', value: 'doctor' },
        { label: 'Paramedic', value: 'paramedic' },
        { label: 'Ambulance', value: 'ambulance' }
      ],
      valueIndex: 0,
      value: 'doctor',
      client: Voximplant.getInstance(),
      currentCall: null
    };
    props.selectHelperType('doctor');

    this.number = '';
    this.numbers = ['test2', '412412']; //todo fill it from the backend
    YellowBox.ignoreWarnings([
      'Warning: componentWillMount is deprecated',
      'Warning: componentWillReceiveProps is deprecated'
    ]);
  }

  componentDidMount() {
    LoginManager.getInstance().on('onConnectionClosed', this._connectionClosed);
  }

  componentWillUnmount() {
    LoginManager.getInstance().off(
      'onConnectionClosed',
      this._connectionClosed
    );
  }

  _connectionClosed = () => {
    //todo
    // this.props.navigation.navigate('Login');
  };

  async makeCall(isVideoCall) {
    console.log(
      'MainScreen: make call: ' + this.number + ', isVideo:' + isVideoCall
    );
    try {
      if (Platform.OS === 'android') {
        let permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
        if (isVideoCall) {
          permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
        }
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        const recordAudioGranted =
          granted['android.permission.RECORD_AUDIO'] === 'granted';
        const cameraGranted =
          granted['android.permission.CAMERA'] === 'granted';
        if (recordAudioGranted) {
          if (isVideoCall && !cameraGranted) {
            console.warn(
              'MainScreen: makeCall: camera permission is not granted'
            );
            return;
          }
        } else {
          console.warn(
            'MainScreen: makeCall: record audio permission is not granted'
          );
          return;
        }
      }
      const callSettings = {
        video: {
          sendVideo: isVideoCall,
          receiveVideo: isVideoCall
        }
      };
      if (Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 10) {
        const useCallKitString = await AsyncStorage.getItem('useCallKit');
        callSettings.setupCallKit = JSON.parse(useCallKitString);
      }

      // let calls = [];
      // for (let i = 0; i < this.numbers.length; i++) {
      //   let call = await Voximplant.getInstance().call(
      //     this.numbers[i],
      //     callSettings
      //   );
      //   let callManager = CallManager.getInstance();
      //   callManager.addCall(call);
      //   calls.push(call);
      //   if (callSettings.setupCallKit) {
      //     callManager.startOutgoingCallViaCallKit(isVideoCall, this.numbers[i]);
      //   }
      // }
      // console.log(calls);
      let call = await Voximplant.getInstance().call(
        this.numbers[0],
        callSettings
      );
      let callManager = CallManager.getInstance();
      callManager.addCall(call);
      if (callSettings.setupCallKit) {
        callManager.startOutgoingCallViaCallKit(isVideoCall, this.numbers[0]);
      }
      Actions.Call({
        callId: call.callId,
        isVideo: isVideoCall,
        isIncoming: false
      });
    } catch (e) {
      console.warn('MainScreen: makeCall failed: ' + e);
    }
  }

  logoutButtonPressed() {
    axios.defaults.headers.common['TOKEN'] = '';
    AsyncStorage.clear()
      .then(() => Actions.welcome())
      .catch(() => {});
  }

  renderHeader() {
    return (
      <View style={styles.headerFooterContainer}>
        <Text style={{ fontSize: 20 }}>Doctor specialization</Text>
      </View>
    );
  }

  renderFooter(action) {
    return (
      <TouchableOpacity
        style={styles.headerFooterContainer}
        onPress={() => {
          action.close();
        }}
      >
        <Text>close</Text>
      </TouchableOpacity>
    );
  }

  renderField(settings) {
    const { selectedItem, defaultText, getLabel, clear } = settings;
    return (
      <View style={styles.container}>
        <View>
          {!selectedItem && (
            <Text style={[styles.text, { color: 'grey' }]}>{defaultText}</Text>
          )}
          {selectedItem && (
            <View style={styles.innerContainer}>
              <TouchableOpacity onPress={clear}>
                <Image
                  style={[
                    {
                      width: 12,
                      height: 12,
                      margin: 12
                    },
                    styles.shadow
                  ]}
                  source={Images.clearIcon}
                />
              </TouchableOpacity>
              <Image
                style={[styles.imageIconWrapper, styles.shadow]}
                source={selectedItem.img}
              />
              <Text style={[styles.text, { color: selectedItem.color }]}>
                {getLabel(selectedItem)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  renderOption(settings) {
    const { item, getLabel } = settings;
    return (
      <View style={styles.optionContainer}>
        <View style={styles.innerContainer}>
          {/* <View style={[styles.box, { backgroundColor: item.color }]} /> */}
          <Image style={styles.imageIconWrapper} source={item.img} />
          <Text
            style={{
              fontSize: 18,
              padding: 8,
              color: item.color,
              alignSelf: 'flex-start'
            }}
          >
            {getLabel(item)}
          </Text>
        </View>
      </View>
    );
  }

  isDoctorSelected() {
    // return <Text>this.props.helperType</Text>;
    if (this.props.helperType === 'doctor') {
      const options = [
        {
          color: '#051C2B',
          label: 'الباطنة والأمراض الصدرية',
          img: Images.lungIcon,
          value: 1
        },
        {
          color: '#051C2B',
          label: 'أمراض القلب والأوعية الدموية',
          img: Images.heartIcon,
          value: 2
        },
        {
          color: '#051C2B',
          label: 'مخ و أعصاب',
          img: Images.brainIcon,
          value: 3
        },
        {
          color: '#051C2B',
          label: 'العظام',
          img: Images.boneIcon,
          value: 4
        },
        {
          color: '#051C2B',
          label: 'المسالك بولية و التناسلية',
          img: Images.bladderIcon,
          value: 5
        },
        {
          color: '#051C2B',
          label: 'النساء والتوليد',
          img: Images.pregnantIcon,
          value: 6
        },
        {
          color: '#051C2B',
          label: 'الجلدية',
          img: Images.skinIcon,
          value: 7
        },
        {
          color: '#051C2B',
          label: 'طب وجراحةالعيون',
          img: Images.eyeIcon,
          value: 8
        },
        {
          color: '#051C2B',
          label: 'أطفال',
          img: Images.childIcon,
          value: 9
        },
        {
          color: '#051C2B',
          label: 'أنف و أذن و حنجرة',
          img: Images.throatIcon,
          value: 9
        }
      ];
      return (
        <CustomPicker
          placeholder={'Please select your doctor specialization'}
          options={options}
          getLabel={item => item.label}
          fieldTemplate={this.renderField}
          optionTemplate={this.renderOption}
          headerTemplate={this.renderHeader}
          footerTemplate={this.renderFooter}
          onValueChange={value => {
            Alert.alert(
              'Selected Item',
              value ? JSON.stringify(value) : 'No item were selected!'
            );
          }}
        />
      );
    }
  }

  renderButtons() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.articles}
      >
        <Block flex>
          <Block flex row>
            <Card
              item={buttons[0]}
              style={{ marginRight: theme.SIZES.BASE }}
              imageStyle={{ backgroundColor: 'red', opacity: 0.6 }}
            />
            <Card
              item={buttons[1]}
              imageStyle={{ backgroundColor: 'green', opacity: 0.6 }}
            />
          </Block>
          <Card
            style={{ marginBottom: theme.SIZES.BASE }}
            item={buttons[2]}
            full
            imageStyle={{ backgroundColor: 'blue', opacity: 0.6 }}
          />
        </Block>
      </ScrollView>
    );
  }

  decideImage() {
    switch (this.state.value) {
      case 'doctor':
        return <Image style={styles.imageDoctor} source={Images.doctor} />;
      case 'paramedic':
        return (
          <View style={styles.imageParamedicWrapper}>
            <Image style={styles.imageParamedic} source={Images.paramedic} />
          </View>
        );
      case 'ambulance':
        return (
          <Image style={styles.imageAmbulance} source={Images.ambulance} />
        );
    }
  }

  async videoCall() {
    // try {
    //   let s = await client.getClientState();
    //   if (s === Voximplant.ClientState.DISCONNECTED) {
    //     await client.connect();
    //   }
    //   let authResult = await this.state.client.login('412412', info.userPass);
    //   // Alert.alert('Selected Item', authResult);
    // } catch (e) {
    //   console.log(e.name + e.message);
    // }
    // Alert.alert('Welcome', 'Hello');
    await LoginManager.getInstance().loginWithPassword(
      '201011315175@nabd.abdulrahman.elshafei98.voximplant.com',
      info.userPass
    );
    // Alert.alert('Welcome', 'Hello');
    this.makeCall(true);
  }

  render() {
    return (
      <View
        // flex
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: argonTheme.COLORS.BACKGROUND
        }}
      >
        <View></View>
        {this.decideImage()}
        <View style={styles.position}>
          <View style={styles.component}>
            <RadioForm
              formHorizontal={true}
              animation={true}
              // style={{ paddingLeft: 20 }}
            >
              {this.state.type.map((obj, i) => {
                var that = this;
                var is_selected = this.state.valueIndex == i;
                return (
                  <View key={i} style={styles.radioButtonWrap}>
                    <RadioButton
                      labelStyle={{ fontSize: 18, paddingTop: 5 }}
                      isSelected={is_selected}
                      obj={obj}
                      index={i}
                      labelHorizontal={false}
                      buttonColor={argonTheme.COLORS.APP}
                      labelColor={'#000'}
                      style={[
                        i !== this.state.type.length - 1 && styles.radioStyle
                      ]}
                      onPress={(value, index) => {
                        this.setState({ value: value });
                        this.setState({ valueIndex: index });
                        this.props.selectHelperType(value);
                      }}
                    />
                  </View>
                );
              })}
            </RadioForm>
            {/* <Text>selected: {this.state.type[this.state.valueIndex].label}</Text> */}
          </View>
          <View>{this.isDoctorSelected()}</View>

          <TouchableOpacity
            onPress={() => {
              this.videoCall();
            }}
            style={styles.circleStyle}
          >
            <Icon
              size={50}
              color={argonTheme.COLORS.WHITE}
              name="camera-video"
              family="LinearIcon"
              style={{
                textAlign: 'center'
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,
    height: height,
    alignContent: 'center'
  },
  articles: {
    width: width - theme.SIZES.BASE * 2
  },
  component: {
    alignItems: 'center',
    marginBottom: 20
  },
  radioStyle: {
    borderRightWidth: 2,
    borderColor: argonTheme.COLORS.APP,
    paddingRight: 20
  },
  radioButtonWrap: {
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleStyle: {
    padding: 10,
    margin: 20,
    backgroundColor: argonTheme.COLORS.APP,
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5
  },
  container: {
    borderColor: 'grey',
    borderWidth: 1,
    padding: 15
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  text: {
    fontSize: 18,
    padding: 8
  },
  headerFooterContainer: {
    padding: 10,
    alignItems: 'center',
    fontSize: 20
  },
  clearButton: {
    backgroundColor: 'grey',
    borderRadius: 5,
    marginRight: 10,
    padding: 5
  },
  optionContainer: {
    padding: 10,
    borderBottomColor: 'grey',
    borderBottomWidth: 1
  },
  optionInnerContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  box: {
    width: 20,
    height: 20,
    marginRight: 10
  },
  imageAmbulance: {
    width: 240,
    height: 240
    // borderRadius: 240 / 2
    // position: 'absolute',
    // top: 0
  },
  imageIcon: {},
  imageIconWrapper: {
    backgroundColor: '#E8E6E3',
    width: 32,
    height: 32,
    borderRadius: 32 / 2,
    margin: 5
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2
  },
  imageParamedic: {
    width: 140,
    height: 140,
    textAlign: 'center',
    marginTop: 18,
    marginLeft: 28
  },
  imageParamedicWrapper: {
    backgroundColor: '#FF5B62',
    width: 160,
    height: 160,
    borderRadius: 160 / 2,
    marginBottom: 30
    // position: 'absolute',
    // top: 40
  },
  imageDoctor: {
    width: 160,
    height: 160,
    borderRadius: 160 / 2,
    marginBottom: 20
    // position: 'absolute',
    // top: 40
  },
  position: {
    // position: 'absolute',
    // bottom: 0,
    alignItems: 'center'
  }
});

const mapStateToProps = state => {
  const { helperType, helperName } = state.requestHelp;
  return { helperType, helperName };
};

export default connect(
  mapStateToProps,
  { selectHelperType, requestHelp }
)(MainScreen);

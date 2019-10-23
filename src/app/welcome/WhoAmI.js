import React, { Component } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { Button } from '../../components';
import { Block, Text, Button as GaButton, theme } from 'galio-framework';
import { Actions } from 'react-native-router-flux';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Colors, Images } from '../../constants';
import { connect } from 'react-redux';
import { setUserType, getWelcomeInfo } from '../../actions';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import t from '../../I18n';

const { width, height } = Dimensions.get('screen');
class WhoAmI extends Component {
  componentDidMount() {
    (async () => {
      await AsyncStorage.getItem('@app:session')
        .then(token => {
          console.log('check token');
          if (token) {
            console.log('token:', token);
            axios.defaults.headers.common['TOKEN'] = token;
            Actions.home();
          } else {
            console.log('No token');
            this.props.getWelcomeInfo();
          }
        })
        .catch(error => {
          console.log(error);
          this.props.getWelcomeInfo();
        });
    })();
  }

  ambulance() {
    this.props.setUserType('ambulance');
    Actions.iAmbulance();
  }

  doctor() {
    this.props.setUserType('doctor');
    Actions.iDoctor();
  }

  user() {
    this.props.setUserType('user');
    Actions.iUser();
  }

  paramedic() {
    this.props.setUserType('paramedic');
    Actions.iParamedic();
  }

  render() {
    return (
      <Block flex style={{ backgroundColor: '#ffffff' }}>
        <Block center>
          <Block center>
            <Image
              style={styles.image}
              source={require('../../assets/imgs/black-logo.png')}
            />
          </Block>
          {/* <Block center style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: '700' }}>Nabd Egypt</Text>
          </Block> */}
        </Block>
        <Block>
          <Block>
            <Block
              style={{
                flexWrap: 'wrap',
                left: 15,
                top: 15
              }}
            >
              <Block>
                <Block center style={{ marginBottom: 4 }}>
                  <Text style={styles.numberText}>
                    {this.props.numberUsers}
                  </Text>
                  <Text style={styles.textStyle}>{t.User}</Text>
                </Block>
              </Block>
              <Block>
                <Block center>
                  <Text style={styles.numberText}>
                    {this.props.numberDoctors}
                  </Text>
                  <Text style={styles.textStyle}>{t.Doctor}</Text>
                </Block>
              </Block>
            </Block>
            <Block style={{ position: 'absolute', right: 15, top: 15 }}>
              <Block>
                <Block center tyle={{ marginBottom: 4 }}>
                  <Text style={styles.numberText}>
                    {this.props.numberParamedics}
                  </Text>
                  <Text style={styles.textStyle}>{t.Paramedic}</Text>
                </Block>
              </Block>
              <Block>
                <Block center>
                  <Text style={styles.numberText}>
                    {this.props.numberAmbulance}
                  </Text>
                  <Text style={styles.textStyle}>{t.Ambulance}</Text>
                </Block>
              </Block>
            </Block>
          </Block>
        </Block>
        <Block center style={{ position: 'absolute', bottom: 10 }}>
          <Button
            color="warning"
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={this.user.bind(this)}
          >
            {t.iUser}
          </Button>
          <Button
            color="warning"
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={this.doctor.bind(this)}
          >
            {t.iDoctor}
          </Button>
          <Button
            color="warning"
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={this.paramedic.bind(this)}
          >
            {t.iParamedic}
          </Button>
          <Button
            color="warning"
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={this.ambulance.bind(this)}
          >
            {t.Ambulance}
          </Button>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    marginBottom: theme.SIZES.BASE,
    width: width - theme.SIZES.BASE * 2,
    height: height / 15,
    backgroundColor: Colors.APP,
    borderRadius: 5
  },
  buttonText: { fontSize: 20, fontWeight: '700' },
  numberText: { fontSize: 20, color: '#000' },
  typeText: { fontSize: 18, color: '#A9A9A9' },
  image: {
    paddingTop: '5%',
    width: 250,
    height: 250,
    resizeMode: 'center'
  },
  textStyle: {
    color: '#484848'
  }
});

const mapStateToProps = state => ({
  numberUsers: state.openApp.numberUsers,
  numberParamedics: state.openApp.numberParamedics,
  numberAmbulance: state.openApp.numberAmbulance,
  numberDoctors: state.openApp.numberDoctors
});

export default connect(
  mapStateToProps,
  { setUserType, getWelcomeInfo }
)(WhoAmI);

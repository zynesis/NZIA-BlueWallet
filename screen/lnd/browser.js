import React, { Component } from 'react';
import { View, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { BlueHeaderDefaultSub } from '../../BlueComponents';
import { FormInput } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';

export default class Browser extends Component {
  static navigationOptions = {
    header: ({ navigation }) => {
      return <BlueHeaderDefaultSub leftText={'Lapp Browser'} onClose={() => navigation.goBack(null)} />;
    },
  };

  constructor(props) {
    super(props);
    this.state = { url: '' };
  }

  render() {
    return (
      <React.Fragment>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons
            onPress={() => {
              this.webview.goBack();
            }}
            name={'ios-arrow-round-back'}
            size={26}
            style={{
              color: 'red',
              backgroundColor: 'transparent',
              left: 8,
              top: 1,
            }}
          />

          <FormInput
            inputStyle={{ color: 'black', maxWidth: 320 }}
            containerStyle={{
              borderColor: '#d2d2d2',
              borderWidth: 0.5,
              backgroundColor: '#f5f5f5',
            }}
            value={this.state.url}
          />

          <Ionicons
            onPress={() => {
              this.webview.reload();
            }}
            name={'ios-sync'}
            size={26}
            style={{
              color: 'red',
              backgroundColor: 'transparent',
              left: 8,
              top: 1,
            }}
          />
        </View>

        <WebView
          ref={ref => (this.webview = ref)}
          source={{ uri: 'http://138.68.146.115:3456' }}
          onMessage={e => {
            console.log('-------------onMessage', e.nativeEvent);
            let json = false;
            try {
              json = JSON.parse(e.nativeEvent.data);
            } catch (_) {}
            if (json && json.pay) {
              Alert.alert(
                'Page',
                'This page asks for permission to pay this invoice',
                [
                  { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                  {
                    text: 'Pay',
                    onPress: () => {
                      console.log('OK Pressed');
                      // alert('this is RN alert. Pay this? ' + json.pay);
                      this.props.navigation.navigate({
                        routeName: 'ScanLndInvoice',
                        params: {
                          uri: json.pay,
                        },
                      });
                    },
                  },
                ],
                { cancelable: false },
              );
            }
          }}
          onLoadEnd={e => {
            this.setState({ url: e.nativeEvent.url });
            console.log('onLoadEnd', e.nativeEvent);
            this.webview.injectJavaScript(' window.postMessage("this is from postmessage"); void(0);');

            this.webview.injectJavaScript(`
	          setInterval(function(){

	            var aTags = document.getElementsByTagName("span");

							var searchText = "lnbc";
							var found;

							for (var i = 0; i < aTags.length; i++) {
							  if (aTags[i].textContent.indexOf(searchText) === 0) {
							    found = aTags[i];
							    // alert('found ' + aTags[i].textContent);
							    window.postMessage(JSON.stringify({pay:aTags[i].textContent}));
							    found.replaceWith('Invoice intercepted by BlueWallet');
							    break;
							  }
							}


							//////////////////////////////////
							//////////////////////////////////
							//////////////////////////////////


							var aTags = document.getElementsByTagName("input");
							var searchText = "lnbc";
							var found;

							for (var i = 0; i < aTags.length; i++) {
							  if (aTags[i].value.indexOf(searchText) === 0) {
							    found = aTags[i];
							    // alert('found ' + aTags[i].value);
							    window.postMessage(JSON.stringify({pay:aTags[i].value}));
							    found.replaceWith('Invoice intercepted by BlueWallet');
							    break;
							  }
							}






	          }, 1000);
	         `);
            // this.webview.injectJavaScript(' alert("done");  void(0);');

            /* this.webview.injectJavaScript(`
						function interceptClickEvent(e) {
							var href;
							var target = e.target || e.srcElement;
							window.postMessage("target.tagName =  "+ target.tagName);
							if (target.tagName === 'A') {
								href = target.getAttribute('href');

								window.postMessage("this is from postmessage: "+ href);
							}
						}


					// listen for link click events at the document level
					if (document.addEventListener) {
						document.addEventListener('click', interceptClickEvent);
					} else if (document.attachEvent) {
						document.attachEvent('onclick', interceptClickEvent);
					}
				`); */
          }}
        />
      </React.Fragment>
    );
  }
}

Browser.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
};

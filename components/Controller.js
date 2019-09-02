import React from 'react';
import { Platform } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';


const isWeb = Platform.OS === 'web';
export default class Controller extends React.Component{

  controller = {
    move: 'u'
  }

  componentDidMount() {
    this.props.onLoad(this.controller);

    if(isWeb)
      document.addEventListener("keydown", this.keydown.bind(this));
  }

  keydown(e) {
    let { controller } = this;
    switch (e.keyCode) {
      case 37:
        controller.move = 'l';
        break;
      case 38:
        controller.move = 'u';
        break;
      case 39:
        controller.move = 'r';
        break;
      case 40:
        controller.move = 'd';
        break;
      default:

    }
  }

  render() {
    let { controller } = this;
    return(
      <GestureRecognizer
        onSwipeUp={() => controller.move = 'u'}
        onSwipeDown={() => controller.move = 'd'}
        onSwipeLeft={() => controller.move = 'l'}
        onSwipeRight={() => controller.move = 'r'}
        config={{
          velocityThreshold: 0.3,
          directionalOffsetThreshold: 80,
        }}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        {this.props.children}
      </GestureRecognizer>
    );
  }
}

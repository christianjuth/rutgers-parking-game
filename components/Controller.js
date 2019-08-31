import React from 'react';
import GestureRecognizer from 'react-native-swipe-gestures';



export default class Controller extends React.Component{

  controller = {
    move: 'u'
  }

  componentDidMount() {
    this.props.onLoad(this.controller);
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

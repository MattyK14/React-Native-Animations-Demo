import React, { Component } from 'react';
import { View, Animated, PanResponder,
         Dimensions, LayoutAnimation, UIManager } from 'react-native';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;

class Deck extends Component {
  //  DEFAULT PROPS PASSED TO COMPONENT IF NOT PROVIDED
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {},
    renderNoMoreCards: () => {},
  }

  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },

      onPanResponderRelease: (event, gesture) => {
        //  SWIPE FAR ENOUGH RIGHT
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe('right');
        }
        //  SWIPE FAR ENOUGH LEFT
        else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        }
        //  DIDN'T SWIPE FAR ENOUGH IN EITHER DIRECTION
        else {
          this.resetPosition();
        }
      }
    });

    this.state = {
      panResponder,
      position,
      index: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({ index: 0 });
    }
  }

  componentWillUpdate() {
    //  ANDROID COMPATIBILITY
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
  }

  getCardStyle() {
    const { position } = this.state;

    const rotate = position.x.interpolate({
      inputRange: [-width * 1.5, 0, width * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }]   //  ES6 rotate: rotate
    };
  }

  forceSwipe(direction) {
    const x = direction === 'right' ? width : -width;
    Animated.timing(this.state.position, {
      toValue: { x, y: 0 }
    }).start(() => this.onSwipeComplete(direction));
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];

    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    this.state.position.setValue({ x: 0, y: 0 });
    this.setState({ index: this.state.index + 1 });
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 },
      duration: 250,
    }).start();
  }

  renderCards() {
    //  IF THERE ARE NO CARDS LEFT
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    return this.props.data.map((item, i) => {
      //  IF ALREADY SWIPED
      if (i < this.state.index) {
        return null;
      }

      //  IF TOP CARD
      if (i === this.state.index) {
        return (
          <Animated.View
            key={item.id}
            {...this.state.panResponder.panHandlers}
            style={[this.getCardStyle(), styles.cardStyle]}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      }

      return (
        <Animated.View
          key={item.id}
          style={[styles.cardStyle, { top: 10 * (i - this.state.index) }]}
        >
          {this.props.renderCard(item)}
        </Animated.View>
      );
    }).reverse();
  }

  render() {
    return (
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: width
  }
};

export default Deck;

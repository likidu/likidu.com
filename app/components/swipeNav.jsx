/**
 * Wrapper of SwipeLink
 */
import React, { Component, PropTypes } from 'react';

if (process.env.BROWSER) {
  require('styles/swipeNav.styl');
}

export default class SwipeNav extends Component {

  constructor(props, context) {
    super(props, context);
    const selectedIndex = this.props.selectedIndex || 0;
    const pageWidthPercent = 100 / this.props.children.length;
    const translation = selectedIndex * pageWidthPercent;
    this.state = {
      selectedIndex,
      pageWidthPercent,
      translation,
      clientX: null,
      animate: true
    };
  }

  static defaultProps = {
    // pageWidth: window.innerWidth
    pageWidth: 1200
  }

  // This is required for getting the context object: https://github.com/rackt/react-router/issues/975
  // The proptype should be object in lieu of func, guessing its a change in react-router 1.0
  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  componentDidMount() {
    this._selectIndex();
  }

  componentWillReceiveProps(nextProps) {
    this._selectIndex(parseInt(nextProps.selectedIndex, 10));
  }

  render() {
    const { props, state } = this;

    const swipeNavStyle = {
      transform: `translateX(-${state.translation}%)`,
      WebkitTransform: `translateX(-${state.translation}%)`,
      transitionProperty: state.animate ? 'all' : 'none',
      WebkitTransitionProperty: state.animate ? 'all' : 'none',
      width: `${props.children.length * 100}%`
    };

    return (
      <div
        className="swipeNav"
        style={swipeNavStyle}
        onTouchMove={this._handleTouchMove.bind(this)}
        onTouchEnd={this._handleTouchEnd.bind(this)}
      >
        {props.children.map((child, i) => {
          return (
            <div
              key={i}
              className="swipeNavItem"
              style={{ width: `${state.pageWidthPercent}%`}}
            >
              {child.props.children}
            </div>
          );
        })}
      </div>
    );
  }

  _selectIndex(selectedIndex) {
    const { state, context } = this;

    if (Number.isInteger(selectedIndex)) {
      const translation = selectedIndex * state.pageWidthPercent;
      return this.setState({
        selectedIndex,
        translation,
        clientX: null,
        animate: true
      });
    }

    if (!context.router) {
      return null;
    }
  }

  _transitionTo(selectedIndex) {
    const { props, context } = this;

    if (!this.context.router) {
      return null;
    }

    const child = props.children[selectedIndex];
    const to = child.props.to;

    if (!context.router.isActive(to)) {
      this.context.router.transitionTo(to);
    }
  }

  _handleTouchMove(e) {
    const { props, state } = this;

    const clientX = e.changedTouches[0].clientX;
    const distX = clientX - state.clientX;
    const distXPercent = distX / (props.pageWidth * props.children.length) * 100;
    const maxTranslation = state.pageWidthPercent * (props.children.length - 1);
    const tippingPoint = state.pageWidthPercent * 0.3;

    let selectedIndex = state.selectedIndex;
    let translation = state.translation - distXPercent;

    const previousTranslation = selectedIndex * state.pageWidthPercent;

    if (!state.clientX) {
      return this.setState({
        clientX
      });
    }

    if (translation < 0) {
      translation = 0;
    } else if (translation > maxTranslation) {
      translation = maxTranslation;
    }

    if (distX > 0 && translation < previousTranslation - tippingPoint) {
      selectedIndex -= 1;
    } else if (distX < 0 && translation > previousTranslation + tippingPoint) {
      selectedIndex += 1;
    }

    this.setState({
      selectedIndex,
      translation,
      clientX,
      animate: false
    });
  }

  _handleTouchEnd() {
    const { state } = this;

    const selectedIndex = state.selectedIndex;
    const translation = selectedIndex * state.pageWidthPercent;

    this.setState({
      selectedIndex,
      translation,
      clientX: null,
      animate: true
    }, this._transitionTo(selectedIndex));
  }
}

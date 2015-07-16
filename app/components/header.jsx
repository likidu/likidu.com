import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {IntlMixin} from 'react-intl';

import imageResolver from 'utils/image-resolver';
import Spinner from 'components/shared/spinner';
import LangPicker from 'components/shared/lang-picker';

// Load styles for the header
// and load the `react-logo.png` image
// for the `<img src='' />` element
let reactLogo;
if (process.env.BROWSER) {
  require('styles/header.styl');
  reactLogo = require('images/react-logo.png');
} else {
  reactLogo = imageResolver('images/react-logo.png');
}

class Header extends Component {

  static propTypes: {
    flux: PropTypes.object.isRequired
  }

  _getIntlMessage = IntlMixin.getIntlMessage

  state = {
    spinner: false
  }

  componentDidMount() {
    this.props.flux
      .getStore('requests')
      .listen(this._handleRequestStoreChange);
  }

  _handleRequestStoreChange = ::this._handleRequestStoreChange
  _handleRequestStoreChange({inProgress}) {
    return this.setState({spinner: inProgress});
  }

  render() {
    return (
      <header className='app--header'>
        {/* Spinner in the top right corner */}
        <Spinner active={this.state.spinner} />

        {/* LangPicker on the right side */}
        <LangPicker
          activeLocale={this.props.locales[0]}
          onChange={this.props.flux.getActions('locale').switchLocale} />

        {/* React Logo in header */}
        <Link to='/' className='app--logo'>
          <img src={reactLogo} alt='react-logo' />
        </Link>

        {/* Links in the navbar */}
        <ul className='app--navbar un-select'>
          <li>
            <Link to={this._getIntlMessage('routes.users')}>
              {this._getIntlMessage('header.users')}
            </Link>
          </li>
          <li>
            <Link to={this._getIntlMessage('routes.guides')}>
              {this._getIntlMessage('header.guides')}
            </Link>
          </li>
          <li>
            <Link to={this._getIntlMessage('routes.protected')}>
              {this._getIntlMessage('header.protected')}
            </Link>
          </li>
        </ul>
      </header>
    );
  }
}

export default Header;

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as authActions from 'redux/modules/auth';

@connect(
    state => ({user: state.auth.user, logged: state.auth.logged}),
    authActions)
export default
class LoginSuccess extends Component {
  static propTypes = {
    user: PropTypes.object,
    logout: PropTypes.func,
    logged: PropTypes.bool
  };
  render() {
    const {logged, logout} = this.props;
    return (logged &&
      <div className="container">
        <br /><br /><br />
        <br /><br /><br />
        <br /><br /><br />
        <br /><br /><br />
        <h1>Login Success</h1>

        <div>
          <br /><br /><br />
          <p>Hi. You have just successfully logged in, and were forwarded here
            by <code>componentWillReceiveProps()</code> in <code>App.js</code>, which is listening to
            the auth reducer via redux <code>@connect</code>. How exciting!
          </p>
          <br /><br /><br />
          <p>
            The same function will forward you to <code>/</code> should you chose to log out. The choice is yours...
          </p>
          <br /><br /><br />
          <div>
            <button className="btn btn-danger" onClick={logout}><i className="fa fa-sign-out"/>{' '}Log Out</button>
          </div>
          <br /><br /><br /><br />
        </div>
      </div>
    );
  }
}

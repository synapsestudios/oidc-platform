import React, { Component } from 'react';
import queryString from 'query-string';
import localstorage from 'store2';
import createHistory from 'history/createBrowserHistory';
import config from './config';
import './App.css';

const history = createHistory();

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentWillMount() {
    if (location.pathname === '/logout') {
      localstorage.clear();
      history.replace('/');
    } else {
      this.checkForCode();
    }
  }

  checkForCode() {
    const query = queryString.parse(location.hash.substr(1));

    if (query.code && !localstorage('accessToken')) {
      localstorage({
        accessToken: query.access_token,
        expiresIn: query.expires_in,
        idToken: query.id_token,
        tokenType: query.token_type,
      });
      this.setState(localstorage());
      history.replace('/');
    } else if (localstorage('accessToken')) {
      this.setState(localstorage());
    }
  }

  renderLoggedOutContent() {
    return (
      <div>
        <span>
          <a href={`http://localhost:9000/op/auth?client_id=${config.clientId}&response_type=code id_token token&scope=${config.scope}&redirect_uri=${config.redirectUri}&nonce=nonce`}>Login</a>
          <span> | </span>
          <a href={`http://localhost:9000/user/register?client_id=${config.clientId}&response_type=code id_token token&scope=${config.scope}&redirect_uri=${config.redirectUri}&nonce=nonce`}>Register</a>
        </span>
      </div>
    );
  }

  renderLoggedInContent() {
    return (
      <div>
        <p>Logged In</p>
        <div>
          <h2>Access Token</h2>
          <p>{this.state.accessToken}</p>
          <h2>Expires In</h2>
          <p>{this.state.expiresIn}</p>
          <h2>Id Token</h2>
          <p>{this.state.idToken}</p>
          <h2>Token Type</h2>
          <p>{this.state.tokenType}</p>
        </div>
        <div>
          <div><a href={`http://localhost:9000/user/profile?clientId=${config.clientId}&accessToken=${localstorage('accessToken')}&redirect_uri=${config.redirectUri}`}>Edit Profile</a></div>
          <div><a href={`http://localhost:9000/op/session/end?id_token_hint=${this.state.idToken}&post_logout_redirect_uri=${config.postLogoutRedirectUri}`}>Log Out</a></div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Synapse Identity Platform</h2>
        </div>
        {!this.state.accessToken ? this.renderLoggedOutContent() : this.renderLoggedInContent()}
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import queryString from 'query-string';
import localstorage from 'store2';
import { createBrowserHistory as createHistory } from 'history';
import config from './config';
import './App.css';
import { getLoginUrl } from './oidc-url-builders';

import InviteUserForm from './components/InviteUserForm';
import UserProfileForm from './components/UserProfileForm';

const history = createHistory();

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
    };
  }

  login = () => {
    fetch(`${config.testServer}token`, {
      method: 'POST',
      body: JSON.stringify({ grant_type: 'password', username: this.state.email, password: this.state.password }),
    })
      .then(res => res.json())
      .then(json => {
        if (json.statusCode >= 300) {
          console.error(json)
        } else {
          localstorage({
            accessToken: json.access_token,
            expiresIn: json.expires_in,
            idToken: json.id_token,
            tokenType: json.token_type,
          });
          this.setState(localstorage());
        }
      })
      .catch(e => console.error(e));
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

    if (query.id_token && !localstorage('accessToken')) {
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
          <a href={getLoginUrl()}>Log In</a>
          <span> | </span>
          <a href={`https://sso-client.test:9000/user/register?client_id=${config.clientId}&response_type=id_token token&scope=${config.scope}&redirect_uri=${config.redirectUri}&nonce=nonce`}>Sign Up</a>
        </span>

        <div>
          <input type="text" id="email" value={this.state.email} onChange={({ target }) => this.setState(() => ({ email: target.value }))} />
          <input type="password" id="password" value={this.state.password} onChange={({ target }) => this.setState(() => ({ password: target.value }))}/>
          <button onClick={this.login}>login with password grant</button>
        </div>
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
          <InviteUserForm />
          <UserProfileForm />
          <div><a href={`https://sso-client.test:9000/user/profile?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&access_token=${this.state.accessToken}`}>Edit Profile</a></div>
          <div><a href={`https://sso-client.test:9000/user/password?client_id=${config.clientId}&redirect_uri=${config.redirectUri}`}>Change Password</a></div>
          <div><a href={`https://sso-client.test:9000/user/email-settings?client_id=${config.clientId}&redirect_uri=${config.redirectUri}`}>Email Settings</a></div>
          <div><a href={`https://sso-client.test:9000/op/session/end?id_token_hint=${this.state.idToken}&post_logout_redirect_uri=${config.postLogoutRedirectUri}`}>Log Out</a></div>
          <div><a href={`https://sso-client.test:9000/user/logout?post_logout_redirect_uri=${config.postLogoutRedirectUri}`}>One-click log Out</a></div>
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

import React, { Component } from 'react';
import queryString from 'query-string';
import localstorage from 'store2';
import createHistory from 'history/createBrowserHistory';
import config from './config';
import Client from '@synapsestudios/fetch-client';
import './App.css';

const client = new Client();
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
    const query = queryString.parse(location.search);

    if (query.code && !localstorage('accessToken')) {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('code', query.code);
      formData.append('redirect_uri', config.redirectUri);

      const auth = btoa(`${config.clientId}:${config.clientSecret}`);

      client.fetch('http://localhost:9000/op/token', {
        method: 'POST',
        body: formData,
        headers: {
          Host: 'localhost:9000',
          Authorization: `Basic ${auth}`,
        },
        mode: 'cors',
      })
        .then(response => response.json())
        .then(response => {
          localstorage({
            accessToken: response.access_token,
            expiresIn: response.expires_in,
            idToken: response.id_token,
            tokenType: response.token_type,
          });
          this.setState(localstorage());
          history.replace('/');
        })
        .catch((e) => {
          console.error(e);
        });
    } else if (localstorage('accessToken')) {
      this.setState(localstorage());
    }
  }

  renderLoggedOutContent() {
    return (
      <div>
        <span>
          <a href={`http://localhost:9000/op/auth?client_id=${config.clientId}&response_type=code&scope=${config.scope}&redirect_uri=${config.redirectUri}`}>Login</a>
          <span> | </span>
          <a href={`http://localhost:9000/user/register?client_id=${config.clientId}&response_type=code&scope=${config.scope}&redirect_uri=${config.redirectUri}`}>Register</a>
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
          <a href={`http://localhost:9000/op/session/end?id_token_hint=${this.state.idToken}&post_logout_redirect_uri=${config.postLogoutRedirectUri}`}>Log Out</a>
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

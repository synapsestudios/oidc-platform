import React, { Component } from 'react';
import queryString from 'query-string';
import './App.css';
import config from './config';

import Client from '@synapsestudios/fetch-client';
const client = new Client();

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  checkForCode() {
    const query = queryString.parse(location.search);

    if (query.code && !this.state.accessToken) {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('code', query.code);
      formData.append('redirect_uri', 'http://sso-client.dev:3000/');

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
          this.setState({
            accessToken: response.access_token,
            expiresIn: response.expires_in,
            idToken: response.id_token,
            tokenType: response.token_type,
          });
        })
        .catch((e) => {
          // why can't i get access to the request from here?
          console.error(e);
        });
    }
  }

  render() {
    this.checkForCode();
    return (
      <div className="App">
        <div className="App-header">
          <h2>Synapse Identity Platform</h2>
        </div>
        <p>
          {!this.state.accessToken ? (
            <span>
              <a href={`http://localhost:9000/op/auth?client_id=${config.clientId}&response_type=code&scope=${config.scope}&redirect_uri=http://sso-client.dev:3000/`}>Login</a>
              <span> | </span>
              <a href={`http://localhost:9000/user/register?client_id=${config.clientId}&response_type=code&scope=${config.scope}&redirect_uri=http://sso-client.dev:3000/`}>Register</a>
            </span>
          ) : 'Logged In'}
        </p>
        {this.state.accessToken ? (
          <div>
            Access Token : {this.state.accessToken}<br />
            Expires In : {this.state.expiresIn}<br />
            Id Token : {this.state.idToken}<br />
            Token Type : {this.state.tokenType}
          </div>
        ) : ''}
      </div>
    );
  }
}

export default App;

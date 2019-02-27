import React, { Component } from 'react';
import localstorage from 'store2';
import config from '../config';

const fields = [
  { label: 'Name', id: 'name' },
  { label: 'Given Name', id: 'given_name' },
  { label: 'Family Name', id: 'family_name' },
  { label: 'Middle Name', id: 'middle_name' },
  { label: 'Nickname', id: 'nickname' },
  { label: 'Preferred Username', id: 'preferred_username' },
  { label: 'Profile', id: 'profile' },
  { label: 'Website', id: 'website' },
  { label: 'Email', id: 'email' },
  { label: 'Gender', id: 'gender' },
  { label: 'Birthdate', id: 'birthdate' },
  { label: 'Phone Number', id: 'phone_number' },
  { label: 'Street Address', id: 'address.street_address' },
  { label: 'Locality', id: 'address.locality' },
  { label: 'Region', id: 'address.region' },
  { label: 'Postal Code', id: 'address.postal_code' },
  { label: 'Country', id: 'address.country' },
];

const defaultFields = fields.reduce((acc, {id}) => ({ ...acc, [id]: ''}), {});

class UserProfileForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showMessage: false,
      message: '',
      ...defaultFields,
      picture: '',
    };
  }

  updateForm(fieldName, e) {
    const field = {};
    field[fieldName] = (e.target.type === 'checkbox')
      ? e.target.checked : e.target.value;
    this.setState(field);
  }

  submitForm(e) {
    e.preventDefault();
    const data = new FormData();

    fields.forEach(({id}) => data.append(id, this.state[id]));
    const file = this.pictureUpload.files[0];
    if (file) {
      data.append('picture', file, file.name);
    }

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${localstorage('accessToken')}`);

    fetch(`${config.identityServer}api/user/profile`, {
      method: 'PUT',
      headers,
      body: data,
    }).then((res) => res.json())
      .then((data) => {
        this.setState({ showMessage: true, message: 'Profile Updated' });
        setTimeout(() => {
          this.setState({
            ...defaultFields,
            showMessage: false,
            message: '',
            picture: '',
          });
        }, 1000);
      });
  }

  renderField = ({ label, id }) => {
    return (
      <div style={{
        padding: '10px',
      }} key={id} >
        <label htmlFor={id} style={{ width: '100px', textAlign: 'left' }}>{label}:</label>
        <input
          type="text"
          name={id}
          id={id}
          value={this.state[id]}
          placeholder={`Enter a ${label.toLowerCase()}`}
          onChange={(e) => this.updateForm.call(this, id, e)}
          style={{
            width: '150px',
          }} />
      </div>
    );
  }

  renderPictureUpload() {
    return (
      <div style={{
        padding: '10px',
      }}>
        <label htmlFor="picture" style={{ width: '100px', textAlign: 'left' }}>Picture:</label>
        <input
          type="file"
          name="picture"
          id="picture"
          accept="image/*"
          value={this.state.picture.name}
          placeholder="Upload a picture"
          onChange={(e) => {
            const field = {picture: e.target.value};
            this.setState(field);
          }}
          ref={ref => this.pictureUpload = ref}
          style={{
            width: '150px',
          }} />
      </div>
    );
  }

  render() {
    return (
      <div>
        <form
          onSubmit={this.submitForm.bind(this)}
          style={{
            border: 'thin solid black',
            padding: '10px',
            width: '400px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
          {fields.map(this.renderField)}
          {this.renderPictureUpload()}
          <div style={{
            padding: '10px',
          }}>
            <input
              type="submit"
              value="Update User Profile"
              style={{
                width: '150px',
              }} />
          </div>
        </form>
        {(this.state.showMessage) ? <div>
          <h4>{this.state.message}</h4>
        </div> : ''}
      </div>
    );
  }
}

export default UserProfileForm;

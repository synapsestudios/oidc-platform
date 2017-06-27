import React, { Component } from 'react';

class InviteUserForm extends Component {
  constructor(props){
    super(props);

    this.state = { name: '', email: '' };
  }

  updateForm(fieldName, e) {
    const field = {};
    field[fieldName] = e.target.value;
    this.setState(field);
  }

  submitForm(e) {
    e.preventDefault();
    fetch('/invite', {
      method: 'POST',
      body: JSON.stringify(this.state),
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
    });
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
          <div style={{
            padding: '10px',
          }}>
            <label htmlFor="name" style={{ width: '100px', textAlign: 'left' }}>Name:</label>
            <input 
              type="text" 
              name="name" 
              id="name" 
              value={this.state.name} 
              placeholder="Enter a name"
              onChange={(e) => this.updateForm.call(this, 'name', e)}
              required
              style={{
                width: '150px',
            }} />
          </div>
          <div style={{
            padding: '10px',
          }}>
            <label htmlFor="email" style={{ width: '100px', textAlign: 'left' }}>Email:</label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              value={this.state.email} 
              placeholder="Enter an email" 
              onChange={(e) => this.updateForm.call(this, 'email', e)}
              required
              style={{
                width: '150px',
            }} />
          </div>
          <div style={{
            padding: '10px',
          }}>
            <input 
              type="submit"  
              value="Invite User"  
              style={{
                width: '150px',
            }} />
          </div>
        </form>
      </div>
    );
  }
}

export default InviteUserForm;
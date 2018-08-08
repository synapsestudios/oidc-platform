import React, {Component} from 'react';

class InviteUserForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      email: '',
      from: '',
      showMessage: false,
      message: '',
      useTemplate: false,
    };
  }

  updateForm(fieldName, e) {
    const field = {};
    field[fieldName] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    this.setState(field);
  }

  submitForm(e) {
    e.preventDefault();
    const data = {
      name: this.state.name,
      email: this.state.email,
      from: this.state.from,
      useTemplate: this.state.useTemplate,
    };
    fetch('/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(data => {
        return data.json();
      })
      .then(data => {
        const message = `Message sent to ${data.email}`;
        this.setState({showMessage: true, message});
        setTimeout(() => {
          this.setState({
            name: '',
            email: '',
            showMessage: false,
            message: '',
            useTemplate: false,
          });
        }, 1000);
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
          <div
            style={{
              padding: '10px',
            }}>
            <label htmlFor="name" style={{width: '100px', textAlign: 'left'}}>
              Name:
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={this.state.name}
              placeholder="Enter a name"
              onChange={e => this.updateForm.call(this, 'name', e)}
              required
              style={{
                width: '150px',
              }}
            />
          </div>
          <div
            style={{
              padding: '10px',
            }}>
            <label htmlFor="email" style={{width: '100px', textAlign: 'left'}}>
              Email:
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={this.state.email}
              placeholder="Enter an email"
              onChange={e => this.updateForm.call(this, 'email', e)}
              required
              style={{
                width: '150px',
              }}
            />
          </div>

          <div
            style={{
              padding: '10px',
            }}>
            <label htmlFor="from" style={{width: '100px', textAlign: 'left'}}>
              From:
            </label>
            <input
              type="email"
              name="from"
              id="from"
              value={this.state.from}
              placeholder="Enter an from address"
              onChange={e => this.updateForm.call(this, 'from', e)}
              style={{
                width: '150px',
              }}
            />
          </div>

          <div
            style={{
              padding: '10px',
            }}>
            <label htmlFor="use-template" style={{width: '100px', textAlign: 'left'}}>
              Use Email Template:
            </label>
            <input
              type="checkbox"
              name="use-template"
              id="use-template"
              checked={this.state.useTemplate}
              onChange={e => this.updateForm.call(this, 'useTemplate', e)}
              style={{
                width: '150px',
              }}
            />
          </div>
          <div
            style={{
              padding: '10px',
            }}>
            <input
              type="submit"
              value="Invite User"
              style={{
                width: '150px',
              }}
            />
          </div>
        </form>
        {this.state.showMessage ? (
          <div>
            <h4>{this.state.message}</h4>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default InviteUserForm;

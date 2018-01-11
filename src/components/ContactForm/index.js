import React from 'react'
import Link from 'gatsby-link'
import get from 'lodash/get'
import Helmet from 'react-helmet'

//-- Styles.
import styles from './index.scss'

export default class ContactForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      validationMessage: '',
      validationClass: ''
    };
  }

  encode = (data) => {
    return Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
  }

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  }

  handleSubmit = e => {
    e.preventDefault();

    let state = this.state;

    delete(state.validationMessage);

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: this.encode({ "form-name": "contact", ...this.state })
    })
      .then(() => {
        this.setState({
          validationMessage: 'Thanks! Your message was submitted successfully.',
          validationClass: ''
        })
      })
      .catch(error => {
        this.setState({
          validationMessage: 'Sorry, something went wrong. If you want, you can email me at <strong>alex@macarthur.me</strong> directly.',
          validationClass: 'is-error'
        })
      });
  };

  render() {
    return (
      <form
        name="Contact"
        method="post"
        action="/thanks/"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        onSubmit={this.handleSubmit}
      >
        <p hidden>
          <label>
            Don’t fill this out: <input name="bot-field" />
          </label>
        </p>
        <p>
          <label>
            Your name:<br />
          <input type="text" name="name" onChange={this.handleChange}/>
          </label>
        </p>
        <p>
          <label>
            Your email:<br />
            <input type="email" name="email" onChange={this.handleChange}/>
          </label>
        </p>
        <p>
          <label>
            Message:<br />
            <textarea name="message" onChange={this.handleChange}/>
          </label>
      </p>
        <p>
          <button type="submit">Send</button>
        </p>

        { this.state.validationMessage &&
          <span className={"message " + this.state.validationClass}
          >{ this.state.validationMessage }</span>
        }

      </form>
    )
  }
}


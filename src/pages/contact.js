import React from 'react'
import Link from 'gatsby-link'
import get from 'lodash/get'
import Helmet from 'react-helmet'

import ContactForm from '../components/ContactForm'

export default ({ data }) => {

  return (
  <div>
      <h1>Contact</h1>

      <p>
        If you have a question about something I've built, have an issue with me at a deep, personal level, or are interested in hiring me for a project, get in touch!
      </p>

      <div style={{
        maxWidth: '600px',
        margin: '5rem auto 0'
      }}>
        <ContactForm />
      </div>

    </div>
  )
}

export const contactQuery = graphql`
  query contactQuery {
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`

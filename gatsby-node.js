const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')
const paginate = require('./paginate');
const redirects = require('./redirects');

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const nodePath = createFilePath({ node, getNode });
    
    // If this node was source from the "posts" directory, slap a prefix onto the slug, 
    // so that the resulting path is formatted correctly.
    let fileNode = getNode(node.parent);
    let slugPrefix = fileNode.dir.match(/src\/posts/) ? "/posts" : "";

    // Put the date string itself in a matching group.
    let publishDateMatch = nodePath.match(/^\/(\d{4}-\d{2}-\d{2})/);
    let publishDate = publishDateMatch ? publishDateMatch[1] : "";

    let cleanPath = nodePath
      .replace(/\/$/, '') // Remove trailing slashes.
      .replace(/(^\/)(\d{4}-\d{2}-\d{2}-)/, '$1'); // Remove date string.

    createNodeField({
      name: `publishDate`,
      node,
      value: publishDate
    });

    createNodeField({
      name: `slug`,
      node,
      value: `${slugPrefix}${cleanPath}`
    });
  }
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions

  redirects.forEach(redirect => {
    createRedirect(redirect);
  });

  const postsPaginationPromise = paginate({
    queryPromise: graphql(`
      {
        allMarkdownRemark(
          sort: { fields: [fields___publishDate], order: DESC }, 
          limit: 1000,
          filter: {fileAbsolutePath: {regex: "/(posts)/(.*).md$/"}}
        ) {
          edges {
            node {
              excerpt(pruneLength: 250)
              fields {
                slug
                publishDate(formatString: "MMMM DD, YYYY")
              }
              frontmatter {
                last_updated(formatString: "MMMM DD, YYYY")
                title
                external
              }
            }
          }
        }
      }
    `),
    perPage: 10,
    listPath: 'posts', 
    createPage
  });

  /**
   * Generate all pages made of markdown.
   */
  const allMarkdownPromise = graphql(
    `
      {
        allMarkdownRemark(sort: { fields: [fields___publishDate], order: DESC }, limit: 1000) {
          edges {
            node {
              fileAbsolutePath
              fields {
                slug
                publishDate(formatString: "MMMM DD, YYYY")
              }
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      console.log(result.errors)
      reject(result.errors)
    }

    const posts = result.data.allMarkdownRemark.edges;

    posts.forEach(post => {
      createPage({
        path: post.node.fields.slug,
        component: path.resolve('./src/templates/page.js'),
        context: {
          slug: post.node.fields.slug,
          publishDate: post.node.fields.publishDate
        },
      });
    });
  });

  return Promise.all([postsPaginationPromise, allMarkdownPromise]);
}

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    node: {
      fs: 'empty'
    }
  })
}

const { GraphQLClient } = require('graphql-request')
const crypto = require('crypto')

const DATO_URL = 'https://graphql.datocms.com/'

exports.sourceNodes = ({ boundActionCreators, createNodeId }, options) => {
  const { createNode } = boundActionCreators

  return new Promise((resolve, reject) => {
    const client = new GraphQLClient(DATO_URL, {
      headers: {
        Authorization: options.datoApiKey,
      },
    })

    const query = `{
      allJournals{
        id
        title
        entry
      }
    }`

    client
      .request(query)
      .then(data => {
        data.allJournals.forEach(entry => {
          const digest = crypto
            .createHash(`md5`)
            .update(JSON.stringify(entry))
            .digest(`hex`)

          const node = Object.assign(entry, {
            id: createNodeId(entry.id),
            parent: null,
            children: [],
            internal: {
              type: 'Entry',
              contentDigest: digest,
            },
          })
          createNode(node)
        })
      })
      .then(resolve)
      .catch(reject)
  })
}

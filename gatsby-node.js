const fs = require('fs')

function flatten (object) {
  for (const key of Object.keys(object)) {
    if (object[key] !== null && object[key] !== undefined && typeof object[key] === 'object') {
      if (object[key].edges) {
        object[key] = object[key].edges.map(edge => edge.node)
      }
    }
    if (object[key] !== null && object[key] !== undefined && typeof object[key] === 'object') {
      flatten(object[key])
    }
  }
}

exports.onPostBuild = async ({ graphql }) => {
  const result = await graphql(`
{
  githubData {
    data {
      organization {
        repositories {
          edges {
            node {
              description
              url
              homepageUrl
              collaborators {
                edges {
                  node {
                    login
                    name
                  }
                }
              }
              releases {
                edges {
                  node {
                    name
                    url
                    descriptionHTML
                    updatedAt
                    tagName
                    isPrerelease
                    releaseAssets {
                      edges {
                        node {
                          name
                          contentType
                          downloadUrl
                        }
                      }
                    }
                  }
                }
              }
            }
            cursor
          }
        }
      }
    }
  }
}`)
  const postsPath = './public'
  flatten(result)
  const modules = result.data.githubData.data.organization.repositories
  if (!fs.existsSync(postsPath)) fs.mkdirSync(postsPath, { recursive: true })
  fs.writeFileSync(`${postsPath}/modules.json`, JSON.stringify(modules))
}

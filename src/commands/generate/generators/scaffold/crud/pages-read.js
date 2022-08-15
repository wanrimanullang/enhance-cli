const { schemaToForm } = require('../schema-to-form')

module.exports = function ({ plural, singular, schema }) {
  return `// View documentation at: https://docs.begin.com
export default function Html ({ html, state }) {
  const { store } = state
  const ${singular} = store.${singular} || {}
  const problems = store.problems || {}

  return html\`
  ${schemaToForm({ action: plural, schema, update: true, data: singular })}
\`
}
`
}

const { schemaToForm } = require('../schema-to-form')

module.exports = function ({ singular, plural, schema }) {
  return `// View documentation at: https://docs.begin.com
export default function Html ({ html, state }) {
  const { store } = state
  const ${singular} = store.${singular} || {}
  const problems = store.problems || []
  const display = problems.length > 0? 'block' : 'none'
  const li = p => \`<li>\${p.name} \${p.error}</li>\`

  return html\`
  ${schemaToForm({ action: plural, schema, update: false, data: singular  })}
\`
}
`
}

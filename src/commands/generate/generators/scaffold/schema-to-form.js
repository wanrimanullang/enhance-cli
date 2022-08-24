const capitalize = s => s && s[0].toUpperCase() + s.slice(1)

function getType (key, property) {
  if (key === 'key') {
    return 'hidden'
  }
  let { type } = property
  if (type === 'boolean') {
    return 'checkbox'
  }
  else if (type === 'string') {
    if (property.format) {
      if (property.format === 'date-time') {
        return 'datetime-local'
      }
      else if (property.format === 'uri') {
        return 'url'
      }
      else {
        return property.format
      }
    }
    return 'text'
  }
  return type
}

function inputTemplate (key, type, property, data, required = [], keyPrefix = '') {
  let tagName = type === 'checkbox' ? 'checkbox' : 'text-input'
  if (type === 'hidden') {
    return `<input type="hidden" id="${key}" name="${key}" value="\${${data}?.${key}}" />`
  }

  // if the json schema indicates an number allow decimals
  if (type === 'number' && !property.step) {
    property.step = 0.01
  }
  // otherwise, just and integer
  else if (type === 'integer') {
    type = 'number'
  }

  let name = keyPrefix ? `${keyPrefix}` : key
  let dataPath = keyPrefix ? keyPrefix.replace(/\./g, '?.') : key

  let input = `<enhance-${tagName} label="${capitalize(key).replace(/([a-z])([A-Z])/g, '$1 $2')}" type="` + type + '" id="' + name + '" name="' + name + '" '
  if (property.minimum) {
    input = input + 'min="' + property.minimum + '" '
  }
  if (property.minLength) {
    input = input + 'minlength="' + property.minLength + '" '
  }
  if (property.maximum) {
    input = input + 'max="' + property.maximum + '" '
  }
  if (property.maxLength) {
    input = input + 'maxlength="' + property.maxLength + '" '
  }
  if (property.pattern) {
    input = input + 'pattern="' + property.pattern + '" '
  }
  if (property.description) {
    input = input + 'description="' + property.description + '" '
  }
  if (property.step) {
    input = input + 'step="' + property.step + '" '
  }
  if (required.includes(key)) {
    input = input + 'required '
  }
  if (type === 'checkbox' && data[key] === true) {
    input = input + 'checked '
  }
  input = input + `value="\${${data}?.${dataPath}}" errors="\${problems?.${dataPath}?.errors}"></enhance-${tagName}>`
  return input
}

function selectTemplate (key, property, data, required = [], keyPrefix = '') {
  let name = keyPrefix ? `${keyPrefix}.${key}` : key
  let input = '<select id="' + name + '" name="' + name + '"'
  if (required.includes(key)) {
    input = input + 'required'
  }
  input = input + '>'
  property.enum.forEach(item => input = input + `<option value="${item}" ${item === data[key]?.value ? 'selected' : ''}>${item}</option>`)
  input = input + '</select>'
  return input
}

function input (key, schema, data, prefix = '') {
  const property = schema.properties[key]
  const type = getType(key, property)
  let elem = ''
  let keyPrefix = prefix ? `${prefix}.${key}` : ''
  if (property.enum) {
    elem = selectTemplate(key, property, data, schema.required, keyPrefix)
  }
  else if (type === 'object') {
    elem = elem + `<enhance-fieldset legend="${capitalize(key)}">`
    elem = elem + Object.keys(schema.properties[key].properties).map(innerKey =>
      input(innerKey, schema.properties[key], data, key)
    ).join('\n')
    elem = elem + `</enhance-fieldset>`
  }
  else {
    elem = inputTemplate(key, type, property, data, schema.required, keyPrefix)
  }
  return elem
}

function schemaToForm ({ action, schema, update = false, data }) {
  return `<enhance-form
  action="/${action}${update ? `/\${${data}.key}` : ''}"
  method="POST">
  <div class="\${problems.form ? 'block' : 'hidden'}">
    <p>Found some problems!</p>
    <ul>\${problems.form}</ul>
  </div>
  <enhance-fieldset legend="${capitalize(schema?.id)}">
  ${Object.keys(schema.properties).map(key =>
    input(key, schema, data)
  ).join('\n  ')}
  <enhance-submit-button style="float: right"><span slot="label">Save</span></enhance-submit-button>
  </enhance-fieldset>
</enhance-form>`
}

module.exports = {
  schemaToForm
}

const fs = require('fs')

function fixFile(filePath, saveText) {
  let content = fs.readFileSync(filePath, 'utf8')

  // Find "SearchPage" and the duplicate "professional"
  const startIdx = content.indexOf('  "SearchPage": {')
  if (startIdx === -1) {
    console.log('No SearchPage found in', filePath)
    return
  }

  // Find the duplicate "professional"
  const endIdx = content.indexOf('    "plans": {')
  if (endIdx === -1) {
    console.log('No plans found in', filePath)
    return
  }

  // Revert the "save" strings
  let before = content.slice(0, startIdx)
  before = before.replace('"save": "Salvar Formação"', '"save": "Salvar Endereço"')
  before = before.replace('"save": "Guardar Formación"', '"save": "Guardar Dirección"')

  // Also we need to make sure the address block ends with `    },\n` instead of `    }\n  },\n`
  before = before.substring(0, before.lastIndexOf('}'))
  before = before.substring(0, before.lastIndexOf('}')) + '    },\n'

  fs.writeFileSync(filePath, before + content.slice(endIdx))
  console.log('Fixed', filePath)
}

fixFile('messages/pt.json')
fixFile('messages/es.json')

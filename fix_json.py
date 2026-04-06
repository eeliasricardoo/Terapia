import codecs
import re

def fix_file(filepath, replace_to):
    with codecs.open(filepath, 'r', 'utf-8') as f:
        content = f.read()

    pattern = re.compile(r'(\s*\}\n  \},\n  "SearchPage": \{\n[\s\S]*?"professional": \{\n[\s\S]*?"save": "[^"]+"\n    \},\n)(\s*"plans": \{)', re.MULTILINE)
    match = pattern.search(content)
    if match:
        before = content[:match.start(1)]
        before = before.replace('"Salvar Formação"', '"Salvar Endereço"').replace('"Guardar Formación"', '"Guardar Dirección"')
        content = before + '\n    },\n' + content[match.end(1):]
        with codecs.open(filepath, 'w', 'utf-8') as f:
             f.write(content)
        print("Fixed", filepath)
    else:
        print("No match", filepath)

fix_file('messages/pt.json', '"Salvar Endereço"')
fix_file('messages/es.json', '"Guardar Dirección"')

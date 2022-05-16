import Prism from "prismjs";
import codegen from "codegen.macro";

// Babel Codegen Macro:
// Get a list of all prismjs languages and inline them here.
// They should only depend on "Prism" being present in the current scope.

codegen`
  const { readFileSync } = require('fs')
  const { dirname, join } = require('path')
  const { languages } = require('prismjs/components')
  const prismPath = dirname(require.resolve('prismjs'))

  // This json defines which languages to include
  const includedLangs = require('./includeLangs')

  let output = '/* This content is auto-generated to include some prismjs language components: */\\n'

  const addLanguageToOutput = language => {
    const pathToLanguage = 'components/prism-' + language
    const fullPath = join(prismPath, pathToLanguage + '.js')
    const contents = readFileSync(fullPath, 'utf8')
    const header = '\\n\\n/* "prismjs/' + pathToLanguage + '" */\\n'
    output += header + contents
  }

  const visitedLanguages = {}

  const visitLanguage = (language, langEntry) => {
    // Mark language as visited or return if it was
    if (visitedLanguages[language]) {
      return
    } else {
      visitedLanguages[language] = true
    }

    // Required + optional dependencies come before the actual language
    const dependencies = [].concat(langEntry.require).concat(langEntry.optional).filter(f => f)

    if (dependencies.length > 0) {
      dependencies.forEach(x => {
        if (includedLangs[x]) {
          if (languages[x]) {
            visitLanguage(x, languages[x])
          } else {
            console.warn('[prismjs/components]: Language', x, 'does not exist!')
          }
        }
      })
    }

    // Add current language to output
    addLanguageToOutput(language)

    // Peer dependencies come after the actual language
    const peerDependencies = [].concat(langEntry.peerDependencies).filter(f => f)

    if (Array.isArray(peerDependencies)) {
      peerDependencies.forEach(x => {
        if (languages[x]) {
          visitLanguage(x, languages[x])
        } else {
          console.warn('[prismjs/components]: Language', x, 'does not exist!')
        }
      })
    }
  };

  Object.keys(includedLangs).forEach(language => {
    visitLanguage(language, languages[language])
  })

  module.exports = output
`;

export default Prism;

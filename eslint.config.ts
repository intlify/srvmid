import {
  comments,
  defineConfig,
  jsdoc,
  jsonc,
  markdown,
  oxlint,
  typescript,
  yaml
} from '@kazupon/eslint-config'

const config: ReturnType<typeof defineConfig> = defineConfig(
  typescript({
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
      project: true
    }
  }),
  comments({ kazupon: false }),
  jsdoc({
    typescript: 'syntax',
    ignores: ['./**/playground/**', './**/spec/**', './packages/shared/**']
  }),
  // yaml({
  //   prettier: true
  // }),
  yaml(),
  markdown({
    preferences: true
  }),
  jsonc({
    json: true,
    json5: true,
    jsonc: true
    // prettier: true
  }),
  oxlint({
    presets: ['typescript'],
    configFile: './.oxlintrc.json'
  }),
  {
    ignores: ['pnpm-lock.yaml', 'CHANGELOG.md', '.github/**']
  }
)

export default config

const shared = {
  presets: ['@babel/typescript'],
  plugins: ['babel-plugin-add-import-extension']
}

module.exports = {
  env: {
    esmUnbundled: shared,
    esmBundled: {
      ...shared,
      presets: [['@babel/env', {
        targets: "> 0.25%, not dead"
      }], ...shared.presets],
    },
    cjs: {
      ...shared,
      presets: [['@babel/env', {
        modules: 'commonjs'
      }], ...shared.presets],
    },
    test: {
      presets: ['@babel/env', ...shared.presets]
    },
  }
}
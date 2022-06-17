const esbuild = require('esbuild')
const { dependencies, peerDependencies } = require('./package.json')

const external = [
  ...Object.keys(dependencies),
  ...Object.keys(peerDependencies)
]

const main = async () => {

  await Promise.all([

    /**
     * ES Module
     */
    esbuild
      .build({
        entryPoints: ['src/index.ts'],
        // outdir: 'lib',
        outfile: 'lib/index.mjs',
        bundle: true,
        sourcemap: false, // true,
        minify: false, // true,
        splitting: false, // true,
        format: 'esm',
        target: ['esnext'],
        external
      }),

    /**
     * CommonJS
     */
    esbuild
      .build({
        entryPoints: ['src/index.ts'],
        // outdir: 'lib',
        outfile: 'lib/index.js',
        bundle: true,
        sourcemap: false, // true,
        minify: false, // true,
        platform: 'node',
        target: ['node12'], // https://esbuild.github.io/api/#target
        external
      })
  ])

}

main().catch(() => process.exit(1))

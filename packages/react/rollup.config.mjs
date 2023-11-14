import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: true,
    },
  ],
  external: ['react/jsx-runtime', 'react', 'use-sync-external-store/shim'],
  plugins: [
    // must come before the typescript plugin!
    nodeResolve({
      extensions: ['.js', '.ts', '.tsx'],
    }),
    typescript({
      tsconfig: './tsconfig.build.json',
    }),
  ],
}

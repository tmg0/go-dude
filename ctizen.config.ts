import { defineConfig } from 'ctizen'

export default defineConfig({
  tsup: {
    format: ['esm']
  },
  unimport: {
    imports: [{ name: 'default', as: 'consola', from: 'consola' }],
    dirs: ['./utils/**/*.ts']
  }
})

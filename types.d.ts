interface DudeConfig {
  name?: string
  dockerCompose: {
    file: string
  }
  ssh: {
    host: string
    username: string
    password: string
    port: number
  }
  build: {
    script: string
    output: string
  }
}
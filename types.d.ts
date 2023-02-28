interface ImageRepo {
  host: string
  username: string
  password: string
  project: string
}

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
    script?: string
    output: string
  }
  repos?: ImageRepo[]
}

interface DockerComposeService {
  image: string
  volumns: string[]
  ports: string[]
  network_mode: string
}

interface DockerCompose {
  version: string
  services: Record<string, DockerComposeService>
}
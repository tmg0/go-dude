interface ImageRepo {
  host: string
  username: string
  password: string
  project: string
}

interface DudeConfig {
  name?: string
  dockerCompose?: false | {
    file: string
    command?: string
  }
  k8s: {
    deployment: string
    pod?: string
    container?: string
    namespace?: string
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

interface DockerVersion {
  Client: {
    Platform: { Name: string }
    Version: string
  },
  Server: {
    Platform: { Name: string }
    Version: string
  }
}

interface DockerPs {
  Command: string
  CreatedAt: string
  ID: string
  Image: string
  Labels: string
  LocalVolumes: strin
  Mounts: string
  Names: string
  Networks: string
  Ports: string
  RunningFor: string
  Size: string
  State: string
  Status: string
}
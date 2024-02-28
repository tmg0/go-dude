export interface ImageRepo {
  host: string
  username: string
  password: string
  project: string
}

export interface DudeOptions {
  name?: string
  dockerCompose?: {
    file: string
    command?: string
  }
  k8s?: {
    deployment: string
    pod?: string
    container?: string
    namespace?: string
  }
  ssh?: {
    host: string
    username: string
    password: string
    port: number
  }
  build?: {
    script?: string
    output: string
  }
  repos?: ImageRepo[]
}

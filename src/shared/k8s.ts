import { NodeSSH } from 'node-ssh'

export const deploymentLabelSelectors = async (ssh: NodeSSH, conf: DudeConfig) => {
  const { stdout } = await ssh.execCommand(`kubectl get deployment ${conf.k8s.deployment} -n ${conf.k8s.namespace} -o json`)
  try {
    const json = JSON.parse(stdout)
    return Object.entries(json.spec.selector.matchLabels).map(([key, value]) => `${key}=${value}`)
  } catch {
    return []
  }
}

export const kubeGetPods = async (ssh: NodeSSH, conf: DudeConfig, selectors: string[]) => {
  const { stdout } = await ssh.execCommand(`kubectl get pods -n ${conf.k8s.namespace} -l ${selectors.join(',')} -o jsonpath='{.items[*].metadata.name}'`)
  return stdout.split('#')
}

export const kubeGetContainers = async (ssh: NodeSSH, conf: DudeConfig, selectors: string[]) => {
  const { stdout } = await ssh.execCommand(`kubectl get pods -n ${conf.k8s.namespace} -l ${selectors.join(',')} -o jsonpath='{.items[*].spec.containers[*].name}'`)
  return stdout.split('#')
}

export const kubeSetImage = (ssh: NodeSSH, conf: DudeConfig, container: string, image: string) => {
  return ssh.execCommand(`kubectl set image deployment/${conf.k8s.deployment} ${container}=${image} -n ${conf.k8s.namespace}`)
}

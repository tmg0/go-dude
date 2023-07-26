import { NodeSSH } from 'node-ssh'
import consola from 'consola'
import destr from 'destr'
import { sshExecAsync } from './ssh'

export const deploymentLabelSelectors = async (ssh: NodeSSH, conf: DudeConfig) => {
  const { stdout } = await ssh.execCommand(`kubectl get deployment ${conf.k8s.deployment} -n ${conf.k8s.namespace} -o json`)
  try {
    const json = JSON.parse(stdout)
    return Object.entries(json.spec.selector.matchLabels).map(([key, value]) => `${key}=${value}`)
  } catch {
    return []
  }
}

export const kubeGetPodNames = async (ssh: NodeSSH, conf: DudeConfig, selectors: string[]) => {
  const { stdout } = await ssh.execCommand(`kubectl get pods -n ${conf.k8s.namespace} -l ${selectors.join(',')} -o jsonpath='{.items[*].metadata.name}'`)
  return stdout.split('#')
}

export const kubeGetContainers = async (ssh: NodeSSH, conf: DudeConfig, selectors: string[]) => {
  const { stdout } = await ssh.execCommand(`kubectl get pods -n ${conf.k8s.namespace} -l ${selectors.join(',')} -o jsonpath='{.items[*].spec.containers[*].name}'`)
  return stdout.split('#')
}

export const kubeSetImage = async (ssh: NodeSSH, conf: DudeConfig, container: string, image: string) => {
  await ssh.execCommand(`kubectl set image deployment/${conf.k8s.deployment} ${container}=${image} -n ${conf.k8s.namespace}`)
  consola.success('Kubectl deployment container image edit complete.')
}

export const kubeExecAsync = async (ssh: NodeSSH, conf: DudeConfig, str: string) => {
  const { stdout } = await ssh.execCommand(`kubectl -n ${conf.k8s.namespace} ${str}`)
  return stdout
}

export const kubeGetPo = async (ssh: NodeSSH, conf: DudeConfig, selectors: string[]) => {
  const pods: K8sContainerStatus[] = []
  const stdout = await sshExecAsync(ssh, `kubectl get po -n ${conf.k8s.namespace} -l ${selectors.join(',')} -o json`)
  destr<KubectlGetPo>(stdout).items.forEach(({ status }) => {
    status.containerStatuses.forEach(c => pods.push(c))
  })
  return pods
}

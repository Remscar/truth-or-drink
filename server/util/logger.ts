import logdown from 'logdown'

export const getLogger = (title: string) => {
  const logger = logdown(`ToDServer::${title}`)
  logger.state.isEnabled = true
  return logger
}

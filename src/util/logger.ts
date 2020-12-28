import logdown from 'logdown'

export const getLogger = (title: string) => {
  const logger = logdown(`ToD::${title}`)
  logger.state.isEnabled = true
  return logger
}

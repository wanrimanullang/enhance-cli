module.exports = {
  names: { en: [ 'version', 'ver', 'v' ] },
  action: ({ appVersion }) => {
    return {
      stdout: `Begin ${appVersion}`,
      json: {
        begin: process.argv[0],
        version: appVersion,
      }
    }
  }
}

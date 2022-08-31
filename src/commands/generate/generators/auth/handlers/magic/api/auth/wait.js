module.exports = function () {
  return `import arc from '@architect/functions'
import db from '@begin/data'
import { getUsers } from '../../../models/users.mjs'
import { getRoles } from '../../../models/roles.mjs'

export async function get (req) {
  const magicQueryId = req.query?.magic
  const session = req?.session
  const { redirectAfterAuth = '/', signingUp = false, ...newSession } = session
  let sessionInfo
  try {
    sessionInfo = await db.get({ table: 'session', key: session.magicId })
  }
  catch (e) {
    console.log(e)
  }
  const verified = sessionInfo?.verified

  if (!verified) {
    // still waiting
    return {
      json: { magicQueryId }
    }
  }
  if (signingUp) {
    return {
      session:{ verifiedEmail:sessionInfo?.email },
      location: '/auth/register'
    }
  }
  if (!signingUp) {
    let users, user, roles, permissions
    try {
      users = await getUsers()
      user = users.find(i => i.email === sessionInfo.email)
      roles = await getRoles()
      permissions = Object.values(user?.roles).filter(Boolean).map(role => roles.find(i => role === i.name))
    }
    catch (e) {
      console.log(e)
    }

    if (user) {
      // Verified User
      return {
        session: { ...newSession, account: { user, permissions } },
        location: redirectAfterAuth
      }
    }
    else {
      // Verified Email but not a user
      return {
        session: {},
        location: '/auth/signup'
      }
    }
  }

}


`
}

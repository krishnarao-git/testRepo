const endpointsRoutes = require('../../../fixtures/endpoints.json')

class KeyCloakAuth {
  async loginAs(loginBody) {
    const loginParams = new URLSearchParams(loginBody)
    return fetch(endpointsRoutes.authKeycloak, {
      method: 'POST',
      failOnStatusCode: false,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
      body: loginParams.toString(),
    }).then(async (response) => {
      return {
        body: await response.json(),
        status: response.status,
      }
    })
  }

  async logout(logoutBody) {
    const logoutParams = new URLSearchParams(logoutBody)
    return fetch(endpointsRoutes.logout, {
      method: 'POST',
      failOnStatusCode: false,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
      body: logoutParams.toString(),
    }).then(async (response) => {
      const string = await response.text()
      const json = string === '' ? {} : JSON.parse(string)
      return {
        body: await json,
        status: response.status,
      }
    })
  }
}
export const keyCloakAuth = new KeyCloakAuth()

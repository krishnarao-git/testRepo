const endpointsRoutes = require('../../../fixtures/endpoints.json')
const inputs = require('./../../../fixtures/inputs.json')
const userTypes = require('../../../fixtures/userTypes.json')
import { expectResponse } from '../../../support/expects/ExpectResponse'
import { keyCloakAuth } from '../../../support/classes/keycloakAuthentication/KeyCloakAuth'
let authInfo, deleteResponse
let token = null
describe('TC001: Fetch quality control determination validations', () => {
  before('Token generate', async () => {
    // get token
    authInfo = await keyCloakAuth.loginAs(userTypes.admin)
    token = authInfo.body.access_token
  })

  it('POST | - /login with invalid login credentials', async () => {
    authInfo = await keyCloakAuth.loginAs(userTypes.invalidCredentials)
    expectResponse.unAuthorizedRequest(authInfo.status)
    expectResponse.haveProperties(authInfo.body, ['error', 'error_description'])
    expectResponse.invalidUserCredentials(authInfo.body.error_description)
  })

  it('POST | - /login with invalid client Id', async () => {
    authInfo = await keyCloakAuth.loginAs(userTypes.invalidClientID)
    expectResponse.badRequest(authInfo.status)
    expectResponse.haveProperties(authInfo.body, ['error', 'error_description'])
    expectResponse.unauthorizedClient(authInfo.body.error)
    expectResponse.invalidClientCredentials(authInfo.body.error_description)
  })

  it('POST | - /login with invalid grand type', async () => {
    authInfo = await keyCloakAuth.loginAs(userTypes.invalidGrantType)
    expectResponse.badRequest(authInfo.status)
    expectResponse.haveProperties(authInfo.body, ['error', 'error_description'])
    expectResponse.unsupportedGrantType(authInfo.body.error_description)
  })

  it('GET | - /qualityControlDeterminations/{qualityControlDetermination ID} Fetch quality control determination with invalid token', () => {
    // Get Information of Accepted Quality Control Determination
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlDeterminations +
        inputs.acceptedDeterminationId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidToken),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.signatureVerificationFailed(response.body.detail)
    })
  })

  it('GET | - /qualityControlDeterminations/{qualityControlDetermination ID} Fetch quality control determination with malformed token', () => {
    // Get Information of Accepted Quality Control Determination
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlDeterminations +
        inputs.acceptedDeterminationId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidStringRange),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.notEnoughSegments(response.body.detail)
    })
  })

  it('GET | - /qualityControlDeterminations/{qualityControlDetermination ID} Fetch quality control determination with checked customer is not allowed permission', async () => {
    //customer login & check permission not allowed
    authInfo = await keyCloakAuth.loginAs(userTypes.customer)
    if (authInfo.body.access_token) {
      // Get Information of Accepted Quality Control Determination
      await cy
        .request({
          method: 'GET',
          url:
            endpointsRoutes.qualityControlDeterminations +
            inputs.acceptedDeterminationId,
          failOnStatusCode: false,
          headers: expectResponse.getHeader(authInfo.body.access_token),
        })
        .then(response => {
          expectResponse.forbiddenRequest(response.status)
          expect(response.body).to.have.property('detail')
          expectResponse.requiredPermission(response.body.detail)
        })
    } else {
      expectResponse.unAuthorizedRequest(authInfo.status)
      expectResponse.haveProperties(authInfo.body, [
        'error',
        'error_description',
      ])
      expectResponse.invalidUserCredentials(authInfo.body.error_description)
    }
  })

  it('GET | - /qualityControlDeterminations/{qualityControlDetermination ID} Fetch quality control determination with checked contractor is not allowed permission', async () => {
    //contractor login & check permission not allowed
    authInfo = await keyCloakAuth.loginAs(userTypes.contractor)
    if (authInfo.body.access_token) {
      // Get Information of Accepted Quality Control Determination
      await cy
        .request({
          method: 'GET',
          url:
            endpointsRoutes.qualityControlDeterminations +
            inputs.acceptedDeterminationId,
          failOnStatusCode: false,
          headers: expectResponse.getHeader(authInfo.body.access_token),
        })
        .then(response => {
          expectResponse.forbiddenRequest(response.status)
          expect(response.body).to.have.property('detail')
          expectResponse.requiredPermission(response.body.detail)
        })
    } else {
      expectResponse.unAuthorizedRequest(authInfo.status)
      expectResponse.haveProperties(authInfo.body, [
        'error',
        'error_description',
      ])
      expectResponse.invalidUserCredentials(authInfo.body.error_description)
    }
  })

  it('GET | - /qualityControlDeterminations/{qualityControlDetermination ID} Fetch quality control determination without token', () => {
    // Get Information of Accepted Quality Control Determination
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlDeterminations +
        inputs.acceptedDeterminationId,
      failOnStatusCode: false,
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.requiredToken(response.body.detail)
    })
  })

  it('GET | - /qualityControlDeterminations/{qualityControlDetermination ID} Fetch quality control determination with extra end slash', () => {
    // Get Information of Accepted Quality Control Determination
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlDeterminations +
        inputs.acceptedDeterminationId +
        '/',
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.notFoundRequest(response.status)
      expect(response.body).to.have.property('Error')
      expectResponse.urlNotFound(response.body.Error)
    })
  })

  it('GET | - /qualityControlDeterminations/{qualityControlDetermination ID} with malformed qualityControlDeterminations ID', () => {
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlDeterminations +
        inputs.invalidDeterminationId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.notFoundRequest(response.status)
      expect(response.body).to.have.property('Error')
      expectResponse.qualityControlDeterminationIdNotExists(response.body.Error)
    })
  })

  it('GET | - /qualityControlDeterminations/{qualityControlDetermination ID} with malformed (zero) qualityControlDeterminations ID', () => {
    cy.request({
      method: 'GET',
      url: endpointsRoutes.qualityControlDeterminations + inputs.zeroId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('qualityControlDeterminationId')
      expectResponse.idCanNotBeZero(response.body.qualityControlDeterminationId)
    })
  })

  it('GET | - /qualityControlDeterminations/{qualityControlDetermination ID} with malformed (int) qualityControlDeterminations ID', () => {
    cy.request({
      method: 'GET',
      url: endpointsRoutes.qualityControlDeterminations + inputs.invalidIdInt,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('qualityControlDeterminationId')
      expectResponse.validRange(response.body.qualityControlDeterminationId)
    })
  })

  it('GET | - /qualityControlDeterminations/{qualityControlDetermination ID} with malformed (str) qualityControlDeterminations ID', () => {
    cy.request({
      method: 'GET',
      url: endpointsRoutes.qualityControlDeterminations + inputs.invalidString,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('qualityControlDeterminationId')
      expectResponse.validInteger(response.body.qualityControlDeterminationId)
    })
  })

  it('POST | - /logout with invalid refresh token', async () => {
    authInfo = await keyCloakAuth.logout(userTypes.logout)
    expectResponse.badRequest(authInfo.status)
    expectResponse.haveProperties(authInfo.body, ['error', 'error_description'])
    expectResponse.invalidRefreshToken(authInfo.body.error_description)
  })

  it('POST | - /logout with invalid client Id', async () => {
    authInfo = await keyCloakAuth.logout(userTypes.invalidLogout)
    expectResponse.badRequest(authInfo.status)
    expectResponse.haveProperties(authInfo.body, ['error', 'error_description'])
    expectResponse.invalidClientCredentials(authInfo.body.error_description)
  })

  it('POST | - /logout/ should not accept any services after logout', async () => {
    //login admin/ logout should not accept any services after logout
    authInfo = await keyCloakAuth.loginAs(userTypes.admin)
    // assign refresh token
    userTypes.logout.refresh_token = authInfo.body.refresh_token
    //logout
    deleteResponse = await keyCloakAuth.logout(userTypes.logout)
    expectResponse.logoutRequest(deleteResponse.status)
    //fetch quality control determination
    await cy
      .request({
        method: 'GET',
        url:
          endpointsRoutes.qualityControlDeterminations +
          inputs.acceptedDeterminationId,
        failOnStatusCode: false,
        headers: expectResponse.getHeader(authInfo.body.access_token),
      })
      .then(response => {
        expectResponse.forbiddenRequest(response.status)
        expect(response.body).to.have.property('detail')
        expectResponse.sessionNotfound(response.body.detail)
      })
  })
})

describe('TC002: Fetch quality control determination', () => {
  it('GET | - /qualityControlDeterminations/{qualityControlDetermination ID} Fetch accepted quality control determination', () => {
    // Get Information of Accepted Quality Control Determination
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlDeterminations +
        inputs.acceptedDeterminationId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.okResponse(response.status)
      expectResponse.haveProperties(response.body, [
        'publicId',
        'name',
        'active',
      ])
      expectResponse.numberOnly(response.body.publicId)
    })
  })

  it('GET | - /qualityControlDeterminations/{qualityControlDetermination ID} Fetch rejected quality control determination', () => {
    // Get Information of Rejected Quality Control Determination
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlDeterminations +
        inputs.rejectedDeterminationId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.okResponse(response.status)
      expectResponse.haveProperties(response.body, [
        'publicId',
        'name',
        'active',
      ])
      expectResponse.numberOnly(response.body.publicId)
    })
  })
})

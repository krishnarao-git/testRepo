const endpointsRoutes = require('../../../fixtures/endpoints.json')
const userTypes = require('../../../fixtures/userTypes.json')
const inputs = require('./../../../fixtures/inputs.json')
import { rejectionReason } from '../../../support/classes/performance-assessment/RejectionReason'
import { expectResponse } from '../../../support/expects/ExpectResponse'
import { keyCloakAuth } from '../../../support/classes/keycloakAuthentication/KeyCloakAuth'
let response, createRejectionReason, authInfo, deleteResponse
let token = null

describe('TC001: Fetch quality control rejection reason validation', () => {
  before('Token generate', async () => {
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

  it('GET | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Fetch quality control rejection reason with invalid token', async () => {
    // Creates quality control rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Get Information of quality control rejection reason
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidToken),
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.signatureVerificationFailed(response.body.detail)
  })

  it('GET | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Fetch quality control rejection reason with malformed token', async () => {
    // Creates quality control rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Get Information of quality control rejection reason
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidStringRange),
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.notEnoughSegments(response.body.detail)
  })

  it('GET | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Fetch quality control rejection reason with checked customer is not allowed permission', async () => {
    //customer login & check permission allowed
    authInfo = await keyCloakAuth.loginAs(userTypes.customer)
    if (authInfo.body.access_token) {
      // Get Information of quality control rejection reason
      await cy
        .request({
          method: 'GET',
          url:
            endpointsRoutes.qualityControlRejectionReasons +
            createRejectionReason.qualityControlRejectionReasonId,
          failOnStatusCode: false,
          headers: expectResponse.getHeader(authInfo.body.access_token),
        }).then(response => {
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
      expectResponse.invalidUserCredentials(
        authInfo.body.error_description
      )
    }
  })

  it('GET | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Fetch quality control rejection reason with checked contractor is not allowed permission', async () => {
    //Contractor login & check permission allowed
    authInfo = await keyCloakAuth.loginAs(userTypes.contractor)
    if (authInfo.body.access_token) {
      // Get Information of quality control rejection reason
      await cy
        .request({
          method: 'GET',
          url:
            endpointsRoutes.qualityControlRejectionReasons +
            createRejectionReason.qualityControlRejectionReasonId,
          failOnStatusCode: false,
          headers: expectResponse.getHeader(authInfo.body.access_token),
        }).then(response => {
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
      expectResponse.invalidUserCredentials(
        authInfo.body.error_description
      )
    }
  })

  it('GET | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Fetch quality control rejection reason without token', async () => {
    // Creates quality control rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Get Information of quality control rejection reason
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId,
      failOnStatusCode: false,
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.requiredToken(response.body.detail)
  })

  it('GET | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Fetch quality control rejection reason with extra end slash', async () => {
    // Creates quality control rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Get Information of quality control rejection reason
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId +
        '/',
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.urlNotFound(response.body.Error)
  })

  it('GET | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} with malformed a qualityControlRejectionReason ID', () => {
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        inputs.invalidRejectionReasonId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.notFoundRequest(response.status)
      expect(response.body).to.have.property('Error')
      expectResponse.qualityControlRejectionReasonNotExists(response.body.Error)
    })
  })

  it('GET | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} with malformed (zero) qualityControlRejectionReason ID', () => {
    cy.request({
      method: 'GET',
      url: endpointsRoutes.qualityControlRejectionReasons + inputs.zeroId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('qualityControlRejectionReasonId')
      expectResponse.idCanNotBeZero(
        response.body.qualityControlRejectionReasonId
      )
    })
  })

  it('GET | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} with malformed large (int) qualityControlRejectionReason ID', () => {
    cy.request({
      method: 'GET',
      url: endpointsRoutes.qualityControlRejectionReasons + inputs.invalidIdInt,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('qualityControlRejectionReasonId')
      expectResponse.validRange(response.body.qualityControlRejectionReasonId)
    })
  })

  it('GET | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} with malformed (str) qualityControlRejectionReason ID', () => {
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlRejectionReasons + inputs.invalidString,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('qualityControlRejectionReasonId')
      expectResponse.validInteger(response.body.qualityControlRejectionReasonId)
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
    await cy
      .request({
        method: 'GET',
        url:
          endpointsRoutes.qualityControlRejectionReasons + inputs.invalidString,
        failOnStatusCode: false,
        headers: expectResponse.getHeader(authInfo.body.access_token),
      }).then(response => {
        expectResponse.forbiddenRequest(response.status)
        expect(response.body).to.have.property('detail')
        expectResponse.sessionNotfound(response.body.detail)
      })
  })
})

describe('TC002: Fetch quality control rejection reason', () => {
  it('GET | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Fetch quality control rejection reason', async () => {
    // Creates quality control rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Get Information of quality control rejection reason
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.okResponse(response.status)
    expectResponse.haveProperties(response.body, [
      'publicId',
      'name',
      'description',
      'active',
    ])
    expect(response.body.publicId).to.be.equal(
      createRejectionReason.qualityControlRejectionReasonId
    )
    rejectionReason.validResponse(response.body)
  })
})

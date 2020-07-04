import { expectResponse } from '../../../support/expects/ExpectResponse'
const endpointsRoutes = require('../../../fixtures/endpoints.json')
const userTypes = require('../../../fixtures/userTypes.json')
const inputs = require('../../../fixtures/inputs.json')
import { rejectionReason } from '../../../support/classes/performance-assessment/RejectionReason'
import { keyCloakAuth } from '../../../support/classes/keycloakAuthentication/KeyCloakAuth'
let response,
  createRejectionReason,
  responseRejectionReason,
  authInfo,
  deleteResponse
let token = null
describe('TC001: Fetch all quality control rejection reason validation', () => {
  before('Token generate', async () => {
    //get token
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

  it('GET | - /qualityControlRejectionReasons/ fetch all quality control rejection reason without token', () => {
    // Get all Information of Quality Control Rejection Reason
    cy.request({
      method: 'GET',
      url: endpointsRoutes.qualityControlRejectionReasons,
      failOnStatusCode: false,
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.requiredToken(response.body.detail)
    })
  })

  it('GET | - /qualityControlRejectionReasons/ fetch all quality control rejection reason with invalid token', () => {
    // Get all Information of Quality Control Rejection Reason
    cy.request({
      method: 'GET',
      url: endpointsRoutes.qualityControlRejectionReasons,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidToken),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.signatureVerificationFailed(response.body.detail)
    })
  })

  it('GET | - /qualityControlRejectionReasons/ fetch all quality control rejection reason with malformed token', () => {
    // Get all Information of Quality Control Rejection Reason
    cy.request({
      method: 'GET',
      url: endpointsRoutes.qualityControlRejectionReasons,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidStringRange),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.notEnoughSegments(response.body.detail)
    })
  })

  it('GET | - /qualityControlRejectionReasons/ fetch all quality control rejection reason with checked customer is not allowed permission', async () => {
    // Customer login & check permission
    authInfo = await keyCloakAuth.loginAs(userTypes.customer)
    if (authInfo.body.access_token) {
      // Get all Information of Quality Control Rejection Reason
      await cy
        .request({
          method: 'GET',
          url: endpointsRoutes.qualityControlRejectionReasons,
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
      expectResponse.invalidUserCredentials(authInfo.body.error_description)
    }
  })

  it('GET | - /qualityControlRejectionReasons/ fetch all quality control rejection reason with checked contractor is not allowed permission', async () => {
    // Contractor login & check permission
    authInfo = await keyCloakAuth.loginAs(userTypes.contractor)
    if (authInfo.body.access_token) {
      // Get all Information of Quality Control Rejection Reason
      await cy
        .request({
          method: 'GET',
          url: endpointsRoutes.qualityControlRejectionReasons,
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
      expectResponse.invalidUserCredentials(authInfo.body.error_description)
    }
  })

  it('GET | - /qualityControlRejectionReasons/ fetch all quality control rejection reason with extra end slash', () => {
    // Get all Information of Quality Control Rejection Reason
    cy.request({
      method: 'GET',
      url: endpointsRoutes.qualityControlRejectionReasons.slice(0, -1),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.notFoundRequest(response.status)
      expect(response.body).to.have.property('Error')
      expectResponse.urlNotFound(response.body.Error)
    })
  })

  it('GET | - /qualityControlRejectionReasons/{qualityControlRejection Id} with malformed qualityControlRejection ID', () => {
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

  it('GET | - /qualityControlRejectionReasons/{qualityControlRejection ID} with malformed (str) qualityControlRejection ID', () => {
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

  it('GET | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Create rejection reason to verify quality control rejection reason exist', async () => {
    // Creates quality control rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Verify that quality control rejection reason result exists
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expect(response.body.publicId).to.be.equal(
      createRejectionReason.qualityControlRejectionReasonId
    )
    rejectionReason.validResponse(response.body)
  })

  it('GET | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Create rejection reason & fetch all and check record exist', async () => {
    // Creates quality control rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Verify that quality control rejection reason result exists
    responseRejectionReason = await rejectionReason.fetchRejectionReason(token)
    // Check record exists
    response = await expectResponse.fetchCheckExist(
      responseRejectionReason,
      createRejectionReason.qualityControlRejectionReasonId
    )
    expectResponse.haveProperties(response, [
      'publicId',
      'name',
      'description',
      'active',
    ])
    expect(response.publicId).to.be.equal(
      createRejectionReason.qualityControlRejectionReasonId
    )
    rejectionReason.validResponse(response)
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
        url: endpointsRoutes.qualityControlRejectionReasons,
        failOnStatusCode: false,
        headers: expectResponse.getHeader(authInfo.body.access_token),
      }).then(response => {
        expectResponse.forbiddenRequest(response.status)
        expect(response.body).to.have.property('detail')
        expectResponse.sessionNotfound(response.body.detail)
      })
  })
})

describe('TC002: Fetch all quality control rejection reason', () => {
  it('GET | - /qualityControlRejectionReasons/ fetch all quality control rejection reason', () => {
    // Get all Information of Quality Control Rejection Reason
    cy.request({
      method: 'GET',
      url: endpointsRoutes.qualityControlRejectionReasons,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.okResponse(response.status)
      response.body.forEach(value => {
        expectResponse.haveProperties(value, [
          'publicId',
          'name',
          'description',
          'active',
        ])
      })
    })
  })
})

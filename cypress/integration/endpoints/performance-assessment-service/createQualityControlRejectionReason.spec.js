const userTypes = require('../../../fixtures/userTypes.json')
const inputs = require('../../../fixtures/inputs.json')
const endpointsRoutes = require('../../../fixtures/endpoints.json')
import { expectResponse } from '../../../support/expects/ExpectResponse'
import { rejectionReason } from '../../../support/classes/performance-assessment/RejectionReason'
import { keyCloakAuth } from '../../../support/classes/keycloakAuthentication/KeyCloakAuth'
let response,
  createRejectionReason,
  responseRejectionReason,
  authInfo,
  deleteResponse
let token = null

describe('TC001: Create quality control rejection reason validation', () => {
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

  it('POST | - /createQualityControlRejectionReasons/ with invalid token', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.qualityControlRejectionReasons,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidToken),
      body: rejectionReason.getBodyAddRejectionReason(),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.signatureVerificationFailed(response.body.detail)
    })
  })

  it('POST | - /createQualityControlRejectionReasons/ with malformed token', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.qualityControlRejectionReasons,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidStringRange),
      body: rejectionReason.getBodyAddRejectionReason(),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.notEnoughSegments(response.body.detail)
    })
  })

  it('POST | - /createQualityControlRejectionReasons/ without token', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.qualityControlRejectionReasons,
      failOnStatusCode: false,
      body: rejectionReason.getBodyAddRejectionReason(),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.requiredToken(response.body.detail)
    })
  })

  it('POST | - /createQualityControlRejectionReasons/ with checked customer is not allowed permission', async () => {
    //customer login & check permission not allowed
    authInfo = await keyCloakAuth.loginAs(userTypes.customer)
    if (authInfo.body.access_token) {
      //create quality control rejection reason
      await cy
        .request({
          method: 'POST',
          url: endpointsRoutes.qualityControlRejectionReasons,
          failOnStatusCode: false,
          headers: expectResponse.getHeader(authInfo.body.access_token),
          body: rejectionReason.getBodyAddRejectionReason(),
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

  it('POST | - /createQualityControlRejectionReasons/ with checked contractor is not allowed permission', async () => {
    //contractor login & check permission not allowed
    authInfo = await keyCloakAuth.loginAs(userTypes.contractor)
    if (authInfo.body.access_token) {
      //create quality control rejection reason
      await cy
        .request({
          method: 'POST',
          url: endpointsRoutes.qualityControlRejectionReasons,
          failOnStatusCode: false,
          headers: expectResponse.getHeader(authInfo.body.access_token),
          body: rejectionReason.getBodyAddRejectionReason(),
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

  it('POST | - /createQualityControlRejectionReasons/ without end slash', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.qualityControlRejectionReasons.slice(0, -1),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: rejectionReason.getBodyAddRejectionReason(),
    }).then(response => {
      expectResponse.notFoundRequest(response.status)
      expect(response.body).to.have.property('Error')
      expectResponse.urlNotFound(response.body.Error)
    })
  })

  it('POST | - /createQualityControlRejectionReasons/ without body', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.qualityControlRejectionReasons,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['name', 'description'])
      expectResponse.fieldRequired(response.body.name)
      expectResponse.fieldRequired(response.body.description)
    })
  })

  it('POST | - /qualityControlRejectionReasons/ with blank input', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.qualityControlRejectionReasons,
      headers: expectResponse.getHeader(token),
      body: rejectionReason.getBodyRejectionReasonWithBlankField(),
      failOnStatusCode: false,
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['name', 'description'])
      expectResponse.fieldNotBlank(response.body.name)
      expectResponse.fieldNotBlank(response.body.description)
    })
  })

  it('POST | - /createQualityControlRejectionReasons/ with a malformed name and description', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.qualityControlRejectionReasons,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: rejectionReason.getBodyRejectionReasonWithMalformedField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['name', 'description'])
      expectResponse.validNameLength(response.body.name)
      expectResponse.validDescriptionLength(response.body.description)
    })
  })

  it('POST | - /createQualityControlRejectionReasons/ with name and description', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.qualityControlRejectionReasons,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: rejectionReason.getBodyAddRejectionReason(),
    }).then(response => {
      expectResponse.createdResponse(response.status)
      expect(response.body).to.have.property('qualityControlRejectionReasonId')
      expectResponse.numberOnly(response.body.qualityControlRejectionReasonId)
    })
  })

  it('POST | - /createQualityControlRejectionReasons/ Create a rejection reason fetch all and check record exist', async () => {
    // Creates quality control rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Fetch rejection reason
    responseRejectionReason = await rejectionReason.fetchRejectionReason(token)
    // Check record exist
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
    //create quality control rejection reason
    await cy
      .request({
        method: 'POST',
        url: endpointsRoutes.qualityControlRejectionReasons,
        failOnStatusCode: false,
        headers: expectResponse.getHeader(authInfo.body.access_token),
        body: rejectionReason.getBodyAddRejectionReason(),
      }).then(response => {
        expectResponse.forbiddenRequest(response.status)
        expect(response.body).to.have.property('detail')
        expectResponse.sessionNotfound(response.body.detail)
      })
  })
})

describe('TC002: Create quality control rejection reason', () => {
  it('POST | - /createQualityControlRejectionReasons/ Create a rejection reason', async () => {
    // Creates quality control rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Fetch quality control rejection reason
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

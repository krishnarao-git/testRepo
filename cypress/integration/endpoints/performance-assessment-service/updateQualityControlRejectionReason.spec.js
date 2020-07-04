const endpointsRoutes = require('../../../fixtures/endpoints.json')
const inputs = require('./../../../fixtures/inputs.json')
const userTypes = require('../../../fixtures/userTypes.json')
import { rejectionReason } from '../../../support/classes/performance-assessment/RejectionReason'
import { expectResponse } from '../../../support/expects/ExpectResponse'
import { keyCloakAuth } from '../../../support/classes/keycloakAuthentication/KeyCloakAuth'
let response,
  updateRejectionReason,
  responseRejectionReason,
  createRejectionReason,
  authInfo,
  deleteResponse
let token = null

describe('TC001: Update quality control rejection reason validation', () => {
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

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Update a quality control rejection reason with invalid token', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Update a quality control rejection reason
    response = await cy.request({
      method: 'PATCH',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId,
      body: rejectionReason.getBodyUpdateRejectionReason(),
      headers: expectResponse.getHeader(inputs.invalidToken),
      failOnStatusCode: false,
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.signatureVerificationFailed(response.body.detail)
  })

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Update a quality control rejection reason with malformed token', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Update a quality control rejection reason
    response = await cy.request({
      method: 'PATCH',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId,
      body: rejectionReason.getBodyUpdateRejectionReason(),
      headers: expectResponse.getHeader(inputs.invalidStringRange),
      failOnStatusCode: false,
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.notEnoughSegments(response.body.detail)
  })

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Update a quality control rejection reason with checked customer is not allowed permission', async () => {
    //customer login & check permission not allowed
    authInfo = await keyCloakAuth.loginAs(userTypes.customer)
    if (authInfo.body.access_token) {
      // Update a quality control rejection reason
      await cy
        .request({
          method: 'PATCH',
          url:
            endpointsRoutes.qualityControlRejectionReasons +
            createRejectionReason.qualityControlRejectionReasonId,
          body: rejectionReason.getBodyUpdateRejectionReason(),
          headers: expectResponse.getHeader(authInfo.body.access_token),
          failOnStatusCode: false,
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

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Update a quality control rejection reason with checked contractor is not allowed permission', async () => {
    //contractor login & check permission not allowed
    authInfo = await keyCloakAuth.loginAs(userTypes.contractor)
    if (authInfo.body.access_token) {
      // Update a quality control rejection reason
      await cy
        .request({
          method: 'PATCH',
          url:
            endpointsRoutes.qualityControlRejectionReasons +
            createRejectionReason.qualityControlRejectionReasonId,
          body: rejectionReason.getBodyUpdateRejectionReason(),
          headers: expectResponse.getHeader(authInfo.body.access_token),
          failOnStatusCode: false,
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

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Update a quality control rejection reason without token', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Update a quality control rejection reason
    response = await cy.request({
      method: 'PATCH',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId,
      body: rejectionReason.getBodyUpdateRejectionReason(),
      failOnStatusCode: false,
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.requiredToken(response.body.detail)
  })

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Update a quality control rejection reason with extra end slash', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Update a quality control rejection reason
    response = await cy.request({
      method: 'PATCH',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId +
        '/',
      body: rejectionReason.getBodyUpdateRejectionReason(),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.urlNotFound(response.body.Error)
  })

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} without qualityControlRejectionReason ID', () => {
    cy.request({
      method: 'PATCH',
      url: endpointsRoutes.qualityControlRejectionReasons,
      body: rejectionReason.getBodyUpdateRejectionReason(),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.notAllowedRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.methodNotAllowed(response.body.detail)
    })
  })

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} with malformed a qualityControlRejectionReason ID', () => {
    cy.request({
      method: 'PATCH',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        inputs.invalidRejectionReasonId,
      body: rejectionReason.getBodyUpdateRejectionReason(),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.notFoundRequest(response.status)
      expect(response.body).to.have.property('Error')
      expectResponse.qualityControlRejectionReasonNotExists(response.body.Error)
    })
  })

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} with malformed (zero) qualityControlRejectionReason ID', () => {
    cy.request({
      method: 'PATCH',
      url: endpointsRoutes.qualityControlRejectionReasons + inputs.zeroId,
      body: rejectionReason.getBodyUpdateRejectionReason(),
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

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} with malformed (int) qualityControlRejectionReason ID', () => {
    cy.request({
      method: 'PATCH',
      url: endpointsRoutes.qualityControlRejectionReasons + inputs.invalidIdInt,
      body: rejectionReason.getBodyUpdateRejectionReason(),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('qualityControlRejectionReasonId')
      expectResponse.validRange(response.body.qualityControlRejectionReasonId)
    })
  })

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} with malformed (str) qualityControlRejectionReason ID', () => {
    cy.request({
      method: 'PATCH',
      url:
        endpointsRoutes.qualityControlRejectionReasons + inputs.invalidString,
      body: rejectionReason.getBodyUpdateRejectionReason(),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('qualityControlRejectionReasonId')
      expectResponse.validInteger(response.body.qualityControlRejectionReasonId)
    })
  })

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} with blank input', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Update rejection reason
    response = await cy.request({
      method: 'PATCH',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId,
      body: rejectionReason.getBodyRejectionReasonWithBlankField(),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.badRequest(response.status)
    expectResponse.haveProperties(response.body, ['name', 'description'])
    expectResponse.fieldNotBlank(response.body.name)
    expectResponse.fieldNotBlank(response.body.description)
  })

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} with malformed name and description', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Update rejection reason
    response = await cy.request({
      method: 'PATCH',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId,
      body: rejectionReason.getBodyRejectionReasonWithMalformedField(),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.badRequest(response.status)
    expectResponse.haveProperties(response.body, ['name', 'description'])
    expectResponse.validNameLength(response.body.name)
    expectResponse.validDescriptionLength(response.body.description)
  })

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} without body', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Update rejection reason
    response = await cy.request({
      method: 'PATCH',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.okResponse(response.status)
    expect(response.body).to.be.empty
  })

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} with name and description', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Update a quality control rejection reason
    response = await cy.request({
      method: 'PATCH',
      url:
        endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId,
      body: rejectionReason.getBodyUpdateRejectionReason(),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.okResponse(response.status)
    expect(response.body).to.be.empty
  })

  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID}  update a quality control rejection reason & fetch all and check record exist', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Update a quality control rejection reason
    updateRejectionReason = await rejectionReason.fetchUpdateRejectionReason(
      endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId,
      token
    )
    // Get All Information of quality control rejection reason
    responseRejectionReason = await rejectionReason.fetchRejectionReason(token)
    // Check exists record
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
    expect(response.publicId).to.eq(
      createRejectionReason.qualityControlRejectionReasonId
    )
    rejectionReason.validUpdateResponse(response)
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
    //update rjection reason
    await cy
      .request({
        method: 'PATCH',
        url:
          endpointsRoutes.qualityControlRejectionReasons +
          createRejectionReason.qualityControlRejectionReasonId,
        body: rejectionReason.getBodyUpdateRejectionReason(),
        headers: expectResponse.getHeader(authInfo.body.access_token),
        failOnStatusCode: false,
      }).then(response => {
        expectResponse.forbiddenRequest(response.status)
        expect(response.body).to.have.property('detail')
        expectResponse.sessionNotfound(response.body.detail)
      })
  })
})

describe('TC002: Update quality control rejection reason', () => {
  it('PATCH | - /qualityControlRejectionReasons/{qualityControlRejectionReason ID} Update a quality control rejection reason with name and description', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Update a quality control rejection reason
    updateRejectionReason = await rejectionReason.fetchUpdateRejectionReason(
      endpointsRoutes.qualityControlRejectionReasons +
        createRejectionReason.qualityControlRejectionReasonId,
      token
    )
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
    rejectionReason.validUpdateResponse(response.body)
  })
})

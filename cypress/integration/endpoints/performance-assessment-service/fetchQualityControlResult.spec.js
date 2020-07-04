const inputs = require('./../../../fixtures/inputs.json')
const userTypes = require('./../../../fixtures/userTypes.json')
const endpointsRoutes = require('../../../fixtures/endpoints.json')
import { rejectionReason } from '../../../support/classes/performance-assessment/RejectionReason'
import { qualityControlResults } from '../../../support/classes/performance-assessment/QualityControlResults'
import { expectResponse } from '../../../support/expects/ExpectResponse'
import { keyCloakAuth } from '../../../support/classes/keycloakAuthentication/KeyCloakAuth'
let response,
  acceptServiceItem,
  serviceItemWork,
  createRejectionReason,
  rejectServiceItem,authInfo, deleteResponse
let token = null
describe('TC001: Fetch quality control results validation', () => {
  before('Token generate', async () => {
    authInfo = await keyCloakAuth.loginAs(userTypes.admin)
    token = authInfo.body.access_token
    // Clean db
    await qualityControlResults.cleanDB(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult,
      token
    )    
  })

  it('POST | - /login with invalid login credentials', async () => {
    authInfo = await keyCloakAuth.loginAs(userTypes.invalidCredentials)
    expectResponse.unAuthorizedRequest(authInfo.status)
    expectResponse.haveProperties(authInfo.body, [
      'error',
      'error_description',
    ])
    expectResponse.invalidUserCredentials(
      authInfo.body.error_description
    )    
  })

  it('POST | - /login with invalid client Id', async () => {
    authInfo = await keyCloakAuth.loginAs(userTypes.invalidClientID)
    expectResponse.badRequest(authInfo.status)
    expectResponse.haveProperties(authInfo.body, [
      'error',
      'error_description',
    ])
    expectResponse.unauthorizedClient(authInfo.body.error)
    expectResponse.invalidClientCredentials(
      authInfo.body.error_description
    )    
  })

  it('POST | - /login with invalid grand type', async () => {
    authInfo = await keyCloakAuth.loginAs(userTypes.invalidGrantType)
    expectResponse.badRequest(authInfo.status)
    expectResponse.haveProperties(authInfo.body, [
      'error',
      'error_description',
    ])
    expectResponse.unsupportedGrantType(authInfo.body.error_description)    
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with Fetch accept quality control result without token', async () => {
    // Get information accept quality control result
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Fetch quality control result
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.requiredToken(response.body.detail)
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with Fetch accept quality control result with invalid token', async () => {
    // Get information accept quality control result
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Fetch quality control result
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidToken),
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.signatureVerificationFailed(response.body.detail)
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with Fetch accept quality control result with malformed token', async () => {
    // Get information accept quality control result
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Fetch quality control result
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidStringRange),
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.notEnoughSegments(response.body.detail)
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with Fetch accept quality control result checked customer is not allowed permission', async () => {
    // Customer login & check permission
    authInfo = await keyCloakAuth.loginAs(userTypes.customer)
    if (authInfo.body.access_token) {
      // Fetch quality control result
      await cy
        .request({
          method: 'GET',
          url:
            endpointsRoutes.serviceItem +
            inputs.serviceItemId +
            endpointsRoutes.qualityControlResult +
            acceptServiceItem.qualityControlResultId,
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

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with Fetch accept quality control result checked contractor is not allowed permission', async () => {
    // Contractor login & check permission
    authInfo = await keyCloakAuth.loginAs(userTypes.contractor)
    if (authInfo.body.access_token) {
      // Fetch quality control result
      await cy
        .request({
          method: 'GET',
          url:
            endpointsRoutes.serviceItem +
            inputs.serviceItemId +
            endpointsRoutes.qualityControlResult +
            acceptServiceItem.qualityControlResultId,
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

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with Fetch accept quality control result with extra end slash', async () => {
    // Get information accept quality control result
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Fetch quality control result
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId +
        '/',
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.urlNotFound(response.body.Error)
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} without serviceItem ID', async () => {
    // Create service item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Fetch quality control result
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        endpointsRoutes.qualityControlResult.substr(1) +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.urlNotFound(response.body.Error)
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (zero) serviceItem ID', async () => {
    // Create service item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Fetch qaulity control result
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.zeroId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('serviceItemId')
    expectResponse.idCanNotBeZero(response.body.serviceItemId)
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (int) serviceItem ID', async () => {
    // Create service item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Fetch quality control result
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.invalidIdInt +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('serviceItemId')
    expectResponse.validRange(response.body.serviceItemId)
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (str) serviceItem ID', async () => {
    // Create service item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Fetch qaulity control result
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.invalidString +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('serviceItemId')
    expectResponse.validInteger(response.body.serviceItemId)
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed qualityControlResult ID', () => {
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        inputs.invalidQualityControlResultsId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.notFoundRequest(response.status)
      expect(response.body).to.have.property('Error')
      expectResponse.qualityControlResultNotExists(response.body.Error)
    })
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (zero) qualityControlResult ID', () => {
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        inputs.zeroId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('qualityControlResultId')
      expectResponse.idCanNotBeZero(response.body.qualityControlResultId)
    })
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (int) qualityControlResult ID', () => {
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        inputs.invalidIdInt,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('qualityControlResultId')
      expectResponse.validRange(response.body.qualityControlResultId)
    })
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (str) qualityControlResult ID', () => {
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        inputs.invalidString,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('qualityControlResultId')
      expectResponse.validInteger(response.body.qualityControlResultId)
    })
  })

  it('GET | - /serviceItems/<serviceItemId>/qualityControlResults/<qualityControlResult ID> Create service item to verify quality control result exist', async () => {
    // Create a service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Get Accept Qaulity control result
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.okResponse(response.status)
    expectResponse.haveProperties(response.body, [
      'publicId',
      'serviceItemId',
      'userId',
      'comment',
      'type',
      'qualityControlAcceptanceId',
      'starRating',
    ])
    expect(response.body.publicId).to.be.equal(
      acceptServiceItem.qualityControlResultId
    )
    qualityControlResults.validateAcceptResponse(response.body)
  })

  it('GET | - /serviceItems/<serviceItemId>/qualityControlResults/<qualityControlResult ID> Create service item & fetch all and record exist', async () => {
    // Create a service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Get Accept Qaulity control result
    serviceItemWork = await qualityControlResults.fetchFindOne(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult,
      token
    )
    // Check record exists
    response = await expectResponse.fetchCheckExist(
      serviceItemWork,
      acceptServiceItem.qualityControlResultId
    )
    expectResponse.haveProperties(response, [
      'publicId',
      'serviceItemId',
      'userId',
      'comment',
      'type',
      'qualityControlAcceptanceId',
      'starRating',
    ])
    expect(response.publicId).to.be.equal(
      acceptServiceItem.qualityControlResultId
    )
    qualityControlResults.validateAcceptResponse(response)
  })

  it('POST | - /logout with invalid refresh token', async () => {
    authInfo = await keyCloakAuth.logout(userTypes.logout)
    expectResponse.badRequest(authInfo.status)
    expectResponse.haveProperties(authInfo.body, [
      'error',
      'error_description',
    ])
    expectResponse.invalidRefreshToken(
      authInfo.body.error_description
    )    
  })

  it('POST | - /logout with invalid client Id', async () => {
    authInfo = await keyCloakAuth.logout(userTypes.invalidLogout)
    expectResponse.badRequest(authInfo.status)
    expectResponse.haveProperties(authInfo.body, [
      'error',
      'error_description',
    ])
    expectResponse.invalidClientCredentials(
      authInfo.body.error_description
    )    
  })

  it('POST | - /logout/ should not accept any services after logout',async () => {
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
          endpointsRoutes.serviceItem +
          inputs.serviceItemId +
          endpointsRoutes.qualityControlResult +
          inputs.invalidString,
        failOnStatusCode: false,
        headers: expectResponse.getHeader(authInfo.body.access_token),
      }).then(response => {
        expectResponse.forbiddenRequest(response.status)
        expect(response.body).to.have.property('detail')
        expectResponse.sessionNotfound(response.body.detail)
      }) 
  })
})

describe('TC002: Fetch quality control result', () => {
  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with Fetch accept quality control result', async () => {
    // Create a service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Get information accept quality control result
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.okResponse(response.status)
    expectResponse.haveProperties(response.body, [
      'publicId',
      'serviceItemId',
      'userId',
      'comment',
      'type',
      'qualityControlAcceptanceId',
      'starRating',
    ])
    expect(response.body.publicId).to.be.equal(
      acceptServiceItem.qualityControlResultId
    )
    qualityControlResults.validateAcceptResponse(response.body)
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with Fetch reject quality control result', async () => {
    // Create a quality control rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Create reject service item work
    rejectServiceItem = await qualityControlResults.fetchRejectServiceItemWork(
      createRejectionReason.qualityControlRejectionReasonId,
      token
    )
    // Fetch quality control result
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        rejectServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.okResponse(response.status)
    expectResponse.haveProperties(response.body, [
      'publicId',
      'qualityControlRejectionReasonId',
      'serviceItemId',
      'userId',
      'comment',
      'type',
      'qualityControlRejectionId',
      'serviceTypeIds',
    ])
    expect(response.body.publicId).to.be.equal(
      rejectServiceItem.qualityControlResultId
    )
    expect(response.body.qualityControlRejectionReasonId).to.be.equal(
      createRejectionReason.qualityControlRejectionReasonId
    )
    qualityControlResults.validateRejectResponse(response.body)
  })
})

const endpointsRoutes = require('../../../fixtures/endpoints.json')
const inputs = require('../../../fixtures/inputs.json')
const userTypes = require('../../../fixtures/userTypes.json')
import { expectResponse } from '../../../support/expects/ExpectResponse'
import { qualityControlResults } from '../../../support/classes/performance-assessment/QualityControlResults'
import { keyCloakAuth } from '../../../support/classes/keycloakAuthentication/KeyCloakAuth'
let response, acceptServiceItem, serviceItemWork, authInfo, deleteResponse
let token = null
describe('TC001: Fetch all quality control results validations', () => {
  before('Token generate', async () => {
    //get token
    authInfo = await keyCloakAuth.loginAs(userTypes.admin)
    token = authInfo.body.access_token
    // Clean DB
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

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/ Fetch all quality control results without token', () => {
    // Get all information of Quality Control Results
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult,
      failOnStatusCode: false,
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.requiredToken(response.body.detail)
    })
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/ Fetch all quality control result with invalid token', () => {
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidToken),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.signatureVerificationFailed(response.body.detail)
    })
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/ Fetch all quality control result with malformed token', () => {
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidStringRange),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.notEnoughSegments(response.body.detail)
    })
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/ Fetch all quality control results with checked customer is not allowed permission', async () => {
    // Customer login & check permission
    authInfo = await keyCloakAuth.loginAs(userTypes.customer)
    if (authInfo.body.access_token) {
      // Get all Information of Quality Control Result
      await cy
        .request({
          method: 'GET',
          url:
            endpointsRoutes.serviceItem +
            inputs.serviceItemId +
            endpointsRoutes.qualityControlResult,
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

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/ Fetch all quality control results with checked contractor is not allowed permission', async () => {
    // Contractor login & check permission
    authInfo = await keyCloakAuth.loginAs(userTypes.contractor)
    if (authInfo.body.access_token) {
      // Get all Information of Quality Control Result
      await cy
        .request({
          method: 'GET',
          url:
            endpointsRoutes.serviceItem +
            inputs.serviceItemId +
            endpointsRoutes.qualityControlResult,
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

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/ Fetch all quality control results without end slash', () => {
    // Get all information of Quality Control Results
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult.slice(0, -1),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.notFoundRequest(response.status)
      expect(response.body).to.have.property('Error')
      expectResponse.urlNotFound(response.body.Error)
    })
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/ without serviceItem ID', () => {
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        endpointsRoutes.qualityControlResult.substr(1),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.notFoundRequest(response.status)
      expect(response.body).to.have.property('Error')
      expectResponse.urlNotFound(response.body.Error)
    })
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/ with malformed (zero) serviceItem ID', () => {
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.zeroId +
        endpointsRoutes.qualityControlResult,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('serviceItemId')
      expectResponse.idCanNotBeZero(response.body.serviceItemId)
    })
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/ with malformed (int) serviceItem ID', () => {
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.invalidIdInt +
        endpointsRoutes.qualityControlResult,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('serviceItemId')
      expectResponse.validRange(response.body.serviceItemId)
    })
  })

  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/ with malformed (str) serviceItem ID', () => {
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.invalidString +
        endpointsRoutes.qualityControlResult,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('serviceItemId')
      expectResponse.validInteger(response.body.serviceItemId)
    })
  })

  it('GET | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Create service item to verify quality control result exist', async () => {
    // Create a service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Get Accept Quality control result
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

  it('GET | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Create service item & fetch all and record exist', async () => {
    // Create a service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    //Get Accept Quality control result
    serviceItemWork = await qualityControlResults.fetchFindOne(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult,
      token
    )
    //check record exist
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

  it('POST | - /logout/ should not accept any services after logout', async () => {
    //login admin/ logout should not accept any services 6after logout
    authInfo = await keyCloakAuth.loginAs(userTypes.admin)
    // assign refresh token
    userTypes.logout.refresh_token = authInfo.body.refresh_token
    //logout
    deleteResponse = await keyCloakAuth.logout(userTypes.logout)
    expectResponse.logoutRequest(deleteResponse.status)
    //create accept service item work
    await cy
      .request({
        method: 'POST',
        url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult,
        failOnStatusCode: false,
        headers: expectResponse.getHeader(authInfo.body.access_token),
        body: qualityControlResults.getBodyAccept(),
      })
      .then((response) => {
        expectResponse.forbiddenRequest(response.status)
        expect(response.body).to.have.property('detail')
        expectResponse.sessionNotfound(response.body.detail)
      })
  })
})

describe('TC002: Fetch all quality control results', () => {
  it('GET | - /serviceItem/{serviceItem ID}/qualityControlResults/ Fetch all quality control results', () => {
    // Get all information of Quality Control Results
    cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.okResponse(response.status)
      response.body.forEach(value => {
        if (value.type == 'qualityControlAcceptance') {
          expectResponse.haveProperties(value, [
            'publicId',
            'serviceItemId',
            'userId',
            'comment',
            'type',
            'starRating',
            'qualityControlAcceptanceId',
          ])
        } else {
          expectResponse.haveProperties(value, [
            'publicId',
            'serviceItemId',
            'userId',
            'comment',
            'type',
            'qualityControlRejectionId',
            'qualityControlRejectionReasonId',
            'serviceTypeIds',
          ])
        }
      })
    })
  })
})

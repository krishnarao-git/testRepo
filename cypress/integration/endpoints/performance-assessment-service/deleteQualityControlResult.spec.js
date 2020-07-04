import { qualityControlResults } from '../../../support/classes/performance-assessment/QualityControlResults'
import { expectResponse } from '../../../support/expects/ExpectResponse'
const endpointsRoutes = require('../../../fixtures/endpoints.json')
const inputs = require('../../../fixtures/inputs.json')
const userTypes = require('../../../fixtures/userTypes.json')
import { keyCloakAuth } from '../../../support/classes/keycloakAuthentication/KeyCloakAuth'
let response, acceptServiceItem, authInfo, deleteResponse
let token = null
describe('TC001: Delete quality control result validation', () => {
  before('Token generate', async () => {
    // get token
    authInfo = await keyCloakAuth.loginAs(userTypes.admin)
    token = authInfo.body.access_token
    // delete quality control result
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

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} without token', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    response = await cy.request({
      method: 'DELETE',
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

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with invalid token', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    response = await cy.request({
      method: 'DELETE',
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

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed token', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    response = await cy.request({
      method: 'DELETE',
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

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with checked customer is not allowed permission', async () => {
    // Customer login & check permission
    authInfo = await keyCloakAuth.loginAs(userTypes.customer)
    if (authInfo.body.access_token) {
      // Delete quality control result
      await cy
        .request({
          method: 'DELETE',
          url:
            endpointsRoutes.serviceItem +
            inputs.serviceItemId +
            endpointsRoutes.qualityControlResult +
            acceptServiceItem.qualityControlResultId,
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

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with checked contractor is not allowed permission', async () => {
    // contractor login & check permission
    authInfo = await keyCloakAuth.loginAs(userTypes.customer)
    if (authInfo.body.access_token) {
      // Delete quality control result
      cy.request({
        method: 'DELETE',
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
      expectResponse.invalidUserCredentials(authInfo.body.error_description)
    }
  })

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with extra end slash', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    //delete quality control result
    response = await cy.request({
      method: 'DELETE',
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

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} without serviceItem ID', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    //delete quality control result
    response = await cy.request({
      method: 'DELETE',
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

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed serviceItem ID', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Delete quality control result
    response = await cy.request({
      method: 'DELETE',
      url:
        endpointsRoutes.serviceItem +
        inputs.invalidServiceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.qualityControlServiceItemIdNotExists(response.body.Error)
  })

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (zero) serviceItem ID', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Delete quality control result
    response = await cy.request({
      method: 'DELETE',
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

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (int) serviceItem ID', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Delete quality control result
    response = await cy.request({
      method: 'DELETE',
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

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (str) serviceItem ID', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Delete quality control result
    response = await cy.request({
      method: 'DELETE',
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

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} without qualityControlResult ID', () => {
    cy.request({
      method: 'DELETE',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.notAllowedRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.methodNotAllowed(response.body.detail)
    })
  })

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed qualityControlResult ID', () => {
    cy.request({
      method: 'DELETE',
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

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (zero) qualityControlResult ID', () => {
    cy.request({
      method: 'DELETE',
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

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (int) qualityControlResult ID', () => {
    cy.request({
      method: 'DELETE',
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

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (str) qualityControlResult ID', () => {
    cy.request({
      method: 'DELETE',
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

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Delete a quality control result Verify that quality control result does not exists', async () => {
    // Create accept service item work
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Delete quality control result
    await qualityControlResults.fetchDeleteQualityControlResult(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      token
    )
    // Quality control result does not exist
    response = await cy.request({
      method: 'DELETE',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.qualityControlResultNotExists(response.body.Error)
  })

  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Delete a quality control result & fetch all and record does not exists', async () => {
    // Create a Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Delete quality control result
    await qualityControlResults.fetchDeleteQualityControlResult(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      token
    )

    // Verify that quality control result does not exists
    response = await cy.request({
      method: 'GET',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    response.body.forEach(service => {
      expect(service.publicId).to.not.eql(
        acceptServiceItem.qualityControlResultId
      )
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
    //logout
    deleteResponse = await keyCloakAuth.logout(userTypes.logout)
    expectResponse.logoutRequest(deleteResponse.status)
    //delete quality control result
    await cy
      .request({
        method: 'DELETE',
        url:
          endpointsRoutes.serviceItem +
          inputs.serviceItemId +
          endpointsRoutes.qualityControlResult +
          acceptServiceItem.qualityControlResultId,
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

describe('TC002: Delete Quality Control Result', () => {
  it('DELETE | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Delete a quality control result', async () => {
    // Create a Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Delete a quality control result
    await qualityControlResults.fetchDeleteQualityControlResult(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      token
    )
    // Fetch quality control result & check record does not exist
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
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.qualityControlResultNotExists(response.body.Error)
  })
})

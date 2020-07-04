const inputs = require('../../../fixtures/inputs.json')
const userTypes = require('../../../fixtures/userTypes.json')
const incorrectIds = require('../../../fixtures/incorrectIds.json')
const endpointsRoutes = require('../../../fixtures/endpoints.json')
import { expectResponse } from '../../../support/expects/ExpectResponse'
import { qualityControlResults } from '../../../support/classes/performance-assessment/QualityControlResults'
import { keyCloakAuth } from '../../../support/classes/keycloakAuthentication/KeyCloakAuth'
const serviceItemScenarios = Object.keys(incorrectIds)
let response, acceptServiceItem, serviceItemWork, authInfo, deleteResponse
let token = null

describe('TC001: Accept service item work validation', () => {
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

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ with invalid token', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.acceptWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidToken),
      body: qualityControlResults.getBodyAccept(),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.signatureVerificationFailed(response.body.detail)
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ with malformed token', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.acceptWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidStringRange),
      body: qualityControlResults.getBodyAccept(),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.notEnoughSegments(response.body.detail)
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ without token', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.acceptWork,
      failOnStatusCode: false,
      body: qualityControlResults.getBodyAccept(),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.requiredToken(response.body.detail)
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ with checked customer is not allowed permission', async () => {
    //customer login & check customer is not allowed permission
    authInfo = await keyCloakAuth.loginAs(userTypes.customer)
    if (authInfo.body.access_token) {
      await cy
        .request({
          method: 'POST',
          url:
            endpointsRoutes.serviceItem +
            inputs.serviceItemId +
            endpointsRoutes.acceptWork,
          failOnStatusCode: false,
          headers: expectResponse.getHeader(authInfo.body.access_token),
          body: qualityControlResults.getBodyAccept(),
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

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ with checked contractor is not allowed permission', async () => {
    //customer login & check contractor is not allowed permission
    authInfo = await keyCloakAuth.loginAs(userTypes.contractor)
    if (authInfo.body.access_token) {
      await cy
        .request({
          method: 'POST',
          url:
            endpointsRoutes.serviceItem +
            inputs.serviceItemId +
            endpointsRoutes.acceptWork,
          failOnStatusCode: false,
          headers: expectResponse.getHeader(authInfo.body.access_token),
          body: qualityControlResults.getBodyAccept(),
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

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ without end slash', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.acceptWork.slice(0, -1),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAccept(),
    }).then(response => {
      expectResponse.notFoundRequest(response.status)
      expect(response.body).to.have.property('Error')
      expectResponse.urlNotFound(response.body.Error)
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ without serviceItem ID', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.serviceItem + endpointsRoutes.acceptWork.substr(1),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAccept(),
    }).then(response => {
      expectResponse.notFoundRequest(response.status)
      expect(response.body).to.have.property('Error')
      expectResponse.urlNotFound(response.body.Error)
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ with malformed (int) serviceItem ID', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.invalidIdInt +
        endpointsRoutes.acceptWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAccept(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('serviceItemId')
      expectResponse.validRange(response.body.serviceItemId)
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ with malformed (str) serviceItem ID', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.invalidString +
        endpointsRoutes.acceptWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAccept(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('serviceItemId')
      expectResponse.validInteger(response.body.serviceItemId)
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ with malformed (zero) serviceItem ID', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.zeroId +
        endpointsRoutes.acceptWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAccept(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('serviceItemId')
      expectResponse.idCanNotBeZero(response.body.serviceItemId)
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ without body', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.acceptWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['userId', 'starRating'])
      expectResponse.fieldRequired(response.body.userId)
      expectResponse.fieldRequired(response.body.starRating)
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ without userId and starRating', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.acceptWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptWithoutRequiredFields(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['userId', 'starRating'])
      expectResponse.fieldRequired(response.body.userId)
      expectResponse.fieldRequired(response.body.starRating)
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ with a malformed large (int)', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.acceptWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptWithMalformedNumberField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, [
        'userId',
        'starRating',
        'comment',
      ])
      expectResponse.validRange(response.body.userId)
      expectResponse.validRatingRange(response.body.starRating)
      expectResponse.validCommentLength(response.body.comment)
    })
  })

  serviceItemScenarios.map(typeId => {
    it(`POST | - /serviceItem/{serviceItem ID}/acceptWork/ and includes ${typeId} userId & starRating`, () => {
      cy.request({
        method: 'POST',
        url:
          endpointsRoutes.serviceItem +
          inputs.serviceItemId +
          endpointsRoutes.acceptWork,
        failOnStatusCode: false,
        headers: expectResponse.getHeader(token),
        body: qualityControlResults.getBodyAcceptWithUserIdStarRatingField(
          incorrectIds[typeId]
        ),
      }).then(response => {
        expectResponse.badRequest(response.status)
        expectResponse.haveProperties(response.body, ['userId', 'starRating'])
        expectResponse.validInteger(response.body.userId)
        expectResponse.validInteger(response.body.starRating)
      })
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ with a malformed (zero)', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.acceptWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptWithMalformedZeroField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['userId', 'starRating'])
      expectResponse.idCanNotBeZero(response.body.userId)
      expectResponse.ratingCanNotBeZero(response.body.starRating)
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ with userId and starRating', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.acceptWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptWithoutOptionalFields(),
    }).then(response => {
      expectResponse.createdResponse(response.status)
      expect(response.body).to.have.property('qualityControlResultId')
      expectResponse.numberOnly(response.body.qualityControlResultId)
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ Create a accept service item & fetch all and check record exist', async () => {
    // Creating the Service Item
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
    // Check record exist
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
          endpointsRoutes.acceptWork,
        failOnStatusCode: false,
        headers: expectResponse.getHeader(authInfo.body.access_token),
        body: qualityControlResults.getBodyAccept(),
      })
      .then(response => {
        expectResponse.forbiddenRequest(response.status)
        expect(response.body).to.have.property('detail')
        expectResponse.sessionNotfound(response.body.detail)
      })
  })
})

describe('TC002: Accept service item work', () => {
  it('POST | - /serviceItem/{serviceItem ID}/acceptWork/ Create a accept service item', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Obtain the Service Item
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
})

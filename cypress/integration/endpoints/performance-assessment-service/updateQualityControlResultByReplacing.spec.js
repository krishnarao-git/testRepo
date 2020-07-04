const inputs = require('./../../../fixtures/inputs.json')
const userTypes = require('../../../fixtures/userTypes.json')
import { rejectionReason } from '../../../support/classes/performance-assessment/RejectionReason'
import { qualityControlResults } from '../../../support/classes/performance-assessment/QualityControlResults'
import { expectResponse } from '../../../support/expects/ExpectResponse'
const endpointsRoutes = require('../../../fixtures/endpoints.json')
const incorrectIds = require('../../../fixtures/incorrectIds.json')
import { keyCloakAuth } from '../../../support/classes/keycloakAuthentication/KeyCloakAuth'
const serviceItemScenarios = Object.keys(incorrectIds)
let response,
  rejectServiceItem,
  serviceItemWork,
  acceptServiceItem,
  createRejectionReason,
  updateQualityControlResult,
  authInfo,
  deleteResponse
let token = null

describe('TC001: Update quality control result by replacing validation', () => {
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

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Update quality control result with invalid token', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidToken),
      body: qualityControlResults.getBodyAcceptUpdate(
        inputs.acceptedDeterminationId
      ),
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.signatureVerificationFailed(response.body.detail)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Update quality control result with malformed token', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidStringRange),
      body: qualityControlResults.getBodyAcceptUpdate(
        inputs.acceptedDeterminationId
      ),
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.notEnoughSegments(response.body.detail)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Update quality control result with checked customer is not allowed permission', async () => {
    //customer login & check permission not allowed
    authInfo = await keyCloakAuth.loginAs(userTypes.customer)
    if (authInfo.body.access_token) {
      // Update quality control result
      await cy
        .request({
          method: 'PUT',
          url:
            endpointsRoutes.serviceItem +
            inputs.serviceItemId +
            endpointsRoutes.qualityControlResult +
            acceptServiceItem.qualityControlResultId,
          failOnStatusCode: false,
          headers: expectResponse.getHeader(authInfo.body.access_token),
          body: qualityControlResults.getBodyAcceptToAcceptWithoutOptionalUpdate(),
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

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Update quality control result with checked contractor is not allowed permission', async () => {
    //Contractor login & check permission not allowed
    authInfo = await keyCloakAuth.loginAs(userTypes.customer)
    if (authInfo.body.access_token) {
      // Update quality control result
      cy.request({
        method: 'PUT',
        url:
          endpointsRoutes.serviceItem +
          inputs.serviceItemId +
          endpointsRoutes.qualityControlResult +
          acceptServiceItem.qualityControlResultId,
        failOnStatusCode: false,
        headers: expectResponse.getHeader(authInfo.body.access_token),
        body: qualityControlResults.getBodyAcceptToAcceptWithoutOptionalUpdate(),
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

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Update quality control result without token', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,

      body: qualityControlResults.getBodyAcceptUpdate(
        inputs.acceptedDeterminationId
      ),
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.requiredToken(response.body.detail)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Update quality control result with extra end slash', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId +
        '/',
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptUpdate(
        inputs.acceptedDeterminationId
      ),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.urlNotFound(response.body.Error)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} without serviceItem ID', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        endpointsRoutes.qualityControlResult.substr(1) +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptUpdate(
        inputs.acceptedDeterminationId
      ),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.urlNotFound(response.body.Error)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed serviceItem ID', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.invalidServiceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptUpdate(
        inputs.acceptedDeterminationId
      ),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.qualityControlServiceItemIdNotExists(response.body.Error)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (zero) serviceItem ID', async () => {
    // Create service item work
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.zeroId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptUpdate(
        inputs.acceptedDeterminationId
      ),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('serviceItemId')
    expectResponse.idCanNotBeZero(response.body.serviceItemId)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed large (int) serviceItem ID', async () => {
    // Create service item work
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.invalidIdInt +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptUpdate(
        inputs.acceptedDeterminationId
      ),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('serviceItemId')
    expectResponse.validRange(response.body.serviceItemId)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (str) serviceItem ID', async () => {
    // Create service item work
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.invalidString +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptUpdate(
        inputs.acceptedDeterminationId
      ),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('serviceItemId')
    expectResponse.validInteger(response.body.serviceItemId)
  })

  it('PUT | - /serviceItems/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} without qualityControlResult ID', () => {
    cy.request({
      method: 'PUT',
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

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed qualityControlResult ID', () => {
    cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        inputs.invalidQualityControlResultsId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptUpdate(
        inputs.acceptedDeterminationId
      ),
    }).then(response => {
      expectResponse.notFoundRequest(response.status)
      expect(response.body).to.have.property('Error')
      expectResponse.qualityControlResultNotExists(response.body.Error)
    })
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (zero) qualityControlResult ID', () => {
    cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        inputs.zeroId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptUpdate(
        inputs.acceptedDeterminationId
      ),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('qualityControlResultId')
      expectResponse.idCanNotBeZero(response.body.qualityControlResultId)
    })
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed large (int) qualityControlResult ID', () => {
    cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        inputs.invalidIdInt,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptUpdate(
        inputs.acceptedDeterminationId
      ),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('qualityControlResultId')
      expectResponse.validRange(response.body.qualityControlResultId)
    })
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (str) qualityControlResult ID', () => {
    cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        inputs.invalidString,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptUpdate(
        inputs.acceptedDeterminationId
      ),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expect(response.body).to.have.property('qualityControlResultId')
      expectResponse.validInteger(response.body.qualityControlResultId)
    })
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} without body', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('qualityControlDeterminationId')
    expectResponse.fieldRequired(response.body.qualityControlDeterminationId)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed large (int)', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptUpdateWithoutMalformedNumberFields(),
    })
    expectResponse.badRequest(response.status)
    expectResponse.haveProperties(response.body, [
      'qualityControlDeterminationId',
      'userId',
      'starRating',
      'comment',
      'qualityControlRejectionReasonId',
      'serviceTypeIds',
    ])
    expectResponse.validRange(response.body.qualityControlDeterminationId)
    expectResponse.validRange(response.body.userId)
    expectResponse.validRatingRange(response.body.starRating)
    expectResponse.validCommentLength(response.body.comment)
    expectResponse.validRange(response.body.qualityControlRejectionReasonId)
    expectResponse.validRange(response.body.serviceTypeIds)
  })

  serviceItemScenarios.map(typeId => {
    it(`PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} and includes (${typeId})`, async () => {
      // Creating the Service Item
      acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
        token
      )
      // Update quality control result
      response = await cy.request({
        method: 'PUT',
        url:
          endpointsRoutes.serviceItem +
          inputs.serviceItemId +
          endpointsRoutes.qualityControlResult +
          acceptServiceItem.qualityControlResultId,
        failOnStatusCode: false,
        headers: expectResponse.getHeader(token),
        body: qualityControlResults.getBodyAcceptUpdateWithMalformedRequestFields(
          incorrectIds[typeId]
        ),
      })
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, [
        'qualityControlDeterminationId',
        'userId',
        'starRating',
        'qualityControlRejectionReasonId',
        'serviceTypeIds',
      ])
      expectResponse.validInteger(response.body.qualityControlDeterminationId)
      expectResponse.validInteger(response.body.userId)
      expectResponse.validInteger(response.body.starRating)
      expectResponse.validInteger(response.body.qualityControlRejectionReasonId)
      var invalidServiceTypeIds = qualityControlResults.getServiceTypeId(
        incorrectIds[typeId]
      )
      invalidServiceTypeIds.forEach(function(key, index) {
        expectResponse.validInteger(response.body.serviceTypeIds[index])
      })
    })
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with malformed (zero)', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptUpdateWithoutMalformedZeroFields(),
    })
    expectResponse.badRequest(response.status)
    expectResponse.haveProperties(response.body, [
      'qualityControlDeterminationId',
      'userId',
      'starRating',
      'qualityControlRejectionReasonId',
      'serviceTypeIds',
    ])
    expectResponse.idCanNotBeZero(response.body.qualityControlDeterminationId)
    expectResponse.idCanNotBeZero(response.body.userId)
    expectResponse.ratingCanNotBeZero(response.body.starRating)
    expectResponse.idCanNotBeZero(response.body.qualityControlRejectionReasonId)
    expectResponse.idCanNotBeZero(response.body.serviceTypeIds)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with required qualityControlDetermination ID', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptUpdateWithoutRequiredFields(),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('qualityControlDeterminationId')
    expectResponse.fieldRequired(response.body.qualityControlDeterminationId)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with a malformed qualityControlDetermination ID', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyInvalidDeterminationId(
        inputs.invalidDeterminationId
      ),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.qualityControlDeterminationIdNotExists(response.body.Error)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} without starRating', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Reject a service item
    rejectServiceItem = await qualityControlResults.fetchRejectServiceItemWork(
      createRejectionReason.qualityControlRejectionReasonId,
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        rejectServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyRejectToAcceptUpdateWithoutStarRating(),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.fieldRequiredStarRating(response.body.Error)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} without qualityControlRejectionReason ID', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptToRejectUpdateWithoutRejectionReasionId(),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.fieldRequiredRejectionReason(response.body.Error)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} without array (int) serviceType Ids', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Reject a service item
    rejectServiceItem = await qualityControlResults.fetchRejectServiceItemWork(
      createRejectionReason.qualityControlRejectionReasonId,
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        rejectServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyRejectUpdatewithoutArrayServiceTypeIds(
        createRejectionReason.qualityControlRejectionReasonId,
        inputs.zeroId
      ),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('serviceTypeIds')
    expectResponse.fieldRequiredArray(response.body.serviceTypeIds)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} without array (str) serviceType Ids', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)

    // Reject a service item
    rejectServiceItem = await qualityControlResults.fetchRejectServiceItemWork(
      createRejectionReason.qualityControlRejectionReasonId,
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        rejectServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyRejectUpdatewithoutArrayServiceTypeIds(
        createRejectionReason.qualityControlRejectionReasonId,
        inputs.invalidString
      ),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('serviceTypeIds')
    expectResponse.fieldRequiredArray(response.body.serviceTypeIds)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} with a malformed qualityControlRejectionReason ID', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptToRejectUpdateInvalidField(
        inputs.invalidRejectionReasonId
      ),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.qualityControlRejectionReasonNotExists(response.body.Error)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} without optional input acceptance to acceptance', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update a quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptToAcceptWithoutOptionalUpdate(),
    })
    expectResponse.okResponse(response.status)
    expect(response.body).to.be.empty
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} without optional input rejection to rejection', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Reject a service Item
    rejectServiceItem = await qualityControlResults.fetchRejectServiceItemWork(
      createRejectionReason.qualityControlRejectionReasonId,
      token
    )
    // Update quality control result
    response = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        rejectServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyRejectToRejectWithoutOptionalUpdate(),
    })
    expectResponse.okResponse(response.status)
    expect(response.body).to.be.empty
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Update quality control result acceptance to acceptance & fetch all and check record exist', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )

    // Update a quality control result
    updateQualityControlResult = await qualityControlResults.fetchPutUpdateServiceItemWork(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      token
    )
    // Fetch qaulity control result
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
      'starRating',
      'serviceItemId',
      'userId',
      'comment',
      'type',
      'qualityControlAcceptanceId',
    ])
    expect(response.publicId).to.be.equal(
      acceptServiceItem.qualityControlResultId
    )
    qualityControlResults.validateAcceptUpdateResponse(response)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Update quality control rejection to rejection & fetch all and check record exist', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Reject a service item
    rejectServiceItem = await qualityControlResults.fetchRejectServiceItemWork(
      createRejectionReason.qualityControlRejectionReasonId,
      token
    )
    // Update quality control result
    updateQualityControlResult = await qualityControlResults.fetchPutRejectUpdateServiceItemWork(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        rejectServiceItem.qualityControlResultId,
      createRejectionReason.qualityControlRejectionReasonId,
      token
    )
    // Fetch quality control result
    serviceItemWork = await qualityControlResults.fetchFindOne(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult,
      token
    )
    // Check record exists
    response = await expectResponse.fetchCheckExist(
      serviceItemWork,
      rejectServiceItem.qualityControlResultId
    )
    expectResponse.haveProperties(response, [
      'publicId',
      'qualityControlRejectionReasonId',
      'serviceItemId',
      'userId',
      'comment',
      'type',
      'qualityControlRejectionId',
      'serviceTypeIds',
    ])
    expect(response.publicId).to.be.equal(
      rejectServiceItem.qualityControlResultId
    )
    expect(response.qualityControlRejectionReasonId).to.be.equal(
      createRejectionReason.qualityControlRejectionReasonId
    )
    //get an array with unique values
    var newServiceTypeIds = Array.from(new Set(inputs.updateServiceTypeIds))
    expect(response.serviceTypeIds).to.deep.eq(newServiceTypeIds)
    qualityControlResults.validateRejectUpdateResponse(response)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Update quality control acceptance to rejection & fetch all and check record exist', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Update a quality control result
    updateQualityControlResult = await cy.request({
      method: 'PUT',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyAcceptToRejectUpdatePut(
        createRejectionReason.qualityControlRejectionReasonId
      ),
    })
    // Fetch quality control result
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
      'qualityControlRejectionReasonId',
      'serviceTypeIds',
      'type',
      'comment',
      'qualityControlRejectionId',
    ])
    expect(response.publicId).to.be.equal(
      acceptServiceItem.qualityControlResultId
    )
    expect(response.qualityControlRejectionReasonId).to.be.equal(
      createRejectionReason.qualityControlRejectionReasonId
    )
    // get an array with unique values
    var newServiceTypeIds = Array.from(new Set(inputs.updateServiceTypeIds))
    expect(response.serviceTypeIds).to.deep.eq(newServiceTypeIds)
    qualityControlResults.validateRejectUpdateResponse(response)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Update quality control rejection to acceptance & fetch all and check record exist', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Reject a service item
    rejectServiceItem = await qualityControlResults.fetchRejectServiceItemWork(
      createRejectionReason.qualityControlRejectionReasonId,
      token
    )

    // Update quality control result
    updateQualityControlResult = await qualityControlResults.fetchPutRejectToAcceptUpdateServiceItemWork(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        rejectServiceItem.qualityControlResultId,
      token
    )
    // Fetch quality control result
    serviceItemWork = await qualityControlResults.fetchFindOne(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult,
      token
    )
    // Check record exists
    response = await expectResponse.fetchCheckExist(
      serviceItemWork,
      rejectServiceItem.qualityControlResultId
    )
    expectResponse.haveProperties(response, [
      'publicId',
      'serviceItemId',
      'userId',
      'type',
      'comment',
      'starRating',
      'qualityControlAcceptanceId',
    ])
    expect(response.publicId).to.be.equal(
      rejectServiceItem.qualityControlResultId
    )
    expect(response.starRating).to.be.equal(inputs.starRating)
    qualityControlResults.validateAcceptUpdateResponse(response)
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
    // update quality control result
    await cy
      .request({
        method: 'PUT',
        url:
          endpointsRoutes.serviceItem +
          inputs.serviceItemId +
          endpointsRoutes.qualityControlResult +
          rejectServiceItem.qualityControlResultId,
        failOnStatusCode: false,
        headers: expectResponse.getHeader(authInfo.body.access_token),
        body: qualityControlResults.getBodyAcceptUpdate(
          inputs.acceptedDeterminationId
        ),
      })
      .then(response => {
        expectResponse.forbiddenRequest(response.status)
        expect(response.body).to.have.property('detail')
        expectResponse.sessionNotfound(response.body.detail)
      })
  })
})

describe('TC002: Update quality control result by replacing', () => {
  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Update quality control result acceptance to acceptance', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Update quality control result
    updateQualityControlResult = await qualityControlResults.fetchPutUpdateServiceItemWork(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
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
      headers: expectResponse.getHeader(token),
    })
    expectResponse.okResponse(response.status)
    expectResponse.haveProperties(response.body, [
      'publicId',
      'starRating',
      'serviceItemId',
      'userId',
      'comment',
      'type',
      'qualityControlAcceptanceId',
    ])
    expect(response.body.publicId).to.be.equal(
      acceptServiceItem.qualityControlResultId
    )
    expect(response.body.starRating).to.be.equal(inputs.updateStarRating)
    qualityControlResults.validateAcceptUpdateResponse(response.body)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Update quality control rejection to rejection', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Reject a service item
    rejectServiceItem = await qualityControlResults.fetchRejectServiceItemWork(
      createRejectionReason.qualityControlRejectionReasonId,
      token
    )

    // Update quality control result
    updateQualityControlResult = await qualityControlResults.fetchPutRejectUpdateServiceItemWork(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        rejectServiceItem.qualityControlResultId,
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
    //get an array with unique values
    var newServiceTypeIds = Array.from(new Set(inputs.updateServiceTypeIds))
    expect(response.body.serviceTypeIds).to.deep.eq(newServiceTypeIds)
    qualityControlResults.validateRejectUpdateResponse(response.body)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Update quality control acceptance to rejection', async () => {
    // Creating the Service Item
    acceptServiceItem = await qualityControlResults.fetchAcceptServiceItemWork(
      token
    )
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Update quality control result accept to reject
    updateQualityControlResult = await qualityControlResults.fetchPutAcceptToRejectUpdateServiceItemWork(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        acceptServiceItem.qualityControlResultId,
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
        acceptServiceItem.qualityControlResultId,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    })
    expectResponse.okResponse(response.status)
    expectResponse.haveProperties(response.body, [
      'publicId',
      'serviceItemId',
      'userId',
      'qualityControlRejectionReasonId',
      'serviceTypeIds',
      'type',
      'comment',
      'qualityControlRejectionId',
    ])
    expect(response.body.publicId).to.be.equal(
      acceptServiceItem.qualityControlResultId
    )
    expect(response.body.qualityControlRejectionReasonId).to.be.equal(
      createRejectionReason.qualityControlRejectionReasonId
    )
    //get an array with unique values
    var newServiceTypeIds = Array.from(new Set(inputs.updateServiceTypeIds))
    expect(response.body.serviceTypeIds).to.deep.eq(newServiceTypeIds)
    qualityControlResults.validateRejectUpdateResponse(response.body)
  })

  it('PUT | - /serviceItem/{serviceItem ID}/qualityControlResults/{qualityControlResult ID} Update quality control rejection to acceptance', async () => {
    // Create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Reject a service item
    rejectServiceItem = await qualityControlResults.fetchRejectServiceItemWork(
      createRejectionReason.qualityControlRejectionReasonId,
      token
    )
    // Update quality control result
    updateQualityControlResult = await qualityControlResults.fetchPutRejectToAcceptUpdateServiceItemWork(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult +
        rejectServiceItem.qualityControlResultId,
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
      'serviceItemId',
      'userId',
      'type',
      'comment',
      'starRating',
      'qualityControlAcceptanceId',
    ])
    expect(response.body.publicId).to.be.equal(
      rejectServiceItem.qualityControlResultId
    )
    expect(response.body.starRating).to.be.equal(inputs.starRating)
    qualityControlResults.validateAcceptUpdateResponse(response.body)
  })
})

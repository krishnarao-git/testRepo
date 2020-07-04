const endpointsRoutes = require('../../../fixtures/endpoints.json')
const userTypes = require('../../../fixtures/userTypes.json')
const inputs = require('./../../../fixtures/inputs.json')
import { rejectionReason } from '../../../support/classes/performance-assessment/RejectionReason'
import { qualityControlResults } from '../../../support/classes/performance-assessment/QualityControlResults'
import { expectResponse } from '../../../support/expects/ExpectResponse'
import { keyCloakAuth } from '../../../support/classes/keycloakAuthentication/KeyCloakAuth'
const incorrectIds = require('../../../fixtures/incorrectIds.json')
const serviceItemScenarios = Object.keys(incorrectIds)
let response,
  rejectServiceItem,
  serviceItemWork,
  createRejectionReason,
  authInfo,
  deleteResponse
let token = null

describe('TC001: Reject service item work validation', () => {
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

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ with invalid token', async () => {
    //create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    //create reject service item
    response = await cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.rejectWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidToken),
      body: qualityControlResults.getBodyReject(
        createRejectionReason.qualityControlRejectionReasonId
      ),
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.signatureVerificationFailed(response.body.detail)
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ with malformed token', async () => {
    //create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    //create reject service item
    response = await cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.rejectWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(inputs.invalidStringRange),
      body: qualityControlResults.getBodyReject(
        createRejectionReason.qualityControlRejectionReasonId
      ),
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.notEnoughSegments(response.body.detail)
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ with checked customer is not allowed permission', async () => {
    //login checked customer is not allowed permission
    authInfo = await keyCloakAuth.loginAs(userTypes.customer)
    if (authInfo.body.access_token) {
      //create reject service item
      await cy
        .request({
          method: 'POST',
          url:
            endpointsRoutes.serviceItem +
            inputs.serviceItemId +
            endpointsRoutes.rejectWork,
          failOnStatusCode: false,
          headers: expectResponse.getHeader(authInfo.body.access_token),
          body: qualityControlResults.getBodyReject(
            createRejectionReason.qualityControlRejectionReasonId
          ),
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

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ with checked contractor is not allowed permission', async () => {
    //login checked contractor is not allowed permission
    authInfo = await keyCloakAuth.loginAs(userTypes.contractor)
    if (authInfo.body.access_token) {
      //create reject service item
      await cy
        .request({
          method: 'POST',
          url:
            endpointsRoutes.serviceItem +
            inputs.serviceItemId +
            endpointsRoutes.rejectWork,
          failOnStatusCode: false,
          headers: expectResponse.getHeader(authInfo.body.access_token),
          body: qualityControlResults.getBodyReject(
            createRejectionReason.qualityControlRejectionReasonId
          ),
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

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ without token', async () => {
    //create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    //create reject service item
    response = await cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.rejectWork,
      failOnStatusCode: false,
      body: qualityControlResults.getBodyReject(
        createRejectionReason.qualityControlRejectionReasonId
      ),
    })
    expectResponse.forbiddenRequest(response.status)
    expect(response.body).to.have.property('detail')
    expectResponse.requiredToken(response.body.detail)
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ without end slash', async () => {
    //create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    //create reject service item
    response = await cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.rejectWork.slice(0, -1),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyReject(
        createRejectionReason.qualityControlRejectionReasonId
      ),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.urlNotFound(response.body.Error)
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ without serviceItem ID', async () => {
    //create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    //create reject service item
    response = await cy.request({
      method: 'POST',
      url: endpointsRoutes.serviceItem + endpointsRoutes.rejectWork.substr(1),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyReject(
        createRejectionReason.qualityControlRejectionReasonId
      ),
    })
    expectResponse.notFoundRequest(response.status)
    expect(response.body).to.have.property('Error')
    expectResponse.urlNotFound(response.body.Error)
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ with malformed (int) serviceItem ID', async () => {
    //create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    //create reject service item
    response = await cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.invalidIdInt +
        endpointsRoutes.rejectWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyReject(
        createRejectionReason.qualityControlRejectionReasonId
      ),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('serviceItemId')
    expectResponse.validRange(response.body.serviceItemId)
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ with malformed (str) serviceItem ID', async () => {
    //create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    //create reject service item
    response = await cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.invalidString +
        endpointsRoutes.rejectWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyReject(
        createRejectionReason.qualityControlRejectionReasonId
      ),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('serviceItemId')
    expectResponse.validInteger(response.body.serviceItemId)
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ with malformed (zero) serviceItem ID', async () => {
    //create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    //create reject service item
    response = await cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.zeroId +
        endpointsRoutes.rejectWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyReject(
        createRejectionReason.qualityControlRejectionReasonId
      ),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('serviceItemId')
    expectResponse.idCanNotBeZero(response.body.serviceItemId)
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ without body', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.rejectWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, [
        'userId',
        'qualityControlRejectionReasonId',
      ])
      expectResponse.fieldRequired(response.body.userId)
      expectResponse.fieldRequired(
        response.body.qualityControlRejectionReasonId
      )
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ with malformed large (int)', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.rejectWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyRejectWithMalformedNumberField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, [
        'userId',
        'serviceTypeIds',
        'comment',
        'qualityControlRejectionReasonId',
      ])
      expectResponse.validRange(response.body.userId)
      expectResponse.validRange(response.body.serviceTypeIds)
      expectResponse.validCommentLength(response.body.comment)
      expectResponse.validRange(response.body.qualityControlRejectionReasonId)
    })
  })

  serviceItemScenarios.map(typeId => {
    it(`POST | - /serviceItem/{serviceItem ID}/rejectWork/ with includes ${typeId} userId, qualityControlRejectionReason Id & serviceType Ids`, () => {
      cy.request({
        method: 'POST',
        url:
          endpointsRoutes.serviceItem +
          inputs.serviceItemId +
          endpointsRoutes.rejectWork,
        failOnStatusCode: false,
        headers: expectResponse.getHeader(token),
        body: qualityControlResults.getBodyRejectWithIncurrectField(
          incorrectIds[typeId]
        ),
      }).then(response => {
        expectResponse.badRequest(response.status)
        expectResponse.haveProperties(response.body, [
          'userId',
          'serviceTypeIds',
          'qualityControlRejectionReasonId',
        ])
        expectResponse.validInteger(response.body.userId)
        var invalidServiceTypeIds = qualityControlResults.getServiceTypeId(
          incorrectIds[typeId]
        )
        invalidServiceTypeIds.forEach(function (key, index) {
          expectResponse.validInteger(response.body.serviceTypeIds[index])
        })
        expectResponse.validInteger(
          response.body.qualityControlRejectionReasonId
        )
      })
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ with malformed (zero)', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.rejectWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyRejectWithMalformedZeroField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, [
        'userId',
        'qualityControlRejectionReasonId',
        'serviceTypeIds',
      ])
      expectResponse.idCanNotBeZero(response.body.userId)
      expectResponse.idCanNotBeZero(
        response.body.qualityControlRejectionReasonId
      )
      expectResponse.idCanNotBeZero(response.body.serviceTypeIds)
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ without array (int) serviceType Ids', async () => {
    //create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    //create reject service item
    response = await cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.rejectWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyRejectWithoutArrayServiceTypeIdsFields(
        createRejectionReason.qualityControlRejectionReasonId,
        inputs.zeroId
      ),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('serviceTypeIds')
    expectResponse.fieldRequiredArray(response.body.serviceTypeIds)
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ without array (str) serviceType Ids', async () => {
    //create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    //create reject service item
    response = await cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.rejectWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyRejectWithoutArrayServiceTypeIdsFields(
        createRejectionReason.qualityControlRejectionReasonId,
        inputs.invalidString
      ),
    })
    expectResponse.badRequest(response.status)
    expect(response.body).to.have.property('serviceTypeIds')
    expectResponse.fieldRequiredArray(response.body.serviceTypeIds)
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ with malformed qualityControlRejectionReason ID', () => {
    cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.rejectWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyRejectWithoutOptionalFields(
        inputs.invalidRejectionReasonId
      ),
    }).then(response => {
      expectResponse.notFoundRequest(response.status)
      expect(response.body).to.have.property('Error')
      expectResponse.qualityControlRejectionReasonNotExists(response.body.Error)
    })
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ with userId and qualityControlRejectionReasonId', async () => {
    //create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    response = await cy.request({
      method: 'POST',
      url:
        endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.rejectWork,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: qualityControlResults.getBodyRejectWithoutOptionalFields(
        createRejectionReason.qualityControlRejectionReasonId
      ),
    })
    expectResponse.createdResponse(response.status)
    expectResponse.numberOnly(response.body.qualityControlResultId)
  })

  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ Reject a service item & fetch all and check record exist', async () => {
    //create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Reject Service Item
    rejectServiceItem = await qualityControlResults.fetchRejectServiceItemWork(
      createRejectionReason.qualityControlRejectionReasonId,
      token
    )
    //Get Reject Qaulity control result
    serviceItemWork = await qualityControlResults.fetchFindOne(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.qualityControlResult,
      token
    )
    //Check exist record
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
    qualityControlResults.validateRejectResponse(response)
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
    //reject service item
    await cy
      .request({
        method: 'POST',
        url:
          endpointsRoutes.serviceItem +
          inputs.serviceItemId +
          endpointsRoutes.rejectWork,
        failOnStatusCode: false,
        headers: expectResponse.getHeader(authInfo.body.access_token),
        body: qualityControlResults.getBodyReject(
          createRejectionReason.qualityControlRejectionReasonId
        ),
      })
      .then(response => {
        expectResponse.forbiddenRequest(response.status)
        expect(response.body).to.have.property('detail')
        expectResponse.sessionNotfound(response.body.detail)
      })
  })
})

describe('TC002: Reject service item work', () => {
  it('POST | - /serviceItem/{serviceItem ID}/rejectWork/ Reject a service item ', async () => {
    //create rejection reason
    createRejectionReason = await rejectionReason.fetchAddRejectionReason(token)
    // Reject Service Item
    rejectServiceItem = await qualityControlResults.fetchRejectServiceItemWork(
      createRejectionReason.qualityControlRejectionReasonId,
      token
    )
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

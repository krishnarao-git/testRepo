const inputs = require('../../../fixtures/inputs.json')
import { expectResponse } from '../../../support/expects/ExpectResponse'
const endpointsRoutes = require('../../../fixtures/endpoints.json')

class QualityControlResults {
  async fetchAcceptServiceItemWork(token) {
    const responseAcceptServiceItem = await fetch(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.acceptWork,
      {
        method: 'POST',
        headers: expectResponse.getHeader(token),
        failOnStatusCode: false,
        body: JSON.stringify(this.getBodyAccept()),
      }
    )
    return await responseAcceptServiceItem.json()
  }

  async fetchPutUpdateServiceItemWork(endpointsRoute, token) {
    const responsePutUpdateAcceptServiceItem = await fetch(endpointsRoute, {
      method: 'PUT',
      headers: expectResponse.getHeader(token),
      failOnStatusCode: false,
      body: JSON.stringify(
        this.getBodyAcceptUpdate(inputs.acceptedDeterminationId)
      ),
    })
    return await responsePutUpdateAcceptServiceItem.json()
  }

  async fetchFindOne(endpointsRoute, token) {
    const responseFindOne = await fetch(endpointsRoute, {
      method: 'GET',
      headers: expectResponse.getHeader(token),
      failOnStatusCode: false,
    })
    return await responseFindOne.json()
  }

  async fetchDeleteQualityControlResult(endpointsRoute, token) {
    const responseDeleteQualityControlResult = await fetch(endpointsRoute, {
      method: 'DELETE',
      headers: expectResponse.getHeader(token),
      failOnStatusCode: false,
    })
    return await responseDeleteQualityControlResult.json()
  }

  async fetchRejectUpdateServiceItemWork(
    endpointsRoute,
    qualityControlRejectionReasonId,
    token
  ) {
    const responseRejectUpdateAcceptServiceItem = await fetch(endpointsRoute, {
      method: 'PATCH',
      headers: expectResponse.getHeader(token),
      failOnStatusCode: false,
      body: JSON.stringify(
        this.getBodyRejectUpdate(qualityControlRejectionReasonId)
      ),
    })
    return await responseRejectUpdateAcceptServiceItem.json()
  }

  getBodyAcceptWithoutRequiredFields() {
    return {
      comment: inputs.comment,
    }
  }

  getBodyAcceptWithMalformedNumberField() {
    return {
      userId: inputs.invalidIdInt,
      starRating: inputs.invalidStarRatingInt,
      comment: inputs.invalidComment,
    }
  }

  getBodyAcceptWithMalformedZeroField() {
    return {
      userId: inputs.zeroId,
      starRating: inputs.zeroId,
    }
  }

  getBodyAcceptWithUserIdStarRatingField(fieldId) {
    return {
      userId: fieldId,
      starRating: fieldId,
    }
  }

  getBodyAcceptWithoutOptionalFields() {
    return {
      userId: inputs.userId,
      starRating: inputs.starRating,
    }
  }

  getBodyAcceptToAcceptWithoutOptionalUpdate() {
    return {
      qualityControlDeterminationId: inputs.acceptedDeterminationId,
    }
  }

  getBodyAcceptUpdateWithoutMalformedNumberFields() {
    return {
      userId: inputs.invalidIdInt,
      comment: inputs.invalidComment,
      starRating: inputs.invalidStarRatingInt,
      qualityControlDeterminationId: inputs.invalidIdInt,
      serviceTypeIds: inputs.invalidServiceTypeIdsInt,
      qualityControlRejectionReasonId: inputs.invalidIdInt,
    }
  }

  getBodyAcceptUpdateWithMalformedRequestFields(fieldId) {
    return {
      userId: fieldId,
      qualityControlRejectionReasonId: fieldId,
      serviceTypeIds: this.getServiceTypeId(fieldId),
      starRating: fieldId,
      qualityControlDeterminationId: fieldId,
    }
  }

  getServiceTypeId(fieldId) {
    return [fieldId, fieldId, fieldId]
  }

  getBodyAcceptUpdateWithoutMalformedZeroFields() {
    return {
      userId: inputs.zeroId,
      starRating: inputs.zeroId,
      qualityControlDeterminationId: inputs.zeroId,
      serviceTypeIds: inputs.invalidServiceTypeIdsZero,
      qualityControlRejectionReasonId: inputs.zeroId,
    }
  }

  getBodyAcceptUpdateWithoutRequiredFields() {
    return {
      userId: inputs.userId,
      starRating: inputs.starRating,
      comment: inputs.comment,
    }
  }

  getBodyInvalidDeterminationId(qualityControlDeterminationId) {
    return {
      qualityControlDeterminationId: qualityControlDeterminationId,
    }
  }

  async fetchRejectServiceItemWork(qualityControlRejectionReasonId, token) {
    const responseAcceptServiceItem = await fetch(
      endpointsRoutes.serviceItem +
        inputs.serviceItemId +
        endpointsRoutes.rejectWork,
      {
        method: 'POST',
        headers: expectResponse.getHeader(token),
        failOnStatusCode: false,
        body: JSON.stringify(
          this.getBodyReject(qualityControlRejectionReasonId)
        ),
      }
    )
    return await responseAcceptServiceItem.json()
  }

  async cleanDB(endpointsRoute, token) {
    // Get all information a quality control result
    await cy
      .request({
        method: 'GET',
        url: `${endpointsRoute}`,
        failOnStatusCode: false,
        headers: expectResponse.getHeader(token),
      })
      .then(response => {
        var services = response.body
        // delete quality control result
        if (services.length > 0) {
          services.forEach(service => {
            this.delete(
              endpointsRoutes.serviceItem +
                inputs.serviceItemId +
                endpointsRoutes.qualityControlResult +
                service.publicId,
              token
            )
          })
        }
      })
  }

  delete(endpointsRoute, token) {
    cy.request({
      method: 'DELETE',
      url: `${endpointsRoute}`,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).should(response => {
      expectResponse.okResponse(response.status)
      expect(response.body).to.be.empty
    })
  }

  validateAcceptResponse(response) {
    expect(response.serviceItemId).to.be.equal(inputs.serviceItemId)
    expect(response.userId).to.be.equal(inputs.userId)
    expect(response.comment).to.be.equal(inputs.comment)
    expect(response.type).to.be.equal('qualityControlAcceptance')
    expectResponse.numberOnly(response.qualityControlAcceptanceId)
    expect(response.starRating).to.be.equal(inputs.starRating)
  }

  async fetchPutRejectUpdateServiceItemWork(
    endpointsRoute,
    qualityControlRejectionReasonId,
    token
  ) {
    const responsePutUpdateRejectServiceItem = await fetch(endpointsRoute, {
      method: 'PUT',
      headers: expectResponse.getHeader(token),
      failOnStatusCode: false,
      body: JSON.stringify(
        this.getBodyRejectUpdate(qualityControlRejectionReasonId)
      ),
    })
    return await responsePutUpdateRejectServiceItem.json()
  }

  async fetchPutRejectToAcceptUpdateServiceItemWork(endpointsRoute, token) {
    const responsePutRejectToAcceptUpdateRejectServiceItem = await fetch(
      endpointsRoute,
      {
        method: 'PUT',
        headers: expectResponse.getHeader(token),
        failOnStatusCode: false,
        body: JSON.stringify(this.getBodyRejectToAcceptUpdatePut()),
      }
    )
    return await responsePutRejectToAcceptUpdateRejectServiceItem
  }

  async fetchPutAcceptToRejectUpdateServiceItemWork(
    endpointsRoute,
    qualityControlRejectionReasonId,
    token
  ) {
    const responsePutAcceptToRejectUpdateRejectServiceItem = await fetch(
      endpointsRoute,
      {
        method: 'PUT',
        headers: expectResponse.getHeader(token),
        failOnStatusCode: false,
        body: JSON.stringify(
          this.getBodyAcceptToRejectUpdatePut(qualityControlRejectionReasonId)
        ),
      }
    )
    return await responsePutAcceptToRejectUpdateRejectServiceItem.json()
  }

  getBodyReject(qualityControlRejectionReasonId) {
    return {
      userId: inputs.userId,
      qualityControlRejectionReasonId: qualityControlRejectionReasonId,
      serviceTypeIds: inputs.serviceTypeIds,
      comment: inputs.comment,
    }
  }

  getBodyRejectWithMalformedNumberField() {
    return {
      userId: inputs.invalidIdInt,
      serviceTypeIds: inputs.invalidServiceTypeIdsInt,
      comment: inputs.invalidComment,
      qualityControlRejectionReasonId: inputs.invalidIdInt,
    }
  }

  getBodyRejectWithIncurrectField(fieldId) {
    return {
      userId: fieldId,
      qualityControlRejectionReasonId: fieldId,
      serviceTypeIds: this.getServiceTypeId(fieldId),
    }
  }

  getServiceTypeId(fieldId) {
    return [fieldId, fieldId, fieldId]
  }

  getBodyRejectWithMalformedZeroField() {
    return {
      userId: inputs.zeroId,
      qualityControlRejectionReasonId: inputs.zeroId,
      serviceTypeIds: inputs.invalidServiceTypeIdsZero,
    }
  }

  getBodyRejectWithoutArrayServiceTypeIdsFields(
    qualityControlRejectionReasonId,
    serviceTypeIds
  ) {
    return {
      qualityControlDeterminationId: inputs.rejectedDeterminationId,
      userId: inputs.userId,
      comment: inputs.updateComment,
      qualityControlRejectionReasonId: qualityControlRejectionReasonId,
      serviceTypeIds: serviceTypeIds,
    }
  }

  getBodyRejectWithoutOptionalFields(qualityControlRejectionReasonId) {
    return {
      userId: inputs.userId,
      qualityControlRejectionReasonId: qualityControlRejectionReasonId,
    }
  }

  validateRejectResponse(response) {
    expect(response.serviceItemId).to.be.equal(inputs.serviceItemId)
    expect(response.userId).to.be.equal(inputs.userId)
    expect(response.comment).to.be.equal(inputs.comment)
    expect(response.type).to.be.equal('qualityControlRejection')
    expectResponse.numberOnly(response.qualityControlRejectionId)
    //get an array with unique values
    var newServiceTypeIds = Array.from(new Set(inputs.serviceTypeIds))
    expect(response.serviceTypeIds).to.deep.eq(newServiceTypeIds)
  }

  getBodyAcceptToRejectUpdateInvalidField(qualityControlRejectionReasonId) {
    return {
      qualityControlDeterminationId: inputs.rejectedDeterminationId,
      userId: inputs.userId,
      comment: inputs.updateComment,
      qualityControlRejectionReasonId: qualityControlRejectionReasonId,
      serviceTypeIds: inputs.serviceTypeIds,
    }
  }

  getBodyRejectToRejectWithoutOptionalUpdate() {
    return {
      qualityControlDeterminationId: inputs.rejectedDeterminationId,
    }
  }

  getBodyAcceptUpdate(qualityControlDeterminationId) {
    return {
      userId: inputs.userId,
      qualityControlDeterminationId: qualityControlDeterminationId,
      starRating: inputs.updateStarRating,
      comment: inputs.updateComment,
    }
  }

  validateAcceptUpdateResponse(response) {
    expect(response.serviceItemId).to.be.equal(inputs.serviceItemId)
    expect(response.userId).to.be.equal(inputs.userId)
    expect(response.comment).to.be.equal(inputs.updateComment)
    expect(response.type).to.be.equal('qualityControlAcceptance')
    expectResponse.numberOnly(response.qualityControlAcceptanceId)
  }

  validateRejectUpdateResponse(response) {
    expect(response.serviceItemId).to.be.equal(inputs.serviceItemId)
    expect(response.userId).to.be.equal(inputs.userId)
    expect(response.comment).to.be.equal(inputs.updateComment)
    expect(response.type).to.be.equal('qualityControlRejection')
    expectResponse.numberOnly(response.qualityControlRejectionId)
  }

  getBodyAcceptToRejectUpdatePut(qualityControlRejectionReasonId) {
    return {
      qualityControlDeterminationId: inputs.rejectedDeterminationId,
      userId: inputs.userId,
      comment: inputs.updateComment,
      qualityControlRejectionReasonId: qualityControlRejectionReasonId,
      serviceTypeIds: inputs.updateServiceTypeIds,
    }
  }

  getBodyRejectToAcceptUpdatePut() {
    return {
      userId: inputs.userId,
      qualityControlDeterminationId: inputs.acceptedDeterminationId,
      starRating: inputs.starRating,
      comment: inputs.updateComment,
    }
  }

  getBodyRejectUpdate(qualityControlRejectionReasonId) {
    return {
      userId: inputs.userId,
      qualityControlDeterminationId: inputs.rejectedDeterminationId,
      comment: inputs.updateComment,
      serviceTypeIds: inputs.updateServiceTypeIds,
      qualityControlRejectionReasonId: qualityControlRejectionReasonId,
    }
  }

  getBodyRejectToAcceptUpdateWithoutStarRating() {
    return { qualityControlDeterminationId: inputs.acceptedDeterminationId }
  }

  getBodyRejectUpdatewithoutArrayServiceTypeIds(
    qualityControlRejectionReasonId,
    serviceTypeIds
  ) {
    return {
      qualityControlDeterminationId: inputs.rejectedDeterminationId,
      userId: inputs.userId,
      comment: inputs.updateComment,
      qualityControlRejectionReasonId: qualityControlRejectionReasonId,
      serviceTypeIds: serviceTypeIds,
    }
  }

  getBodyAcceptToRejectUpdateWithoutRejectionReasionId() {
    return {
      qualityControlDeterminationId: inputs.rejectedDeterminationId,
    }
  }

  getBodyRejectToRejectInvalidQualityControlRejectionReasonId(
    qualityControlRejectionReasonId
  ) {
    return {
      qualityControlDeterminationId: inputs.rejectedDeterminationId,
      userId: inputs.userId,
      comment: inputs.updateComment,
      qualityControlRejectionReasonId: qualityControlRejectionReasonId,
      serviceTypeIds: inputs.serviceTypeIds,
    }
  }

  async fetchUpdateServiceItemWork(endpointsRoute, token) {
    const responseUpdateAcceptServiceItem = await fetch(endpointsRoute, {
      method: 'PATCH',
      headers: expectResponse.getHeader(token),
      failOnStatusCode: false,
      body: JSON.stringify(
        this.getBodyAcceptUpdate(inputs.acceptedDeterminationId)
      ),
    })
    return await responseUpdateAcceptServiceItem.json()
  }

  getBodyAccept() {
    return {
      userId: inputs.userId,
      starRating: inputs.starRating,
      comment: inputs.comment,
    }
  }
}
export const qualityControlResults = new QualityControlResults()

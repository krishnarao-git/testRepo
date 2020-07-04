const inputs = require('../../../fixtures/inputs.json')
const endpointsRoutes = require('../../../fixtures/endpoints.json')
import { expectResponse } from '../../../support/expects/ExpectResponse'
class RejectionReason {
  async fetchAddRejectionReason(token) {
    const responseAddRejectionReason = await fetch(
      endpointsRoutes.qualityControlRejectionReasons,
      {
        method: 'POST',
        headers: expectResponse.getHeader(token),
        failOnStatusCode: false,
        body: JSON.stringify(this.getBodyAddRejectionReason()),
      }
    )
    return await responseAddRejectionReason.json()
  }

  async fetchRejectionReason(token) {
    const responseRejectionReason = await fetch(
      endpointsRoutes.qualityControlRejectionReasons,
      {
        method: 'GET',
        headers: expectResponse.getHeader(token),
        failOnStatusCode: false,
      }
    )
    return await responseRejectionReason.json()
  }

  getBodyAddRejectionReason() {
    return {
      name: inputs.name,
      description: inputs.description,
    }
  }

  validResponse(response) {
    expect(response.name).to.be.equal(inputs.name)
    expect(response.description).to.be.equal(inputs.description)
    expect(response.active).to.be.true
  }

  async fetchUpdateRejectionReason(endpointsRoute, token) {
    const responseUpdateRejectionReason = await fetch(endpointsRoute, {
      method: 'PATCH',
      headers: expectResponse.getHeader(token),
      failOnStatusCode: false,
      body: JSON.stringify(this.getBodyUpdateRejectionReason()),
    })
    return await responseUpdateRejectionReason.json()
  }

  getBodyUpdateRejectionReason() {
    return {
      name: inputs.updateName,
      description: inputs.updateDescription,
    }
  }

  validUpdateResponse(response) {
    expect(response.name).to.be.equal(inputs.updateName)
    expect(response.description).to.be.equal(inputs.updateDescription)
    expect(response.active).to.be.true
  }

  getBodyRejectionReasonWithBlankField() {
    return {
      name: '',
      description: '',
    }
  }

  getBodyRejectionReasonWithMalformedField() {
    return {
      name: inputs.invalidStringRange,
      description: inputs.invalidStringRange,
    }
  }
}
export const rejectionReason = new RejectionReason()

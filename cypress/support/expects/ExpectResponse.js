const constants = require('../../fixtures/constant.json')
class ExpectResponse {
  haveProperties(body, properties) {
    properties.forEach(prop => {
      expect(body).to.have.property(prop)
    })
  }

  unAuthorizedRequest(response) {
    expect(response).to.eq(401)
  }

  unauthorizedClient(property) {
    expect(property).to.equal(constants.unauthorizedClient)
  }

  unsupportedGrantType(property) {
    expect(property).to.equal(constants.unsupportedGrantType)
  }

  invalidUserCredentials(property) {
    expect(property).to.equal(constants.invalidUserCredentials)
  }

  invalidClientCredentials(property) {
    expect(property).to.equal(constants.invalidClientCredentials)
  }

  badRequest(response) {
    expect(response).to.eq(400)
  }

  validRange(property) {
    expect(property).to.include.members([constants.serviceIntValidation])
  }

  validInteger(property) {
    expect(property).to.include.members([constants.integerOnly])
  }

  okResponse(response) {
    expect(response).to.eq(200)
  }

  async fetchCheckExist(property, value) {
    let result = {}
    if (property.length > 0) {
      property.map(function(obj) {
        if (obj.publicId === value) {
          result = obj
        }
      })
    }
    return await result
  }

  createdResponse(response) {
    expect(response).to.eq(201)
  }

  urlNotFound(property) {
    var pattern = new RegExp(constants.urlNotFound)
    expect(pattern.test(property)).to.be.true
  }

  forbiddenRequest(response) {
    expect(response).to.eq(403)
  }

  requiredToken(property) {
    expect(property).to.equal(constants.requiredToken)
  }

  notAllowedRequest(response) {
    expect(response).to.eq(405)
  }

  notEnoughSegments(property) {
    expect(property).to.equal(constants.notEnoughSegments)
  }

  signatureVerificationFailed(property) {
    expect(property).to.equal(constants.signatureVerificationFailed)
  }

  requiredPermission(property) {
    expect(property).to.equal(constants.requiredPermission)
  }

  qualityControlRejectionReasonNotExists(property) {
    var pattern = new RegExp(constants.qualityControlRejectionReasonNotExist)
    expect(pattern.test(property)).to.be.true
  }

  validCommentLength(property) {
    expect(property).to.include.members([constants.commentLength])
  }

  fieldRequiredArray(property) {
    var pattern = new RegExp(constants.requiredArrayItem)
    expect(pattern.test(property)).to.be.true
  }

  fieldRequiredRejectionReason(property) {
    expect(property).to.equal(constants.requiredRejectionReason)
  }

  qualityControlDeterminationIdNotExists(property) {
    var pattern = new RegExp(constants.qualityControlDeterminationIdNotExist)
    expect(pattern.test(property)).to.be.true
  }

  fieldRequired(property) {
    expect(property).to.include.members([constants.required])
  }

  fieldNotBlank(property) {
    expect(property).to.include.members([constants.blankRequired])
  }

  validNameLength(property) {
    expect(property).to.include.members([constants.nameLength])
  }

  validDescriptionLength(property) {
    expect(property).to.include.members([constants.descriptionLength])
  }

  qualityControlServiceItemIdNotExists(property) {
    var pattern = new RegExp(
      constants.qualityControlResultServiceItemIdNotExist
    )
    expect(pattern.test(property)).to.be.true
  }

  fieldRequiredStarRating(property) {
    expect(property).to.equal(constants.requiredStarRating)
  }

  methodNotAllowed(property) {
    var pattern = new RegExp(constants.methodNotAllowed)
    expect(pattern.test(property)).to.be.true
  }

  qualityControlResultNotExists(property) {
    var pattern = new RegExp(constants.qualityControlResultNotExist)
    expect(pattern.test(property)).to.be.true
  }

  numberOnly(property) {
    expect(property).to.be.a('number')
  }

  invalidRefreshToken(property) {
    expect(property).to.equal(constants.invalidRefreshToken)
  }

  idCanNotBeZero(property) {
    expect(property).to.members([constants.serviceItemIdCanNotBeZero])
  }

  validRatingRange(property) {
    expect(property).to.include.members([constants.ratingRange])
  }

  ratingCanNotBeZero(property) {
    expect(property).to.members([constants.ratingCanNotBeZero])
  }

  fieldRequired(property) {
    expect(property).to.include.members([constants.required])
  }

  sessionNotfound(property) {
    expect(property).to.equal(constants.sessionNotfound)
  }

  logoutRequest(response) {
    expect(response).to.eq(204)
  }

  notFoundRequest(response) {
    expect(response).to.eq(404)
  }

  getHeader(token) {
    return {
      'Content-type': 'application/json',
      Authorization: 'Bearer ' + token,
    }
  }

  invalidOrderJson(property) {
    expect(property).to.equal(constants.invalidOrderJson)
  }

  invalidJsonServicePlan(property) {
    expect(property).to.equal(constants.invalidJsonServicePlan)
  }

  invalidJsonCreateOrder(property) {
    expect(property).to.equal(constants.invalidJsonCreateOrder)
  }
}

export const expectResponse = new ExpectResponse()

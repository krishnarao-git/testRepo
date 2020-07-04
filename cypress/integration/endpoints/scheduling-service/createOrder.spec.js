const inputs = require('../../../fixtures/inputs.json')
const userTypes = require('../../../fixtures/userTypes.json')
const endpointsRoutes = require('../../../fixtures/endpoints.json')
import { expectResponse } from '../../../support/expects/ExpectResponse'
import { scheduling } from '../../../support/classes/scheduling/Scheduling'
import { keyCloakAuth } from '../../../support/classes/keycloakAuthentication/KeyCloakAuth'
let deleteResponse, authInfo
let token = null

describe('TC001: Create a order validation', () => {
  before('Token generate', async () => {
    // get token
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

  it('POST | - /order/ with invalid token', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      body: scheduling.getBodyCreateOrder(),
      headers: expectResponse.getHeader(inputs.invalidToken),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.signatureVerificationFailed(response.body.detail)
    })
  })

  it('POST | - /order/ with malformed token', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      body: scheduling.getBodyCreateOrder(),
      headers: expectResponse.getHeader(inputs.invalidStringRange),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.notEnoughSegments(response.body.detail)
    })
  })

  it('POST | - /order/ without token', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      body: scheduling.getBodyCreateOrder(),
    }).then(response => {
      expectResponse.forbiddenRequest(response.status)
      expect(response.body).to.have.property('detail')
      expectResponse.requiredToken(response.body.detail)
    })
  })

  it('POST | - /order/ without end slash', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order.slice(0, -1),
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrder(),
    }).then(response => {
      expectResponse.notFoundRequest(response.status)
      expect(response.body).to.have.property('Error')
      expectResponse.urlNotFound(response.body.Error)
    })
  })

  it('POST | - /order/ with checked customer is not allowed permission', async () => {
    //customer login & check permission allowed
    authInfo = await keyCloakAuth.loginAs(userTypes.customer)
    //check customer token
    if (authInfo.body.access_token) {
      //create a order
      await cy
        .request({
          method: 'POST',
          url: endpointsRoutes.order,
          failOnStatusCode: false,
          body: scheduling.getBodyCreateOrder(),
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

  it('POST | - /order/ with checked contractor is not allowed permission', async () => {
    //contractor login & check contractor is not allowed permission
    authInfo = await keyCloakAuth.loginAs(userTypes.contractor)
    if (authInfo.body.access_token) {
      // Creating the order
      await cy
        .request({
          method: 'POST',
          url: endpointsRoutes.order,
          failOnStatusCode: false,
          body: scheduling.getBodyCreateOrder(),
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

  it('POST | - /order/ without body', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidOrderJson(response.body.Error)
    })
  })

  it('POST | - /order/ without customer info', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutCustomerField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidJsonServicePlan(response.body.Error)
    })
  })

  it('POST | - /order/ without Asset', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutAssetField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidOrderJson(response.body.Error)
    })
  })

  it('POST | - /order/ without Customer info & Asset info & Bundle info', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutCustomerAndAssetAndBundleField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidOrderJson(response.body.Error)
    })
  })

  it('POST | - /order/ without customer Id ', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutCustomerIdField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidJsonServicePlan(response.body.Error)
    })
  })

  it('POST | - /order/ without Asset SF PropertyId', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutAssetSFPropertyIdField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidJsonServicePlan(response.body.Error)
    })
  })

  it('POST | - /order/ without Asset TE PropertyId', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutAssetTEPropertyIdField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidOrderJson(response.body.Error)
    })
  })

  it('POST | - /order/ without Asset AccessInstructions', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutAccessInstructionsField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidJsonServicePlan(response.body.Error)
    })
  })

  it('POST | - /order/ without Asset gateCode', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutAssetGateCodeField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidJsonServicePlan(response.body.Error)
    })
  })

  it('POST | - /order/ without Bundle', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutBundleField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidJsonCreateOrder(response.body.Error)
    })
  })

  it('POST | - /order/ with malformed (zero) Json', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithMalformedZeroJson(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidOrderJson(response.body.Error)
    })
  })

  it('POST | - /order/ with invalid Json', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithMalformedInvalidJsonField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidOrderJson(response.body.Error)
    })
  })

  it('POST | - /order/ with order Id input empty', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithOrderIdField(),
    }).then(response => {
      expectResponse.createdResponse(response.status)
      expectResponse.haveProperties(response.body, ['orderId'])
      expectResponse.numberOnly(response.body.orderId)
    })
  })

  it('POST | - /order/ without optional input', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrder(),
    }).then(response => {
      expectResponse.createdResponse(response.status)
      expectResponse.haveProperties(response.body, ['orderId'])
      expectResponse.numberOnly(response.body.orderId)
    })
  })

  it('POST | - /order/ with optional input', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithOptionalField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidOrderJson(response.body.Error)
    })
  })

  it('POST | - /order/ with delete order Id field in json', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutOrderIdlField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidJsonCreateOrder(response.body.Error)
    })
  })

  it('POST | - /order/ without OrderNumber', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutOrderNumber(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidJsonServicePlan(response.body.Error)
    })
  })

  it('POST | - /order/ without OrderDate', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutOrderDate(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidJsonServicePlan(response.body.Error)
    })
  })

  it('POST | - /order/ with empty order json', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithEmptyOrderJson(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidOrderJson(response.body.Error)
    })
  })

  it('POST | - /order/ with empty customer json inside order json', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithEmptyCustomerJson(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidOrderJson(response.body.Error)
    })
  })

  it('POST | - /order/ with empty asset json inside order json', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithEmptyAssetJson(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidOrderJson(response.body.Error)
    })
  })

  it('POST | - /order/ without packages inside bundle', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutPackagesField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidJsonCreateOrder(response.body.Error)
    })
  })

  it('POST | - /order/ without serviceTypes inside packages', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutServiceTypesField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidJsonCreateOrder(response.body.Error)
    })
  })

  it('POST | - /order/ without photoSets inside serviceTypes', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithoutPhotoSetsField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidJsonCreateOrder(response.body.Error)
    })
  })

  it('POST | - /order/ with invalid Customer Json', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithMalformedInvalidCustomerJsonField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidJsonServicePlan(response.body.Error)
    })
  })

  it('POST | - /order/ with invalid Asset Json', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithMalformedInvalidAssetJsonField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidOrderJson(response.body.Error)
    })
  })

  it('POST | - /order/ with invalid Bundle array json', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithMalformedInvalidBundleArrayJsonField(),
    }).then(response => {
      expectResponse.badRequest(response.status)
      expectResponse.haveProperties(response.body, ['Error'])
      expectResponse.invalidJsonCreateOrder(response.body.Error)
    })
  })

  it('POST | - /order/ create a order', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithAllField(),
    }).then(response => {
      expectResponse.createdResponse(response.status)
      expectResponse.haveProperties(response.body, ['orderId'])
      expectResponse.numberOnly(response.body.orderId)
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
    deleteResponse = await keyCloakAuth.logout(userTypes.logout)
    expectResponse.logoutRequest(deleteResponse.status)
    //create tag
    await cy
      .request({
        method: 'POST',
        url: endpointsRoutes.order,
        failOnStatusCode: false,
        body: scheduling.getBodyCreateOrderWithAllField(),
        headers: expectResponse.getHeader(authInfo.body.access_token),
      })
      .then(response => {
        expectResponse.forbiddenRequest(response.status)
        expect(response.body).to.have.property('detail')
        expectResponse.sessionNotfound(response.body.detail)
      })
  })
})

describe('TC002: Create a order', () => {
  it('POST | - /order/ Create a order', () => {
    cy.request({
      method: 'POST',
      url: endpointsRoutes.order,
      failOnStatusCode: false,
      headers: expectResponse.getHeader(token),
      body: scheduling.getBodyCreateOrderWithAllField(),
    }).then(response => {
      expectResponse.createdResponse(response.status)
      expectResponse.haveProperties(response.body, ['orderId'])
      expectResponse.numberOnly(response.body.orderId)
    })
  })
})

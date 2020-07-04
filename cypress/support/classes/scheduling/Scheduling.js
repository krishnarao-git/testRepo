const inputs = require('../../../fixtures/inputs.json')

class Scheduling {
  getBodyCreateOrder() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.Customer = inputs.customer
    order.Asset = inputs.asset
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithoutCustomerField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    delete order.Customer
    order.Asset = inputs.asset
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithoutAssetField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.Customer = inputs.customer
    delete order.Asset
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithoutCustomerAndAssetAndBundleField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    delete order.Customer
    delete order.Asset
    delete order.Bundle
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithoutCustomerIdField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.Customer = inputs.customer
    delete order.Customer.CustomerId
    order.Asset = inputs.asset
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithoutAssetSFPropertyIdField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.Customer = inputs.customer
    order.Customer.CustomerId = inputs.customerId
    order.Asset = inputs.asset
    delete order.Asset.SF_PropertyId
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithoutAssetTEPropertyIdField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.Customer = inputs.customer
    order.Asset = inputs.asset
    order.Asset.SF_PropertyId = inputs.sfPropertyId
    delete order.Asset.TE_PropertyId
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithoutAccessInstructionsField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.Customer = inputs.customer
    order.Asset = inputs.asset
    order.Asset.TE_PropertyId = inputs.tePropertyId
    delete order.Asset.AccessInstructions
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithoutAssetGateCodeField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.Customer = inputs.customer
    order.Asset = inputs.asset
    order.Asset.TE_PropertyId = inputs.tePropertyId
    order.Asset.AccessInstructions = inputs.accessInstructions
    delete order.Asset.GateCode
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithoutBundleField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.Customer = inputs.customer
    order.Asset = inputs.asset
    order.Asset.GateCode = inputs.gateCode
    delete order.Bundle
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithMalformedZeroJson() {
    return inputs.zeroId
  }

  getBodyCreateOrderWithMalformedInvalidJsonField() {
    return inputs.invalidOrderJson
  }

  getBodyCreateOrderWithOrderIdField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.Customer = inputs.customer
    order.Asset = inputs.asset
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithOptionalField() {
    let optionalInput = {
      RequiredCustomerStartDate: inputs.requiredCustomerStartDate,
      RequiredCustomerEndDate: inputs.requiredCustomerEndDate,
      WorkOrderReference: inputs.workOrderReference,
      Contractor: inputs.contractor,
      WorkCrewId: inputs.workCrewId,
    }
    return JSON.stringify(optionalInput)
  }

  getBodyCreateOrderWithoutOrderIdlField() {
    let order = inputs.order
    delete order.OrderId
    order.Customer = inputs.customer
    order.Asset = inputs.asset
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithoutOrderNumber() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    delete order.OrderNumber
    order.Customer = inputs.customer
    order.Asset = inputs.asset
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithoutOrderDate() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.OrderNumber = inputs.orderNumber
    delete order.OrderDate
    order.Customer = inputs.customer
    order.Asset = inputs.asset
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithoutPackagesField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.OrderNumber = inputs.orderNumber
    order.OrderDate = inputs.orderDate
    order.Customer = inputs.customer
    order.Asset = inputs.asset
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    delete order.Bundle[0].Packages
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithoutServiceTypesField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.Customer = inputs.customer
    order.Asset = inputs.asset
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    delete order.Bundle[0].Packages[0].ServiceTypes
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithoutPhotoSetsField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.Customer = inputs.customer
    order.Asset = inputs.asset
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    delete order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithAllField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.RequiredCustomerStartDate = inputs.requiredCustomerStartDate
    order.RequiredCustomerEndDate = inputs.requiredCustomerEndDate
    order.WorkOrderReference = inputs.workOrderReference
    order.AdditionalCSVFields = inputs.orderAdditionalCSVFields
    order.Contractor = inputs.contractor
    order.WorkCrewId = inputs.workCrewId
    order.Customer = inputs.customer
    order.Customer.AdditionalCSVFields = inputs.customerAdditionalCSVFields
    order.Asset = inputs.asset
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].AdditionalCSVFields =
      inputs.packageAdditionalCSVFields
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithMalformedInvalidCustomerJsonField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.OrderDate = inputs.orderDate
    order.Customer = inputs.invalidCustomerJson
    order.Asset = inputs.asset
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithMalformedInvalidAssetJsonField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.Customer = inputs.customer
    order.Asset = inputs.invalidAssetJson
    order.Bundle = inputs.bundle
    order.Bundle[0].Packages = inputs.packages
    order.Bundle[0].Packages[0].ServiceTypes = inputs.serviceTypes
    order.Bundle[0].Packages[0].ServiceTypes[0].PhotoSets = inputs.photoSetsOne
    order.Bundle[0].Packages[0].ServiceTypes[1].PhotoSets = inputs.photoSetsTwo
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithMalformedInvalidBundleArrayJsonField() {
    let order = inputs.order
    order.OrderId = inputs.nullId
    order.Customer = inputs.customer
    order.Asset = inputs.asset
    delete order.Bundle
    order.Bundle = inputs.invalidBundle
    return JSON.stringify(order)
  }

  getBodyCreateOrderWithEmptyOrderJson() {
    return JSON.stringify(inputs.emptyJson)
  }

  getBodyCreateOrderWithEmptyCustomerJson() {
    return JSON.stringify(inputs.emptyJson)
  }

  getBodyCreateOrderWithEmptyAssetJson() {
    return JSON.stringify(inputs.emptyJson)
  }
}
export const scheduling = new Scheduling()

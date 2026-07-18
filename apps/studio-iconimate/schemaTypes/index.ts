import {iconType} from './icon'
import {labVariantType} from './labVariant'

// labVariantType is an object embedded in icon.labVariants, but it still has to be
// registered here for Sanity to resolve the `labVariant` type name.
export const schemaTypes = [iconType, labVariantType]

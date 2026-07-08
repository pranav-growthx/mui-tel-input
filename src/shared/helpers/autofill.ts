import type React from 'react'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

// Keystrokes always dispatch an InputEvent carrying an inputType such as
// 'insertText' or 'deleteContentBackward'. Bulk mechanisms either declare one
// of these types, or — like browser autofill and password managers — dispatch
// a plain event with no inputType at all.
// 'insertReplacementText' covers autofill (Chrome/Firefox) and autocorrect.
const BULK_INSERT_INPUT_TYPES = new Set([
  'insertReplacementText',
  'insertFromPaste',
  'insertFromDrop'
])

function getDigits(value: string): string {
  return value.replaceAll(/\D/g, '')
}

export function matchIsBulkInsertEvent(
  event: React.ChangeEvent<HTMLInputElement>,
  previousInputValue: string
): boolean {
  const { inputType } = event.nativeEvent as Partial<InputEvent>

  if (inputType) {
    return BULK_INSERT_INPUT_TYPES.has(inputType)
  }

  // No inputType usually means a programmatic fill, but some environments omit
  // it for typing too — corroborate with a multi-digit jump, which a single
  // keystroke can never produce. Autofill on a partially typed field can slip
  // through this guard; the cost is only falling back to current behaviour.
  return (
    getDigits(event.target.value).length -
      getDigits(previousInputValue).length >
    1
  )
}

/**
 * Interpret a bulk-inserted value as a complete international number whose
 * country calling code is embedded without a leading '+' (the HTML spec
 * defines `autocomplete="tel"` as the full number including country code).
 * Returns the E.164 number when that interpretation is fully valid, otherwise
 * `null`.
 */
export function getBulkInsertedE164(inputValue: string): string | null {
  if (inputValue.startsWith('+')) {
    return null
  }

  const digits = getDigits(inputValue)

  if (!digits) {
    return null
  }

  const phoneNumber = parsePhoneNumberFromString(`+${digits}`)

  return phoneNumber?.isValid() ? phoneNumber.number : null
}

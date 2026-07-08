import type React from 'react'
import { getBulkInsertedE164, matchIsBulkInsertEvent } from '../autofill'
import '@testing-library/jest-dom/vitest'

function buildChangeEvent(
  value: string,
  inputType?: string
): React.ChangeEvent<HTMLInputElement> {
  return {
    target: { value },
    nativeEvent: inputType === undefined ? {} : { inputType }
  } as unknown as React.ChangeEvent<HTMLInputElement>
}

describe('helpers/autofill', () => {
  describe('matchIsBulkInsertEvent', () => {
    it('should return false for a keystroke', () => {
      expect(
        matchIsBulkInsertEvent(buildChangeEvent('+91 6', 'insertText'), '+91')
      ).toBe(false)
    })

    it('should return false for a deletion', () => {
      expect(
        matchIsBulkInsertEvent(
          buildChangeEvent('+91', 'deleteContentBackward'),
          '+91 6'
        )
      ).toBe(false)
    })

    it('should return true for a paste', () => {
      expect(
        matchIsBulkInsertEvent(
          buildChangeEvent('6582541458', 'insertFromPaste'),
          '+91'
        )
      ).toBe(true)
    })

    it('should return true for an autofill replacement', () => {
      expect(
        matchIsBulkInsertEvent(
          buildChangeEvent('6582541458', 'insertReplacementText'),
          '+91'
        )
      ).toBe(true)
    })

    it('should return true for a programmatic fill without inputType', () => {
      expect(
        matchIsBulkInsertEvent(buildChangeEvent('6582541458'), '+91')
      ).toBe(true)
    })

    it('should return false without inputType when only one digit was added', () => {
      expect(matchIsBulkInsertEvent(buildChangeEvent('+91 65'), '+91 6')).toBe(
        false
      )
    })
  })

  describe('getBulkInsertedE164', () => {
    it('should return null for a value already starting with +', () => {
      expect(getBulkInsertedE164('+6582541458')).toBeNull()
    })

    it('should return null for an empty value', () => {
      expect(getBulkInsertedE164('')).toBeNull()
    })

    it('should adopt an embedded Singapore calling code', () => {
      expect(getBulkInsertedE164('6582541458')).toBe('+6582541458')
    })

    it('should adopt an embedded US calling code', () => {
      expect(getBulkInsertedE164('15178365282')).toBe('+15178365282')
    })

    it('should adopt an embedded calling code in a formatted value', () => {
      expect(getBulkInsertedE164('1 (517) 836-5282')).toBe('+15178365282')
    })

    it('should return null for a bare national number that is not valid internationally', () => {
      // An Indian national number: +9876543210 is not a valid number, so the
      // caller falls back to prepending the selected calling code.
      expect(getBulkInsertedE164('9876543210')).toBeNull()
    })

    it('should return null for a partial number', () => {
      expect(getBulkInsertedE164('658')).toBeNull()
    })
  })
})

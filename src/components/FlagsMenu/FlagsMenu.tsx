import React from 'react'
import FlagMenuItem from '@components/FlagMenuItem/FlagMenuItem'
import Menu, { type MenuOwnerState, type MenuProps } from '@mui/material/Menu'
import type { MuiTelInputContinent } from '@shared/constants/continents'
import { ISO_CODES, type MuiTelInputCountry } from '@shared/constants/countries'
import { DEFAULT_LANG } from '@shared/constants/lang'
import { filterCountries } from '@shared/helpers/country'
import { getDisplayNames } from '@shared/helpers/intl'
import type { GetFlagElement } from '../../index.types'

export type FlagsMenuProps = Partial<MenuProps> & {
  isoCode: MuiTelInputCountry | null
  onlyCountries?: MuiTelInputCountry[]
  excludedCountries?: MuiTelInputCountry[]
  preferredCountries?: MuiTelInputCountry[]
  langOfCountryName?: string
  continents?: MuiTelInputContinent[]
  onSelectCountry: (isoCode: MuiTelInputCountry) => void
  getFlagElement: GetFlagElement
}

const defaultExcludedCountries: MuiTelInputCountry[] = []
const defaultOnlyCountries: MuiTelInputCountry[] = []
const defaultContinents: MuiTelInputContinent[] = []
const defaultPreferredCountries: MuiTelInputCountry[] = []

export const menuClass = 'MuiTelInput-Menu'

type MenuListSlotProps = NonNullable<FlagsMenuProps['slotProps']>['list']

const getMenuListSlotProps = (
  listSlotProps: MenuListSlotProps,
  isoCode: MuiTelInputCountry | null
): MenuListSlotProps => {
  const sharedListProps = {
    role: 'listbox',
    'aria-activedescendant': isoCode ? `country-${isoCode}` : '',
    'aria-labelledby': 'select-country'
  } as const

  if (typeof listSlotProps === 'function') {
    return (ownerState: MenuOwnerState) => {
      return {
        ...listSlotProps(ownerState),
        ...sharedListProps
      }
    }
  }

  return {
    ...listSlotProps,
    ...sharedListProps
  }
}

const FlagsMenu = ({
  anchorEl,
  isoCode,
  onSelectCountry,
  excludedCountries = defaultExcludedCountries,
  onlyCountries = defaultOnlyCountries,
  langOfCountryName = DEFAULT_LANG,
  continents = defaultContinents,
  preferredCountries = defaultPreferredCountries,
  className,
  getFlagElement,
  slotProps: menuSlotProps,
  ...restMenuProps
}: FlagsMenuProps) => {
  // eslint-disable-next-line no-restricted-syntax -- Intl.DisplayNames instantiation is expensive
  const displayNames = React.useMemo(() => {
    return getDisplayNames(langOfCountryName)
  }, [langOfCountryName])

  const countriesFiltered = filterCountries(ISO_CODES, displayNames, {
    onlyCountries,
    excludedCountries,
    continents,
    preferredCountries
  })

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      id="select-country"
      className={`${menuClass} ${className || ''}`}
      slotProps={{
        ...menuSlotProps,
        list: getMenuListSlotProps(menuSlotProps?.list, isoCode)
      }}
      {...restMenuProps}
    >
      {countriesFiltered.map((isoCodeItem) => {
        return (
          <FlagMenuItem
            onSelectCountry={onSelectCountry}
            key={isoCodeItem}
            isoCode={isoCodeItem}
            countryName={displayNames.of(isoCodeItem) || ''}
            selected={isoCodeItem === isoCode}
            id={`country-${isoCodeItem}`}
            getFlagElement={getFlagElement}
          />
        )
      })}
    </Menu>
  )
}

export default FlagsMenu

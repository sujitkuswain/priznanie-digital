import React, { useEffect, useState, useRef } from 'react'
import { useLocale } from 'next-intl'
import classnames from 'classnames'
import Fuse from 'fuse.js'
import { getNace, getNaceEnglishLabels } from '../lib/api'
import styles from './Nace.module.css'
import { AutoCompleteInput, AutoCompleteItem } from './AutoCompleteInput'

const options = {
  shouldSort: true,
  includeScore: true,
  threshold: 0.4,
  location: 30,
  distance: 100,
  minMatchCharLength: 2,
  keys: ['code', 'label', 'translit', 'labelEn'],
}

function useFuse<T>(data: T[]): Fuse<T> {
  const fuseRef = useRef(new Fuse(data, options))

  useEffect(() => {
    fuseRef.current = new Fuse(data, options)
  }, [data])

  return fuseRef.current
}

interface Nace {
  code: string
  label: string
  labelEn?: string
}

// the stored value keeps the official Slovak label, it is written to the tax form XML
const formatNace = (nace: Fuse.FuseResult<Nace>): AutoCompleteItem => ({
  id: nace?.item?.code,
  value: `${nace?.item?.code} - ${nace?.item?.label}`,
  displayLabel: nace?.item?.labelEn
    ? `${nace.item.code} - ${nace.item.labelEn}`
    : undefined,
})

export const Nace: React.FC = () => {
  const locale = useLocale()
  const [naceData, setNaceData] = useState<Nace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fuse = useFuse(naceData)

  const fetchData = async () => {
    setIsLoading(true)
    const result: Nace[] = await getNace()
    if (locale === 'en') {
      const englishLabels = await getNaceEnglishLabels()
      setNaceData(
        result.map((item) => ({ ...item, labelEn: englishLabels[item.code] })),
      )
    } else {
      setNaceData(result)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [locale])

  // show the English label for a selected code; the stored value stays Slovak
  const formatDisplayValue = (value: string) => {
    const code = value?.split(' - ')[0]
    const nace = naceData.find((item) => item.code === code)
    return nace?.labelEn && value === `${nace.code} - ${nace.label}`
      ? `${nace.code} - ${nace.labelEn}`
      : value
  }

  const searchNace = (value) => {
    const searchResult = fuse.search(value)
    return searchResult.length === 0
      ? naceData.map((item) => ({ item, score: 1, refIndex: 0 }))
      : searchResult
  }

  return (
    <div
      className={classnames([
        'govuk-form-group',
        isLoading ? [styles.autocompleteFieldLoading] : '',
        styles.relative,
        styles.autocompleteField,
      ])}
    >
      <AutoCompleteInput
        name="r003_nace"
        label="NACE"
        minLength={0}
        formatDisplayValue={formatDisplayValue}
        fetchData={async (value: string) => {
          const data = searchNace(value) as Fuse.FuseResult<Nace>[]
          return data.map((nace) => formatNace(nace))
        }}
      />
    </div>
  )
}

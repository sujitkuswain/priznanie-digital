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

interface NaceIndex {
  data: Nace[]
  fuse: Fuse<Nace>
}

const loadNace = async (locale: string): Promise<NaceIndex> => {
  const result: Nace[] = await getNace()
  const englishLabels = locale === 'en' ? await getNaceEnglishLabels() : {}
  const data = result.map((item) => ({
    ...item,
    labelEn: englishLabels[item.code],
  }))
  return { data, fuse: new Fuse(data, options) }
}

export const Nace: React.FC = () => {
  const locale = useLocale()
  const [naceData, setNaceData] = useState<Nace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  // searches wait for this, so typing before the list has loaded still finds results
  const naceIndex = useRef<Promise<NaceIndex>>(null)

  const fetchData = async () => {
    setIsLoading(true)
    naceIndex.current = loadNace(locale)
    const { data } = await naceIndex.current
    setNaceData(data)
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

  const searchNace = async (value: string) => {
    if (!naceIndex.current) {
      return []
    }
    const { data, fuse } = await naceIndex.current
    const searchResult = fuse.search(value)
    return searchResult.length === 0
      ? data.map((item) => ({ item, score: 1, refIndex: 0 }))
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
          const data = await searchNace(value)
          return data.map((nace) => formatNace(nace))
        }}
      />
    </div>
  )
}

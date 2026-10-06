import { useTranslation } from 'react-i18next'
import { C } from '../theme.js'

// One-line note shown directly below every map that draws Living Lab boundaries (the landing
// overview and each LL detail map, in all three layouts), flagging that the regions are not yet
// final. Teal rather than C.muted so the small text keeps a legible contrast on white and C.bg.
const BASE_STYLE = {
  margin: 0,
  fontSize: 12,
  lineHeight: 1.4,
  fontStyle: 'italic',
  color: C.teal,
}

export function MapDisclaimer({ style }) {
  const { t } = useTranslation()
  return <p style={{ ...BASE_STYLE, ...style }}>{t('map.boundaryDisclaimer')}</p>
}

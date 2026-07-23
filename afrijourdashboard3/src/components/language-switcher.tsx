import { IconCheck, IconLanguage } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type Locale,
  normalizeLocale,
} from '@/i18n/config'

/**
 * Language switcher — swaps the /:lang/ URL prefix by hard-navigating.
 *
 * We use a hard navigate (not react-router `navigate`) because the router
 * uses `basename` to strip the current language segment; changing the
 * basename requires a fresh router instance, which comes for free from a
 * full page load.
 */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  const currentSegment = window.location.pathname.split('/')[1] ?? ''
  const current = normalizeLocale(
    (SUPPORTED_LOCALES as readonly string[]).includes(currentSegment)
      ? currentSegment
      : i18n.language,
  )

  function switchTo(next: Locale) {
    if (next === current) return
    try {
      window.localStorage.setItem('i18nextLng', next)
    } catch {
      /* private mode / storage disabled — non-fatal */
    }
    const segments = window.location.pathname.split('/').filter(Boolean)
    if (
      segments[0] &&
      (SUPPORTED_LOCALES as readonly string[]).includes(segments[0])
    ) {
      segments[0] = next
    } else {
      segments.unshift(next)
    }
    const target =
      '/' + segments.join('/') + window.location.search + window.location.hash
    window.location.assign(target)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className='inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/80 hover:bg-muted hover:text-foreground'
        aria-label={t('language.change')}
        title={t('language.change')}
      >
        <IconLanguage size={18} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-44'>
        <DropdownMenuLabel>{t('language.label')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORTED_LOCALES.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => switchTo(code)}
            className='flex items-center justify-between'
          >
            <span>{LOCALE_LABELS[code]}</span>
            {code === current ? <IconCheck size={14} /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSwitcher

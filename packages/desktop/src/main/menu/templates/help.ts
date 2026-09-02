import { shell, type BrowserWindow, type MenuItemConstructorOptions } from 'electron'
import * as actions from '../actions/help'
import { t } from '../../i18n'

export default function(): MenuItemConstructorOptions {
  const submenu: MenuItemConstructorOptions[] = [
    {
      label: t('menu.help.markdownReference'),
      click() {
        shell.openExternal(
          'https://marktext.me/docs/markdown-syntax'
        )
      }
    },
    {
      label: t('menu.help.changelog'),
      click() {
        shell.openExternal('https://github.com/marktext/marktext/releases')
      }
    },
    {
      type: 'separator'
    },
    {
      label: t('menu.help.followUs'),
      click() {
        shell.openExternal('https://twitter.com/marktextapp')
      }
    },
    {
      label: t('menu.help.support'),
      click() {
        shell.openExternal('https://github.com/sponsors/marktext')
      }
    },
    {
      type: 'separator'
    },
    {
      label: t('menu.help.askQuestion'),
      click() {
        shell.openExternal('https://github.com/marktext/marktext/discussions')
      }
    },
    {
      label: t('menu.help.reportBug'),
      click() {
        shell.openExternal('https://github.com/marktext/marktext/issues')
      }
    },
    {
      label: t('menu.help.viewSource'),
      click() {
        shell.openExternal('https://github.com/marktext/marktext')
      }
    },
    {
      type: 'separator'
    },
    {
      label: t('menu.help.license'),
      click() {
        shell.openExternal('https://github.com/marktext/marktext/blob/develop/LICENSE')
      }
    }
  ]

  const helpMenu: MenuItemConstructorOptions = {
    label: t('menu.help.help'),
    role: 'help',
    submenu
  }

  if (process.platform !== 'darwin') {
    submenu.push(
      {
        type: 'separator'
      },
      {
        label: t('menu.help.about'),
        click(_menuItem, browserWindow) {
          actions.showAboutDialog(browserWindow as BrowserWindow | undefined)
        }
      }
    )
  }
  return helpMenu
}

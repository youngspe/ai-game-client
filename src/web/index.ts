import React from 'react'
import { AppRegistry } from 'react-native'

import App from '../common/App'
import { AppModel, Device } from '../common/viewModels/AppModel'

const device: Device = {
    window: {
        setBackground(color) {
            document.body.style.backgroundColor = color
        },
    },
    history: {
        exit() {
            if (history.length > 2) {
                history.go(-2)
            }
        }
    },
    tokenStore: {
        load() {
            return localStorage.getItem('aiGameClient/token')
        },
        store(token: string) {
            localStorage.setItem('aiGameClient/token', token)
        },
    },
    baseUrlHttp: `${location.protocol}//${location.host}/api/`,
    baseUrlWs: `${location.protocol == 'https:' ? 'wss:' : 'ws:'}//${location.host}/api/`,
}

console.log(device)

addEventListener('popstate', ({ state }) => {
    if (state == 'BACK') {
        history.pushState('DEFAULT', '')
        device.history?.onBackListener?.()
    }
})

if (history.state != 'DEFAULT') {
    history.replaceState('BACK', '')
    history.pushState('DEFAULT', '')
}
const appModel = new AppModel(device)
AppRegistry.registerComponent('App', () => () => React.createElement(App, { appModel }));
AppRegistry.runApplication('App', { rootTag: document.getElementById('react-root') })

import React from 'react'
import { AppRegistry } from 'react-native'

import App, { Device } from '../common/App'

const device: Device = {
    window: {
        setBackground(color) {
            document.body.style.backgroundColor = color
        },
    }
}

AppRegistry.registerComponent('App', () => () => React.createElement(App, { device }));
AppRegistry.runApplication('App', { rootTag: document.getElementById('react-root') })

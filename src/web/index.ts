import React from 'react'
import { AppRegistry } from 'react-native'
import { App } from '../common/App'
import { WebApp, WebAppModule } from './WebModule'

Error.stackTraceLimit = Infinity
WebAppModule.inject({ WebApp, App }, ({ WebApp, App }) => {
    AppRegistry.registerComponent('App', () => () => React.createElement(App, {}));
    AppRegistry.runApplication('App', { rootTag: document.getElementById('react-root') })
    WebApp.initApp()
})


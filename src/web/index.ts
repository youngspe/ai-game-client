import React from 'react'
import { AppRegistry } from 'react-native'
import { App } from '../common/App'
import { AppModel } from '../common/viewModels/AppModel'
import { WebApp, WebAppModule } from './WebModule'
import { Navigator } from '../common/utils/navigator'

WebAppModule.inject({ WebApp, App, nav: Navigator }, ({ WebApp, App, nav }) => {
    AppRegistry.registerComponent('App', () => () => React.createElement(App, { nav }));
    AppRegistry.runApplication('App', { rootTag: document.getElementById('react-root') })
    WebApp.initApp()
})

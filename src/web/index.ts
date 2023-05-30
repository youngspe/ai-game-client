import { AppRegistry } from 'react-native'

import App from '../common/App'

AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', { rootTag: document.getElementById('react-root') })

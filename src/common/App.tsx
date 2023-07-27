import React from 'react'
import { MyTheme, ThemeProps } from './Theme'
import { MainMenu } from './components/MainMenu'
import { Lobby } from './components/Lobby'
import { AppModel } from './viewModels/AppModel'
import { useReactive } from './utils/Reactive'
import MainMenuViewModel from './viewModels/MainMenuViewModel'
import { GameModel } from './viewModels/GameModel'
import { GameContainer } from './components/GameContainer'

export default function App({ appModel }: { appModel: AppModel }) {
    let { currentViewModel } = useReactive(appModel.props)
    let themeProps: ThemeProps<typeof MyTheme> = {
        accent: '#0080FF',
        background: '#101010',
        foreground: '#E8E8E8',
    }
    appModel.device.window?.setBackground?.(themeProps.background)

    return <MyTheme.Init {...themeProps}>
        {currentViewModel instanceof MainMenuViewModel && <MainMenu viewModel={currentViewModel} />}
        {currentViewModel instanceof GameModel && <GameContainer viewModel={currentViewModel} />}
    </MyTheme.Init>
}

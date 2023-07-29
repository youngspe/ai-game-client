import React from 'react'
import { MyTheme, ThemeProps } from './Theme'
import { MainMenu } from './components/MainMenu'
import { MainMenuViewModel } from './viewModels/MainMenuViewModel'
import { GameModel } from './viewModels/GameModel'
import { GameContainer } from './components/GameContainer'
import { FactoryKey, Target } from 'checked-inject'
import { WindowManager } from './CommonModule'
import { Navigator } from './utils/navigator'
import { useStateObservable } from './utils/rxUtils'

export const App = class extends FactoryKey({ winMgr: WindowManager }, ({ winMgr }, { nav }: { nav: Navigator }) => {
    let currentViewModel = useStateObservable(nav.currentViewModel)
    let themeProps: ThemeProps<typeof MyTheme> = {
        accent: '#0080FF',
        background: '#101010',
        foreground: '#E8E8E8',
    }
    winMgr.setBackground?.(themeProps.background)

    return <MyTheme.Init {...themeProps}>
        {currentViewModel instanceof MainMenuViewModel && <MainMenu viewModel={currentViewModel} />}
        {currentViewModel instanceof GameModel && <GameContainer viewModel={currentViewModel} />}
    </MyTheme.Init>
}) { private _: any }

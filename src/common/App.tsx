import React, { useMemo } from 'react'
import { MainMenuViewModel } from './viewModels/MainMenuViewModel'
import { GameModel } from './viewModels/GameModel'
import { MyTheme, ThemeProps } from './Theme'
import { MainMenu } from './components/MainMenu'
import { GameContainer } from './components/GameContainer'
import { FactoryKey, Inject } from 'checked-inject'
import { WindowManager } from './CommonModule'
import { Navigator } from './utils/navigator'
import { useStateObservable } from './utils/rxUtils'

export const App = class extends FactoryKey(Inject.lazy({ winMgr: WindowManager, nav: Navigator }), (deps, { }: {}) => {
    const { winMgr, nav } = useMemo(deps, [])
    const currentViewModel = useStateObservable(nav.currentViewModel)
    const themeProps: ThemeProps<typeof MyTheme> = {
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

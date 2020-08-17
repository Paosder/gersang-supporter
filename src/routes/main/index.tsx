import { ipcRenderer } from 'electron';
import {
  Route, Switch, RouteComponentProps, Link,
} from 'react-router-dom';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import IconButton from 'react-uwp/IconButton';
import { ThemeProps } from 'react-uwp';
import { useSelector, useDispatch } from 'react-redux';
import { GlobalState } from '@common/reducer';
import { EnumLoginState } from '@common/reducer/login/types';
import { reqGameExecute, reqOpenConfig, buildTrayContextMenu } from '@common/ipc/req';
import { executeDirect } from '@common/reducer/login/action';
import LoginForm from './login';
import Clock from './clock';

const MainLayout = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  background-color: #eeeeee;

  > * {
    flex-grow: 1;
  }

  > :first-child {
    flex: none;
  }
`;

const LeftMenu = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

const Features = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 195px;
  overflow-y: auto;
`;
interface ExecuteAccountArgs {
  index: number;
}

const Main: React.FC<RouteComponentProps & ThemeProps> = ({ match, theme }) => {
  const configClients = useSelector((state: GlobalState) => state.config.clients);
  const loginClients = useSelector((state: GlobalState) => state.login.clients);
  const dispatch = useDispatch();

  useEffect(() => {
    // rebuild tray context menu.
    const trayMenuInfo = configClients.map((el, i) => ({
      title: el.title,
      index: i,
    }));
    buildTrayContextMenu({
      clients: trayMenuInfo,
    });

    const executeAccount = (e: Electron.IpcRendererEvent, args: ExecuteAccountArgs) => {
      dispatch(executeDirect(args.index));
    };

    ipcRenderer.on('execute-client', executeAccount);

    return () => {
      ipcRenderer.off('execute-client', executeAccount);
    };
  }, [configClients, configClients.length, dispatch, loginClients.length]);

  return (
  <MainLayout>
    <LeftMenu>
      <Features>
        <Link to={`${match.path}`}>
          <IconButton>
              GuestUser
          </IconButton>
        </Link>
        <Link to={`${match.url}/clock`}>
          <IconButton>
              ClockLegacy
          </IconButton>
        </Link>
        {/* <IconButton>
            CalculatorLegacy
        </IconButton>
        <IconButton>
            CharactersLegacy
        </IconButton> */}
        {/* <IconButton>
            ChatBubbles
          </IconButton> */}
      </Features>
      <IconButton
        onClick={reqOpenConfig}
      >
        SettingsLegacy
      </IconButton>
    </LeftMenu>
    <Switch>
      <Route exact path={match.path} component={LoginForm} />
      <Route path={`${match.path}/clock`} component={Clock} />
    </Switch>
  </MainLayout>
  );
};
export default Main;

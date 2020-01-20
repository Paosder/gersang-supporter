import { ipcRenderer } from 'electron';
import {
  Route, Switch, RouteComponentProps, Link,
} from 'react-router-dom';
import React from 'react';
import styled from 'styled-components';
import IconButton from 'react-uwp/IconButton';
import { ThemeProps } from 'react-uwp';
import LoginForm from './login';
import Clock from './clock';

const MainLayout = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  background-color: #eeeeee;
  /* justify-content: space-between; */

  > * {
    flex-grow: 1;
  }

  > :first-child {
    flex: none;
    /* background-color: rgb(0, 120, 215); */
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


const openConfig = () => {
  ipcRenderer.send('configuration', '');
};

const Main: React.FC<RouteComponentProps & ThemeProps> = ({ match, theme }) => {
  // alert(match.url);
  const t = 4;
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
          <IconButton>
            CalculatorLegacy
          </IconButton>
          <IconButton>
            CharactersLegacy
          </IconButton>
          {/* <IconButton>
            ChatBubbles
          </IconButton> */}
        </Features>
        <IconButton
          onClick={openConfig}
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

import { ipcRenderer } from 'electron';
import {
  Route, Switch, RouteComponentProps,
} from 'react-router-dom';
import React from 'react';
import path from 'path';
import url from 'url';
import styled from 'styled-components';
import IconButton from 'react-uwp/IconButton';
import { ThemeProps } from 'react-uwp';
import LoginForm from './login';

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

const openConfig = () => {
  ipcRenderer.send('configuration', '');
};

const Main: React.FC<RouteComponentProps & ThemeProps> = ({ match, theme }) => (
  <MainLayout>
    <IconButton
      onClick={openConfig}
    >
SettingsLegacy
    </IconButton>
    <Switch>
      <Route exact path={match.path} component={LoginForm} />
    </Switch>
  </MainLayout>
);

export default Main;

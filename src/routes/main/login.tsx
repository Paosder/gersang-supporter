import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import Tabs, { Tab } from 'react-uwp/Tabs';
import { ipcRenderer } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import { configReload } from '@common/reducer/config/action';
import { GlobalState } from '@common/reducer';
import { reInitActiveClients } from '@common/reducer/login/action';
import LoginForm from './login-form';

const LoginLayout = styled.div`
  background-color: white;
  padding: 0 0.1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

// const StatusBar = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 0 0.5rem;

//   > span {
//     font-size: 14px;
//     line-height: 25px;
//   }
// `;

const LoginTabs: React.FC = () => {
  const dispatch = useDispatch();
  const clientLength = useSelector((state: GlobalState) => state.config.clients.length);
  const clients = useSelector((state: GlobalState) => state.config.clients);
  const activeClients = useSelector((state: GlobalState) => state.login.clients.length);
  useEffect(() => {
    const reloadCallback = () => {
      dispatch(configReload());
    };
    ipcRenderer.on('change-config', reloadCallback);
    return () => {
      ipcRenderer.off('change-config', reloadCallback);
    };
  }, [dispatch]);

  useEffect(() => {
    if (activeClients !== clientLength) {
      // custom client length.
      dispatch(reInitActiveClients(clientLength));
    }
  }, [activeClients, clientLength, dispatch]);

  const tabs = useMemo(() => {
    const renderTabs: React.ReactElement[] = [];
    for (let i = 0; i < clientLength; i += 1) {
      const title = clients[i].title ? clients[i].title : `${i + 1}번`;
      renderTabs.push(
        <Tab title={title} key={title}>
          <LoginForm index={i} />
        </Tab>,
      );
    }
    return renderTabs;
  }, [clientLength, clients]);

  return (
    <LoginLayout>
      <Tabs
        tabTitleStyle={{
          userSelect: 'none',
        // width: '100%',
        }}
      >
        {tabs}
      </Tabs>
      {/* <StatusBar>
        <span> 준비. </span>
      </StatusBar> */}
    </LoginLayout>
  );
};

export default LoginTabs;

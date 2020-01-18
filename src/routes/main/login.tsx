import React, {
  useEffect, useRef, KeyboardEvent, useState, useCallback,
} from 'react';
import TextBox from 'react-uwp/TextBox';
import PasswordBox from 'react-uwp/PasswordBox';
import Icon from 'react-uwp/Icon';
import Button from 'react-uwp/Button';
import styled from 'styled-components';
import Tabs, { Tab } from 'react-uwp/Tabs';
import { ipcRenderer } from 'electron';

// import ProgressBar from 'react-uwp/ProgressBar';
import ProgressRing from 'react-uwp/ProgressRing';


const ClientLayout = styled.div`
  /* background-color: #eeeeee; */
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  width: calc(100vw - 48px);
  /* height: 200px; */
  align-items: center;
  > * {
    margin-bottom: 0.5rem;
  }
`;

const CommandButtons = styled.div`
  display: flex;
  justify-content: space-around;
  > * {
    margin: 0 0.5rem 0 0.5rem;
  }
`;

const style = {
  margin: '0 8px',
};

enum LoginState {
  AUTH_FAILED,
  LOGOUT,
  WAIT_OTP,
  SEND_AUTH,
  SEND_OTP,
  LOGIN,
}

interface LoginResponse {
  status: boolean;
  reason?: string;
}

const LoginForm: React.FC = () => {
  const idRef = useRef<TextBox>(null);
  const pwRef = useRef<PasswordBox>(null);
  const [loginState, setLoginState] = useState<LoginState>(LoginState.LOGOUT);

  const requestLogin = useCallback(() => {
    if (loginState === LoginState.LOGIN) {
      requestLogout();
      return;
    }
    const id = idRef.current!.getValue();
    const password = pwRef.current!.getValue();
    ipcRenderer.send('request-login', {
      id,
      password,
    });
    setLoginState(LoginState.SEND_AUTH);
  }, [loginState]);

  const requestLogout = () => {
    ipcRenderer.send('request-logout', '');
  };

  const onKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      requestLogin();
    }
  };

  useEffect(() => {
    ipcRenderer.on('request-login', (event, res: LoginResponse) => {
      if (res.status) {
        setLoginState(LoginState.LOGIN);
      } else if (res.reason === 'OTP_AUTH_REQUIRED') {
        setLoginState(LoginState.WAIT_OTP);
      }
    });

    ipcRenderer.on('request-logout', (event, res: LoginResponse) => {
      if (res.status) {
        setLoginState(LoginState.LOGOUT);
      } else {
        alert(`unknown response!${res}`);
      }
    });
  }, []);

  const isAuthenticating = (loginState >= LoginState.SEND_AUTH
    && loginState <= LoginState.SEND_OTP);

  const isLoggedIn = loginState === LoginState.LOGIN;

  return (
    <ClientLayout>
      <TextBox
        background="none"
        placeholder="아이디를 입력해주세요"
        rightNode={<Icon style={style}>Emoji2Legacy</Icon>}
        style={{
          height: '2rem',
        }}
        ref={idRef}
        onKeyPress={onKeyPress}
      />
      <PasswordBox
        placeholder="Password"
        style={{
          height: '2rem',
        }}
        ref={pwRef}
        onKeyPress={onKeyPress}
      />
      <PasswordBox
        placeholder="OTP?"
        defaultShowPassword
        style={{
          height: '2rem',
        }}
      />
      <CommandButtons>
        {(loginState === LoginState.LOGOUT)
          && (
          <Button onClick={requestLogin} disabled={isAuthenticating}>
            로그인
          </Button>
          )}
        {(loginState === LoginState.LOGIN)
          && (
          <Button onClick={requestLogout}>
            로그아웃
          </Button>
          )}
        <Button disabled>
        출석 체크
        </Button>
        <Button>
        실행
        </Button>
      </CommandButtons>
      {isAuthenticating && (<ProgressRing size={25} />)}
    </ClientLayout>
  );
};

const LoginLayout = styled.div`
  background-color: white;
  padding: 0 0.1rem;
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5rem;

  > span {
    font-size: 14px;
    line-height: 25px;
  }
`;

const LoginTabs: React.FC = () => {
  const t = 4;
  return (
    <LoginLayout>
      <Tabs
        tabTitleStyle={{
          userSelect: 'none',
        // width: '100%',
        }}
      >
        <Tab title="1">
          <LoginForm />
        </Tab>
        <Tab title="2">
          <LoginForm />
        </Tab>
        <Tab title="3">
          <LoginForm />
        </Tab>
      </Tabs>
      {/* <StatusBar>
        <span> 준비. </span>

      </StatusBar> */}
    </LoginLayout>
  );
};

export default LoginTabs;

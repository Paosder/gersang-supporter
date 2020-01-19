import React, {
  useEffect, useRef, KeyboardEvent, useState, useCallback,
} from 'react';
import TextBox from 'react-uwp/TextBox';
import PasswordBox from 'react-uwp/PasswordBox';
import Icon from 'react-uwp/Icon';
import Button from 'react-uwp/Button';
import styled from 'styled-components';
import Tabs, { Tab } from 'react-uwp/Tabs';
import { ipcRenderer, IpcRendererEvent, remote } from 'electron';
import ProgressBar from 'react-uwp/ProgressBar';
import ProgressRing from 'react-uwp/ProgressRing';
import CheckBox from 'react-uwp/CheckBox';
import { useSelector, useDispatch } from 'react-redux';
import {
  setAutoSave, ConfigData, setUserInfo, configReload,
} from '@common/reducer/config/action';
import { setStatus, EnumLoginState as LoginState } from '@common/reducer/main/action';
import { GlobalState } from '@common/reducer';
import { decrypt } from '@common/constant';


const ClientLayout = styled.div`
  /* background-color: #eeeeee; */
  padding-top: 2rem;
  padding-bottom: 3rem;
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

const WarnTitle = styled.span`
  position: absolute;
  top: 0.5rem;
  color: red;
  user-select: none;
`;

const PathInfo = styled.span`
  position: absolute;
  bottom: 0;
  color: #858585;
`;

const style = {
  margin: '0 8px',
};

interface LoginResponse {
  status: boolean;
  reason?: string;
}

interface LogoutResponse {
  error: boolean;
  reason?: string;
}

interface LoginFormProps {
  config: ConfigData;
  index: number;
}

const LoginForm: React.FC<LoginFormProps> = ({ config, index }) => {
  const idRef = useRef<TextBox>(null);
  const pwRef = useRef<PasswordBox>(null);
  const saveRef = useRef<CheckBox>(null);
  const loginState = useSelector((state: GlobalState) => state.main.status);
  const loginIndex = useSelector((state: GlobalState) => state.main.clientIndex);
  const isEncrypted = useSelector((state: GlobalState) => state.config.encrypted);
  const [pending, setPending] = useState<number>(0);
  const dispatch = useDispatch();

  const requestLogin = useCallback(() => {
    if (pending > 0) return;
    if (loginState === LoginState.LOGIN) {
      requestLogout();
      return;
    }
    if (loginState !== LoginState.LOGOUT) return;

    const id = idRef.current!.getValue();
    const password = pwRef.current!.getValue();
    ipcRenderer.send('request-login', {
      id,
      password,
    });
    dispatch(setStatus(index, LoginState.SEND_AUTH));
    // setLoginState(LoginState.SEND_AUTH);
  }, [dispatch, index, loginState, pending]);

  const requestLogout = () => {
    ipcRenderer.send('request-logout', false);
  };

  const requestGameExecute = () => {
    ipcRenderer.send('execute-game', {
      index,
      path: config!.path,
    }); // set client number
  };

  const onKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      requestLogin();
    }
  };

  const toggleSaveConfig = (checked?: boolean) => {
    dispatch(setAutoSave(checked || false, index));
  };

  useEffect(() => {
    if (config) {
      if (idRef && idRef.current
        && pwRef && pwRef.current) {
        if (isEncrypted === 'true') {
          idRef.current!.setValue(decrypt(config.username));
          pwRef.current!.setValue(decrypt(config.password));
        } else {
          idRef.current!.setValue(config.username);
          pwRef.current!.setValue(config.password);
        }
      }
    }
  }, [config, idRef, isEncrypted, pwRef]);

  useEffect(() => {
    const requestLoginCallback = (event: IpcRendererEvent, res: LoginResponse) => {
      if (res.status) {
        // setLoginState(LoginState.LOGIN);
        if (config.alwaysSave === 'true') {
          dispatch(setUserInfo(
            idRef.current!.getValue(),
            pwRef.current!.getValue(),
            index,
          ));
        }
        dispatch(setStatus(index, LoginState.LOGIN));
      } else if (res.reason === 'OTP_AUTH_REQUIRED') {
        // setLoginState(LoginState.WAIT_OTP);
        dispatch(setStatus(index, LoginState.WAIT_OTP));
      }
    };

    const requestLogoutCallback = (event: IpcRendererEvent, res: LogoutResponse) => {
      if (res.error) {
        // setLoginState(LoginState.LOGOUT);
        setPending(5);
        // remote.dialog.showErrorBox('알 수 없는 오류!',
        //   `알 수 없는 오류입니다 T.T
        //   ${JSON.stringify(res)}`);
      }
      dispatch(setStatus(index, LoginState.LOGOUT));
    };
    ipcRenderer.on('request-login', requestLoginCallback);
    ipcRenderer.on('request-logout', requestLogoutCallback);
    return () => {
      ipcRenderer.off('request-login', requestLoginCallback);
      ipcRenderer.off('request-logout', requestLogoutCallback);
    };
  }, [config.alwaysSave, dispatch, index, idRef, pwRef]);

  useEffect(() => {
    let interval: number;
    if (pending > 0) {
      interval = setInterval(() => {
        setPending(pending - 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [pending]);

  const isAuthenticating = (loginState >= LoginState.SEND_AUTH
    && loginState <= LoginState.SEND_OTP);

  const isLoggedIn = loginState === LoginState.LOGIN;
  return (
    <ClientLayout>
      {(loginIndex !== index)
        && (
        <WarnTitle>
          현재
          {loginIndex + 1}
          클이 활성화되어 있습니다.
        </WarnTitle>
        )}
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
      <CheckBox
        label="로그인에 성공할 경우 로그인 정보 저장하기"
        defaultChecked={config.alwaysSave === 'true'}
        onCheck={toggleSaveConfig}
        ref={saveRef}
        style={{
          userSelect: 'none',
        }}
      />
      <CommandButtons>
        {(!isLoggedIn)
          && (
          <Button
            onClick={requestLogin}
            disabled={isAuthenticating || pending > 0}
            style={{ position: 'relative' }}
          >
            로그인
            <ProgressBar
              barWidth={76}
              style={{
                position: 'absolute',
                left: '-2px',
                bottom: '-2px',
                display: pending > 0 ? 'block' : 'none',
              }}
              defaultProgressValue={pending * 0.2}
            />
          </Button>
          )}
        {(isLoggedIn)
          && (
          <Button onClick={requestLogout}>
            로그아웃
          </Button>
          )}
        <Button disabled>
        출석 체크
        </Button>
        <Button disabled={!isLoggedIn} onClick={requestGameExecute}>
        게임 실행
        </Button>
      </CommandButtons>
      <PathInfo>
        경로:&nbsp;
        {config.path}
      </PathInfo>
      {isAuthenticating && (<ProgressRing size={25} />)}
    </ClientLayout>
  );
};

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
  const config = useSelector((state: GlobalState) => state.config);
  const dispatch = useDispatch();

  useEffect(() => {
    const reloadCallback = () => {
      dispatch(configReload());
    };
    ipcRenderer.on('change-config', reloadCallback);
    return () => {
      ipcRenderer.off('change-config', reloadCallback);
    };
  }, [dispatch]);

  return (
    <LoginLayout>
      <Tabs
        tabTitleStyle={{
          userSelect: 'none',
        // width: '100%',
        }}
      >
        <Tab title="1클">
          <LoginForm index={0} config={config && config.clients[0]} />
        </Tab>
        <Tab title="2클">
          <LoginForm index={1} config={config && config.clients[1]} />
        </Tab>
        <Tab title="3클">
          <LoginForm index={2} config={config && config.clients[2]} />
        </Tab>
      </Tabs>
      {/* <StatusBar>
        <span> 준비. </span>
      </StatusBar> */}
    </LoginLayout>
  );
};

export default LoginTabs;

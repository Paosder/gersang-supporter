import { ipcRenderer, IpcRendererEvent, remote } from 'electron';
import React, {
  useEffect, useRef, KeyboardEvent, useState, useCallback,
} from 'react';
import TextBox from 'react-uwp/TextBox';
import PasswordBox from 'react-uwp/PasswordBox';
import Icon from 'react-uwp/Icon';
import Button from 'react-uwp/Button';
import ProgressBar from 'react-uwp/ProgressBar';
import ProgressRing from 'react-uwp/ProgressRing';
import CheckBox from 'react-uwp/CheckBox';
import { GlobalState } from '@common/reducer';
import { decrypt } from '@common/constant';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import {
  setAutoSave, setAutoRestore, setUserInfo,
} from '@common/reducer/config/action';
import { setStatus } from '@common/reducer/login/action';
import { EnumLoginState as LoginState } from '@common/reducer/login/types';
import { reqLogin, reqGameExecute, reqLogout } from '@common/ipc/req';

const ClientLayout = styled.div`
  padding-top: 2rem;
  padding-bottom: 3rem;
  display: flex;
  flex-direction: column;
  width: calc(100vw - 48px);
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

// const WarnTitle = styled.span`
//   position: absolute;
//   top: 0.5rem;
//   color: red;
//   user-select: none;
// `;

const PathInfo = styled.span`
  position: absolute;
  bottom: 0;
  color: #858585;
`;

const AlignLeft = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0 2rem 1rem;
  margin: -3px;

  > * {
    margin: 3px;
  }
`;

const style = {
  margin: '0 8px',
};

const passwordStyle = {
  paddingLeft: 0,
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
  index: number;
}
const LoginForm: React.FC<LoginFormProps> = ({ index }) => {
  const idRef = useRef<TextBox>(null);
  const pwRef = useRef<PasswordBox>(null);
  const loginState = useSelector((state: GlobalState) => state.login.clients[index].status);
  const isEncrypted = useSelector((state: GlobalState) => state.config.encrypted);
  const config = useSelector((state: GlobalState) => state.config.clients[index]);
  const restorePath = useSelector((state: GlobalState) => state.config.clients[0].path);

  const [pending, setPending] = useState<number>(0);
  const dispatch = useDispatch();

  const requestLogout = useCallback(() => {
    reqLogout(index, false);
  }, [index]);

  const requestLogin = useCallback(() => {
    if (pending > 0) return;
    if (loginState === LoginState.LOGIN) {
      requestLogout();
      return;
    }
    if (loginState !== LoginState.LOGOUT) return;

    const id = idRef.current!.getValue().trim();
    const password = pwRef.current!.getValue().trim();
    if (!id || !password) {
      remote.dialog.showErrorBox('킹갓 근본 에러',
        '아이디 혹은 비밀번호가 공란이에요!');
      return;
    }
    reqLogin(index, id, password);
    dispatch(setStatus(index, LoginState.SEND_AUTH));
    // setLoginState(LoginState.SEND_AUTH);
  }, [dispatch, index, loginState, pending, requestLogout]);



  const requestGameExecute = () => {
    reqGameExecute(index, config.path,
      config.alwaysRestore === 'true',
      restorePath);
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

  const toggleRestoreConfig = (checked?: boolean) => {
    dispatch(setAutoRestore(checked || false, index));
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
    const responseLoginCallback = (event: IpcRendererEvent, res: LoginResponse) => {
      if (res.status) {
        if (config.alwaysSave === 'true') {
          dispatch(setUserInfo(
            idRef.current!.getValue(),
            pwRef.current!.getValue(),
            index,
          ));
        }
        dispatch(setStatus(index, LoginState.LOGIN));
      } else if (res.reason === 'OTP_AUTH_REQUIRED') {
        dispatch(setStatus(index, LoginState.WAIT_OTP));
      }
    };

    const responseLogoutCallback = (event: IpcRendererEvent, res: LogoutResponse) => {
      if (res.error) {
        setPending(5);
        // remote.dialog.showErrorBox('알 수 없는 오류!',
        //   `알 수 없는 오류입니다 T.T
        //   ${JSON.stringify(res)}`);
      }
      dispatch(setStatus(index, LoginState.LOGOUT));
    };
    ipcRenderer.on('response-login', responseLoginCallback);
    ipcRenderer.on('response-logout', responseLogoutCallback);
    return () => {
      ipcRenderer.off('response-login', responseLoginCallback);
      ipcRenderer.off('response-logout', responseLogoutCallback);
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
      {/* {(loginIndex !== index)
        && (
        <WarnTitle>
          현재&nbsp;
          {loginIndex + 1}
          클이 활성화되어 있습니다.
        </WarnTitle>
        )} */}
      <TextBox
        background="none"
        placeholder="아이디를 입력해주세요"
        rightNode={<Icon style={style}>Emoji2Legacy</Icon>}
        ref={idRef}
        onKeyPress={onKeyPress}
      />
      <PasswordBox
        placeholder="Password"
        ref={pwRef}
        onKeyPress={onKeyPress}
        style={passwordStyle}
      />
      <AlignLeft>
        <CheckBox
          label="로그인에 성공할 경우 로그인 정보 저장하기"
          defaultChecked={config.alwaysSave === 'true'}
          onCheck={toggleSaveConfig}
          style={{
            userSelect: 'none',
          }}
        />
        <CheckBox
          label="게임 실행전 클라이언트 변조 현상 항상 복구"
          defaultChecked={config.alwaysRestore === 'true'}
          disabled={index === 0}
          onCheck={toggleRestoreConfig}
          style={{
            userSelect: 'none',
          }}
        />
      </AlignLeft>
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

export default LoginForm;

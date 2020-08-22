import React, {
  useRef, useEffect, useCallback, useState, createRef, RefObject,
} from 'react';
import Toggle from 'react-uwp/Toggle';
import TextBox from 'react-uwp/TextBox';
import IconButton from 'react-uwp/IconButton';
import Button from 'react-uwp/Button';
import Separator from 'react-uwp/Separator';
import ToolTip from 'react-uwp/Tooltip';
import Flyout from 'react-uwp/Flyout';
import FlyoutContent from 'react-uwp/FlyoutContent';
import styled from 'styled-components';
import { ThemeProps } from 'react-uwp';
import { ipcRenderer, remote } from 'electron';
import { useSelector, useDispatch } from 'react-redux';
import { GlobalState } from '@common/reducer';
import { saveConfig } from '@common/reducer/config/action';
import { reqToggleBrowserOpen, reqOpenClientGenerator } from '@common/ipc/req';

const ConfigLayout = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const OptionLayout = styled.div`
  padding: 0.5rem;
  flex-shrink: 1;
  height: 0;
  position: relative;
  flex-grow: 1;
  display: flex;
  overflow-y: scroll;
  flex-direction: column;
  > * {
    margin-bottom: 1rem;
  }
`;

const DirectoryTitle = styled.span`
  margin-bottom: 0;
`;

const SectionTitle = styled.span`
  font-weight: bold;
  font-size: 1rem;
`;


const Directory = styled.div`
  display: flex;
  align-items: center;
`;

const ProgramInfo = styled.div`
  display: flex;
  flex-direction: row-reverse;
  font-weight: bold;
`;

interface DirectoryInfo {
  index: number;
  path: string;
}

const Configuration: React.FC<ThemeProps> = ({ theme }) => {
  const encryptRef = useRef<Toggle>(null);
  const config = useSelector((state: GlobalState) => state.config);

  const [dirRefs, setDirRefs] = useState<Array<RefObject<TextBox>>>([]);

  useEffect(() => {
    // add or remove refs
    setDirRefs((el) => (
      Array(config.clients.length).fill(null).map((_, i) => el[i] || createRef<TextBox>())
    ));
  }, [config.clients.length]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (config) {
      for (const el of dirRefs) {
        if (!el || !el.current) {
          return;
        }
      }
      dirRefs.forEach((dirRef, i) => {
        dirRef.current!.setValue(config.clients[i].path);
      });
    }
  }, [config, dirRefs]);

  const getNewDirectory = useCallback((targetIndex: number) => {
    const res = remote.dialog.showOpenDialogSync(remote.getCurrentWindow(), {
      title: '거상 설치 경로 선택',
      defaultPath: 'C:\\AKInteractive',
      properties: ['openDirectory'],
    });
    if (res && res.length > 0) {
      dirRefs[targetIndex].current!.setValue(res[0]);
    }
  }, [dirRefs]);

  const saveAll = useCallback(() => {
    if (config) {
      const dirInfo: Array<string> = dirRefs.map((el) => el.current!.getValue());
      const doEncrypt = encryptRef.current!.state.currToggled;
      dispatch(saveConfig({
        dirInfo,
        doEncrypt,
      }));
    }
  }, [config, dirRefs, dispatch]);

  useEffect(() => {
    ipcRenderer.on('change-config', () => {
      remote.getCurrentWindow().close();
    });
  }, []);

  const paths = [];
  for (let i = 0; i < config.clients.length; i += 1) {
    paths.push(
      <>
        <DirectoryTitle style={theme?.typographyStyles?.base}>
          거상 경로(
          {i + 1}
          ):
          {' '}
          {config.clients[i].title ? config.clients[i].title : `${i + 1}번`}
        </DirectoryTitle>
        <Directory style={theme?.typographyStyles?.base}>
          <TextBox background="none" ref={dirRefs[i]} />
          <ToolTip content="폴더 열기">
            <IconButton onClick={() => { getNewDirectory(i); }}>FileExplorerApp</IconButton>
          </ToolTip>
        </Directory>
      </>,
    );
  }

  return (
    <ConfigLayout>
      <Header>
        <h2 style={theme?.typographyStyles?.header}>환경 설정</h2>
        <div>
          <ToolTip content="불러오기" verticalPosition="bottom" margin={5}>
            <IconButton disabled>DownloadLegacy</IconButton>
          </ToolTip>
          <ToolTip content="리셋" verticalPosition="bottom" margin={5}>
            <IconButton disabled>ResetDrive</IconButton>
          </ToolTip>
          <ToolTip content="저장" verticalPosition="bottom" margin={5}>
            <IconButton onClick={saveAll}>SaveLegacy</IconButton>
          </ToolTip>
        </div>
      </Header>
      <Separator />
      <OptionLayout>
        <SectionTitle>일반</SectionTitle>
        <Flyout>
          <Toggle label="닫기 시 트레이 아이콘으로 이동" defaultToggled />
          <FlyoutContent
            show={false}
            verticalPosition="bottom"
            enterDelay={850}
          >
            활성화할 경우 닫기 시 트레이 아이콘으로 이동됩니다.
            비활성화 할 경우 닫기 시 즉시 종료됩니다.
          </FlyoutContent>
        </Flyout>
        <Separator />
        <SectionTitle>보안</SectionTitle>
        <Flyout>
          <Toggle
            ref={encryptRef}
            label="유저 정보 저장 (암호화)"
            defaultToggled={config.encrypted === 'true'}
          />
          <FlyoutContent
            show={false}
            verticalPosition="bottom"
            enterDelay={850}
          >
            비활성화 할 경우 저장 시 암호화하지 않습니다.
            활성화 할 경우 유저 정보를 암호화하여 저장합니다(강력히 권장).
            사용하고 있는 PC에서만 암호를 풀 수 있습니다.
            USB 등에 담에 사용할 경우 비활성화 하시고 나머지의 경우 보안을 위해 암호화 사용을 강력 권장합니다.
          </FlyoutContent>
        </Flyout>
        <Toggle label="OTP 입력 시 기본 별표 처리" defaultToggled />
        <Flyout>
          <Button onClick={reqToggleBrowserOpen}>
            브라우저 열기/닫기 (임시)
          </Button>
          <FlyoutContent
            show={false}
            verticalPosition="bottom"
            enterDelay={850}
          >
            로그인 시 브라우저를 수동으로 엽니다(임시 기능).
            만약 브라우저를 사용자 임의대로 닫을 경우 프로그램이 정상동작하지 않을 수도 있습니다. 유의해주세요.
          </FlyoutContent>
        </Flyout>
        <Separator />
        <SectionTitle>경로</SectionTitle>
        {paths}
        <Button onClick={reqOpenClientGenerator}>
            클라이언트 생성
        </Button>
        <Separator />
        <ProgramInfo>
          프로그램 정보:
          {' '}
          {process.env.VERSION}
        </ProgramInfo>
      </OptionLayout>
    </ConfigLayout>
  );
};

export default Configuration;

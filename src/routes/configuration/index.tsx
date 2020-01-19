import React, {
  useRef, useEffect, useCallback,
} from 'react';
import Toggle from 'react-uwp/Toggle';
import TextBox from 'react-uwp/TextBox';
import IconButton from 'react-uwp/IconButton';
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

interface DirectoryInfo {
  index: number;
  path: string;
}

interface ConfigData {
  username: string;
  password: string;
  path: string;
  alwaysSave: boolean;
}

const Configuration: React.FC<ThemeProps> = ({ theme }) => {
  const dirRef0 = useRef<TextBox>(null);
  const dirRef1 = useRef<TextBox>(null);
  const dirRef2 = useRef<TextBox>(null);
  const encryptRef = useRef<Toggle>(null);
  const dirRefs = [dirRef0, dirRef1, dirRef2];
  const config = useSelector((state: GlobalState) => state.config);
  const dispatch = useDispatch();

  useEffect(() => {
    if (config) {
      if (dirRef0 && dirRef0.current
        && dirRef1 && dirRef1.current
        && dirRef2 && dirRef2.current) {
        dirRef0.current.setValue(config.clients[0].path);
        dirRef1.current.setValue(config.clients[1].path);
        dirRef2.current.setValue(config.clients[2].path);
      }
    }
  }, [config, dirRef0, dirRef1, dirRef2]);

  const getNewDirectory = (targetIndex: number) => {
    ipcRenderer.send('gersang-directory', targetIndex);
  };

  const setDir = useCallback((event, directory: DirectoryInfo) => {
    dirRefs[directory.index].current!.setValue(directory.path);
  }, [dirRefs]);

  const saveAll = useCallback(() => {
    if (config) {
      const dirInfo: Array<string> = [];
      for (let i = 0; i < 3; i += 1) {
        dirInfo.push(dirRefs[i].current!.getValue());
      }
      const doEncrypt = encryptRef.current!.state.currToggled;
      dispatch(saveConfig({
        dirInfo,
        doEncrypt,
      }));
    }
  }, [config, dirRefs, dispatch]);

  useEffect(() => {
    ipcRenderer.on('gersang-directory', setDir);
    return () => {
      ipcRenderer.off('gersang-directory', setDir);
    };
  }, [setDir]);

  useEffect(() => {
    ipcRenderer.on('change-config', () => {
      remote.getCurrentWindow().close();
    });
  }, []);

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
        <Separator />
        <SectionTitle>경로</SectionTitle>
        <DirectoryTitle style={theme?.typographyStyles?.base}>
          거상 경로 1
        </DirectoryTitle>
        <Directory style={theme?.typographyStyles?.base}>
          <TextBox background="none" ref={dirRef0} />
          <ToolTip content="폴더 열기">
            <IconButton onClick={() => { getNewDirectory(0); }}>FileExplorerApp</IconButton>
          </ToolTip>
        </Directory>
        <DirectoryTitle style={theme?.typographyStyles?.base}>
          거상 경로 2
        </DirectoryTitle>
        <Directory style={theme?.typographyStyles?.base}>
          <TextBox background="none" ref={dirRef1} />
          <ToolTip content="폴더 열기">
            <IconButton onClick={() => { getNewDirectory(1); }}>FileExplorerApp</IconButton>
          </ToolTip>
        </Directory>
        <DirectoryTitle style={theme?.typographyStyles?.base}>
          거상 경로 3
        </DirectoryTitle>
        <Directory style={theme?.typographyStyles?.base}>
          <TextBox background="none" ref={dirRef2} />
          <ToolTip content="폴더 열기">
            <IconButton onClick={() => { getNewDirectory(2); }}>FileExplorerApp</IconButton>
          </ToolTip>
        </Directory>
      </OptionLayout>
    </ConfigLayout>
  );
};

export default Configuration;

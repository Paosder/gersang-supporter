import React, { useRef, useEffect } from 'react';
import Toggle from 'react-uwp/Toggle';
import TextBox from 'react-uwp/TextBox';
import IconButton from 'react-uwp/IconButton';
import Separator from 'react-uwp/Separator';
import styled from 'styled-components';
import { ThemeProps } from 'react-uwp';
import { ipcRenderer } from 'electron';

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

const Configuration: React.FC<ThemeProps> = ({ theme }) => {
  const dirRef1 = useRef<TextBox>(null);
  const dirRef2 = useRef<TextBox>(null);
  const dirRef3 = useRef<TextBox>(null);
  const dirRefs = [dirRef1, dirRef2, dirRef3];

  const getNewDirectory = (targetIndex: number) => {
    ipcRenderer.send('gersang-directory', targetIndex);
  };

  useEffect(() => {
    ipcRenderer.on('gersang-directory', (event, directory: DirectoryInfo) => {
      dirRefs[directory.index].current!.setValue(directory.path);
    });
  }, [dirRefs]);

  return (
    <ConfigLayout>
      <Header>
        <h2 style={theme?.typographyStyles?.header}>환경 설정</h2>
        <IconButton>FileExplorerApp</IconButton>
      </Header>
      <Separator />
      <OptionLayout>
        <SectionTitle>일반</SectionTitle>
        <Toggle label="폴더 경로 항상 저장" defaultToggled />
        <Toggle label="닫기 시 트레이 아이콘으로 이동" defaultToggled />
        <Separator />
        <SectionTitle>보안</SectionTitle>
        <Toggle label="유저 정보 저장 (암호화)" />
        <Toggle label="OTP 입력 시 별표 처리" />
        <Separator />
        <SectionTitle>경로</SectionTitle>
        <DirectoryTitle style={theme?.typographyStyles?.base}>
          거상 경로 1
        </DirectoryTitle>
        <Directory style={theme?.typographyStyles?.base}>
          <TextBox background="none" ref={dirRef1} />
          <IconButton onClick={() => { getNewDirectory(0); }}>FileExplorerApp</IconButton>
        </Directory>
        <DirectoryTitle style={theme?.typographyStyles?.base}>
          거상 경로 2
        </DirectoryTitle>
        <Directory style={theme?.typographyStyles?.base}>
          <TextBox background="none" ref={dirRef2} />
          <IconButton onClick={() => { getNewDirectory(1); }}>FileExplorerApp</IconButton>
        </Directory>
        <DirectoryTitle style={theme?.typographyStyles?.base}>
          거상 경로 3
        </DirectoryTitle>
        <Directory style={theme?.typographyStyles?.base}>
          <TextBox background="none" ref={dirRef3} />
          <IconButton onClick={() => { getNewDirectory(2); }}>FileExplorerApp</IconButton>
        </Directory>
      </OptionLayout>
    </ConfigLayout>
  );
};

export default Configuration;

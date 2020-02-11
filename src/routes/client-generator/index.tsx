import React, { useRef } from 'react';
import styled from 'styled-components';
import Button from 'react-uwp/Button';
import TextBox from 'react-uwp/TextBox';
import IconButton from 'react-uwp/IconButton';
import ToolTip from 'react-uwp/Tooltip';
import { remote } from 'electron';
import { ThemeProps } from 'react-uwp';
import Separator from 'react-uwp/Separator';

// [1] ---- [2] ---- [3]
/**
 * steps
 * 1. set main client path
 * 2. set destination sub client path
 * 3. create
 */

const GeneratorWrapper = styled.div`
  > h2 {
    margin: 0.5rem 0 1rem;
    /* margin-bottom: 1rem; */
  }
`;


const OriginPath = styled.div`
  display: flex;
  align-items: center;
`;

const Directories = styled.div`
  padding: 1rem;
`;

const DirectoryTitle = styled.span`
  margin-bottom: 0;
`;

const Controls = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
`;

const ClientGenerator: React.FC<ThemeProps> = ({ theme }) => {
  const originRef = useRef<TextBox>(null);

  const getNewDirectory = () => {
    if (originRef.current) {
      const res = remote.dialog.showOpenDialogSync(remote.getCurrentWindow(), {
        title: '거상 원본 설치 경로 선택',
        defaultPath: 'C:\\AKInteractive',
        properties: ['openDirectory'],
      });
      if (res && res.length > 0) {
        originRef.current.setValue(res[0]);
      }
    }
  };
  return (
    <GeneratorWrapper>
      <h2>
        거상 클라이언트 생성기
      </h2>
      <Separator />
      <Directories>
        <DirectoryTitle style={theme?.typographyStyles?.base}>
          거상 원본 경로
        </DirectoryTitle>
        <OriginPath>
          <TextBox background="none" ref={originRef} />
          <ToolTip content="폴더 열기">
            <IconButton onClick={getNewDirectory}>FileExplorerApp</IconButton>
          </ToolTip>
        </OriginPath>
        <DirectoryTitle style={theme?.typographyStyles?.base}>
          생성할 클라이언트 경로
        </DirectoryTitle>
        <OriginPath>
          <TextBox background="none" ref={originRef} />
          <ToolTip content="폴더 열기">
            <IconButton onClick={getNewDirectory}>FileExplorerApp</IconButton>
          </ToolTip>
        </OriginPath>
        <Controls>
          <Button>
            생성하기
          </Button>
        </Controls>
      </Directories>

    </GeneratorWrapper>
  );
};

export default ClientGenerator;

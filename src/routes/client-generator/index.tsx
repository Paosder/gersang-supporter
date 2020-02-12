import React, { useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import Button from 'react-uwp/Button';
import TextBox from 'react-uwp/TextBox';
import IconButton from 'react-uwp/IconButton';
import ToolTip from 'react-uwp/Tooltip';
import { remote } from 'electron';
import { ThemeProps } from 'react-uwp';
import Separator from 'react-uwp/Separator';
import fs from 'fs';
import path from 'path';
import { useSelector } from 'react-redux';
import { GlobalState } from '@common/reducer';


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

const copyExts = ['.dll', '.exe', '.des', '.gcs', '.ln', '.hq', '.gts', '.inf', '.ico'];

const generateClientWithPath = (source: string, target: string) => {
  try {
    fs.readdirSync(source).forEach((file) => {
      const filePath = path.join(source, file);
      const targetPath = path.join(target, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        if (file.toUpperCase() !== 'GAMEGUARD') {
          fs.symlinkSync(filePath, targetPath);
        }
      } else if (copyExts.includes(path.extname(filePath))) {
        fs.copyFileSync(filePath, targetPath);
      }
    });
    fs.mkdirSync(path.join(target, 'GameGuard'));
    fs.readdirSync(path.join(source, 'GameGuard')).forEach((file) => {
      const filePath = path.join(source, 'GameGuard', file);
      const targetPath = path.join(target, 'GameGuard', file);
      fs.copyFileSync(filePath, targetPath);
    });
    remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      title: '클라이언트 생성 성공',
      type: 'info',
      message: '클라이언트를 성공적으로 생성하였습니다 :)',
    });
    remote.getCurrentWindow().close();
  } catch (e) {
    remote.dialog.showErrorBox('경로 오류!', `경로에 무언가 문제가 있나봐요 T.T
    설치할 폴더가 비어있지 않거나, 이미 복사된 클라이언트가 있을 수도 있어요!
    `);
  }
};

const ClientGenerator: React.FC<ThemeProps> = ({ theme }) => {
  const originRef = useRef<TextBox>(null);
  const targetRef = useRef<TextBox>(null);
  const originPath = useSelector((state: GlobalState) => state.config.clients[0].path);

  const getNewDirectory = (ref: React.RefObject<TextBox>) => {
    if (ref.current) {
      const res = remote.dialog.showOpenDialogSync(remote.getCurrentWindow(), {
        title: '거상 원본 설치 경로 선택',
        defaultPath: 'C:\\AKInteractive',
        properties: ['openDirectory'],
      });
      if (res && res.length > 0) {
        ref.current.setValue(res[0]);
      }
    }
  };

  useEffect(() => {
    if (originRef && originRef.current) {
      originRef.current.setValue(originPath);
    }
  }, [originPath]);

  const generateClient = useCallback(() => generateClientWithPath(
    originRef.current!.getValue(),
    targetRef.current!.getValue(),
  ), []);
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
            <IconButton onClick={() => getNewDirectory(originRef)}>FileExplorerApp</IconButton>
          </ToolTip>
        </OriginPath>
        <DirectoryTitle style={theme?.typographyStyles?.base}>
          생성할 클라이언트 경로
        </DirectoryTitle>
        <OriginPath>
          <TextBox background="none" ref={targetRef} />
          <ToolTip content="폴더 열기">
            <IconButton onClick={() => getNewDirectory(targetRef)}>FileExplorerApp</IconButton>
          </ToolTip>
        </OriginPath>
        <Controls>
          <Button onClick={generateClient}>
            생성하기
          </Button>
        </Controls>
      </Directories>

    </GeneratorWrapper>
  );
};

export default ClientGenerator;

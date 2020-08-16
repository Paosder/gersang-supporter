import React, { useEffect } from 'react';
import styled from 'styled-components';
import { remote, ipcRenderer } from 'electron';
import ProgressRing from 'react-uwp/ProgressRing';

const TransparentDiv = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  user-select: none;
  outline: none;
`;

const close = () => {
  remote.getCurrentWindow().hide();
};

const closeAfter2S = () => {
  setTimeout(() => {
    close();
  }, 2000);
};

const LoadingPage: React.FC = () => {
  useEffect(() => {
    ipcRenderer.on('loading-screen', closeAfter2S);
    setTimeout(() => {
      // workaround: transparent window not appears
      // next time if close window immediately when after initialized.
      close();
    }, 0);
    return () => {
      ipcRenderer.off('loading-screen', closeAfter2S);
    };
  }, []);

  return (
    <TransparentDiv onClick={close}>
      <ProgressRing />
    </TransparentDiv>
  );
};

export default LoadingPage;

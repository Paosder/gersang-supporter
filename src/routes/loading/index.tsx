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
  remote.getCurrentWindow().close();
};

const closeAfter3S = () => {
  setTimeout(() => {
    close();
  }, 3000);
};

const LoadingPage: React.FC = () => {
  useEffect(() => {
    ipcRenderer.on('loading-screen', closeAfter3S);
    setTimeout(() => {
      // workaround: transparent window not appears
      // next time if close window immediately after initialized.
      closeAfter3S();
    }, 0);
    return () => {
      ipcRenderer.off('loading-screen', closeAfter3S);
    };
  }, []);

  return (
    <TransparentDiv onClick={close}>
      <ProgressRing dotsStyle={{ background: 'yellowgreen' }} />
    </TransparentDiv>
  );
};

export default LoadingPage;

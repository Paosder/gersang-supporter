import React, { useEffect, useState, useRef } from 'react';
import { remote } from 'electron';
import styled from 'styled-components';
import CheckBox from 'react-uwp/CheckBox';
import Tabs, { Tab } from 'react-uwp/Tabs';
import Countdown from 'react-countdown';
import AppBarButton from 'react-uwp/AppBarButton';
import { NotificationIcon } from '@common/icons';
import { useSelector } from 'react-redux';
import { GlobalState } from '@common/reducer';
import { TimeEditor } from '@common/component';

const ClockLayout = styled.div`
  background-color: white;
`;

const TimerLayout = styled.div`
  width: calc(100vw - 48px);
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  height: 200px;
`;

const TimerRenderer = styled.div`
  font-size: 4rem;
  margin-bottom: 2rem;
`;

const TimerControls = styled.div`
  padding-top: 1rem;
  display: flex;
  justify-content: space-around;
`;

const notifyUser = () => {
  const notification = new Notification('Gersang Supporter', {
    icon: NotificationIcon,
    body: '시간이 경과되었어요 !',
  });
};

const Timer: React.FC = () => {
  const countDownRef = useRef<Countdown>(null);
  const leftTime = useSelector((state: GlobalState) => state.clock.targetTime);

  const [testTime, setTestTime] = useState(10000);
  useEffect(() => {
    if (testTime < 0) {
      notifyUser();
    } else {
      setTimeout(() => {
        setTestTime(testTime - 1000);
      }, 1000);
    }
  }, [testTime]);
  // useEffect(() => {
  //   if (countDownRef) {
  //     if (countDownRef.current?.api?.isCompleted()) {
  //       notifyUser();
  //     }
  //   }
  // }, [countDownRef]);
  return (
    <TimerLayout>
      <TimerRenderer>
        {/* <Countdown date={leftTime} onComplete={notifyUser} ref={countDownRef} /> */}
        <TimeEditor value={testTime} />
        {testTime}
      </TimerRenderer>
      <CheckBox
        label="시간이 지나면 알리기"
        defaultChecked={false}
        style={{
          userSelect: 'none',
        }}
      />
      <TimerControls>
        <AppBarButton
          icon="PlayLegacy"
          label="시작"
          labelPosition="right"
          style={{
            height: '40px',
          }}
          hoverStyle={{ background: 'yellowgreen' }}
        />
        <AppBarButton
          icon="PauseLegacy"
          label="일시 정지"
          labelPosition="right"
          style={{
            height: '40px',
          }}
          hoverStyle={{ background: 'yellowgreen' }}
        />
        <AppBarButton
          icon="StopLegacy"
          label="정지"
          labelPosition="right"
          style={{
            height: '40px',
          }}
          hoverStyle={{ background: 'yellowgreen' }}
        />
      </TimerControls>
    </TimerLayout>
  );
};

const Clock: React.FC = () => {
  const t = 4;
  return (
    <ClockLayout>
      <Tabs
        tabTitleStyle={{
          userSelect: 'none',
        }}
      >
        <Tab title="타이머">
          <Timer />
        </Tab>
        <Tab title="스톱워치">
          <Timer />

        </Tab>
      </Tabs>
    </ClockLayout>
  );
};

export default Clock;

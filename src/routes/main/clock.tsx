import React, { useRef } from 'react';
import styled from 'styled-components';
import CheckBox from 'react-uwp/CheckBox';
import Tabs, { Tab } from 'react-uwp/Tabs';
import AppBarButton from 'react-uwp/AppBarButton';
import { useSelector, useDispatch } from 'react-redux';
import { GlobalState } from '@common/reducer';
import { setLeftTime, startTimer, setStatus } from '@common/reducer/clock/action';
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
  height: 225px;
`;

const TimerRenderer = styled.div`
  font-size: 4rem;
`;

const TimerControls = styled.div`
  /* margin-top: 2rem; */
  display: flex;
  justify-content: space-around;
`;

const CheckboxControls = styled.div`
  display: flex;
  flex-direction: column;
  height: 80px;
`;

const Timer: React.FC = () => {
  const dispatch = useDispatch();
  const leftTime = useSelector((state: GlobalState) => state.clock.leftTime);

  return (
    <TimerLayout>
      <TimerRenderer>
        <TimeEditor value={leftTime} onChange={(time) => dispatch(setLeftTime(time))} />
      </TimerRenderer>

      <CheckboxControls>
        <CheckBox
          label="시간이 지나면 알리기"
          defaultChecked
          disabled
          style={{
            userSelect: 'none',
            marginBottom: '0.5rem',
          }}
        />
        <CheckBox
          label="알람음 울리기"
          defaultChecked={false}
          disabled
          style={{
            userSelect: 'none',
          }}
        />

      </CheckboxControls>

      <TimerControls>
        <AppBarButton
          icon="PlayLegacy"
          label="시작"
          labelPosition="right"
          style={{
            height: '40px',
          }}
          hoverStyle={{ background: 'yellowgreen' }}
          onClick={() => dispatch(startTimer())}
        />
        <AppBarButton
          icon="PauseLegacy"
          label="일시 정지"
          labelPosition="right"
          style={{
            height: '40px',
          }}
          hoverStyle={{ background: 'yellowgreen' }}
          onClick={() => dispatch(setStatus('PAUSE'))}
        />
        <AppBarButton
          icon="StopLegacy"
          label="정지"
          labelPosition="right"
          style={{
            height: '40px',
          }}
          hoverStyle={{ background: 'yellowgreen' }}
          onClick={() => dispatch(setStatus('STOP'))}
        />
      </TimerControls>
    </TimerLayout>
  );
};

interface SpinnerProps {
  active?: boolean;
}

const Spinner = styled.div<SpinnerProps>`
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;

  div {
    position: absolute;
    border: 4px solid #000;
    border-radius: 50%;
    ${(props) => (props.active ? `
      opacity: 1;
      animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    ` : 'opacity: 0;')}
    
    &:nth-child(2) {
      animation-delay: -0.5s;
    }
  }

  @keyframes lds-ripple {
    0% {
      top: 36px;
      left: 36px;
      width: 0;
      height: 0;
      opacity: 1;
    }
    100% {
      top: 0px;
      left: 0px;
      width: 72px;
      height: 72px;
      opacity: 0;
    }
}
`;


const StopWatch: React.FC = () => {
  const t = 4;
  return (
    <TimerLayout>
      <TimerRenderer>
        <TimeEditor value={0} />
      </TimerRenderer>
      <Spinner active>
        <div />
        <div />
      </Spinner>
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
          <StopWatch />
        </Tab>
      </Tabs>
    </ClockLayout>
  );
};

export default Clock;

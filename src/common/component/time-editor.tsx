import React, {
  useRef, useEffect, useCallback, useState,
} from 'react';
import styled from 'styled-components';

const TimeEdit = styled.input`
  border: 0;
  display: inline;
  width: 70px;
  font-size: inherit;

  ::-webkit-inner-spin-button{
    -webkit-appearance: none; 
    margin: 0; 
  }
  ::-webkit-outer-spin-button{
    -webkit-appearance: none; 
    margin: 0; 
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 1px 1px yellowgreen;
  }
`;

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

interface TimeUnitProps extends InputProps{
  displayType?: 'hour' | 'minute' | 'day';
  changeValue: () => void;
}

// const splitNumberToTime = (timeStr: string) => {
//   let time = parseInt(timeStr, 10);
//   let day = time / (3600 * 24);
// }

const timeToStr = (time: number) => (time < 10 ? `0${time}` : time.toString());

const reCalculateTime = (value: number, limit: number) => {
  let num = value % limit;
  if (num < 0) {
    num += limit;
  }
  return timeToStr(num);
};


const TimeUnit = React.forwardRef<HTMLInputElement, TimeUnitProps>(({
  displayType = 'minute',
  defaultValue,
  changeValue,
}, ref) => {
  let limit = 60;
  if (displayType === 'day') {
    limit = 31;
  } else if (displayType === 'hour') {
    limit = 24;
  }

  const valueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = reCalculateTime(parseInt(e.target.value, 10), limit).toString();
    changeValue();
  };

  const onWheel = useCallback((e: React.WheelEvent<HTMLInputElement>) => {
    const num = parseInt(e.currentTarget.value, 10);
    // if (e.deltaY > 0) { // to lower
    //   num -= 0;
    // } else {
    //   num += 0;
    // }
    e.currentTarget.value = (reCalculateTime(num, limit)).toString();
  }, [limit]);

  return (
    <TimeEdit
      ref={ref}
      onChange={valueChange}
      defaultValue={defaultValue}
      type="number"
      min="-1"
      max="60"
      onWheel={onWheel}
    />
  );
});

interface TimeEditorProps {
  onChange?: (time: number) => void;
  initValue?: number;
  type?: 'day' | 'hour';
}

const TimeEditor: React.FC<TimeEditorProps> = ({ onChange, initValue = 0, type = 'day' }) => {
  let defaultValues = ['00', '00', '00', '00'];
  const unitRef1 = useRef<HTMLInputElement>(null);
  const unitRef2 = useRef<HTMLInputElement>(null);
  const unitRef3 = useRef<HTMLInputElement>(null);
  const unitRef4 = useRef<HTMLInputElement>(null);

  if (initValue && initValue >= 0) {
    const date = new Date(initValue);
    // alert(timeToStr(date.getUTCSeconds()));
    defaultValues = [timeToStr(date.getUTCDate() - 1),
      timeToStr(date.getUTCHours()),
      timeToStr(date.getUTCMinutes()),
      timeToStr(date.getUTCSeconds()),
    ];
  }

  const timeChange = useCallback(() => {
    if (unitRef1.current
      && unitRef2.current
      && unitRef3.current
      && unitRef4.current
      && onChange) {
      const day = parseInt(unitRef1.current.value, 10) * 3600 * 24;
      const hour = parseInt(unitRef2.current.value, 10) * 3600;
      const minute = parseInt(unitRef3.current.value, 10) * 60;
      const second = parseInt(unitRef4.current.value, 10);
      onChange((day + hour + minute + second) * 1000);
    }
  }, [onChange, unitRef1, unitRef2, unitRef3, unitRef4]);

  return (
    <div>
      <TimeUnit
        displayType="day"
        defaultValue={defaultValues[0]}
        changeValue={timeChange}
        ref={unitRef1}
      />
      :
      <TimeUnit
        displayType="hour"
        defaultValue={defaultValues[1]}
        ref={unitRef2}
        changeValue={timeChange}
      />
      :
      <TimeUnit
        defaultValue={defaultValues[2]}
        ref={unitRef3}
        changeValue={timeChange}
      />
      :
      <TimeUnit
        defaultValue={defaultValues[3]}
        ref={unitRef4}
        changeValue={timeChange}
      />
    </div>
  );
};

export default TimeEditor;

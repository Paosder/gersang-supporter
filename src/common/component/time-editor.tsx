import React, { useRef, useEffect, useCallback } from 'react';
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
}

const reCalculateTime = (value: number, limit: number) => {
  let num = value % limit;
  if (num < 0) {
    num += limit;
  }
  return num < 10 ? `0${num}` : num.toString();
};

const TimeUnit = React.forwardRef<HTMLInputElement, TimeUnitProps>(({ displayType = 'minute' }, ref) => {
  const editRef = useRef<HTMLInputElement>(null);
  let limit = 60;
  if (displayType === 'day') {
    limit = 31;
  } else if (displayType === 'hour') {
    limit = 24;
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = reCalculateTime(parseInt(e.target.value, 10), limit).toString();
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

  ref = editRef;
  return (
    <TimeEdit
      ref={editRef}
      defaultValue="00"
      onChange={onChange}
      type="number"
      min="-1"
      max="60"
      onWheel={onWheel}
    />
  );
});

const TimeEditor: React.FC = () => {
  const t = 4;
  return (
    <div>
      <TimeUnit displayType="day" />
      :
      <TimeUnit displayType="hour" />
      :
      <TimeUnit />
      :
      <TimeUnit />
    </div>
  );
};

export default TimeEditor;

import React, { useRef } from 'react';
import styled from 'styled-components';

const TimeEdit = styled.input`
  border: 0;
  display: inline;
  width: 70px;
  font-size: inherit;
`;

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const TimeUnit = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  // const editRef = useRef<HTMLInputElement>(null);
  const t = 4;
  const onChange = () => {
  };

  return (
    <TimeEdit ref={ref} onChange={onChange} />
  );
});

const TimeEditor: React.FC = () => {
  const t = 4;
  return (
    <div>
      <TimeUnit />
      :
      <TimeUnit />
      :
      <TimeUnit />
      :
      <TimeUnit />
    </div>
  );
};

export default TimeEditor;

import React from 'react';
import styled from 'styled-components';
import TextBox from 'react-uwp/TextBox';

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: column;
  /* background-image: url('./img/duck.jpg');
  background-position: center;
  background-size: auto 100%;
  background-repeat: no-repeat;
  background-color: white; */
`;

const CHCLayout = styled.div`
  backdrop-filter: blur(10px);
`;
// chinese test
const ChineseTest: React.FC = () => (
  <Wrapper>
    <CHCLayout>
      WIP: 한자 시험
      <TextBox background="none" />
    </CHCLayout>
  </Wrapper>
);

export default ChineseTest;

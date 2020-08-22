import React, { useEffect } from 'react';
import styled from 'styled-components';
import TextBox from 'react-uwp/TextBox';
import { Helmet } from 'react-helmet';
import fs from 'fs';
import yaml from 'yaml';

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
  /* backdrop-filter: blur(10px); */
`;

let chcs: any;

// chinese test
const ChineseTest: React.FC = () => {
  useEffect(() => {
    if (!chcs) {
      // const yml = fs.readFileSync('./ch-test.yml').toString('utf-8');
      // chcs = yaml.parse(yml);
    }
  }, []);

  return (
  <Wrapper>
    <Helmet>
      <title>한자 시험 보자아</title>
    </Helmet>
    <CHCLayout>
      WIP: 한자 시험
      <TextBox background="none" />
    </CHCLayout>
  </Wrapper>
  );
};

export default ChineseTest;

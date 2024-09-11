import styled from 'styled-components';

import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  BindAccountButton,
  Card,
  GitHubLoginButton
} from '../components';
import { defaultSnapOrigin } from '../config';
import {
  useMetaMask,
  useInvokeSnap,
  useMetaMaskContext,
  useRequestSnap,
  useGitHubLogin,
} from '../hooks';
import { isLocalSnap, shouldDisplayReconnectButton } from '../utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary?.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background?.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  color: ${({ theme }) => theme.colors.text?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error?.muted};
  border: 1px solid ${({ theme }) => theme.colors.error?.default};
  color: ${({ theme }) => theme.colors.error?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const { error } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();
  const gitHubLogin = useGitHubLogin();
  const invokeSnap = useInvokeSnap();
  const loggedInWithGitHub = (card) => { return card; };

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? isFlask
    : snapsDetected;

  const handleSendHelloClick = async () => {
    await invokeSnap({ method: 'hello' });
  };

  return (
    <Container>
      <Heading>
        <Span>ETH</Span>binder
      </Heading>
      <Subtitle>
        A properly verified Ethereum shield for your GitHub account
      </Subtitle>
      <br/>
      <br/>
      <img src="https://img.shields.io/badge/eth-verified-51D06A?logo=ethereum&labelColor=5177D0" />
      <CardContainer>
        <Notice>
          <p>
            <b>ETHbinder</b> allows you to bind your Ethereum address to your GitHub
            account's commit signing key, helping reassure others that it's your wallet.
          </p>
          <br/>
          <p>
            Supply-chain attacks are becoming more frequent, use <b>ETHbinder </b>
            to help prevent the accidental loss of funds by providing you with a provably canonical address.
          </p>
        </Notice>
        {installedSnap && loggedInWithGitHub (
          <Card
            content={{
              title: 'Create Ethereum Binding',
              description:
                'This will fork the ETHbinder repository to your GitHub account and post a commit to the signatures branch, allowing us to verify both your wallet signature and your GitHub commit signature. The mapping of GitHub handles to Ethereum addresses is stored publicly on the blockchain so it may be independently verified.',
              button: (
                <BindAccountButton
                  onClick={handleSendHelloClick}
                  disabled={!installedSnap}
                />
              ),
            }}
            disabled={!installedSnap}
            fullWidth={true}
          />
        )}
        {error && (
          <ErrorMessage>
            <b>An error happened:</b> {error.message}
          </ErrorMessage>
        )}
        {!isMetaMaskReady && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!installedSnap && (
          <Card
            content={{
              title: 'Connect MetaMask',
              description:
                'ETHbinder will use MetaMask to confirm your Ethereum address by signing some data that will be committed to GitHub.',
              button: (
                <ConnectButton
                  onClick={requestSnap}
                  disabled={!isMetaMaskReady}
                />
              ),
            }}
            disabled={!isMetaMaskReady}
          />
        )}
        {shouldDisplayReconnectButton(installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={requestSnap}
                  disabled={!installedSnap}
                />
              ),
            }}
            disabled={!installedSnap}
          />
        )}
        {loggedInWithGitHub && (
          <Card
            content={{
              title: 'Login with GitHub',
              description:
                'Connecting ETHbinder to MetaMask allows us to simplify the setup process for you. It also allows us to confirm that your commit signing key is yours.',
              button: (
                <GitHubLoginButton
                />
              ),
            }}
          />
        )}
      </CardContainer>
    </Container>
  );
};

export default Index;

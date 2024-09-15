import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  ConnectGitHubButton,
  EditGitHubButton,
  Card,
  GitHubForkButton,
  GitHubIssueButton,
  GitHubHandleCollector,
} from '../components';
import { defaultSnapOrigin } from '../config';
import {
  useMetaMask,
  useInvokeSnap,
  useMetaMaskContext,
  useRequestSnap,
  useGitHubLogin,
  useCheckRepoFork,
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
  const invokeSnap = useInvokeSnap();

  const [ethAddress, setEthAddress] = useState(null);
  const [signature, setSignature] = useState(null);

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? isFlask
    : snapsDetected;

  const handleSendBindingClick = async () => {
    try {
      console.log("Invoking Snap...");

      const response = await invokeSnap({ method: 'getGitHubHandle' });

      if (response && response.handle) {
        console.log("GitHub Handle:", response.handle);

        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setEthAddress(address);

        const signature = await ethereum.request({
          method: 'personal_sign',
          params: [response.handle, address],
        });

        console.log("Signature:", signature);

        setHandle(response.handle);
        setSignature(signature);

        return { handle: response.handle, signature };
      } else {
        console.log("No GitHub handle received.");
      }
    } catch (error) {
      console.error("Error invoking Snap or signing:", error);
    }
  };

  const [handle, setHandle] = useState(null); // State to store the GitHub handle
  const [isForked, setIsForked] = useState(false); // Define isForked state
  const GitHubRepoChecker = ({ githubHandle, onForkStatusChange }) => {
    const { hasForked, loading, error } = useCheckRepoFork(githubHandle);

    useEffect(() => {
      if (!loading && !error) {
        onForkStatusChange(hasForked);
      }
    }, [hasForked, loading, error, onForkStatusChange]);

    return null; // This component doesn't render anything itself
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
        {handle && (
          <GitHubRepoChecker
          githubHandle={handle}
          onForkStatusChange={setIsForked} // This will update isForked state
          />
        )}
        {handle && !isForked && (
          <Card
            content={{
              title: 'Fork ETHbinder',
              description:
                'Forking this repo to your account allows us to post an issue with your GitHub handle and a signature from your MetaMask wallet.',
              button: (
                <GitHubForkButton
                />
              ),
            }}
          />
        )}
        {handle && isForked && (
          <Card
            content={{
              title: 'Create Issue',
              description:
                'This posts an issue to your fork with the details necessary for verification. you will have the opportunity to review it before posting.',
              button: (
                <GitHubIssueButton
                  handle={handle}
                  ethAddress={ethAddress}
                  signature={signature}
                />
              ),
            }}
          />
        )}
        {installedSnap && !handle && (
          <Card
            content={{
              title: 'Connect GitHub',
              description:
                'Submit your GitHub handle so ETHbinder can find your public page and verify the signature we create. Your handle is encrypted and stored in your wallet, ETHbinder itself does not store any of your data.',
              button: (
                <ConnectGitHubButton
                  onClick={handleSendBindingClick}
                  disabled={!installedSnap}
                />
              ),
            }}
            disabled={!installedSnap}
            fullWidth={false}
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
        {installedSnap && handle && (
          <Card
            content={{
              title: 'Edit GitHub Handle',
              description:
                'Modify the encrypted GitHub handle we stored in your MetaMask.',
              button: (
                <EditGitHubButton
                  onClick={handleSendBindingClick}
                  disabled={!installedSnap}
                />
              ),
            }}
            disabled={!installedSnap}
            fullWidth={false}
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
              title: 'Reconnect MetaMask',
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
      </CardContainer>
    </Container>
  );
};

export default Index;

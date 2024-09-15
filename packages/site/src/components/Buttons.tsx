import type { ComponentProps } from 'react';
import styled from 'styled-components';

import { ReactComponent as FlaskFox } from '../assets/flask_fox.svg';
import { ReactComponent as GitHubOctocat } from '../assets/github_octocat.svg';
import { ReactComponent as Binding } from '../assets/binding.svg';
import { useMetaMask, useRequestSnap } from '../hooks';
import { shouldDisplayReconnectButton } from '../utils';
import { useGitHubIssueGenerator } from '../hooks/useGitHubIssueGenerator';

const Link = styled.a`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  border-radius: ${(props) => props.theme.radii.button};
  border: 1px solid ${(props) => props.theme.colors.background?.inverse};
  background-color: ${(props) => props.theme.colors.background?.inverse};
  color: ${(props) => props.theme.colors.text?.inverse};
  text-decoration: none;
  font-weight: bold;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: transparent;
    border: 1px solid ${(props) => props.theme.colors.background?.inverse};
    color: ${(props) => props.theme.colors.text?.default};
  }

  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    box-sizing: border-box;
  }
`;

const Button = styled.button`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
  }
`;

const ButtonText = styled.span`
  margin-left: 1rem;
`;

const ConnectedContainer = styled.div`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.small};
  border-radius: ${(props) => props.theme.radii.button};
  border: 1px solid ${(props) => props.theme.colors.background?.inverse};
  background-color: ${(props) => props.theme.colors.background?.inverse};
  color: ${(props) => props.theme.colors.text?.inverse};
  font-weight: bold;
  padding: 1.2rem;
`;

const ConnectedIndicator = styled.div`
  content: ' ';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: green;
`;

export const InstallFlaskButton = () => (
  <Link href="https://metamask.io/flask/" target="_blank">
    <FlaskFox />
    <ButtonText>Install MetaMask Flask</ButtonText>
  </Link>
);

export const GitHubForkButton = () => (
  <Link href="https://github.com/thejonanshow/ethbinder/fork" target="_blank">
    <GitHubOctocat />
    <ButtonText>Fork ETHbinder</ButtonText>
  </Link>
);

export const GitHubIssueButton = ({ handle, ethAddress, signature }) => {
  const { generateIssueUrl } = useGitHubIssueGenerator();

  const issueUrl = generateIssueUrl(handle, ethAddress, signature);

  return (
    <Link href={issueUrl} target="_blank">
      <GitHubOctocat />
      <ButtonText>Create Issue</ButtonText>
    </Link>
  );
};

export const ConnectButton = (props: ComponentProps<typeof Button>) => {
  return (
    <Button {...props}>
      <FlaskFox />
      <ButtonText>Connect</ButtonText>
    </Button>
  );
};

export const ReconnectButton = (props: ComponentProps<typeof Button>) => {
  return (
    <Button {...props}>
      <FlaskFox />
      <ButtonText>Reconnect</ButtonText>
    </Button>
  );
};

export const GitHubLoginButton = (props: ComponentProps<typeof Button>) => {
  return (
    <Button {...props}>
      <GitHubOctocat />
      <ButtonText>Login</ButtonText>
    </Button>
  );
};

export const GitHubLogoutButton = (props: ComponentProps<typeof Button>) => {
  return (
    <Button {...props}>
      <GitHubOctocat />
      <ButtonText>Logout</ButtonText>
    </Button>
  );
};

export const ConnectGitHubButton = (props: ComponentProps<typeof Button>) => {
  return (
    <Button {...props}>
      <GitHubOctocat />
      <ButtonText>Connect GitHub</ButtonText>
    </Button>
  );
};

export const EditGitHubButton = (props: ComponentProps<typeof Button>) => {
  return (
    <Button {...props}>
      <GitHubOctocat />
      <ButtonText>Edit GitHub Handle</ButtonText>
    </Button>
  );
};

export const SendHelloButton = (props: ComponentProps<typeof Button>) => {
  return <Button {...props}>Bind Account</Button>;
};

export const HeaderButtons = () => {
  const requestSnap = useRequestSnap();
  const { isFlask, installedSnap } = useMetaMask();

  if (!isFlask && !installedSnap) {
    return <InstallFlaskButton />;
  }

  if (!installedSnap) {
    return <ConnectButton onClick={requestSnap} />;
  }

  if (shouldDisplayReconnectButton(installedSnap)) {
    return <ReconnectButton onClick={requestSnap} />;
  }

  return (
    <ConnectedContainer>
      <ConnectedIndicator />
      <ButtonText>Connected</ButtonText>
    </ConnectedContainer>
  );
};

// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react'
import { Button, Form, Grid, Header, Image, Segment } from 'semantic-ui-react'
import Credentials, { computeCredentials } from '../Credentials';
import Ledger from '@daml/ledger';
import { Currency } from '@daml.js/Currency';
import { DeploymentMode, deploymentMode, ledgerId, httpBaseUrl} from '../config';
import { useEffect } from 'react';
import { registerOwner } from '../utils';

type Props = {
  onLogin: (credentials: Credentials) => void;
}

const loginTypeOptions = [
  { key: 'issuer', text: 'Issuer', value: 'issuer' },
  { key: 'owner', text: 'Owner', value: 'owner' },
]

/**
 * React component for the login screen of the `App`.
 */
const LoginScreen: React.FC<Props> = ({onLogin}) => {
  const [username, setUsername] = React.useState('');
  const [loginType, setLoginType] = React.useState('issuer');

  const login = useCallback(async (credentials: Credentials) => {
    try {
      const ledger = new Ledger({token: credentials.token, httpBaseUrl});
      if (loginType === 'issuer') {
        let issuerContract = await ledger.fetchByKey(Currency.Issuer, {_1: credentials.party, _2: "Issuer"});
        if (issuerContract === null) {
          const issuer: Currency.Issuer = {name: credentials.party, total: '0'};
          issuerContract = await ledger.create(Currency.Issuer, issuer);
        }
      } else {
        registerOwner(ledger, credentials.party);
      }
      onLogin(credentials);
    } catch(error) {
      alert(`Unknown error:\n${error}`);
    }
  }, [onLogin, loginType]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const credentials = computeCredentials(username, loginType);
    await login(credentials);
  }

  const handleDablLogin = () => {
    window.location.assign(`https://login.projectdabl.com/auth/login?ledgerId=${ledgerId}`);
  }

  useEffect(() => {
    const url = new URL(window.location.toString());
    const token = url.searchParams.get('token');
    if (token === null) {
      return;
    }
    const party = url.searchParams.get('party');
    if (party === null) {
      throw Error("When 'token' is passed via URL, 'party' must be passed too.");
    }
    const type = url.searchParams.get('type');
    if (type === null) {
      throw Error("When 'token' is passed via URL, 'type' must be passed too.");
    }
    url.search = '';
    window.history.replaceState(window.history.state, '', url.toString());
    login({token, party, ledgerId, type});
  }, [login]);

  return (
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as='h1' textAlign='center' size='huge' style={{color: '#223668'}}>
          <Header.Content>
            Create
            <Image
              as='a'
              href='https://www.daml.com/'
              target='_blank'
              src='/daml.svg'
              alt='DAML Logo'
              spaced
              size='small'
              verticalAlign='middle'
            />
            App
          </Header.Content>
        </Header>
        <Form size='large' className='test-select-login-screen'>
          <Segment>
            {deploymentMode !== DeploymentMode.PROD_DABL
            ? <>
                {/* FORM_BEGIN */}
                <Form.Input
                  fluid
                  icon='user'
                  iconPosition='left'
                  placeholder='Username'
                  value={username}
                  className='test-select-username-field'
                  onChange={e => setUsername(e.currentTarget.value)}
                />
                <Form.Dropdown
                  placeholder='Select Type'
                  fluid
                  selection
                  className='test-select-username-field'
                  value={loginType}
                  options={loginTypeOptions}
                  onChange={(e, { value }) => {
                    setLoginType(value as string);
                  }}
                />
                <Button
                  primary
                  fluid
                  className='test-select-login-button'
                  onClick={handleLogin}>
                  Log in
                </Button>
                {/* FORM_END */}
              </>
            : <Button primary fluid onClick={handleDablLogin}>
                Log in with DABL
              </Button>
            }
          </Segment>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

export default LoginScreen;

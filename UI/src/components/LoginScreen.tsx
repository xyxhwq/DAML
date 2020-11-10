// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react'
import { Button, Form, Grid, Header, Image, Segment, Dropdown } from 'semantic-ui-react'
import Credentials, { computeCredentials } from '../Credentials';
import Ledger from '@daml/ledger';
import { Currency } from '@daml.js/Currency';
import { DeploymentMode, deploymentMode, ledgerId, httpBaseUrl} from '../config';
import { useEffect } from 'react';

type Props = {
  onLogin: (credentials: Credentials) => void;
}

const loginTypeOptions = [
  { key: 'publisher', text: 'Publisher', value: 'publisher' },
  { key: 'owner', text: 'Owner', value: 'owner' },
]

/**
 * React component for the login screen of the `App`.
 */
const LoginScreen: React.FC<Props> = ({onLogin}) => {
  const [username, setUsername] = React.useState('');
  const [loginType, setLoginType] = React.useState('publisher');

  const login = useCallback(async (credentials: Credentials) => {
    try {
      const ledger = new Ledger({token: credentials.token, httpBaseUrl});
      let userContract = await ledger.fetchByKey(Currency.Publisher, credentials.party);
      if (userContract === null) {
        const user = {name: credentials.party, value: '0'};
        userContract = await ledger.create(Currency.Publisher, user);
      }
      onLogin(credentials);
    } catch(error) {
      alert(`Unknown error:\n${error}`);
    }
  }, [onLogin]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const credentials = computeCredentials(username);
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
    url.search = '';
    window.history.replaceState(window.history.state, '', url.toString());
    login({token, party, ledgerId});
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

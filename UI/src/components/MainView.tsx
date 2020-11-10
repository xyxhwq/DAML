// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useState } from 'react';
import { Container, Grid, Header, Icon, Segment, Divider, List, Form } from 'semantic-ui-react';
import { Party, Decimal } from '@daml/types';
import { Currency } from '@daml.js/Currency';
import { useParty, useLedger, useStreamFetchByKey, useStreamQuery } from '@daml/react';
// import UserList from './UserList';

// USERS_BEGIN
const MainView: React.FC = () => {
  const [newOwner, setNewOwner] = useState('');
  const [amount, setAmount] = useState('0');
  const username = useParty();
  const myUserResult = useStreamFetchByKey(Currency.Publisher, () => username, [username]);
  const myUser = myUserResult.contract?.payload;
  console.log(myUser)
  const allOwners = useStreamQuery(Currency.Owner).contracts;
// USERS_END

  // Sorted list of users that are following the current user
  const Owners = useMemo(() =>
    allOwners
    .map(user => user.payload),
    [allOwners, username]);

  // FOLLOW_BEGIN
  const ledger = useLedger();

  const publish = async (owner: Party, amount: Decimal): Promise<boolean> => {
    try {
      await ledger.exerciseByKey(Currency.Publisher.Publish, username, {owner, amount});
      return true;
    } catch (error) {
      alert(`Unknown error:\n${error}`);
      return false;
    }
  }
  // FOLLOW_END

  return (
    <Container>
      <Grid centered columns={2}>
        <Grid.Row stretched>
          <Grid.Column>
            <Header as='h1' size='huge' color='blue' textAlign='center' style={{padding: '1ex 0em 0ex 0em'}}>
                {myUser ? `Welcome, ${myUser.name}!` : 'Loading...'}
            </Header>
            <Segment>
              <Header as='h2'>
                <Icon name='user' />
                <Header.Content>
                  {myUser?.name ?? 'Loading...'}
                  <Header.Subheader>Owners</Header.Subheader>
                  <Divider />
                  <List relaxed>
                  {Owners.map((owner) =>
                    <List.Item
                      key={owner.name}
                    >
                      <List.Icon name='user outline' />
                      <List.Content>
                        <List.Header className='test-select-following'>
                          {owner.name}
                        </List.Header>
                      </List.Content>
                    </List.Item>
                  )}
                  </List>
                </Header.Content>
              </Header>
              <Form>
                <Form.Input
                  value={newOwner}
                  onChange={e => setNewOwner(e.currentTarget.value)}
                />
                <Form.Input
                  value={amount}
                  type="number"
                  onChange={e => setAmount(e.currentTarget.value)}
                />
                <Form.Button
                  primary
                  fluid
                  onClick={() => publish(newOwner, amount)}>
                  Publish
                </Form.Button>
              </Form>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}

export default MainView;

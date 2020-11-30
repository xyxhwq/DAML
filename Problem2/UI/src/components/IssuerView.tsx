// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Container, Grid, Header, Icon, Segment, Form, Divider } from 'semantic-ui-react';
import { Decimal, ContractId } from '@daml/types';
import { Currency } from '@daml.js/Currency';
import { useParty, useLedger, useStreamFetchByKey } from '@daml/react';
import { registerOwner } from '../utils'

// USERS_BEGIN
const IssuerView: React.FC = () => {
  const [amount, setAmount] = useState('0');
  const issuerName = useParty();
  const issuerKey = {_1: issuerName, _2: 'Issuer'};
  const ownerKey = {_1: issuerName, _2: 'Owner'};
  const issuerResult = useStreamFetchByKey(Currency.Issuer, () => issuerKey, [issuerName]);
  const issuer = issuerResult.contract?.payload;

  // FOLLOW_BEGIN
  const ledger = useLedger();

  const issue = async (amount: Decimal): Promise<boolean> => {
    try {
      let ownerContract = await ledger.fetchByKey(Currency.Owner, ownerKey);
      if (!ownerContract) {
        await registerOwner(ledger, issuerName);
        ownerContract = await ledger.fetchByKey(Currency.Owner, ownerKey);
      }
      console.log(ownerContract);
      if (ownerContract) {
        await ledger.exerciseByKey(Currency.Issuer.Issue, issuerKey,
            {
              // @ts-ignore
              ownerId: ownerContract.contractId as ContractId<Currency.Owner>,
              amount
            });
      }
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
                {issuer ? `Welcome, ${issuer.name}!` : 'Loading...'}
            </Header>
            <Segment>
              <Header as='h2'>
                <Icon name='user' />
                <Header.Content>
                  {issuer?.name ?? 'Loading...'}
                  <Divider/>
                  Issue amount: {issuer?.total}
                </Header.Content>
              </Header>
              <Form>
                <Form.Input
                  value={amount}
                  type="number"
                  onChange={e => setAmount(e.currentTarget.value)}
                />
                <Form.Button
                  primary
                  fluid
                  onClick={() => issue(amount)}>
                  Issue
                </Form.Button>
              </Form>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}

export default IssuerView;

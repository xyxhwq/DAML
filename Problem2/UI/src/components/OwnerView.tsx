// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useState } from 'react';
import { Container, Grid, Header, Icon, Segment, Divider, List, Form } from 'semantic-ui-react';
import { Party, Decimal, ContractId } from '@daml/types';
import { Currency } from '@daml.js/Currency';
import { useParty, useLedger, useStreamFetchByKey, useStreamQuery } from '@daml/react';
// import { Proposal } from '@daml.js/currency/lib/Currency';

// USERS_BEGIN
const OwnerView: React.FC = () => {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('0');
  const ownerName = useParty();
  const ownerKey = {_2: 'Owner', _1: ownerName};
  const ownerResult = useStreamFetchByKey(Currency.Owner, () => ownerKey, [ownerName]);
  const owner = ownerResult.contract?.payload;
  const transferProposals = useStreamQuery(Currency.Proposal).contracts;


  const frozenAmount = useMemo(() =>{
      let total = 0;
      transferProposals.forEach(proposal => {
        total += +proposal.payload.contract.amount;
      });
      return total;
    },
    [transferProposals]);


  const ledger = useLedger();


  const transfer = async (receiver: Party, amount: Decimal): Promise<boolean> => {
    try {
      await ledger.exerciseByKey(Currency.Owner.ProposeTransfer, ownerKey, {receiver, amount});
      return true;
    } catch (error) {
      alert(`Transfer error:\n${error}`);
      return false;
    }
  }

  const receiveTransfer = async (id: ContractId<Currency.Proposal>): Promise<boolean> => {
    let transferContractId;
    try {
      transferContractId = await ledger.exercise(Currency.Proposal.ProposalAccept, id, {});
    } catch (error) {
      alert(`Unknown error:\n${error}`);
    }
    try {
      // @ts-ignore
      await ledger.exerciseByKey(Currency.Owner.ReceiveTransfer, ownerKey, {id: transferContractId});
    } catch (error) {
      alert(`Unknown error:\n${error}`);
    }
    return true
  }

  return (
    <Container>
      <Grid centered columns={2}>
        <Grid.Row stretched>
          <Grid.Column>
            <Header as='h1' size='huge' color='blue' textAlign='center' style={{padding: '1ex 0em 0ex 0em'}}>
                {owner ? `Welcome, ${owner.name}!` : 'Loading...'}
            </Header>
            <Segment>
              <Header as='h2'>
                <Icon name='user' />
                <Header.Content>
                  {ownerName}
                  
                  <Divider />
                  Cash: {owner?.cash.amount}
                  <Divider />
                  Freeze: {frozenAmount}
                </Header.Content>
              </Header>
              <Form>
                <Form.Input
                  value={receiver}
                  onChange={e => setReceiver(e.currentTarget.value)}
                />
                <Form.Input
                  value={amount}
                  type="number"
                  onChange={e => setAmount(e.currentTarget.value)}
                />
                <Form.Button
                  primary
                  fluid
                  onClick={() => transfer(receiver, amount)}>
                  Transfer
                </Form.Button>
              </Form>
              <List divided relaxed>
                {transferProposals.filter(proposal => proposal.payload.contract.partyB === ownerName)
                  .map(({payload: {contract}, contractId}) =>
                  <List.Item key={contractId}>
                    <List.Content floated='right'>
                      <Icon
                        name='add user'
                        link
                        className='test-select-add-user-following-icon'
                        onClick={() => receiveTransfer(contractId)} />
                    </List.Content>
                    <List.Icon name='user outline' />
                    <List.Content>
                      <List.Header>{contract.partyA} -&gt; {contract.amount}</List.Header>
                    </List.Content>
                  </List.Item>
                )}
              </List>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}

export default OwnerView;

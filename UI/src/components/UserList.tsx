// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react'
import { Icon, List } from 'semantic-ui-react'
import { Party } from '@daml/types';
import { Currency } from '@daml.js/Currency';

type Props = {
  owners: Currency.Owner[];
  onPublish: (userToFollow: Party) => void;
}

/**
 * React component to display a list of `User`s.
 * Every party in the list can be added as a friend.
 */
const UserList: React.FC<Props> = ({owners, onPublish}) => {
  return (
    <List divided relaxed>
      {[...owners].sort((x, y) => x.name.localeCompare(y.name)).map(user =>
        <List.Item key={user.name}>
          <List.Icon name='user' />
          <List.Content>
            <List.Content floated='right'>
              <Icon
                name='add user'
                link
                className='test-select-add-user-icon'
                onClick={() => onPublish(user.name)} />
            </List.Content>
            <List.Header className='test-select-user-in-network'>{user.name}</List.Header>
          </List.Content>
        </List.Item>
      )}
    </List>
  );
};

export default UserList;

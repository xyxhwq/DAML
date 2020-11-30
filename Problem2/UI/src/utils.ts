
import { Currency } from '@daml.js/Currency';
import Ledger from '@daml/ledger';

export const registerOwner = async (ledger: Ledger, name: string) => {
  const cash: Currency.Cash = {issuer: 'Bank', amount: '0'};
  const owner: Currency.Owner = {name, cash};
  let ownerContract;
  try {
    ownerContract = await ledger.create(Currency.Owner, owner);
  } catch (e) {
    console.log(e);
  }
  return ownerContract;
}
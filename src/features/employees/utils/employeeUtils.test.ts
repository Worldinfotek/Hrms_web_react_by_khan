import { initials } from './initials';

describe('initials', () => {
  it.each([
    ['Ali Raza', 'AR'],
    ['Ali Raza Khan', 'AK'],
    ['  sana  ', 'S'],
    ['', ''],
  ])('%s → %s', (name, expected) => expect(initials(name)).toBe(expected));
});

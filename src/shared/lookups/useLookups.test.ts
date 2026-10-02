import { toOptions } from './useLookups';

const cities = [
  { id: 10, code: 'LHE', name: 'Lahore', parentId: 1 },
  { id: 11, code: 'KHI', name: 'Karachi', parentId: 1 },
  { id: 20, code: 'DXB', name: 'Dubai', parentId: 2 },
];

describe('toOptions', () => {
  it('maps lookup items to select options', () => {
    expect(toOptions(cities)).toHaveLength(3);
    expect(toOptions(cities)[0]).toEqual({ value: 10, label: 'Lahore' });
  });

  it('filters by parent for cascading dropdowns', () => {
    expect(toOptions(cities, 2).map((o) => o.label)).toEqual(['Dubai']);
  });

  it('handles missing data', () => expect(toOptions(undefined)).toEqual([]));
});

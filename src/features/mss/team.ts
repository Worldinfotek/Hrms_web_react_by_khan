export const MANAGER = {
  code: 'WIT-0005',
  name: 'Usman Khan',
  designation: 'Team Lead',
};

export const TEAM = [
  { code: 'WIT-0006', name: 'Hira Shah', designation: 'Senior Software Engineer' },
  { code: 'WIT-0007', name: 'Ali Raza', designation: 'Software Engineer' },
  { code: 'WIT-0011', name: 'Hamza Yousaf', designation: 'Intern' },
];

export const TEAM_CODES = TEAM.map((person) => person.code);

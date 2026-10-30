// The players on the collector cards. Real players, written about from public facts.
// No photos, logos or team names: cards show a drawn player in colours that suggest the city.

export type Role = 'hitter' | 'pitcher';

export interface Player {
  id: string;
  name: string;
  /** Position, e.g. "SS" or "P". */
  pos: string;
  /** The city they are best known for playing in. */
  city: string;
  role: Role;
  /** Card colours: main, then trim. */
  colors: [string, string];
  legend?: boolean;
  /** Canadian connection, shown with a maple leaf. */
  canada?: boolean;
  /** Card ratings out of 99 (made up for the game): contact, power, speed, or for pitchers velocity, control, stamina. */
  ratings: [number, number, number];
  /** The fact on the back of the card. */
  fact: string;
}

const TOR: [string, string] = ['#134a8e', '#e8291c'];
const NYY: [string, string] = ['#0c2340', '#c4ced3'];
const NYM: [string, string] = ['#002d72', '#ff5910'];
const LAD: [string, string] = ['#005a9c', '#ef3e42'];
const LAA: [string, string] = ['#ba0021', '#003263'];
const ATL: [string, string] = ['#13274f', '#ce1141'];
const SEA: [string, string] = ['#0c2c56', '#005c5c'];
const KC: [string, string] = ['#004687', '#bd9b60'];
const PIT: [string, string] = ['#27251f', '#fdb827'];
const CIN: [string, string] = ['#c6011f', '#000000'];
const BAL: [string, string] = ['#df4601', '#000000'];
const COL: [string, string] = ['#33006f', '#c4ced4'];
const CHC: [string, string] = ['#0e3386', '#cc3433'];
const MTL: [string, string] = ['#003087', '#e4002b'];
const SF: [string, string] = ['#fd5a1e', '#27251f'];
const TEX: [string, string] = ['#003278', '#c0111f'];
const PHI: [string, string] = ['#e81828', '#002d72'];
const HOU: [string, string] = ['#002d62', '#eb6e1f'];

const H = (id: string, name: string, pos: string, city: string, colors: [string, string], ratings: [number, number, number], fact: string, extra: Partial<Player> = {}): Player =>
  ({ id, name, pos, city, role: 'hitter', colors, ratings, fact, ...extra });
const P = (id: string, name: string, city: string, colors: [string, string], ratings: [number, number, number], fact: string, extra: Partial<Player> = {}): Player =>
  ({ id, name, pos: 'P', city, role: 'pitcher', colors, ratings, fact, ...extra });

export const PLAYERS: Player[] = [
  H('vlad', 'Vladimir Guerrero Jr.', '1B', 'Toronto', TOR, [92, 90, 45], 'Born in Montreal. His dad, Vladimir Guerrero, is in the Hall of Fame.', { canada: true }),
  H('bichette', 'Bo Bichette', 'SS', 'Toronto', TOR, [93, 74, 66], 'His dad Dante also played in the big leagues.'),
  H('springer', 'George Springer', 'OF', 'Toronto', TOR, [80, 82, 70], 'Was the MVP of the 2017 World Series.'),
  H('bautista', 'José Bautista', 'OF', 'Toronto', TOR, [74, 95, 50], 'Famous for his giant bat flip in the 2015 playoffs. Hit 54 home runs in 2010.', { legend: true }),
  H('carter', 'Joe Carter', 'OF', 'Toronto', TOR, [76, 88, 62], 'Hit a walk-off home run to win the 1993 World Series for Toronto.', { legend: true }),
  H('ohtani', 'Shohei Ohtani', 'DH', 'Los Angeles', LAD, [91, 99, 88], 'He hits and pitches. In 2024 he was the first player with 50 home runs and 50 steals in one season.'),
  H('judge', 'Aaron Judge', 'OF', 'New York', NYY, [88, 99, 55], 'Hit 62 home runs in 2022, an American League record. He is 6 feet 7 inches tall.'),
  H('soto', 'Juan Soto', 'OF', 'New York', NYM, [94, 90, 52], 'Won the World Series when he was only 20 years old.'),
  H('alonso', 'Pete Alonso', '1B', 'New York', NYM, [78, 95, 35], 'Nicknamed "the Polar Bear." Hit 53 home runs as a rookie in 2019.'),
  H('trout', 'Mike Trout', 'OF', 'Anaheim', LAA, [92, 93, 75], 'Has won the American League MVP award three times.'),
  H('betts', 'Mookie Betts', 'SS', 'Los Angeles', LAD, [93, 84, 80], 'Won the 2018 MVP. He is also a champion bowler!'),
  H('freeman', 'Freddie Freeman', '1B', 'Los Angeles', LAD, [95, 82, 50], 'Plays for Team Canada because his parents are Canadian. Hit a walk-off grand slam in the 2024 World Series.', { canada: true }),
  H('acuna', 'Ronald Acuña Jr.', 'OF', 'Atlanta', ATL, [88, 90, 97], 'In 2023 he was the first player with 40 home runs and 70 steals in one season.'),
  H('julio', 'Julio Rodríguez', 'OF', 'Seattle', SEA, [86, 84, 92], 'Was the American League Rookie of the Year in 2022.'),
  H('witt', 'Bobby Witt Jr.', 'SS', 'Kansas City', KC, [92, 85, 98], 'One of the fastest runners in baseball.'),
  H('votto', 'Joey Votto', '1B', 'Cincinnati', CIN, [95, 80, 40], 'Grew up in Toronto and won the 2010 National League MVP.', { canada: true }),
  H('walker', 'Larry Walker', 'OF', 'Denver', COL, [93, 88, 75], 'From Maple Ridge, B.C. Won the 1997 MVP and is in the Hall of Fame.', { canada: true, legend: true }),
  H('ripken', 'Cal Ripken Jr.', 'SS', 'Baltimore', BAL, [86, 80, 50], 'Played 2632 games in a row without missing one.', { legend: true }),
  H('ichiro', 'Ichiro Suzuki', 'OF', 'Seattle', SEA, [99, 55, 95], 'Got 262 hits in 2004, the most ever in one season.', { legend: true }),
  H('griffey', 'Ken Griffey Jr.', 'OF', 'Seattle', SEA, [90, 94, 82], 'Hit 630 home runs and won 10 Gold Gloves for his fielding.', { legend: true }),
  H('robinson', 'Jackie Robinson', '2B', 'Brooklyn', ['#1e3a8a', '#ffffff'], [92, 70, 95], 'Played in Montreal in 1946, then broke baseball\'s colour barrier in 1947. Every player wears 42 on Jackie Robinson Day.', { legend: true, canada: true }),
  H('ruth', 'Babe Ruth', 'OF', 'New York', NYY, [90, 99, 40], 'Hit 714 home runs, the record for almost 40 years.', { legend: true }),
  H('aaron', 'Hank Aaron', 'OF', 'Atlanta', ATL, [92, 97, 60], 'Hit 755 home runs, breaking Babe Ruth\'s record.', { legend: true }),
  H('mays', 'Willie Mays', 'OF', 'San Francisco', SF, [90, 94, 92], 'Made "The Catch," a famous over-the-shoulder grab in the 1954 World Series.', { legend: true }),
  P('skenes', 'Paul Skenes', 'Pittsburgh', PIT, [99, 85, 80], 'Was the National League Rookie of the Year in 2024.'),
  P('gausman', 'Kevin Gausman', 'Toronto', TOR, [88, 88, 82], 'Famous for his splitter, a pitch that drops at the last second.'),
  P('cole', 'Gerrit Cole', 'New York', NYY, [95, 88, 90], 'Won the 2023 Cy Young award for the best pitcher in the American League.'),
  P('kershaw', 'Clayton Kershaw', 'Los Angeles', LAD, [86, 95, 85], 'Won the Cy Young award three times. Famous for his big curveball.'),
  P('halladay', 'Roy Halladay', 'Toronto', TOR, [88, 99, 99], 'A Toronto ace who later threw a perfect game and a playoff no-hitter in the same season.', { legend: true }),
  P('jenkins', 'Fergie Jenkins', 'Chicago', CHC, [85, 97, 99], 'From Chatham, Ontario. The first Canadian in the Hall of Fame.', { legend: true, canada: true }),
  P('ryan', 'Nolan Ryan', 'Texas', TEX, [99, 75, 95], 'Threw 7 no-hitters and struck out 5714 batters, both records.', { legend: true }),
  P('martinez', 'Pedro Martínez', 'Montreal', MTL, [94, 96, 85], 'Won the Cy Young award pitching in Montreal in 1997.', { legend: true, canada: true }),
  P('wheeler', 'Zack Wheeler', 'Philadelphia', PHI, [94, 92, 92], 'One of the hardest-throwing starting pitchers in baseball.'),
  H('altuve', 'José Altuve', '2B', 'Houston', HOU, [94, 75, 80], 'At 5 feet 6 inches, he is one of the shortest players and one of the best hitters.'),
];

export const playerById = (id: string) => PLAYERS.find((p) => p.id === id);

export const RATING_NAMES: Record<Role, [string, string, string]> = {
  hitter: ['Contact', 'Power', 'Speed'],
  pitcher: ['Velocity', 'Control', 'Stamina'],
};

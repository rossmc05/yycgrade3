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
const MIN: [string, string] = ['#002b5c', '#d31145'];
const DET: [string, string] = ['#0c2340', '#fa4616'];
const BOS: [string, string] = ['#bd3039', '#0c2340'];
const STL: [string, string] = ['#c41e3a', '#0c2340'];
const CLE: [string, string] = ['#00385d', '#e50022'];
const SD: [string, string] = ['#2f241d', '#ffc425'];
const OAK: [string, string] = ['#003831', '#efb21e'];
const ARI: [string, string] = ['#a71930', '#e3d4ad'];
const WSH: [string, string] = ['#ab0003', '#14225a'];
const MON: [string, string] = ['#1e3a8a', '#dc2626'];
const GRAYS: [string, string] = ['#111827', '#9ca3af'];

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
  // More Toronto, Montreal and Canadian players
  P('stieb', 'Dave Stieb', 'Toronto', TOR, [88, 90, 95], 'Threw the first no-hitter in Toronto history, in 1990.', { legend: true }),
  H('molitor', 'Paul Molitor', 'DH', 'Toronto', TOR, [95, 72, 80], 'MVP of the 1993 World Series for Toronto. He got more than 3000 hits.', { legend: true }),
  H('delgado', 'Carlos Delgado', '1B', 'Toronto', TOR, [84, 94, 40], 'Hit four home runs in one game for Toronto in 2003.', { legend: true }),
  H('donaldson', 'Josh Donaldson', '3B', 'Toronto', TOR, [86, 90, 55], 'Won the 2015 American League MVP playing for Toronto.'),
  H('encarnacion', 'Edwin Encarnación', 'DH', 'Toronto', TOR, [80, 92, 35], 'Famous for "walking the parrot" after home runs. Hit a walk-off homer in the 2016 playoffs.'),
  H('morneau', 'Justin Morneau', '1B', 'Minnesota', MIN, [86, 86, 40], 'From New Westminster, B.C. Won the 2006 American League MVP.', { canada: true }),
  H('bay', 'Jason Bay', 'OF', 'Pittsburgh', PIT, [82, 84, 70], 'From Trail, B.C. Was the 2004 National League Rookie of the Year.', { canada: true }),
  P('gagne', 'Éric Gagné', 'Los Angeles', LAD, [97, 85, 60], 'From Montreal. Won the 2003 Cy Young award as a closer and saved 84 games in a row.', { canada: true }),
  H('raines', 'Tim Raines', 'OF', 'Montreal', MON, [90, 65, 99], 'A Montreal star who stole 808 bases. He is in the Hall of Fame.', { legend: true, canada: true }),
  H('gcarter', 'Gary Carter', 'C', 'Montreal', MON, [82, 82, 50], 'Montreal\'s Hall of Fame catcher, nicknamed "The Kid."', { legend: true, canada: true }),
  H('dawson', 'Andre Dawson', 'OF', 'Montreal', MON, [85, 88, 80], 'Nicknamed "The Hawk." Started in Montreal and won the 1987 MVP.', { legend: true, canada: true }),
  H('vlad-sr', 'Vladimir Guerrero', 'OF', 'Montreal', MON, [94, 92, 70], 'Montreal slugger who could hit pitches near his shoes. Hall of Fame 2018. Father of Vladimir Jr.', { legend: true, canada: true }),
  H('oneill', "Tyler O'Neill", 'OF', 'St. Louis', STL, [78, 90, 88], 'From British Columbia. Won two Gold Gloves for his fielding.', { canada: true }),
  H('naylor', 'Josh Naylor', '1B', 'Cleveland', CLE, [86, 84, 45], 'From Mississauga, Ontario. His brother Bo is a big-league catcher too.', { canada: true }),
  P('paxton', 'James Paxton', 'Seattle', SEA, [92, 84, 80], 'From B.C. and nicknamed "Big Maple." Threw a no-hitter in Toronto in 2018.', { canada: true }),
  // Today's stars
  H('seager', 'Corey Seager', 'SS', 'Texas', TEX, [92, 88, 50], 'Has been World Series MVP twice, with two different teams.'),
  P('yamamoto', 'Yoshinobu Yamamoto', 'Los Angeles', LAD, [92, 94, 85], 'A star pitcher from Japan who joined Los Angeles in 2024.'),
  H('tatis', 'Fernando Tatis Jr.', 'OF', 'San Diego', SD, [86, 92, 90], 'His dad once hit two grand slams in one inning!'),
  H('lindor', 'Francisco Lindor', 'SS', 'New York', NYM, [88, 84, 82], 'Nicknamed "Mr. Smile" for always having fun on the field.'),
  H('harper', 'Bryce Harper', '1B', 'Philadelphia', PHI, [90, 92, 65], 'Won the MVP in 2015 and 2021.'),
  H('gunnar', 'Gunnar Henderson', 'SS', 'Baltimore', BAL, [86, 88, 80], 'Was the American League Rookie of the Year in 2023.'),
  H('elly', 'Elly De La Cruz', 'SS', 'Cincinnati', CIN, [78, 86, 99], 'Super fast, with one of the strongest throwing arms in baseball.'),
  H('raleigh', 'Cal Raleigh', 'C', 'Seattle', SEA, [76, 97, 30], 'Nicknamed "Big Dumper." In 2025 he hit more home runs than any catcher ever.'),
  P('skubal', 'Tarik Skubal', 'Detroit', DET, [94, 95, 88], 'Won the 2024 American League Cy Young award.'),
  P('degrom', 'Jacob deGrom', 'New York', NYM, [99, 95, 75], 'Won the Cy Young award two years in a row, in 2018 and 2019.'),
  P('verlander', 'Justin Verlander', 'Detroit', DET, [94, 90, 95], 'Has thrown three no-hitters and won three Cy Young awards.'),
  P('scherzer', 'Max Scherzer', 'Washington', WSH, [93, 92, 92], 'Once struck out 20 batters in one game. His eyes are two different colours!'),
  // Legends
  P('rivera', 'Mariano Rivera', 'New York', NYY, [90, 99, 70], 'Saved 652 games with his cutter. The first player voted into the Hall of Fame by every voter.', { legend: true }),
  H('jeter', 'Derek Jeter', 'SS', 'New York', NYY, [94, 70, 80], 'Got more than 3400 hits and won five World Series.', { legend: true }),
  H('williams', 'Ted Williams', 'OF', 'Boston', BOS, [99, 92, 45], 'The last player to bat over .400 for a whole season, in 1941.', { legend: true }),
  H('gehrig', 'Lou Gehrig', '1B', 'New York', NYY, [95, 94, 55], 'Called "the Iron Horse." Played 2130 games in a row.', { legend: true }),
  H('clemente', 'Roberto Clemente', 'OF', 'Pittsburgh', PIT, [95, 75, 85], 'Got exactly 3000 hits and won 12 Gold Gloves. Famous for helping others.', { legend: true }),
  P('koufax', 'Sandy Koufax', 'Los Angeles', LAD, [97, 90, 85], 'Threw four no-hitters, including a perfect game in 1965.', { legend: true }),
  P('paige', 'Satchel Paige', 'Kansas City', MON, [92, 99, 99], 'A Negro Leagues superstar who pitched in the major leagues at age 59!', { legend: true }),
  H('gibson', 'Josh Gibson', 'C', 'Pittsburgh', GRAYS, [97, 99, 50], 'A Negro Leagues catcher known as one of the greatest home run hitters ever.', { legend: true }),
  H('rickey', 'Rickey Henderson', 'OF', 'Oakland', OAK, [88, 70, 99], 'Stole 1406 bases, the most ever. Won the 1993 World Series with Toronto.', { legend: true }),
  P('rjohnson', 'Randy Johnson', 'Arizona', ARI, [98, 85, 92], 'Nicknamed "the Big Unit." At 6 feet 10 inches, he won five Cy Young awards.', { legend: true }),
  H('ortiz', 'David Ortiz', 'DH', 'Boston', BOS, [88, 95, 25], 'Nicknamed "Big Papi." Won three World Series with Boston.', { legend: true }),
  H('pujols', 'Albert Pujols', '1B', 'St. Louis', STL, [95, 95, 40], 'Hit 703 home runs in his career.', { legend: true }),
  H('cabrera', 'Miguel Cabrera', '1B', 'Detroit', DET, [97, 90, 30], 'Won the Triple Crown in 2012: most home runs, most runs batted in and best average.', { legend: true }),
];
export const playerById = (id: string) => PLAYERS.find((p) => p.id === id);

export const RATING_NAMES: Record<Role, [string, string, string]> = {
  hitter: ['Contact', 'Power', 'Speed'],
  pitcher: ['Velocity', 'Control', 'Stamina'],
};

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
  /** The one chase card: only ever pulled as a 1/1 Autograph. */
  chase?: boolean;
  /** A top 2025 rookie: only ever pulled as a 1/1 Superfractor. */
  rookie?: boolean;
  /** Only earned as a Milestone card by reaching a rank. */
  milestone?: boolean;
  /** A rookie Superfractor that is also signed. */
  signed?: boolean;
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
const ATL: [string, string] = ['#13274f', '#ce1141'];
const SEA: [string, string] = ['#0c2c56', '#005c5c'];
const PIT: [string, string] = ['#27251f', '#fdb827'];
const CIN: [string, string] = ['#c6011f', '#000000'];
const CHC: [string, string] = ['#0e3386', '#cc3433'];
const SF: [string, string] = ['#fd5a1e', '#27251f'];
const TEX: [string, string] = ['#003278', '#c0111f'];
const PHI: [string, string] = ['#e81828', '#002d72'];
const HOU: [string, string] = ['#002d62', '#eb6e1f'];
const DET: [string, string] = ['#0c2340', '#fa4616'];
const BOS: [string, string] = ['#bd3039', '#0c2340'];
const CLE: [string, string] = ['#00385d', '#e50022'];
const SD: [string, string] = ['#2f241d', '#ffc425'];
const ARI: [string, string] = ['#a71930', '#e3d4ad'];
const WSH: [string, string] = ['#ab0003', '#14225a'];
const MIL: [string, string] = ['#12284b', '#ffc52f'];
const NYY_RUTH: [string, string] = ['#1f2937', '#d6c8a5'];

const H = (id: string, name: string, pos: string, city: string, colors: [string, string], ratings: [number, number, number], fact: string, extra: Partial<Player> = {}): Player =>
  ({ id, name, pos, city, role: 'hitter', colors, ratings, fact, ...extra });
const P = (id: string, name: string, city: string, colors: [string, string], ratings: [number, number, number], fact: string, extra: Partial<Player> = {}): Player =>
  ({ id, name, pos: 'P', city, role: 'pitcher', colors, ratings, fact, ...extra });

export const PLAYERS: Player[] = [
  // Today's stars
  H('vlad', 'Vladimir Guerrero Jr.', '1B', 'Toronto', TOR, [92, 90, 45], 'Born in Montreal. His dad, Vladimir Guerrero, is in the Hall of Fame.'),
  H('bichette', 'Bo Bichette', 'SS', 'New York', NYM, [93, 74, 66], 'His dad Dante also played in the big leagues.'),
  H('springer', 'George Springer', 'OF', 'Toronto', TOR, [80, 82, 70], 'Was the MVP of the 2017 World Series.'),
  P('gausman', 'Kevin Gausman', 'Chicago', CHC, [88, 88, 82], 'Famous for his splitter, a pitch that drops at the last second.'),
  H('freeman', 'Freddie Freeman', '1B', 'Los Angeles', LAD, [95, 82, 50], 'Plays for Team Canada because his parents are Canadian. Hit a walk-off grand slam in the 2024 World Series.'),
  H('ohtani', 'Shohei Ohtani', 'DH', 'Los Angeles', LAD, [91, 99, 88], 'He hits and pitches. In 2024 he was the first player with 50 home runs and 50 steals in one season.'),
  H('judge', 'Aaron Judge', 'OF', 'New York', NYY, [88, 99, 55], 'Hit 62 home runs in 2022, an American League record. He is 6 feet 7 inches tall.'),
  H('soto', 'Juan Soto', 'OF', 'New York', NYM, [94, 90, 52], 'Won the World Series when he was only 20 years old.'),
  H('alonso', 'Pete Alonso', '1B', 'Baltimore', ['#df4601', '#000000'], [78, 95, 35], 'Nicknamed "the Polar Bear." Hit 53 home runs as a rookie in 2019.'),
  H('lindor', 'Francisco Lindor', 'SS', 'New York', NYM, [88, 84, 82], 'Nicknamed "Mr. Smile" for always having fun on the field.'),
  H('jazz', 'Jazz Chisholm Jr.', '3B', 'New York', NYY, [80, 84, 92], 'From the Bahamas, and famous for his colourful style.'),
  H('trout', 'Mike Trout', 'OF', 'Anaheim', ['#ba0021', '#003263'], [92, 93, 75], 'Has won the American League MVP award three times.'),
  H('betts', 'Mookie Betts', 'SS', 'Los Angeles', LAD, [93, 84, 80], 'Won the 2018 MVP. He is also a champion bowler!'),
  H('acuna', 'Ronald Acuña Jr.', 'OF', 'Atlanta', ATL, [88, 90, 97], 'In 2023 he was the first player with 40 home runs and 70 steals in one season.'),
  H('olson', 'Matt Olson', '1B', 'Atlanta', ATL, [82, 94, 30], 'Hit 54 home runs for Atlanta in 2023.'),
  H('julio', 'Julio Rodríguez', 'OF', 'Seattle', SEA, [86, 84, 92], 'Was the American League Rookie of the Year in 2022.'),
  H('raleigh', 'Cal Raleigh', 'C', 'Seattle', SEA, [76, 97, 30], 'Nicknamed "Big Dumper." In 2025 he hit more home runs than any catcher ever.'),
  H('witt', 'Bobby Witt Jr.', 'SS', 'Kansas City', ['#004687', '#bd9b60'], [92, 85, 98], 'One of the fastest runners in baseball.'),
  H('altuve', 'José Altuve', '2B', 'Houston', HOU, [94, 75, 80], 'At 5 feet 6 inches, he is one of the shortest players and one of the best hitters.'),
  H('yordan', 'Yordan Alvarez', 'DH', 'Houston', HOU, [92, 96, 30], 'One of the most powerful left-handed hitters in baseball.'),
  H('pena', 'Jeremy Peña', 'SS', 'Houston', HOU, [84, 74, 80], 'Was the MVP of the 2022 World Series as a rookie.'),
  H('seager', 'Corey Seager', 'SS', 'Texas', TEX, [92, 88, 50], 'Has been World Series MVP twice, with two different teams.'),
  H('tatis', 'Fernando Tatis Jr.', 'OF', 'San Diego', SD, [86, 92, 90], 'His dad once hit two grand slams in one inning!'),
  H('harper', 'Bryce Harper', '1B', 'Philadelphia', PHI, [90, 92, 65], 'Won the MVP in 2015 and 2021.'),
  H('schwarber', 'Kyle Schwarber', 'DH', 'Philadelphia', PHI, [72, 99, 30], 'One of the strongest home run hitters in baseball.'),
  H('turner', 'Trea Turner', 'SS', 'Philadelphia', PHI, [90, 76, 98], 'One of the fastest players in the game.'),
  H('gunnar', 'Gunnar Henderson', 'SS', 'Baltimore', ['#df4601', '#000000'], [86, 88, 80], 'Was the American League Rookie of the Year in 2023.'),
  H('elly', 'Elly De La Cruz', 'SS', 'Cincinnati', CIN, [78, 86, 99], 'Super fast, with one of the strongest throwing arms in baseball.'),
  H('jramirez', 'José Ramírez', '3B', 'Cleveland', CLE, [90, 88, 88], 'A switch-hitter who is a star at hitting and stealing bases.'),
  H('devers', 'Rafael Devers', '1B', 'San Francisco', SF, [88, 92, 35], 'Nicknamed "Carita," which means "little face."'),
  H('carroll', 'Corbin Carroll', 'OF', 'Arizona', ARI, [86, 78, 98], 'Was the National League Rookie of the Year in 2023.'),
  H('marte', 'Ketel Marte', '2B', 'Arizona', ARI, [92, 84, 60], 'A switch-hitter who was MVP of the 2023 National League playoffs series.'),
  H('pca', 'Pete Crow-Armstrong', 'OF', 'Chicago', CHC, [78, 80, 97], 'Famous for fast running and amazing catches in centre field.'),
  H('yelich', 'Christian Yelich', 'OF', 'Milwaukee', MIL, [90, 82, 75], 'Won the National League MVP in 2018.'),
  H('chourio', 'Jackson Chourio', 'OF', 'Milwaukee', MIL, [84, 82, 90], 'Made the big leagues when he was 20 years old.'),
  H('wood', 'James Wood', 'OF', 'Washington', WSH, [82, 90, 75], 'A young slugger who stands 6 feet 7 inches tall.'),
  P('skenes', 'Paul Skenes', 'Pittsburgh', PIT, [99, 85, 80], 'Was the National League Rookie of the Year in 2024.'),
  P('skubal', 'Tarik Skubal', 'Los Angeles', LAD, [94, 95, 88], 'Won the 2024 American League Cy Young award.'),
  P('cole', 'Gerrit Cole', 'New York', NYY, [95, 88, 90], 'Won the 2023 Cy Young award for the best pitcher in the American League.'),
  P('wheeler', 'Zack Wheeler', 'Philadelphia', PHI, [94, 92, 92], 'One of the hardest-throwing starting pitchers in baseball.'),
  P('yamamoto', 'Yoshinobu Yamamoto', 'Los Angeles', LAD, [92, 94, 85], 'A star pitcher from Japan who joined Los Angeles in 2024.'),
  P('degrom', 'Jacob deGrom', 'Texas', TEX, [99, 95, 75], 'Won the Cy Young award two years in a row, in 2018 and 2019.'),
  P('verlander', 'Justin Verlander', 'Detroit', DET, [94, 90, 95], 'Has thrown three no-hitters and won three Cy Young awards.'),
  P('scherzer', 'Max Scherzer', 'Toronto', TOR, [93, 92, 92], 'Once struck out 20 batters in one game. His eyes are two different colours!'),
  P('imanaga', 'Shota Imanaga', 'Chicago', CHC, [86, 92, 85], 'A pitcher from Japan who joined Chicago in 2024.'),
  P('webb', 'Logan Webb', 'San Francisco', SF, [84, 94, 99], 'A ground-ball expert who pitches deep into games.'),
  P('crochet', 'Garrett Crochet', 'Boston', BOS, [97, 88, 85], 'A tall lefty with a blazing fastball.'),
  P('hgreene', 'Hunter Greene', 'Cincinnati', CIN, [99, 80, 80], 'Throws fastballs over 100 miles per hour.'),
  P('mmiller', 'Mason Miller', 'San Diego', SD, [99, 82, 40], 'A closer who has thrown pitches over 103 miles per hour.'),
  H('machado', 'Manny Machado', '3B', 'San Diego', SD, [86, 88, 60], 'A star third baseman with more than 2000 hits.'),
  H('riley', 'Austin Riley', '3B', 'Atlanta', ATL, [84, 90, 45], 'A big slugger who helped Atlanta win the 2021 World Series.'),
  H('tucker', 'Kyle Tucker', 'OF', 'Los Angeles', LAD, [88, 86, 80], 'Can hit for power, steal bases and make great catches.'),
  H('rutschman', 'Adley Rutschman', 'C', 'Boston', BOS, [84, 78, 40], 'Was the first pick in the 2019 draft.'),
  H('wsmith', 'Will Smith', 'C', 'Los Angeles', LAD, [86, 80, 40], 'A catcher who has won the World Series with Los Angeles.'),
  H('arenado', 'Nolan Arenado', '3B', 'Arizona', ARI, [84, 84, 40], 'Has won 10 Gold Gloves at third base.'),
  H('duran', 'Jarren Duran', 'OF', 'Boston', BOS, [86, 74, 95], 'Was the MVP of the 2024 All-Star Game.'),
  H('rgreene', 'Riley Greene', 'OF', 'Detroit', DET, [84, 84, 70], 'A young All-Star outfielder for Detroit.'),
  P('burnes', 'Corbin Burnes', 'Arizona', ARI, [92, 92, 85], 'Won the 2021 Cy Young award with a nasty cutter.'),
  P('sale', 'Chris Sale', 'Atlanta', ATL, [95, 90, 85], 'Won the 2024 National League Cy Young award.'),
  P('snell', 'Blake Snell', 'Los Angeles', LAD, [96, 86, 60], 'Has won the Cy Young award in both leagues.'),
  P('strider', 'Spencer Strider', 'Atlanta', ATL, [99, 84, 70], 'Struck out 281 batters in 2023.'),
  P('valdez', 'Framber Valdez', 'Detroit', DET, [84, 92, 95], 'A ground-ball lefty with a big curveball.'),
  P('hader', 'Josh Hader', 'Houston', HOU, [97, 84, 40], 'One of the best closers in baseball.'),
  P('diaz', 'Edwin Díaz', 'Los Angeles', LAD, [99, 82, 40], 'A closer famous for trumpets playing when he runs in.'),
  // Legends
  H('griffey', 'Ken Griffey Jr.', 'OF', 'Seattle', SEA, [90, 94, 82], 'Hit 630 home runs and won 10 Gold Gloves for his fielding.', { legend: true }),
  H('bonds', 'Barry Bonds', 'OF', 'San Francisco', SF, [94, 99, 80], 'Hit 762 home runs, the most ever, and won 7 MVP awards.', { legend: true }),
  H('jeter', 'Derek Jeter', 'SS', 'New York', NYY, [94, 70, 80], 'Got more than 3400 hits and won five World Series.', { legend: true }),
  H('ichiro', 'Ichiro Suzuki', 'OF', 'Seattle', SEA, [99, 55, 95], 'Got 262 hits in 2004, the most ever in one season.', { legend: true }),
  H('ortiz', 'David Ortiz', 'DH', 'Boston', BOS, [88, 95, 25], 'Nicknamed "Big Papi." Won three World Series with Boston.', { legend: true }),
  H('pujols', 'Albert Pujols', '1B', 'St. Louis', ['#c41e3a', '#0c2340'], [95, 95, 40], 'Hit 703 home runs in his career.', { legend: true }),
  H('cabrera', 'Miguel Cabrera', '1B', 'Detroit', DET, [97, 90, 30], 'Won the Triple Crown in 2012: most home runs, most runs batted in and best average.', { legend: true }),
  P('rivera', 'Mariano Rivera', 'New York', NYY, [90, 99, 70], 'Saved 652 games with his cutter. The first player voted into the Hall of Fame by every voter.', { legend: true }),
  P('rjohnson', 'Randy Johnson', 'Arizona', ARI, [98, 85, 92], 'Nicknamed "the Big Unit." At 6 feet 10 inches, he won five Cy Young awards.', { legend: true }),
  P('kershaw', 'Clayton Kershaw', 'Los Angeles', LAD, [86, 95, 85], 'Won the Cy Young award three times. Famous for his big curveball.', { legend: true }),
  // Top 2025 rookies: 1/1 Superfractors only
  H('kurtz', 'Nick Kurtz', '1B', 'Sacramento', ['#003831', '#efb21e'], [86, 95, 35], 'The 2025 American League Rookie of the Year. Once hit 4 home runs in one game!', { rookie: true }),
  H('baldwin', 'Drake Baldwin', 'C', 'Atlanta', ATL, [86, 84, 30], 'The 2025 National League Rookie of the Year, as a catcher for Atlanta.', { rookie: true }),
  H('anthony', 'Roman Anthony', 'OF', 'Boston', BOS, [88, 84, 70], 'One of the top prospects in baseball when Boston called him up in 2025.', { rookie: true }),
  H('jwilson', 'Jacob Wilson', 'SS', 'Sacramento', ['#003831', '#efb21e'], [95, 60, 60], 'Almost never strikes out. His dad Jack was a big-league shortstop too.', { rookie: true }),
  P('horton', 'Cade Horton', 'Chicago', CHC, [88, 88, 85], 'A Chicago rookie pitcher who was a Rookie of the Year finalist in 2025.', { rookie: true }),
  P('schlittler', 'Cam Schlittler', 'New York', NYY, [94, 86, 82], 'A New York rookie with a 100 mph fastball. Struck out 12 in a 2025 playoff win over Boston.', { rookie: true, signed: true }),
  // Milestone cards: only earned by reaching a rank
  H('aaron', 'Hank Aaron', 'OF', 'Atlanta', ATL, [94, 96, 70], 'Hit 755 home runs and never struck out 100 times in a season. Known as "Hammerin\' Hank."', { legend: true, milestone: true }),
  H('mays', 'Willie Mays', 'OF', 'San Francisco', SF, [94, 94, 95], 'Hit 660 home runs and made one of the most famous catches ever, running away from home plate.', { legend: true, milestone: true }),
  H('robinson', 'Jackie Robinson', '2B', 'Brooklyn', ['#005a9c', '#ef3e42'], [92, 74, 96], 'Broke baseball\'s colour barrier in 1947. His number 42 is retired by every team in baseball.', { legend: true, milestone: true }),
  // The chase card
  H('ruth', 'Babe Ruth', 'OF', 'New York', NYY_RUTH, [90, 99, 40], 'The most famous baseball player ever. Hit 714 home runs. This signed card is one of a kind!', { legend: true, chase: true }),
];

export const playerById = (id: string) => PLAYERS.find((p) => p.id === id);

export const RATING_NAMES: Record<Role, [string, string, string]> = {
  hitter: ['Contact', 'Power', 'Speed'],
  pitcher: ['Velocity', 'Control', 'Stamina'],
};

import type { StaticImageData } from "next/image";

import { CARD_PHOTOS } from "@/lib/card-photos";

/** The six players the quiz is about. All of them are in debates on the site. */
export type FigureSlug = "ronaldo" | "messi" | "mcgregor" | "khabib" | "jordan" | "lebron";

export type Figure = { slug: FigureSlug; name: string; sport: string; color: string; photo: StaticImageData; debateSlug: string; debateTitle: string };

export const FIGURES: Figure[] = [
  { slug: "ronaldo", name: "Cristiano Ronaldo", sport: "Football", color: "#E8322A", photo: CARD_PHOTOS["ronaldo.jpg"], debateSlug: "messi-vs-ronaldo", debateTitle: "Messi vs Ronaldo" },
  { slug: "messi", name: "Lionel Messi", sport: "Football", color: "#75AADB", photo: CARD_PHOTOS["messi.jpg"], debateSlug: "messi-vs-ronaldo", debateTitle: "Messi vs Ronaldo" },
  { slug: "jordan", name: "Michael Jordan", sport: "Basketball", color: "#CE1141", photo: CARD_PHOTOS["jordan.jpg"], debateSlug: "lebron-vs-jordan", debateTitle: "LeBron vs Jordan" },
  { slug: "lebron", name: "LeBron James", sport: "Basketball", color: "#FDB927", photo: CARD_PHOTOS["lebron.jpg"], debateSlug: "lebron-vs-jordan", debateTitle: "LeBron vs Jordan" },
  { slug: "mcgregor", name: "Conor McGregor", sport: "MMA", color: "#2E8B57", photo: CARD_PHOTOS["mcgregor.jpg"], debateSlug: "khabib-vs-mcgregor", debateTitle: "Khabib vs McGregor" },
  { slug: "khabib", name: "Khabib Nurmagomedov", sport: "MMA", color: "#C8102E", photo: CARD_PHOTOS["khabib.jpg"], debateSlug: "khabib-vs-mcgregor", debateTitle: "Khabib vs McGregor" },
];

export function getFigure(slug: string): Figure | undefined {
  return FIGURES.find((f) => f.slug === slug);
}

/** 1 = well known, 2 = a fan would know it, 3 = a real one. */
export type Level = 1 | 2 | 3;

export type QuizQuestion = {
  id: string;
  figure: FigureSlug;
  level: Level;
  question: string;
  answer: string;
  wrong: [string, string, string];
  /** One line shown after the answer. */
  fact: string;
};

type Raw = [level: Level, question: string, answer: string, wrong: [string, string, string], fact: string];

/** Well-known, lasting facts only: no records that change. Seventeen per player: 6 easy, 7 medium, 4 hard. */
const RAW: Record<FigureSlug, Raw[]> = {
  ronaldo: [
    [1, "Which island was Cristiano Ronaldo born on?", "Madeira", ["The Azores", "Sardinia", "Mallorca"], "He was born in Funchal, Madeira, in 1985."],
    [1, "How many Ballon d'Or awards has Ronaldo won?", "5", ["3", "4", "6"], "2008, 2013, 2014, 2016 and 2017."],
    [1, "Which shirt number is Ronaldo famous for?", "7", ["9", "10", "11"], "The 7 at Manchester United, Real Madrid, Juventus and Portugal."],
    [1, "Which club did Ronaldo join from Real Madrid in 2018?", "Juventus", ["AC Milan", "Paris Saint-Germain", "Manchester City"], "He moved to Turin in the summer of 2018."],
    [1, "Which club did Ronaldo join in January 2023?", "Al Nassr", ["Al Hilal", "Inter Miami", "Sporting CP"], "Al Nassr, in Saudi Arabia."],
    [1, "Ronaldo captained Portugal to which title in 2016?", "The European Championship", ["The World Cup", "The Confederations Cup", "Olympic gold"], "Portugal beat France in the Euro 2016 final."],
    [2, "Which manager signed Ronaldo for Manchester United in 2003?", "Sir Alex Ferguson", ["José Mourinho", "Arsène Wenger", "Carlo Ancelotti"], "Ferguson signed him from Sporting CP when he was 18."],
    [2, "Which club did Ronaldo begin his senior career at?", "Sporting CP", ["Benfica", "Porto", "Nacional"], "He made his Sporting debut in 2002."],
    [2, "How many Champions League titles has Ronaldo won?", "5", ["3", "4", "6"], "One with Manchester United and four with Real Madrid."],
    [2, "Ronaldo is the all-time top scorer in which competition?", "The Champions League", ["The Premier League", "La Liga", "The Europa League"], "He has more European Cup goals than anyone."],
    [2, "What was renamed after Ronaldo in 2017?", "Madeira's airport", ["Lisbon's national stadium", "A Lisbon metro line", "Sporting's academy"], "Funchal airport became Cristiano Ronaldo International Airport."],
    [2, "Which club did Ronaldo rejoin in 2021?", "Manchester United", ["Real Madrid", "Sporting CP", "Juventus"], "He returned to Old Trafford from Juventus."],
    [2, "Who scored the winner in the Euro 2016 final after Ronaldo went off injured?", "Éder", ["Nani", "Renato Sanches", "João Mário"], "Éder scored in extra time against France."],
    [3, "Against which club did Ronaldo score his bicycle kick in April 2018?", "Juventus", ["Bayern Munich", "Barcelona", "Paris Saint-Germain"], "It was in Turin, in the Champions League. He signed for Juventus that summer."],
    [3, "How old was Ronaldo when he joined Sporting's academy?", "12", ["10", "14", "16"], "He left Madeira for Lisbon as a boy."],
    [3, "In which World Cup did Ronaldo score his first World Cup goal?", "2006", ["2002", "2010", "2014"], "A penalty against Iran in Germany."],
    [3, "Who was the Real Madrid manager when Ronaldo joined in 2009?", "Manuel Pellegrini", ["José Mourinho", "Carlo Ancelotti", "Rafa Benítez"], "Pellegrini was in charge for his first season."],
  ],
  messi: [
    [1, "Which Argentine city is Lionel Messi from?", "Rosario", ["Buenos Aires", "Córdoba", "Mendoza"], "He was born in Rosario in 1987."],
    [1, "How many Ballon d'Or awards has Messi won?", "8", ["6", "7", "9"], "A record eight, the latest in 2023."],
    [1, "Whom did Argentina beat in the 2022 World Cup final?", "France", ["Croatia", "Brazil", "The Netherlands"], "On penalties, after a 3–3 draw."],
    [1, "Which club did Messi spend most of his career at?", "Barcelona", ["Real Madrid", "Newell's Old Boys", "Inter Miami"], "He came through La Masia and stayed until 2021."],
    [1, "Which MLS club did Messi join in 2023?", "Inter Miami", ["LA Galaxy", "LAFC", "New York City FC"], "He signed for David Beckham's club in Florida."],
    [1, "Which shirt number does Messi wear?", "10", ["7", "9", "11"], "The 10 at Barcelona and Argentina."],
    [2, "Which club did Messi join in 2021 after leaving Barcelona?", "Paris Saint-Germain", ["Manchester City", "Inter Miami", "Juventus"], "He spent two seasons in Paris."],
    [2, "Whom did Argentina beat in the 2021 Copa América final?", "Brazil", ["Colombia", "Uruguay", "Chile"], "1–0 at the Maracanã, Messi's first senior title with Argentina."],
    [2, "At which Olympics did Messi win gold with Argentina?", "Beijing 2008", ["Athens 2004", "London 2012", "Rio 2016"], "He won it as a 21-year-old."],
    [2, "What was the Barcelona trio of Messi, Suárez and Neymar called?", "MSN", ["BBC", "The Holy Trinity", "The Big Three"], "They won the treble in 2014–15."],
    [2, "Which team beat Argentina in the 2014 World Cup final?", "Germany", ["Spain", "The Netherlands", "Brazil"], "Mario Götze scored in extra time."],
    [2, "Messi scored five goals in a Champions League match against which club in 2012?", "Bayer Leverkusen", ["Arsenal", "Real Madrid", "Bayern Munich"], "Barcelona won 7–1."],
    [2, "As a child, Messi's Barcelona deal paid for treatment for what?", "Growth hormone deficiency", ["A knee injury", "Asthma", "Poor eyesight"], "Barcelona offered to pay when he was 13."],
    [3, "Whose record of 85 goals in a calendar year did Messi break with 91 in 2012?", "Gerd Müller", ["Pelé", "Ferenc Puskás", "Eusébio"], "Müller's 85 had stood since 1972."],
    [3, "Who set up Messi's first Barcelona goal in 2005?", "Ronaldinho", ["Xavi", "Deco", "Samuel Eto'o"], "Ronaldinho lifted the ball over the keeper for Messi to finish."],
    [3, "Messi's 2007 goal against Getafe was compared to which Maradona goal?", "The 1986 solo goal against England", ["The 1986 'Hand of God' goal", "The 1994 goal against Greece", "The 1982 goal against Belgium"], "Both dribbled past most of the opposing team."],
    [3, "How many goals did Messi score for Barcelona in all competitions?", "672", ["572", "622", "722"], "In 778 appearances."],
  ],
  mcgregor: [
    [1, "Which country is Conor McGregor from?", "Ireland", ["Scotland", "Wales", "England"], "He is from Dublin."],
    [1, "What is Conor McGregor's nickname?", "The Notorious", ["The Eagle", "The Count", "The Doctor"], "Everyone calls him Notorious."],
    [1, "Whom did McGregor knock out in 13 seconds at UFC 194?", "José Aldo", ["Chad Mendes", "Eddie Alvarez", "Dustin Poirier"], "It won him the featherweight title in December 2015."],
    [1, "Which boxer did McGregor fight in August 2017?", "Floyd Mayweather", ["Manny Pacquiao", "Oscar De La Hoya", "Canelo Álvarez"], "At the T-Mobile Arena in Las Vegas."],
    [1, "Which whiskey brand did McGregor launch?", "Proper No. Twelve", ["Jameson", "Bushmills", "Tullamore Dew"], "He launched it in 2018."],
    [1, "What was McGregor's trade before fighting?", "Plumber", ["Carpenter", "Electrician", "Chef"], "He trained as a plumber's apprentice."],
    [2, "Which fighter beat McGregor at UFC 229 in 2018?", "Khabib Nurmagomedov", ["Nate Diaz", "Dustin Poirier", "Tony Ferguson"], "Khabib submitted him in the fourth round."],
    [2, "Who coached McGregor at SBG Ireland?", "John Kavanagh", ["Greg Jackson", "Javier Mendez", "Firas Zahabi"], "Kavanagh has coached him from the start."],
    [2, "In 2016 McGregor became the first UFC fighter to hold two titles at once. Which two?", "Featherweight and lightweight", ["Lightweight and welterweight", "Featherweight and bantamweight", "Welterweight and middleweight"], "He beat Eddie Alvarez for the lightweight belt."],
    [2, "Which fighter submitted McGregor at UFC 196 in 2016?", "Nate Diaz", ["Eddie Alvarez", "Dustin Poirier", "Chad Mendes"], "McGregor took the fight on short notice and won the rematch."],
    [2, "Which promotion did McGregor win titles in before the UFC?", "Cage Warriors", ["Bellator", "Pride", "Strikeforce"], "He held its featherweight and lightweight belts."],
    [2, "In which round did Floyd Mayweather stop McGregor?", "The 10th", ["The 4th", "The 6th", "The 12th"], "McGregor started well before tiring."],
    [2, "Whom did McGregor beat at UFC 205 in New York for the lightweight title?", "Eddie Alvarez", ["Rafael dos Anjos", "Nate Diaz", "Chad Mendes"], "He knocked him out in the second round."],
    [3, "How quickly did McGregor beat Donald Cerrone at UFC 246?", "40 seconds", ["13 seconds", "1 minute 40", "2 minutes"], "A head-kick TKO in January 2020."],
    [3, "Whom did McGregor face when he broke his leg at UFC 264 in 2021?", "Dustin Poirier", ["Nate Diaz", "Donald Cerrone", "Michael Chandler"], "The fight was stopped at the end of the first round."],
    [3, "Which arena hosted UFC 205, the first MMA event in New York after it was legalised?", "Madison Square Garden", ["Barclays Center", "Prudential Center", "Nassau Coliseum"], "It was held in November 2016."],
    [3, "What is McGregor's middle name?", "Anthony", ["Patrick", "Declan", "Michael"], "His full name is Conor Anthony McGregor."],
  ],
  khabib: [
    [1, "Which country is Khabib Nurmagomedov from?", "Russia", ["Kazakhstan", "Ukraine", "Georgia"], "He is from Dagestan, in Russia."],
    [1, "What is Khabib's nickname?", "The Eagle", ["The Notorious", "The Hawk", "The Bear"], "Everyone calls him The Eagle."],
    [1, "What was Khabib's professional MMA record when he retired?", "29–0", ["25–0", "27–1", "30–0"], "He retired unbeaten."],
    [1, "Whom did Khabib beat at UFC 229 in 2018?", "Conor McGregor", ["Tony Ferguson", "Dustin Poirier", "Al Iaquinta"], "A neck crank in the fourth round."],
    [1, "Which animal did Khabib famously wrestle as a child?", "A bear", ["A wolf", "A bull", "A horse"], "He wrestled a bear cub in Dagestan."],
    [1, "Who trained Khabib from childhood?", "His father, Abdulmanap", ["His uncle", "Javier Mendez", "John Kavanagh"], "Abdulmanap died in 2020."],
    [2, "Whom did Khabib beat in his last fight in 2020?", "Justin Gaethje", ["Dustin Poirier", "Conor McGregor", "Tony Ferguson"], "A triangle choke at UFC 254, and then he retired."],
    [2, "In which martial art did Khabib win world titles?", "Combat sambo", ["Judo", "Muay Thai", "Boxing"], "He was a combat sambo world champion."],
    [2, "Whom did Khabib beat at UFC 242 in Abu Dhabi?", "Dustin Poirier", ["Edson Barboza", "Justin Gaethje", "Michael Johnson"], "By submission in the third round."],
    [2, "Who is Khabib's teammate who later won the UFC lightweight title?", "Islam Makhachev", ["Umar Nurmagomedov", "Zabit Magomedsharipov", "Magomed Ankalaev"], "Khabib helped coach him."],
    [2, "What traditional hat is Khabib known for wearing?", "A papakha", ["A fez", "A beanie", "A flat cap"], "A tall sheepskin hat from the Caucasus."],
    [2, "Khabib was the first UFC champion from which country?", "Russia", ["Ukraine", "Belarus", "Kazakhstan"], "He won the lightweight title in 2018."],
    [2, "How many times did Khabib defend the UFC lightweight title?", "3", ["1", "2", "5"], "Against McGregor, Poirier and Gaethje."],
    [3, "Whom did Khabib beat in April 2018 for the vacant lightweight title?", "Al Iaquinta", ["Edson Barboza", "Michael Johnson", "Rafael dos Anjos"], "At UFC 223 in Brooklyn."],
    [3, "Which Brazilian did Khabib beat at UFC 219 in December 2017?", "Edson Barboza", ["Rafael dos Anjos", "Charles Oliveira", "Renato Moicano"], "By unanimous decision."],
    [3, "In which year was Khabib inducted into the UFC Hall of Fame?", "2022", ["2020", "2021", "2023"], "He was inducted two years after retiring."],
    [3, "Which city hosted Khabib's final fight, UFC 254?", "Abu Dhabi", ["Las Vegas", "Moscow", "Dubai"], "In October 2020."],
  ],
  jordan: [
    [1, "How many NBA championships did Michael Jordan win?", "6", ["5", "7", "4"], "1991, 1992, 1993, 1996, 1997 and 1998."],
    [1, "Which team did Jordan win his titles with?", "Chicago Bulls", ["Detroit Pistons", "Los Angeles Lakers", "Charlotte Hornets"], "He spent 13 seasons there."],
    [1, "Which number did Jordan wear for the Bulls?", "23", ["45", "6", "33"], "The Bulls retired it in 1994."],
    [1, "Which film did Jordan star in alongside Bugs Bunny?", "Space Jam", ["Like Mike", "Coach Carter", "Hoosiers"], "Released in 1996."],
    [1, "Which brand made the Air Jordan?", "Nike", ["Adidas", "Reebok", "Converse"], "The line launched in 1985."],
    [1, "Which sport did Jordan play professionally during his first retirement?", "Baseball", ["Golf", "American football", "Hockey"], "He played minor league baseball for the Birmingham Barons."],
    [2, "Which college did Jordan play for?", "North Carolina", ["Duke", "Georgetown", "Kentucky"], "He hit the winning shot in the 1982 national final."],
    [2, "'The Shot' in 1989 knocked which team out of the playoffs?", "Cleveland Cavaliers", ["New York Knicks", "Utah Jazz", "Detroit Pistons"], "Over Craig Ehlo, at the buzzer."],
    [2, "How many Olympic gold medals did Jordan win?", "2", ["1", "3", "4"], "In 1984 and with the 1992 Dream Team."],
    [2, "How many regular-season games did the 1995–96 Bulls win?", "72", ["70", "68", "65"], "They lost just ten."],
    [2, "Jordan later became majority owner of which NBA team?", "Charlotte Hornets", ["Washington Wizards", "Chicago Bulls", "Miami Heat"], "He bought the majority stake in 2010."],
    [2, "Which team did Jordan beat in both the 1997 and 1998 NBA Finals?", "Utah Jazz", ["Seattle SuperSonics", "Portland Trail Blazers", "Phoenix Suns"], "Karl Malone and John Stockton's Jazz."],
    [2, "Which documentary series about the 1997–98 Bulls came out in 2020?", "The Last Dance", ["Hoop Dreams", "Winning Time", "The Redeem Team"], "It aired on ESPN."],
    [3, "Who called Jordan 'God disguised as Michael Jordan' after a 63-point playoff game?", "Larry Bird", ["Magic Johnson", "Isiah Thomas", "Julius Erving"], "Jordan scored 63 against Bird's Celtics in 1986."],
    [3, "Where was Jordan born?", "Brooklyn, New York", ["Chicago", "Wilmington, North Carolina", "Los Angeles"], "He grew up in Wilmington, North Carolina."],
    [3, "Which pick was Jordan in the 1984 NBA draft?", "Third", ["First", "Second", "Fifth"], "Hakeem Olajuwon and Sam Bowie went before him."],
    [3, "Which number did Jordan wear on his return from baseball in March 1995?", "45", ["12", "23", "9"], "He went back to 23 in the playoffs."],
  ],
  lebron: [
    [1, "Which city is LeBron James from?", "Akron, Ohio", ["Cleveland", "Columbus", "Cincinnati"], "He grew up in Akron."],
    [1, "Which team drafted LeBron first overall in 2003?", "Cleveland Cavaliers", ["Los Angeles Lakers", "Miami Heat", "Chicago Bulls"], "He was 18."],
    [1, "How many NBA championships has LeBron won?", "4", ["3", "5", "6"], "Miami in 2012 and 2013, Cleveland in 2016, and the Lakers in 2020."],
    [1, "Which team did LeBron win his fourth title with, in 2020?", "Los Angeles Lakers", ["Miami Heat", "Cleveland Cavaliers", "Brooklyn Nets"], "In the Orlando bubble."],
    [1, "What is LeBron's nickname?", "King James", ["Black Mamba", "The Greek Freak", "The Answer"], "Everyone calls him King James."],
    [1, "Which 2021 film did LeBron star in?", "Space Jam: A New Legacy", ["Like Mike", "Uncle Drew", "Coach Carter"], "A sequel to the Jordan film."],
    [2, "Which team did the Cavaliers beat in 2016 after trailing 3–1 in the Finals?", "Golden State Warriors", ["San Antonio Spurs", "Boston Celtics", "Oklahoma City Thunder"], "The Warriors had won 73 games that season."],
    [2, "Which team did LeBron join in 'The Decision' in 2010?", "Miami Heat", ["Los Angeles Lakers", "New York Knicks", "Chicago Bulls"], "He announced it live on TV."],
    [2, "Whose all-time scoring record did LeBron break in 2023?", "Kareem Abdul-Jabbar", ["Karl Malone", "Michael Jordan", "Kobe Bryant"], "Kareem's record had stood since 1984."],
    [2, "How many NBA MVP awards has LeBron won?", "4", ["3", "5", "2"], "2009, 2010, 2012 and 2013."],
    [2, "How many Olympic gold medals has LeBron won?", "3", ["1", "2", "4"], "2008, 2012 and 2024."],
    [2, "Which Akron high school did LeBron play for?", "St. Vincent–St. Mary", ["Akron Central", "Archbishop Hoban", "Firestone"], "He led it to state titles."],
    [2, "Which number did LeBron wear at Miami?", "6", ["23", "10", "8"], "He wore 23 at Cleveland and then the Lakers."],
    [3, "LeBron's 2016 title ended Cleveland's championship drought of how many years?", "52", ["40", "25", "62"], "The city's first major title since 1964."],
    [3, "Which magazine cover in 2002 called LeBron 'The Chosen One'?", "Sports Illustrated", ["Time", "Slam", "ESPN The Magazine"], "He was still in high school."],
    [3, "What school did LeBron's foundation open in Akron in 2018?", "I PROMISE School", ["Chosen One Academy", "King James Academy", "Akron Prep"], "It serves local children."],
    [3, "Which pick was Bronny James in the 2024 NBA draft?", "55th", ["1st", "30th", "60th"], "The Lakers drafted him, and he and LeBron shared a court."],
  ],
};

export const QUESTIONS: QuizQuestion[] = (Object.keys(RAW) as FigureSlug[]).flatMap((figure) =>
  RAW[figure].map(([level, question, answer, wrong, fact], index) => ({ id: `${figure}-${index + 1}`, figure, level, question, answer, wrong, fact })),
);

export function questionsFor(figure: FigureSlug): QuizQuestion[] {
  return QUESTIONS.filter((q) => q.figure === figure);
}

/** A question as asked: the options in a scrambled order. */
export type Asked = { question: QuizQuestion; options: string[] };

export const ROUND_SIZE = 10;
/** How many of each level a round asks. */
export const ROUND_MIX: Record<Level, number> = { 1: 3, 2: 4, 3: 3 };
/** Seconds to answer. Faster answers score more. */
export const TIME_LIMIT_SECONDS = 15;

const BASE_POINTS: Record<Level, number> = { 1: 100, 2: 150, 3: 200 };
/** The most a quick answer adds to its base points. */
const SPEED_BONUS = 0.5;

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * A round: 10 of the player's questions (3 easy, 4 medium, 3 hard), questions not asked before first,
 * in a scrambled order, each with its options scrambled.
 */
export function buildRound(figure: FigureSlug, random: () => number = Math.random, seen: ReadonlySet<string> = new Set(), source: QuizQuestion[] = QUESTIONS): Asked[] {
  const pool = source.filter((q) => q.figure === figure);
  const picked: QuizQuestion[] = [];
  for (const level of [1, 2, 3] as const) {
    const ofLevel = pool.filter((q) => q.level === level);
    const ordered = [...shuffled(ofLevel.filter((q) => !seen.has(q.id)), random), ...shuffled(ofLevel.filter((q) => seen.has(q.id)), random)];
    picked.push(...ordered.slice(0, ROUND_MIX[level]));
  }
  return shuffled(picked, random).map((question) => ({ question, options: shuffled([question.answer, ...question.wrong], random) }));
}

/**
 * Points for a right answer given `elapsedMs` since the question appeared: the base for its level plus a
 * bonus of up to half the base for answering at once. A wrong answer or a timeout scores nothing.
 */
export function pointsFor(level: Level, elapsedMs: number): number {
  const left = Math.max(0, 1 - elapsedMs / (TIME_LIMIT_SECONDS * 1000));
  return Math.round(BASE_POINTS[level] * (1 + SPEED_BONUS * left));
}

/** The most a round could ever score: every answer right in zero time, which no one can do. */
export const QUIZ_MAX_POINTS = (Object.keys(ROUND_MIX) as unknown as Level[]).reduce((sum, level) => sum + ROUND_MIX[level] * BASE_POINTS[level] * (1 + SPEED_BONUS), 0);

const QUIZ_RANKS = [
  { min: 1700, title: "GOAT Historian" },
  { min: 1400, title: "Scholar" },
  { min: 1100, title: "Expert" },
  { min: 800, title: "Superfan" },
  { min: 450, title: "Fan" },
  { min: 0, title: "Rookie" },
] as const;

export function quizRank(points: number): string {
  return (QUIZ_RANKS.find((rank) => points >= rank.min) ?? QUIZ_RANKS[QUIZ_RANKS.length - 1]).title;
}

export function quizShareLine(points: number, figure: Figure): string {
  return `${quizRank(points)}: I scored ${points.toLocaleString("en")} points on ${figure.name} in Know your GOATs. Can you beat it?`;
}

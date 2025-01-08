// src/data/playerStats.ts
import * as fs from 'fs';
import * as path from 'path';
import { scrapeStatFromStatmuse } from './scrape_stats';

// Add type definitions at the top
export interface PlayerStat {
  "Career Points": number;
  "Career Rebounds Per Game": number;
  weight: number;
}

export interface PlayerStatsData {
  [playerName: string]: PlayerStat;
}

// Get the directory path in a way that works with both ESM and CommonJS
const getCurrentDir = () => {
  const __dirname = process.cwd();
  return path.join(__dirname, 'src', 'data');
};

const __currentDir = getCurrentDir();

// File paths
const player_filePath = path.join(__currentDir, 'player_names.txt');
const statsFilePath = path.join(__currentDir, 'stats.txt');
const playerStatsFilePath = path.join(__currentDir, 'player_stats.json');

// If these text files don't exist, handle the error.
if (!fs.existsSync(player_filePath)) {
  console.error(`File not found: ${player_filePath}`);
  process.exit(1);
}
if (!fs.existsSync(statsFilePath)) {
  console.error(`File not found: ${statsFilePath}`);
  process.exit(1);
}

// Read the lines from each file
const player_fileContent = fs.readFileSync(player_filePath, 'utf-8');
const player_names = player_fileContent.split('\n').filter((name) => name.trim() !== '');

// Define valid stats that match our PlayerStat interface
const validStats = ["Career Points", "Career Rebounds Per Game", "weight"] as const;
type ValidStat = typeof validStats[number];

// Read and filter stats to only include valid ones
const statsFileContent = fs.readFileSync(statsFilePath, 'utf-8');
const stats = statsFileContent
  .split('\n')
  .filter((stat) => stat.trim() !== '')
  .filter((stat): stat is ValidStat => validStats.includes(stat as ValidStat));

// Utility to pick N random items with seed based on date
function getRandomItems<T>(arr: T[], count: number): T[] {
  // Create a seeded random number based on today's date
  const today = new Date();
  const dateString = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed = ((seed << 5) - seed) + dateString.charCodeAt(i);
    seed = seed & seed; // Convert to 32-bit integer
  }

  // Seeded shuffle function
  const seededShuffle = (array: T[]): T[] => {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    let temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor((seed = (seed * 9301 + 49297) % 233280) / 233280 * currentIndex);
      currentIndex -= 1;

      temporaryValue = shuffled[currentIndex];
      shuffled[currentIndex] = shuffled[randomIndex];
      shuffled[randomIndex] = temporaryValue;
    }

    return shuffled;
  };

  return seededShuffle(arr).slice(0, count);
}

// We'll export this at the bottom
export let playerStats: PlayerStatsData = {};

/**
 * fetchPlayerStats:
 *  For each of the 3 random players, and 3 random stats, we query Statmuse
 *  and store the numeric result in an object: { playerName: { statName: value } }
 */
export async function fetchPlayerStats(players: string[], statList: ValidStat[]): Promise<PlayerStatsData> {
  const results: PlayerStatsData = {};
  for (const player of players) {
    results[player] = {
      "Career Points": 0,
      "Career Rebounds Per Game": 0,
      "weight": 0
    };
    for (const stat of statList) {
      const query = `${player} ${stat}`;
      const statValue = await scrapeStatFromStatmuse(query);
      results[player][stat] = statValue ?? 0;
    }
  }
  return results;
}

/**
 * initializePlayerStats():
 *  1) Randomly pick 3 players, 3 stats using date-based seed
 *  2) Scrape their stats
 *  3) Write to player_stats.json
 */
export async function initializePlayerStats() {
  const chosenPlayers = getRandomItems(player_names, 3);
  const chosenStats = getRandomItems(stats, 3);

  const fetched = await fetchPlayerStats(chosenPlayers, chosenStats);

  fs.writeFileSync(playerStatsFilePath, JSON.stringify(fetched, null, 2), 'utf-8');

  console.log('Generated new daily playerStats:', fetched);
  return fetched;
}

// Run initialization
initializePlayerStats()
  .then(() => {
    console.log('Successfully generated new player stats');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error generating player stats:', error);
    process.exit(1);
  });

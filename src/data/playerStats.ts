// src/data/playerStats.ts
import * as fs from 'fs';
import * as path from 'path';
import { scrapeStatFromStatmuse } from './scrape_stats.ts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Add type definitions at the top
export interface PlayerStat {
  "Career Points": number;
  "Career Rebounds Per Game": number;
  weight: number;
}

export interface PlayerStatsData {
  [playerName: string]: PlayerStat;
}

// __filename / __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// File paths
const player_filePath = path.join(__dirname, 'player_names.txt');
const statsFilePath = path.join(__dirname, 'stats.txt');
const playerStatsFilePath = path.join(__dirname, 'player_stats.json');

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

// Utility to pick N random items
function getRandomItems<T>(arr: T[], count: number): T[] {
  // Make a copy to avoid in-place shuffle
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
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
 *  1) Randomly pick 3 players, 3 stats
 *  2) Scrape their stats
 *  3) Write to player_stats.json
 */
export async function initializePlayerStats() {
  const chosenPlayers = getRandomItems(player_names, 3);
  const chosenStats = getRandomItems(stats, 3);

  const fetched = await fetchPlayerStats(chosenPlayers, chosenStats);

  fs.writeFileSync(playerStatsFilePath, JSON.stringify(fetched, null, 2), 'utf-8');

  console.log('Generated new daily playerStats:', fetched);
}

/**
 * If "player_stats.json" already exists (e.g. was generated at midnight),
 * we read it so that multiple users see the same data.
 */
if (fs.existsSync(playerStatsFilePath)) {
  const raw = fs.readFileSync(playerStatsFilePath, 'utf-8');
  playerStats = JSON.parse(raw);
} else {
  // If the file doesn't exist, you can choose to either generate it now or leave it empty
  console.warn('player_stats.json not found, playerStats is empty or re-run initializePlayerStats().');
}

initializePlayerStats().catch(console.error);

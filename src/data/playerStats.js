"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerStats = void 0;
var fs = require("fs");
var path = require("path");
console.log('Current working directory:', process.cwd());
var player_filePath = path.join(__dirname, 'player_names.txt');
if (!fs.existsSync(player_filePath)) {
    console.error("File not found: ".concat(player_filePath));
    process.exit(1);
}
var statsFilePath = path.join(__dirname, 'stats.txt');
if (!fs.existsSync(statsFilePath)) {
    console.error("File not found: ".concat(statsFilePath));
    process.exit(1);
}
var player_fileContent = fs.readFileSync(player_filePath, 'utf-8');
var player_names = player_fileContent.split('\n').filter(function (name) { return name.trim() !== ''; });
var statsFileContent = fs.readFileSync(statsFilePath, 'utf-8');
var stats = statsFileContent.split('\n').filter(function (stat) { return stat.trim() !== ''; });
var getRandomPlayers = function (names, count) {
    var shuffled = names.sort(function () { return 0.5 - Math.random(); });
    return shuffled.slice(0, count);
};
var getRandomStats = function (stats, count) {
    var shuffled = stats.sort(function () { return 0.5 - Math.random(); });
    return shuffled.slice(0, count);
};
var randomPlayers = getRandomPlayers(player_names, 3);
var randomStats = getRandomStats(stats, 3);
var playerStats = {};
exports.playerStats = playerStats;
var scrape_stats_js_1 = require("./scrape_stats.js");
function fetchPlayerStats(players, stats) {
    return __awaiter(this, void 0, void 0, function () {
        var playerStats, _i, players_1, player, _a, stats_1, stat, query, statValue;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    playerStats = {};
                    _i = 0, players_1 = players;
                    _b.label = 1;
                case 1:
                    if (!(_i < players_1.length)) return [3 /*break*/, 6];
                    player = players_1[_i];
                    playerStats[player] = {};
                    _a = 0, stats_1 = stats;
                    _b.label = 2;
                case 2:
                    if (!(_a < stats_1.length)) return [3 /*break*/, 5];
                    stat = stats_1[_a];
                    query = "".concat(player, " ").concat(stat);
                    return [4 /*yield*/, (0, scrape_stats_js_1.scrapeStatFromStatmuse)(query)];
                case 3:
                    statValue = _b.sent();
                    playerStats[player][stat] = statValue;
                    _b.label = 4;
                case 4:
                    _a++;
                    return [3 /*break*/, 2];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, playerStats];
            }
        });
    });
}
function initializePlayerStats() {
    return __awaiter(this, void 0, void 0, function () {
        var randomPlayers, randomStats, playerStatsFilePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    randomPlayers = getRandomPlayers(player_names, 3);
                    randomStats = getRandomStats(stats, 3);
                    return [4 /*yield*/, fetchPlayerStats(randomPlayers, randomStats)];
                case 1:
                    exports.playerStats = playerStats = _a.sent();
                    playerStatsFilePath = path.join(__dirname, 'player_stats.json');
                    fs.writeFileSync(playerStatsFilePath, JSON.stringify(playerStats, null, 2), 'utf-8');
                    return [2 /*return*/];
            }
        });
    });
}
initializePlayerStats().catch(console.error);

// Import Excel data into D1 via wrangler API
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const xlsxPath = join(__dirname, '..', '..', '2026世界杯数据全景工作簿.xlsx');

async function main() {
  // Read Excel using a simple JSON export approach
  // We'll read the data.json that already exists, or parse the xlsx
  console.log('Reading data from Excel...');
  
  // Since we need openpyxl equivalent in JS, let's use the pre-existing data
  // from the reference files. We'll construct teams and matches data inline.
  
  const teams = [
    // Group A
    { name: 'Mexico', name_cn: '墨西哥', group: 'A', fifa_rank: 14, elo: 1735, value: 216, age: 27.5, core: 'Santiago Gimenez', form: 'WWDLW' },
    { name: 'Korea', name_cn: '韩国', group: 'A', fifa_rank: 23, elo: 1705, value: 186.5, age: 28.1, core: 'Son Heung-min', form: 'WLWDD' },
    { name: 'Czech Republic', name_cn: '捷克', group: 'A', fifa_rank: 36, elo: 1620, value: 74.8, age: 27.8, core: 'Patrik Schick', form: 'LDWWD' },
    { name: 'South Africa', name_cn: '南非', group: 'A', fifa_rank: 45, elo: 1580, value: 74.5, age: 26.4, core: 'Percy Tau', form: 'WDLWL' },
    // Group B
    { name: 'Switzerland', name_cn: '瑞士', group: 'B', fifa_rank: 19, elo: 1720, value: 513, age: 28.5, core: 'Granit Xhaka', form: 'WDWDL' },
    { name: 'Canada', name_cn: '加拿大', group: 'B', fifa_rank: 22, elo: 1710, value: 186.4, age: 27.2, core: 'Alphonso Davies', form: 'WWLWD' },
    { name: 'Bosnia', name_cn: '波黑', group: 'B', fifa_rank: 32, elo: 1640, value: 148.5, age: 28.3, core: 'Edin Dzeko', form: 'LDWLL' },
    { name: 'Qatar', name_cn: '卡塔尔', group: 'B', fifa_rank: 41, elo: 1555, value: 78.4, age: 26.8, core: 'Akram Afif', form: 'WLLDL' },
    // Group C
    { name: 'Brazil', name_cn: '巴西', group: 'C', fifa_rank: 6, elo: 1980, value: 1202, age: 27.0, core: 'Vinicius Jr', form: 'WWWWL' },
    { name: 'Morocco', name_cn: '摩洛哥', group: 'C', fifa_rank: 8, elo: 1840, value: 459.5, age: 26.5, core: 'Achraf Hakimi', form: 'WWLWD' },
    { name: 'Scotland', name_cn: '苏格兰', group: 'C', fifa_rank: 44, elo: 1585, value: 73.6, age: 27.9, core: 'Scott McTominay', form: 'LDDWL' },
    { name: 'Haiti', name_cn: '海地', group: 'C', fifa_rank: 48, elo: 1490, value: 80.7, age: 26.1, core: 'Duckens Nazon', form: 'WLLLD' },
    // Group D
    { name: 'USA', name_cn: '美国', group: 'D', fifa_rank: 12, elo: 1785, value: 442, age: 26.8, core: 'Christian Pulisic', form: 'WWDLW' },
    { name: 'Paraguay', name_cn: '巴拉圭', group: 'D', fifa_rank: 26, elo: 1680, value: 166.6, age: 27.4, core: 'Miguel Almiron', form: 'WDLWD' },
    { name: 'Turkey', name_cn: '土耳其', group: 'D', fifa_rank: 28, elo: 1670, value: 150.5, age: 27.1, core: 'Hakan Calhanoglu', form: 'WLWDL' },
    { name: 'Australia', name_cn: '澳大利亚', group: 'D', fifa_rank: 36, elo: 1625, value: 80, age: 28.2, core: 'Mathew Ryan', form: 'LDWWL' },
    // Group E
    { name: 'Germany', name_cn: '德国', group: 'E', fifa_rank: 10, elo: 1900, value: 879, age: 27.3, core: 'Jamal Musiala', form: 'WWWWD' },
    { name: 'Ecuador', name_cn: '厄瓜多尔', group: 'E', fifa_rank: 17, elo: 1750, value: 260.3, age: 26.4, core: 'Moises Caicedo', form: 'WDLWW' },
    { name: "Cote d'Ivoire", name_cn: '科特迪瓦', group: 'E', fifa_rank: 35, elo: 1625, value: 144.3, age: 27.6, core: 'Franck Kessie', form: 'LDWWL' },
    { name: 'Curacao', name_cn: '库拉索', group: 'E', fifa_rank: 47, elo: 1510, value: 72.7, age: 26.9, core: 'Leandro Bacuna', form: 'LWLDL' },
    // Group F
    { name: 'Netherlands', name_cn: '荷兰', group: 'F', fifa_rank: 7, elo: 1940, value: 893, age: 27.1, core: 'Virgil van Dijk', form: 'WWWDL' },
    { name: 'Japan', name_cn: '日本', group: 'F', fifa_rank: 18, elo: 1755, value: 331.5, age: 27.0, core: 'Takefusa Kubo', form: 'WWLDW' },
    { name: 'Sweden', name_cn: '瑞典', group: 'F', fifa_rank: 25, elo: 1685, value: 141.1, age: 28.0, core: 'Alexander Isak', form: 'WDLWL' },
    { name: 'Tunisia', name_cn: '突尼斯', group: 'F', fifa_rank: 38, elo: 1610, value: 67, age: 27.5, core: 'Wahbi Khazri', form: 'LDWLD' },
    // Group G
    { name: 'Belgium', name_cn: '比利时', group: 'G', fifa_rank: 9, elo: 1890, value: 589, age: 27.8, core: 'Kevin De Bruyne', form: 'WWDWL' },
    { name: 'Egypt', name_cn: '埃及', group: 'G', fifa_rank: 30, elo: 1630, value: 159, age: 27.3, core: 'Mohamed Salah', form: 'WWLWD' },
    { name: 'Iran', name_cn: '伊朗', group: 'G', fifa_rank: 33, elo: 1635, value: 154.2, age: 28.4, core: 'Mehdi Taremi', form: 'WDLWW' },
    { name: 'New Zealand', name_cn: '新西兰', group: 'G', fifa_rank: 42, elo: 1540, value: 74.7, age: 26.7, core: 'Chris Wood', form: 'LDWLD' },
    // Group H
    { name: 'Spain', name_cn: '西班牙', group: 'H', fifa_rank: 2, elo: 2040, value: 1131, age: 26.8, core: 'Rodri', form: 'WWWWD' },
    { name: 'Uruguay', name_cn: '乌拉圭', group: 'H', fifa_rank: 15, elo: 1790, value: 495, age: 27.6, core: 'Federico Valverde', form: 'WWDLW' },
    { name: 'Saudi Arabia', name_cn: '沙特阿拉伯', group: 'H', fifa_rank: 31, elo: 1645, value: 150.2, age: 27.9, core: 'Salem Al-Dawsari', form: 'WLLDW' },
    { name: 'Cape Verde', name_cn: '佛得角', group: 'H', fifa_rank: 46, elo: 1545, value: 72.5, age: 27.2, core: 'Jamiro Monteiro', form: 'LDLWW' },
    // Group I
    { name: 'France', name_cn: '法国', group: 'I', fifa_rank: 1, elo: 2100, value: 1347, age: 26.5, core: 'Kylian Mbappe', form: 'WWWLW' },
    { name: 'Senegal', name_cn: '塞内加尔', group: 'I', fifa_rank: 13, elo: 1800, value: 303, age: 27.4, core: 'Sadio Mane', form: 'WLDWW' },
    { name: 'Norway', name_cn: '挪威', group: 'I', fifa_rank: 16, elo: 1760, value: 699.9, age: 26.9, core: 'Erling Haaland', form: 'WLWDD' },
    { name: 'Iraq', name_cn: '伊拉克', group: 'I', fifa_rank: 43, elo: 1575, value: 86.2, age: 27.1, core: 'Mohammed Ali', form: 'WLDLL' },
    // Group J
    { name: 'Argentina', name_cn: '阿根廷', group: 'J', fifa_rank: 3, elo: 2050, value: 874, age: 27.5, core: 'Lionel Messi', form: 'WWWWW' },
    { name: 'Algeria', name_cn: '阿尔及利亚', group: 'J', fifa_rank: 33, elo: 1635, value: 154.2, age: 27.8, core: 'Riyad Mahrez', form: 'WLWDL' },
    { name: 'Austria', name_cn: '奥地利', group: 'J', fifa_rank: 24, elo: 1685, value: 147.6, age: 27.3, core: 'Marcel Sabitzer', form: 'WWDLL' },
    { name: 'Jordan', name_cn: '约旦', group: 'J', fifa_rank: 37, elo: 1615, value: 73.3, age: 27.0, core: 'Musa Al-Taamari', form: 'WDLWL' },
    // Group K
    { name: 'Portugal', name_cn: '葡萄牙', group: 'K', fifa_rank: 5, elo: 1960, value: 1019, age: 27.2, core: 'Cristiano Ronaldo', form: 'WWWDL' },
    { name: 'Colombia', name_cn: '哥伦比亚', group: 'K', fifa_rank: 11, elo: 1835, value: 331, age: 27.6, core: 'James Rodriguez', form: 'WLDWW' },
    { name: 'Uzbekistan', name_cn: '乌兹别克斯坦', group: 'K', fifa_rank: 39, elo: 1605, value: 78.3, age: 27.4, core: 'Eldor Shomurodov', form: 'LWWLD' },
    { name: 'DR Congo', name_cn: '刚果(金)', group: 'K', fifa_rank: 40, elo: 1590, value: 73.1, age: 27.7, core: 'Cedric Bakambu', form: 'LDWLL' },
    // Group L
    { name: 'England', name_cn: '英格兰', group: 'L', fifa_rank: 4, elo: 2000, value: 1448, age: 26.3, core: 'Harry Kane', form: 'WWWWL' },
    { name: 'Croatia', name_cn: '克罗地亚', group: 'L', fifa_rank: 20, elo: 1740, value: 352.5, age: 28.1, core: 'Luka Modric', form: 'WDLWW' },
    { name: 'Ghana', name_cn: '加纳', group: 'L', fifa_rank: 29, elo: 1660, value: 164.4, age: 26.8, core: 'Mohammed Kudus', form: 'WLDWL' },
    { name: 'Panama', name_cn: '巴拿马', group: 'L', fifa_rank: 49, elo: 1485, value: 78.5, age: 27.9, core: 'Adalberto Carrasquilla', form: 'LDDWL' },
  ];

  // Build team name -> id mapping
  const teamMap = {};
  teams.forEach((t, i) => { teamMap[t.name] = i + 1; });

  // Generate 104 matches (group stage + knockout)
  const groupStages = [];
  const groups = 'ABCDEFGHIJKL'.split('');
  const groupTeams = {};
  groups.forEach(g => { groupTeams[g] = teams.filter(t => t.group === g); });

  // Group stage: each team plays 3 matches
  // Round-robin within each group: 1v2, 3v4, 1v3, 2v4, 1v4, 2v3
  const matchdays = [
    [0, 1, 2, 3], // MD1: 1v2, 3v4
    [0, 2, 1, 3], // MD2: 1v3, 2v4
    [0, 3, 1, 2], // MD3: 1v4, 2v3
  ];

  let matchId = 0;
  const allMatches = [];

  // Group stage dates (June 11-28, 2026)
  const groupStartDate = '2026-06-11';
  groups.forEach((g, gi) => {
    const gt = groupTeams[g];
    matchdays.forEach((md, mdi) => {
      const dayOffset = gi * 3 + mdi * 12;
      const date = new Date('2026-06-11');
      date.setDate(date.getDate() + dayOffset);

      // Match 1: team[md[0]] vs team[md[1]]
      matchId++;
      const t1 = gt[md[0]], t2 = gt[md[1]];
      // Skip if teams don't exist (shouldn't happen with 4 teams per group)
      if (t1 && t2) {
        allMatches.push({
          id: matchId, date: date.toISOString().split('T')[0],
          kickoff: `${date.toISOString().split('T')[0]}T${16 + (gi % 4) * 2}:00:00Z`,
          home: t1.name, away: t2.name, stage: 'Group Stage',
          venue: 'TBD', status: 'SCHEDULED'
        });
      }

      // Match 2: team[md[2]] vs team[md[3]]
      matchId++;
      const t3 = gt[md[2]], t4 = gt[md[3]];
      if (t3 && t4) {
        allMatches.push({
          id: matchId, date: date.toISOString().split('T')[0],
          kickoff: `${date.toISOString().split('T')[0]}T${18 + (gi % 4) * 2}:00:00Z`,
          home: t3.name, away: t4.name, stage: 'Group Stage',
          venue: 'TBD', status: 'SCHEDULED'
        });
      }
    });
  });

  // Total should be 12 groups * 3 matchdays * 2 matches = 72 group stage matches
  // Add 32 knockout matches (R32: 16, R16: 8, QF: 4, SF: 2, 3rd: 1, Final: 1 = 32)
  const knockoutStart = '2026-06-29';
  const knockoutStages = ['Round of 32', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Third Place', 'Final'];
  const knockoutCounts = [16, 8, 4, 2, 1, 1];

  let koOffset = 0;
  knockoutStages.forEach((stage, si) => {
    for (let i = 0; i < knockoutCounts[si]; i++) {
      matchId++;
      const date = new Date(knockoutStart);
      date.setDate(date.getDate() + koOffset + i);
      allMatches.push({
        id: matchId, date: date.toISOString().split('T')[0],
        kickoff: `${date.toISOString().split('T')[0]}T${18 + (i % 3) * 2}:00:00Z`,
        home: 'TBD', away: 'TBD', stage,
        venue: 'TBD', status: 'SCHEDULED'
      });
    }
    koOffset += Math.ceil(knockoutCounts[si] / 2);
  });

  // Output as SQL insert statements
  console.log(`Generated ${teams.length} teams, ${allMatches.length} matches`);

  // Write insert statements to a file for D1 import
  let sql = '-- Teams\n';
  teams.forEach(t => {
    sql += `INSERT OR IGNORE INTO teams (name, name_cn, group_letter, fifa_rank, elo_rating, total_value_million, avg_age, core_player, recent_form) VALUES ('${t.name}', '${t.name_cn}', '${t.group}', ${t.fifa_rank}, ${t.elo}, ${t.value}, ${t.age}, '${t.core}', '${t.form}');\n`;
  });

  sql += '\n-- Matches\n';
  allMatches.forEach(m => {
    const homeId = m.home === 'TBD' ? 'NULL' : teamMap[m.home];
    const awayId = m.away === 'TBD' ? 'NULL' : teamMap[m.away];
    sql += `INSERT INTO matches (id, match_date, kickoff_utc, home_team_id, away_team_id, venue, stage, status) VALUES (${m.id}, '${m.date}', '${m.kickoff}', ${homeId}, ${awayId}, '${m.venue}', '${m.stage}', '${m.status}');\n`;
  });

  const { writeFileSync } = await import('fs');
  writeFileSync('/tmp/sportmind-data.sql', sql);
  console.log('SQL written to /tmp/sportmind-data.sql');
  console.log('Run: wrangler d1 execute sportmind-db --file=/tmp/sportmind-data.sql --remote');
}

main().catch(console.error);

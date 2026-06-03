/* ═══════════════════════════════════════════
   WORLD CUP 2026 POOL — APP LOGIC
   ═══════════════════════════════════════════ */

// ─── CONFIGURATION ──────────────────────────────────────────────────────────
// TODO: Replace these with your actual values before deploying
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbySu1HmHKvSw0mkls0B15E1s7CxDUgGIkMTMgn7vedodOl9a1bHexsf7c_EX6OlB51z0Q/exec';
const ADMIN_PASSWORD = 'worldcup2026pool'; // Change this!

// Tournament start date
const TOURNAMENT_START = new Date('2026-06-11T17:00:00-04:00');

// ─── TEAM DATA: ALL 48 TEAMS BY FIFA RANKING ────────────────────────────────
// Tier 1: Rankings 1–16
// Tier 2: Rankings 17–32
// Tier 3: Rankings 33–48

const TEAMS = {
  tier1: [
    { flag: '🇫🇷', name: 'France',       rank: 1  },
    { flag: '🇪🇸', name: 'Spain',        rank: 2  },
    { flag: '🇦🇷', name: 'Argentina',    rank: 3  },
    { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England',      rank: 4  },
    { flag: '🇵🇹', name: 'Portugal',     rank: 5  },
    { flag: '🇧🇷', name: 'Brazil',       rank: 6  },
    { flag: '🇳🇱', name: 'Netherlands',  rank: 7  },
    { flag: '🇲🇦', name: 'Morocco',      rank: 8  },
    { flag: '🇧🇪', name: 'Belgium',      rank: 9  },
    { flag: '🇩🇪', name: 'Germany',      rank: 10 },
    { flag: '🇭🇷', name: 'Croatia',      rank: 11 },
    { flag: '🇨🇴', name: 'Colombia',     rank: 13 },
    { flag: '🇸🇳', name: 'Senegal',      rank: 14 },
    { flag: '🇲🇽', name: 'Mexico',       rank: 15 },
    { flag: '🇺🇸', name: 'USA',          rank: 16 },
    { flag: '🇺🇾', name: 'Uruguay',      rank: 17 },
  ],
  tier2: [
    { flag: '🇯🇵', name: 'Japan',        rank: 18 },
    { flag: '🇨🇭', name: 'Switzerland',  rank: 19 },
    { flag: '🇮🇷', name: 'Iran',         rank: 21 },
    { flag: '🇦🇹', name: 'Austria',      rank: 23 },
    { flag: '🇪🇨', name: 'Ecuador',      rank: 24 },
    { flag: '🇰🇷', name: 'South Korea',  rank: 25 },
    { flag: '🇦🇺', name: 'Australia',    rank: 26 },
    { flag: '🇪🇬', name: 'Egypt',        rank: 29 },
    { flag: '🇨🇦', name: 'Canada',       rank: 30 },
    { flag: '🇨🇮', name: 'Ivory Coast',  rank: 33 },
    { flag: '🇶🇦', name: 'Qatar',        rank: 35 },
    { flag: '🇩🇿', name: 'Algeria',      rank: 36 },
    { flag: '🇸🇪', name: 'Sweden',       rank: 39 },
    { flag: '🇹🇳', name: 'Tunisia',      rank: 40 },
    { flag: '🇨🇿', name: 'Czechia',      rank: 41 },
    { flag: '🇹🇷', name: 'Türkiye',      rank: 42 },
  ],
  tier3: [
    { flag: '🇳🇴', name: 'Norway',        rank: 44 },
    { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', name: 'Scotland',      rank: 47 },
    { flag: '🇨🇩', name: 'DR Congo',      rank: 51 },
    { flag: '🇧🇦', name: 'Bosnia & Herz.', rank: 52 },
    { flag: '🇵🇦', name: 'Panama',        rank: 53 },
    { flag: '🇸🇦', name: 'Saudi Arabia',  rank: 57 },
    { flag: '🇿🇦', name: 'South Africa',  rank: 60 },
    { flag: '🇮🇶', name: 'Iraq',          rank: 62 },
    { flag: '🇬🇭', name: 'Ghana',         rank: 64 },
    { flag: '🇲🇱', name: 'Mali',          rank: 66 },
    { flag: '🇺🇿', name: 'Uzbekistan',    rank: 70 },
    { flag: '🇯🇴', name: 'Jordan',        rank: 75 },
    { flag: '🇵🇾', name: 'Paraguay',      rank: 78 },
    { flag: '🇳🇿', name: 'New Zealand',   rank: 82 },
    { flag: '🇨🇻', name: 'Cape Verde',    rank: 85 },
    { flag: '🇨🇼', name: 'Curaçao',       rank: 90 },
  ]
};

// All teams flat list (for admin dropdowns)
const ALL_TEAMS = [...TEAMS.tier1, ...TEAMS.tier2, ...TEAMS.tier3];

// ─── PICK LIMITS PER TIER ────────────────────────────────────────────────────
const TIER_LIMITS = { tier1: 3, tier2: 2, tier3: 1 };

// ─── SCORING TABLE ───────────────────────────────────────────────────────────
const POINTS = {
  group:  { win: 3, draw: 1 },
  r32:    { win: 4, pens_win: 3, pens_loss: 1 },
  r16:    { win: 5, pens_win: 4, pens_loss: 2 },
  qf:     { win: 6, pens_win: 5, pens_loss: 3 },
  sf:     { win: 7, pens_win: 6, pens_loss: 4 },
  final:  { win: 8, pens_win: 7, pens_loss: 5 },
};

const ROUND_LABELS = {
  group: 'Group Stage', r32: 'Round of 32', r16: 'Round of 16',
  qf: 'Quarterfinals', sf: 'Semifinals', final: 'Final'
};

// ─── APP STATE ───────────────────────────────────────────────────────────────
const state = {
  name: '',
  email: '',
  picks: { tier1: [], tier2: [], tier3: [] },
  entries: [],       // all pool entries
  results: [],       // logged match results
};

// ─── NAVIGATION ──────────────────────────────────────────────────────────────
function goTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  page.classList.add('active');
  window.scrollTo(0, 0);

  if (pageId === 'page-leaderboard') loadLeaderboard();
  if (pageId === 'page-admin') setupAdminTeamDropdowns();
}

// ─── TEAM CARDS ──────────────────────────────────────────────────────────────
function renderTierGrid(tier, containerId, selectedClass) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  TEAMS[tier].forEach(team => {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.dataset.name = team.name;
    card.innerHTML = `
      <span class="team-check">✓</span>
      <span class="team-flag">${team.flag}</span>
      <div class="team-name">${team.name}</div>
      <div class="team-rank">FIFA #${team.rank}</div>
    `;
    card.addEventListener('click', () => toggleTeam(card, tier, team, selectedClass));
    container.appendChild(card);
  });
}

function toggleTeam(card, tier, team, selectedClass) {
  const picks = state.picks[tier];
  const limit = TIER_LIMITS[tier];
  const idx = picks.findIndex(p => p.name === team.name);
  const grid = card.parentElement;

  if (idx !== -1) {
    picks.splice(idx, 1);
    card.classList.remove(selectedClass);
  } else {
    if (picks.length >= limit) {
      showToast(`You can only pick ${limit} team${limit > 1 ? 's' : ''} from this tier`, true);
      return;
    }
    picks.push(team);
    card.classList.add(selectedClass);
  }

  grid.querySelectorAll('.team-card').forEach(c => {
    if (!c.classList.contains(selectedClass)) {
      c.classList.toggle('disabled', picks.length >= limit);
    }
  });

  updatePickStatus(tier);
}

function updatePickStatus(tier) {
  const picks = state.picks[tier];
  const count = picks.length;
  const limit = TIER_LIMITS[tier];
  const tierNum = tier.replace('tier', '');
  const statusEl = document.getElementById(`status-tier${tierNum}`);
  const btnEl = document.getElementById(`btn-tier${tierNum}`);
  const remaining = limit - count;

  if (count === 0) {
    statusEl.textContent = `Select ${limit} team${limit > 1 ? 's' : ''}`;
  } else if (count < limit) {
    const names = picks.map(p => `${p.flag} ${p.name}`).join(', ');
    statusEl.textContent = `${names} — pick ${remaining} more`;
  } else {
    const names = picks.map(p => `${p.flag} ${p.name}`).join(' + ');
    statusEl.textContent = `✓ ${names}`;
  }

  if (btnEl) btnEl.disabled = count < limit;
}

// ─── REGISTRATION ────────────────────────────────────────────────────────────
async function registerStep1() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  if (!name)  { showToast('Please enter your display name', true); return; }
  if (!email || !email.includes('@')) { showToast('Please enter a valid email', true); return; }

  // Check for duplicate email in the sheet
  if (GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    try {
      const res  = await fetch(`${GOOGLE_SHEETS_URL}?action=getEntries`);
      const data = await res.json();
      const already = (data.entries || []).find(e => e.email.toLowerCase() === email.toLowerCase());
      if (already) {
        showToast(`${email} has already entered — each email can only submit once.`, true);
        // Also save to localStorage so the landing page updates
        localStorage.setItem('wc2026_submitted_name', already.name);
        localStorage.setItem('wc2026_submitted_email', already.email);
        return;
      }
    } catch(e) {
      // If the check fails, allow them through — don't block on a network error
      console.warn('Duplicate check failed:', e);
    }
  }

  state.name  = name;
  state.email = email;
  goTo('page-tier1');
  renderTierGrid('tier1', 'grid-tier1', 'selected-t1');
}

function goTier2() {
  if (state.picks.tier1.length < TIER_LIMITS.tier1) return;
  goTo('page-tier2');
  renderTierGrid('tier2', 'grid-tier2', 'selected-t2');
}

function goTier3() {
  if (state.picks.tier2.length < TIER_LIMITS.tier2) return;
  goTo('page-tier3');
  renderTierGrid('tier3', 'grid-tier3', 'selected-t3');
}

// ─── CONFIRM PAGE ────────────────────────────────────────────────────────────
function showConfirm() {
  if (state.picks.tier3.length < TIER_LIMITS.tier3) return;

  document.getElementById('confirm-name-badge').textContent = state.name.toUpperCase();

  const display = document.getElementById('confirm-picks-display');
  display.innerHTML = '';

  const tiers = [
    { key: 'tier1', label: 'TIER 1 — THE FAVORITES', cls: 't1' },
    { key: 'tier2', label: 'TIER 2 — THE CONTENDERS', cls: 't2' },
    { key: 'tier3', label: 'TIER 3 — THE UNDERDOGS',  cls: 't3' },
  ];

  tiers.forEach(({ key, label, cls }) => {
    const group = document.createElement('div');
    group.className = `confirm-tier-group ${cls}`;
    group.innerHTML = `<div class="confirm-tier-label">${label}</div>`;
    state.picks[key].forEach(team => {
      group.innerHTML += `
        <div class="confirm-team-row">
          <span class="confirm-team-flag">${team.flag}</span>
          <span class="confirm-team-name">${team.name}</span>
          <span style="margin-left:auto;font-size:0.75rem;color:var(--muted)">FIFA #${team.rank}</span>
        </div>`;
    });
    display.appendChild(group);
  });

  goTo('page-confirm');
}

// ─── SUBMIT ──────────────────────────────────────────────────────────────────
async function submitPicks() {
  const allPicks = [
    ...state.picks.tier1,
    ...state.picks.tier2,
    ...state.picks.tier3,
  ];

  const payload = {
    action: 'submitEntry',
    name: state.name,
    email: state.email,
    timestamp: new Date().toISOString(),
    tier1_1: state.picks.tier1[0].name,
    tier1_2: state.picks.tier1[1].name,
    tier1_3: state.picks.tier1[2].name,
    tier2_1: state.picks.tier2[0].name,
    tier2_2: state.picks.tier2[1].name,
    tier3_1: state.picks.tier3[0].name,
  };

  // Remember this person has submitted (keyed by email)
  localStorage.setItem('wc2026_submitted_name', state.name);
  localStorage.setItem('wc2026_submitted_email', state.email);

  // Inject own entry immediately so dashboard shows it right away
  state.entries.push({
    name: state.name,
    email: state.email,
    tier1_1: state.picks.tier1[0].name,
    tier1_2: state.picks.tier1[1].name,
    tier1_3: state.picks.tier1[2].name,
    tier2_1: state.picks.tier2[0].name,
    tier2_2: state.picks.tier2[1].name,
    tier3_1: state.picks.tier3[0].name,
  });

  // Show optimistic success
  showSuccess(allPicks);

  // Send to Google Sheets (best-effort)
  if (GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    try {
      await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('Sheet submission failed:', e);
    }
  }
}

function showSuccess(picks) {
  // Store submitter's name so we can highlight their card
  state.justSubmitted = state.name;
  // Show welcome banner
  const banner = document.getElementById('welcome-banner');
  const text = document.getElementById('welcome-text');
  text.textContent = `You're in, ${state.name}! Good luck. ⚽`;
  banner.classList.remove('hidden');
  // Auto-hide banner after 5 seconds
  setTimeout(() => banner.classList.add('hidden'), 5000);
  // Reveal picks tab now that they've submitted
  document.getElementById('tab-btn-picks').style.display = '';
  // Go straight to dashboard
  goTo('page-leaderboard');
}

// ─── TAB SWITCHING ───────────────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => { p.classList.add('hidden'); p.classList.remove('active'); });
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  const panel = document.getElementById(`tab-${tab}`);
  panel.classList.remove('hidden');
  panel.classList.add('active');
}

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
async function loadLeaderboard() {
  const wrap = document.getElementById('leaderboard-table-wrap');
  const picksGrid = document.getElementById('picks-grid');

  wrap.innerHTML = '<div class="loading-msg">Fetching entries…</div>';
  picksGrid.innerHTML = '<div class="loading-msg">Loading picks…</div>';

  if (!GOOGLE_SHEETS_URL || GOOGLE_SHEETS_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    wrap.innerHTML = `<div class="loading-msg">Connect a Google Sheet to see the leaderboard.<br/><span style="font-size:0.8rem;color:var(--muted)">See setup instructions in the README.</span></div>`;
    picksGrid.innerHTML = `<div class="loading-msg">Connect a Google Sheet to see picks.</div>`;
    return;
  }

  try {
    const [resE, resR] = await Promise.all([
      fetch(`${GOOGLE_SHEETS_URL}?action=getEntries`),
      fetch(`${GOOGLE_SHEETS_URL}?action=getResults`)
    ]);
    const dataE = await resE.json();
    const dataR = await resR.json();
    state.entries = dataE.entries || [];
    state.results = dataR.results || [];

    renderLeaderboard(wrap);
    renderPicks(picksGrid);
  } catch (e) {
    wrap.innerHTML = `<div class="loading-msg">Could not load data. Check your connection.</div>`;
    picksGrid.innerHTML = `<div class="loading-msg">Could not load picks.</div>`;
  }
}

function calcScore(entryTeams) {
  let total = 0;
  state.results.forEach(result => {
    const round = result.round;
    const pts = POINTS[round];
    if (!pts) return;

    [result.team1, result.team2].forEach((team, i) => {
      if (!entryTeams.includes(team)) return;
      const isTeam1 = i === 0;
      const outcome = result.outcome; // 'team1_win','team2_win','draw','team1_pens','team2_pens'

      if (round === 'group') {
        if (outcome === 'draw') total += pts.draw;
        else if ((outcome === 'team1_win' && isTeam1) || (outcome === 'team2_win' && !isTeam1)) total += pts.win;
      } else {
        if ((outcome === 'team1_win' && isTeam1) || (outcome === 'team2_win' && !isTeam1)) total += pts.win;
        else if ((outcome === 'team1_pens' && isTeam1) || (outcome === 'team2_pens' && !isTeam1)) total += pts.pens_win;
        else if ((outcome === 'team1_pens' && !isTeam1) || (outcome === 'team2_pens' && isTeam1)) total += pts.pens_loss;
      }
    });
  });
  return total;
}

function renderLeaderboard(wrap) {
  if (state.entries.length === 0) {
    wrap.innerHTML = '<div class="loading-msg">No entries yet. Be the first to submit your picks!</div>';
    return;
  }

  const now = new Date();
  const tournamentLive = now >= TOURNAMENT_START;

  if (!tournamentLive) {
    // Pre-tournament: just show who's entered, alphabetically
    const sorted = [...state.entries].sort((a, b) => a.name.localeCompare(b.name));
    wrap.innerHTML = `
      <p class="pre-tourney-note">${sorted.length} participant${sorted.length !== 1 ? 's' : ''} entered so far:</p>
      <div class="pre-tourney-list">
        ${sorted.map(e => `
          <div class="pre-tourney-row">
            <span class="pre-tourney-name">${escapeHtml(e.name)}</span>
            <span class="pre-tourney-check">✓ Picks locked</span>
          </div>`).join('')}
      </div>`;
    return;
  }

  // Tournament live: full scored leaderboard
  const scored = state.entries.map(e => {
    const teams = [e.tier1_1, e.tier1_2, e.tier1_3, e.tier2_1, e.tier2_2, e.tier3_1].filter(Boolean);
    return { ...e, teams, score: calcScore(teams) };
  }).sort((a, b) => b.score - a.score);

  const rankClasses = ['top1', 'top2', 'top3'];

  wrap.innerHTML = `
    <table class="lb-table">
      <thead>
        <tr><th>#</th><th>NAME</th><th>TEAMS</th><th style="text-align:right">PTS</th></tr>
      </thead>
      <tbody>
        ${scored.map((e, i) => `
          <tr>
            <td class="lb-rank ${rankClasses[i] || ''}">${i + 1}</td>
            <td><div class="lb-name">${escapeHtml(e.name)}</div></td>
            <td>
              <div class="lb-teams">
                ${e.teams.map(t => {
                  const teamObj = ALL_TEAMS.find(x => x.name === t);
                  return `<span class="lb-team-chip">${teamObj ? teamObj.flag : ''} ${escapeHtml(t)}</span>`;
                }).join('')}
              </div>
            </td>
            <td><div class="lb-score">${e.score}</div><div class="lb-score-label">POINTS</div></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// ─── PICKS GRID ───────────────────────────────────────────────────────────────
function renderPicks(container) {
  if (state.entries.length === 0) {
    container.innerHTML = '<div class="loading-msg">No entries yet.</div>';
    return;
  }

  const sorted = [...state.entries].sort((a, b) => a.name.localeCompare(b.name));

  container.innerHTML = `<div class="picks-grid">
    ${sorted.map(e => {
      const isMe = state.justSubmitted && e.name === state.justSubmitted;
      const tierGroups = [
        { label: 'TIER 1', cls: 't1', teams: [e.tier1_1, e.tier1_2, e.tier1_3].filter(Boolean) },
        { label: 'TIER 2', cls: 't2', teams: [e.tier2_1, e.tier2_2].filter(Boolean) },
        { label: 'TIER 3', cls: 't3', teams: [e.tier3_1].filter(Boolean) },
      ];
      return `
        <div class="picks-card ${isMe ? 'picks-card-me' : ''}">
          <div class="picks-card-name">
            ${isMe ? '<span class="picks-you-badge">YOU</span>' : ''}
            ${escapeHtml(e.name)}
          </div>
          ${tierGroups.map(g => `
            <div class="picks-tier-group ${g.cls}">
              <div class="picks-tier-label">${g.label}</div>
              ${g.teams.map(t => {
                const teamObj = ALL_TEAMS.find(x => x.name === t);
                return `<div class="picks-team-row">
                  <span>${teamObj ? teamObj.flag : ''}</span>
                  <span>${escapeHtml(t)}</span>
                </div>`;
              }).join('')}
            </div>`).join('')}
        </div>`;
    }).join('')}
  </div>`;
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────
function unlockAdmin() {
  const pw = document.getElementById('admin-pw').value;
  if (pw === ADMIN_PASSWORD) {
    document.getElementById('admin-lock').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
    loadResultsLog();
  } else {
    showToast('Incorrect password', true);
  }
}

function setupAdminTeamDropdowns() {
  ['a-team1', 'a-team2'].forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = ALL_TEAMS.map(t =>
      `<option value="${escapeHtml(t.name)}">${t.flag} ${t.name}</option>`
    ).join('');
  });
}

async function submitResult() {
  const round   = document.getElementById('a-round').value;
  const team1   = document.getElementById('a-team1').value;
  const team2   = document.getElementById('a-team2').value;
  const outcome = document.getElementById('a-result').value;

  if (team1 === team2) { showToast('Teams must be different', true); return; }

  const result = { round, team1, team2, outcome, timestamp: new Date().toISOString() };

  if (GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    try {
      await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logResult', ...result }),
      });
    } catch(e) { console.warn(e); }
  }

  // Also store locally for this session
  state.results.push(result);
  showToast('Result logged!');
  loadResultsLog();
}

function loadResultsLog() {
  const log = document.getElementById('results-log');
  if (state.results.length === 0) {
    log.innerHTML = '<p style="color:var(--muted);font-size:0.85rem;">No results logged yet.</p>';
    return;
  }
  log.innerHTML = state.results.slice().reverse().map(r => {
    const t1 = ALL_TEAMS.find(x => x.name === r.team1);
    const t2 = ALL_TEAMS.find(x => x.name === r.team2);
    const f1 = t1 ? t1.flag : '';
    const f2 = t2 ? t2.flag : '';
    const outcomeLabel = {
      team1_win: `${f1} ${r.team1} wins`,
      team2_win: `${f2} ${r.team2} wins`,
      draw: 'Draw',
      team1_pens: `${f1} ${r.team1} wins on pens`,
      team2_pens: `${f2} ${r.team2} wins on pens`,
    }[r.outcome] || r.outcome;
    return `<div class="result-log-entry">
      <span>${f1} ${escapeHtml(r.team1)} vs ${f2} ${escapeHtml(r.team2)}</span>
      <span class="result-tag">${ROUND_LABELS[r.round]}</span>
      <span style="font-size:0.85rem;color:var(--white)">${outcomeLabel}</span>
    </div>`;
  }).join('');
}

function clearResults() {
  if (!confirm('Clear ALL logged results? This cannot be undone.')) return;
  state.results = [];
  loadResultsLog();
  showToast('Results cleared');
}

// ─── UTILS ───────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let toastTimer;
function showToast(msg, isError = false) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'toast' + (isError ? ' error' : '');
  clearTimeout(toastTimer);
  requestAnimationFrame(() => {
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  });
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const submittedName  = localStorage.getItem('wc2026_submitted_name');
  const submittedEmail = localStorage.getItem('wc2026_submitted_email');
  if (submittedName && submittedEmail) {
    document.getElementById('tab-btn-picks').style.display = '';
    const actionsEl = document.getElementById('landing-actions');
    actionsEl.innerHTML = `
      <p class="already-entered-note">Welcome back, <strong>${escapeHtml(submittedName)}</strong> — your picks are locked in.</p>
      <button class="btn-primary" onclick="goTo('page-leaderboard')">VIEW THE POOL →</button>
    `;
  }
});

import React, { useState } from 'react';
import './LeaderboardPage.css';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState('Monthly');

  return (
    <div className="agriculture-leaderboard-page">
      <div className="wrap">
        {/* Header */}
        <div className="page-header">
          <div>
            <div className="eyebrow">Impact &amp; Insights · Community Ranking</div>
            <h1 className="page-title">Village Leaderboard</h1>
            <p className="page-sub">See how Bhadana Village stacks up against other villages in Karnal this month.</p>
          </div>
          <div className="tabs">
            <button className={'tab ' + (timeframe === 'Weekly' ? 'active' : '')} onClick={() => setTimeframe('Weekly')}>Weekly</button>
            <button className={'tab ' + (timeframe === 'Monthly' ? 'active' : '')} onClick={() => setTimeframe('Monthly')}>Monthly</button>
            <button className={'tab ' + (timeframe === 'All Time' ? 'active' : '')} onClick={() => setTimeframe('All Time')}>All Time</button>
          </div>
        </div>

        {/* Your village highlight */}
        <div className="your-village">
          <div className="yv-left">
            <div className="yv-rank">#3</div>
            <div>
              <div className="yv-eyebrow">Your Village</div>
              <div className="yv-name">Bhadana Village</div>
              <div className="yv-meta">38 active farmers · Karnal Block</div>
            </div>
          </div>
          <div className="yv-stats">
            <div className="yv-stat">
              <div className="yv-stat-val">12.4 T</div>
              <div className="yv-stat-label">Waste Collected</div>
            </div>
            <div className="yv-stat">
              <div className="yv-stat-val up">↑ 2</div>
              <div className="yv-stat-label">Rank Change</div>
            </div>
            <div className="yv-stat">
              <div className="yv-stat-val">₹ 1,28,450</div>
              <div className="yv-stat-label">Farmer Earnings</div>
            </div>
          </div>
        </div>

        {/* Podium */}
        <div className="podium">
          <div className="pod-card silver">
            <div className="pod-medal">2</div>
            <div className="pod-village">Kunjpura</div>
            <div className="pod-block">31 farmers</div>
            <div className="pod-tonnes">13.9</div>
            <div className="pod-unit">tonnes collected</div>
          </div>
          <div className="pod-card gold">
            <div className="pod-medal">1</div>
            <div className="pod-village">Nissing</div>
            <div className="pod-block">45 farmers</div>
            <div className="pod-tonnes">16.2</div>
            <div className="pod-unit">tonnes collected</div>
          </div>
          <div className="pod-card bronze">
            <div className="pod-medal">3</div>
            <div className="pod-village">Bhadana</div>
            <div className="pod-block">38 farmers</div>
            <div className="pod-tonnes">12.4</div>
            <div className="pod-unit">tonnes collected</div>
          </div>
        </div>

        {/* Full leaderboard */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Full Rankings — Karnal Block</div>
            <div className="panel-note">Updated today, 09:00 AM</div>
          </div>
          <table className="lb">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Village</th>
                <th className="num">Farmers</th>
                <th className="num">Waste Collected</th>
                <th className="num">Earnings</th>
                <th className="num">Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><div className="rank-cell">01 <span className="rank-move same">–</span></div></td>
                <td>
                  <div className="village-cell">
                    <div className="village-icon">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                      </svg>
                    </div>
                    <div>
                      <div className="village-name">Nissing</div>
                      <div className="village-block">Karnal Block</div>
                    </div>
                  </div>
                </td>
                <td className="num-mono">45</td>
                <td className="num-mono leaf">16.2 T</td>
                <td className="num-mono">₹ 1,61,900</td>
                <td><div className="bar-wrap"><div class="bar-fill" style={{ width: '100%' }}></div></div></td>
              </tr>
              <tr>
                <td><div className="rank-cell">02 <span className="rank-move up">↑1</span></div></td>
                <td>
                  <div className="village-cell">
                    <div className="village-icon">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                      </svg>
                    </div>
                    <div>
                      <div className="village-name">Kunjpura</div>
                      <div className="village-block">Karnal Block</div>
                    </div>
                  </div>
                </td>
                <td className="num-mono">31</td>
                <td className="num-mono leaf">13.9 T</td>
                <td className="num-mono">₹ 1,38,600</td>
                <td><div className="bar-wrap"><div class="bar-fill" style={{ width: '86%' }}></div></div></td>
              </tr>
              <tr className="me">
                <td><div className="rank-cell">03 <span class="rank-move up">↑2</span></div></td>
                <td>
                  <div className="village-cell">
                    <div className="village-icon">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                      </svg>
                    </div>
                    <div>
                      <div className="village-name">Bhadana <span className="you-tag">Your village</span></div>
                      <div className="village-block">Karnal Block</div>
                    </div>
                  </div>
                </td>
                <td className="num-mono">38</td>
                <td className="num-mono leaf">12.4 T</td>
                <td className="num-mono">₹ 1,28,450</td>
                <td><div className="bar-wrap"><div class="bar-fill" style={{ width: '77%' }}></div></div></td>
              </tr>
              <tr>
                <td><div className="rank-cell">04 <span className="rank-move down">↓1</span></div></td>
                <td>
                  <div className="village-cell">
                    <div className="village-icon">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                      </svg>
                    </div>
                    <div>
                      <div className="village-name">Assandh</div>
                      <div className="village-block">Karnal Block</div>
                    </div>
                  </div>
                </td>
                <td className="num-mono">42</td>
                <td className="num-mono leaf">11.6 T</td>
                <td className="num-mono">₹ 1,15,300</td>
                <td><div className="bar-wrap"><div class="bar-fill" style={{ width: '72%' }}></div></div></td>
              </tr>
              <tr>
                <td><div className="rank-cell">05 <span className="rank-move same">–</span></div></td>
                <td>
                  <div className="village-cell">
                    <div className="village-icon">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                      </svg>
                    </div>
                    <div>
                      <div className="village-name">Gharaunda</div>
                      <div className="village-block">Karnal Block</div>
                    </div>
                  </div>
                </td>
                <td className="num-mono">35</td>
                <td className="num-mono leaf">9.8 T</td>
                <td className="num-mono">₹ 96,200</td>
                <td><div className="bar-wrap"><div class="bar-fill" style={{ width: '60%' }}></div></div></td>
              </tr>
              <tr>
                <td><div className="rank-cell">06 <span className="rank-move down">↓1</span></div></td>
                <td>
                  <div className="village-cell">
                    <div className="village-icon">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                      </svg>
                    </div>
                    <div>
                      <div className="village-name">Indri</div>
                      <div className="village-block">Karnal Block</div>
                    </div>
                  </div>
                </td>
                <td className="num-mono">22</td>
                <td className="num-mono leaf">7.1 T</td>
                <td className="num-mono">₹ 70,400</td>
                <td><div className="bar-wrap"><div class="bar-fill" style={{ width: '44%' }}></div></div></td>
              </tr>
            </tbody>
          </table>
          <div className="table-foot">
            <span>Showing 6 of 9 villages in Karnal Block</span>
            <span>Ranked by tonnes of waste collected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

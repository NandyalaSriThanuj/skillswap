// src/pages/LandingPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const explorePeople = [
  { name:'Aarav Shah',  avatar:'AS', level:'experienced', cat:'tech', skills:['Python','ML','Data Science'], rating:4.8, sessions:134, coins:45, bio:'ML engineer specialising in NLP and computer vision.', location:'Pune, India', completionRate:97, responseTime:'< 1 hr' },
  { name:'Mia Thomas',  avatar:'MT', level:'mid', cat:'tech', skills:['React','TypeScript','Next.js'], rating:4.6, sessions:78, coins:30, bio:'Frontend developer teaching React.', location:'Bengaluru', completionRate:94, responseTime:'< 2 hrs' },
];

const leaderboard = [
  { name:'Kiran Das', coins:12400, sessions:189, level:'experienced' },
  { name:'Riya Gupta', coins:10800, sessions:162, level:'experienced' },
];

const LS = {
  experienced: { color:'#ff6b6b', icon:'🔥' },
  mid: { color:'#6c63ff', icon:'⚡' },
  beginner: { color:'#43e97b', icon:'🌱' },
};

const Stars = ({ r }) => [1,2,3,4,5].map(i =>
  <span key={i} style={{ color: i <= Math.round(r) ? '#ffd700' : 'gray' }}>★</span>
);

const LBadge = ({ level }) => {
  const s = LS[level] || LS.beginner;
  return <span style={{ color:s.color }}>{s.icon} {level}</span>;
};

export default function LandingPage() {
  const [pg, setPg] = useState('home');
  const [sq, setSq] = useState('');

  const filtered = explorePeople.filter(p =>
    (!sq || p.name.toLowerCase().includes(sq.toLowerCase()))
  );

  return (
    <div>

      {/* NAV */}
      <nav style={{ display:'flex', justifyContent:'space-between', padding:20 }}>
        <div onClick={() => setPg('home')} style={{ fontWeight:700, cursor:'pointer' }}>
          ⚡ SkillSwap
        </div>
        <div>
          <Link to="/login">Login</Link>
          <Link to="/signup" style={{ marginLeft:10 }}>Signup</Link>
        </div>
      </nav>

      {/* HOME */}
      {pg === 'home' && (
        <div style={{ textAlign:'center', marginTop:50 }}>
          <h1>Trade Skills. Earn Value.</h1>
          <Link to="/signup">
            <button>Get Started</button>
          </Link>
        </div>
      )}

      {/* EXPLORE */}
      {pg === 'explore' && (
        <div style={{ padding:20 }}>
          <input
            value={sq}
            onChange={e=>setSq(e.target.value)}
            placeholder="Search..."
          />

          <div>
            {filtered.map((p,i) => (
              <div key={i} style={{ border:'1px solid #ccc', margin:10, padding:10 }}>
                <h3>{p.name}</h3>
                <LBadge level={p.level} />
                <div><Stars r={p.rating} /></div>
                <p>{p.bio}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEADERBOARD */}
      {pg === 'leaderboard' && (
        <div style={{ padding:20 }}>
          <h2>Leaderboard</h2>
          {leaderboard.map((u,i) => (
            <div key={i}>
              {i+1}. {u.name} - {u.coins}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
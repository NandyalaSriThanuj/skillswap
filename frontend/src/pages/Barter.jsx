// src/pages/Barter.jsx
// ──────────────────────────────────────────────────────────────────────────
// Full React conversion of barter.html — SkillBarter platform
// All original CSS, UI, logic, animations, modals and API integration
// preserved exactly. Uses SkillSwap backend (http://localhost:5000/api)
// with localStorage demo-mode fallback when backend is offline.
// ──────────────────────────────────────────────────────────────────────────

import React, {
  useState, useEffect, useRef, useCallback, useReducer
} from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Google Fonts injection (Clash Display, Space Grotesk, JetBrains Mono) ─
if (!document.getElementById('barter-fonts')) {
  const link = document.createElement('link');
  link.id   = 'barter-fonts';
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap';
  document.head.appendChild(link);
}

// ─── Static data ────────────────────────────────────────────────────────────

const QUESTIONS = {
  js: [
    "Write a function to reverse a string without using built-in reverse().",
    "Implement a debounce function that delays calling fn by 'delay' ms.",
    "Write a function to flatten a deeply nested array."
  ],
  py: [
    "Write a Python function to find the second largest number in a list.",
    "Implement a decorator that measures execution time of a function.",
    "Write a generator function that yields Fibonacci numbers."
  ],
  react: [
    "Create a custom useLocalStorage hook.",
    "Write a higher-order component that adds loading state.",
    "Implement a simple Redux-like state management with useReducer."
  ],
  sql: [
    "Write a query to find employees with salary above the department average.",
    "Write a recursive CTE to traverse a tree structure.",
    "Optimize a slow JOIN query with proper indexing strategy."
  ],
  design: [
    "Describe your process for conducting user research and synthesizing findings.",
    "Explain the difference between UX and UI and when each matters most.",
    "Walk through designing a checkout flow to reduce abandonment."
  ],
  finance: [
    "Explain how to calculate CAGR and when it's misleading.",
    "What is the difference between systematic and unsystematic risk?",
    "Walk through a DCF valuation step by step."
  ]
};

const EXPLORE_PEOPLE = [
  {
    name:"Arjun Mehta", level:"experienced", cat:"tech",
    skills:["Python","Machine Learning","FastAPI"], avatar:"AM", rating:4.9, sessions:142, coins:28,
    location:"Bengaluru, India", languages:["English","Hindi","Kannada"],
    bio:"Senior ML Engineer at a Bangalore startup. 6+ years building production ML systems. I love simplifying complex concepts — my students say I make ML 'click' like nothing else.",
    verifiedBadges:["Python 🔥","ML 🔥","FastAPI ⚡"], experience:"6 years", education:"B.Tech CS — IIT Bombay",
    teachingStyle:"Project-based learning with real datasets",
    availability:["Mon 7–9 PM","Wed 7–9 PM","Sat 10 AM–1 PM"],
    wantToLearn:["UI/UX Design","Product Management"],
    reviews:[
      {from:"Rahul S.",rating:5,text:"Arjun explained backpropagation in 20 minutes better than my entire college course.",tags:["👍 Very Clear"],date:"5 Jan 2026"},
      {from:"Mia T.",rating:5,text:"Super patient and gives great real-world examples. Highly recommend!",tags:["🎯 Practical"],date:"1 Jan 2026"},
      {from:"Dev P.",rating:5,text:"Best Python teacher I've found. Clear, structured, practical.",tags:["📚 Well Structured"],date:"28 Dec 2025"}
    ],
    completionRate:98, responseTime:"< 1 hr"
  },
  {
    name:"Priya Nair", level:"mid", cat:"design",
    skills:["Figma","UI/UX Design","Prototyping"], avatar:"PN", rating:4.7, sessions:67, coins:35,
    location:"Mumbai, India", languages:["English","Malayalam","Hindi"],
    bio:"Product designer with 3 years at a fintech company. I specialize in mobile-first design and user research. Passionate about accessible design and helping engineers understand UX.",
    verifiedBadges:["UI/UX Design ⚡","Figma ⚡"], experience:"3 years", education:"B.Des — NID Ahmedabad",
    teachingStyle:"Case study walkthroughs + hands-on Figma practice",
    availability:["Tue 6–8 PM","Thu 6–8 PM","Sun 2–5 PM"],
    wantToLearn:["React","Frontend Dev"],
    reviews:[
      {from:"Arjun M.",rating:5,text:"Priya redesigned my entire mental model of UX. Sessions are always structured and actionable.",tags:["📚 Well Structured","💬 Interactive"],date:"9 Jan 2026"},
      {from:"Kiran D.",rating:4,text:"Very good teacher, explains Figma workflows clearly.",tags:["👍 Very Clear"],date:"3 Jan 2026"}
    ],
    completionRate:95, responseTime:"< 2 hrs"
  },
  {
    name:"Rahul Singh", level:"beginner", cat:"tech",
    skills:["JavaScript","React","Node.js"], avatar:"RS", rating:4.3, sessions:12, coins:10,
    location:"Delhi, India", languages:["English","Hindi"],
    bio:"Self-taught developer, 1.5 years of experience building side projects. Recently completed a React bootcamp. I teach what I know best — practical JS for beginners, no jargon.",
    verifiedBadges:["JavaScript 🌱"], experience:"1.5 years", education:"B.Com — Delhi University (self-taught dev)",
    teachingStyle:"Build-it-together live coding sessions",
    availability:["Weekday evenings 8–10 PM","Sat/Sun flexible"],
    wantToLearn:["Python","SQL","System Design"],
    reviews:[
      {from:"Sneha K.",rating:4,text:"Really relatable teacher — explains things at a beginner pace perfectly.",tags:["👍 Very Clear"],date:"7 Jan 2026"},
      {from:"Dev P.",rating:5,text:"Rahul helped me understand async/await in one session. Great energy!",tags:["💬 Interactive"],date:"2 Jan 2026"}
    ],
    completionRate:88, responseTime:"< 3 hrs"
  },
  {
    name:"Sneha Kapoor", level:"experienced", cat:"finance",
    skills:["Stock Analysis","DCF Valuation","Options"], avatar:"SK", rating:5.0, sessions:203, coins:50,
    location:"Hyderabad, India", languages:["English","Telugu","Hindi"],
    bio:"CFA Level 3 candidate. 8 years in equity research at a top brokerage. I break down financial concepts that textbooks make terrifying — valuations, options Greeks, portfolio theory — into practical tools you'll actually use.",
    verifiedBadges:["Finance 🔥","Stock Analysis 🔥","Options ⚡"], experience:"8 years", education:"MBA Finance — IIM Calcutta",
    teachingStyle:"Live market analysis + concept deep dives",
    availability:["Mon–Fri 6–8 AM","Sat 9 AM–12 PM"],
    wantToLearn:["Python for Finance","Data Visualization"],
    reviews:[
      {from:"Arjun M.",rating:5,text:"Sneha's DCF session was literally worth ₹50,000 in knowledge. She knows her stuff cold.",tags:["🧠 Deep Knowledge"],date:"12 Jan 2026"},
      {from:"Priya N.",rating:5,text:"Made options trading understandable for a total beginner. Incredible patience.",tags:["👍 Very Clear"],date:"6 Jan 2026"},
      {from:"Kavya R.",rating:5,text:"Best finance teacher on this platform, no contest.",tags:["🎯 Practical"],date:"1 Jan 2026"}
    ],
    completionRate:100, responseTime:"< 30 min"
  },
  {
    name:"Dev Patel", level:"mid", cat:"language",
    skills:["Spanish B2","German A2","English Fluency"], avatar:"DP", rating:4.8, sessions:89, coins:22,
    location:"Ahmedabad, India", languages:["English","Hindi","Gujarati","Spanish","German"],
    bio:"Linguistics enthusiast and language coach. Lived in Madrid for 2 years, now teaching conversational Spanish and German. I focus on speaking confidence, not grammar drills.",
    verifiedBadges:["Spanish ⚡","English Fluency ⚡"], experience:"4 years coaching", education:"MA Linguistics — BHU",
    teachingStyle:"Conversational immersion with zero-translation method",
    availability:["Daily 7–9 AM","Weekends 3–6 PM"],
    wantToLearn:["UI/UX Design","Photography"],
    reviews:[
      {from:"Rahul S.",rating:5,text:"I had my first real Spanish conversation after just 3 sessions. Dev's method works.",tags:["💬 Interactive"],date:"11 Jan 2026"},
      {from:"Priya N.",rating:5,text:"So encouraging and fun. My English fluency improved massively.",tags:["👍 Very Clear"],date:"4 Jan 2026"}
    ],
    completionRate:97, responseTime:"< 1 hr"
  },
  {
    name:"Kavya Reddy", level:"experienced", cat:"music",
    skills:["Guitar","Music Theory","Carnatic"], avatar:"KR", rating:4.9, sessions:178, coins:45,
    location:"Chennai, India", languages:["English","Telugu","Tamil"],
    bio:"Performing musician and music educator with 12 years of experience. Grade 8 ABRSM guitarist. I teach from beginner chords to advanced theory and improvisation.",
    verifiedBadges:["Guitar 🔥","Music Theory 🔥","Carnatic 🔥"], experience:"12 years", education:"B.Music — Chennai Music Academy",
    teachingStyle:"Theory + ear training + performance in every session",
    availability:["Mon/Wed/Fri 5–8 PM","Sat 10 AM–2 PM"],
    wantToLearn:["Music Production","Ableton DAW"],
    reviews:[
      {from:"Dev P.",rating:5,text:"Kavya taught me to read sheet music in 4 sessions. Amazing structured approach.",tags:["📚 Well Structured"],date:"10 Jan 2026"},
      {from:"Sneha K.",rating:5,text:"I picked up guitar as a hobby — Kavya made it feel achievable and joyful.",tags:["💬 Interactive"],date:"5 Jan 2026"},
      {from:"Rahul S.",rating:5,text:"Best music teacher I've ever had. Period.",tags:["🎯 Practical"],date:"30 Dec 2025"}
    ],
    completionRate:99, responseTime:"< 1 hr"
  }
];

const MATCH_PROFILES = [
  {name:"Aarav Shah",teaches:["Python","Machine Learning","Data Science"],level:"experienced",coins:45,avatar:"AS",rating:4.8,sessions:134,completionRate:97,responseTime:"< 1 hr",location:"Pune, India",experience:"5 years",education:"M.Tech AI — IIT Hyderabad",bio:"ML engineer specialising in NLP and computer vision. I break down complex algorithms into intuitive intuitions you can actually build on.",teachingStyle:"Concept-first, then code. Always with real datasets.",availability:["Mon/Wed/Fri 7–9 PM","Sat 10 AM–1 PM"],wantToLearn:["UI/UX Design","React"],languages:["English","Hindi","Marathi"],verifiedBadges:["Python 🔥","ML 🔥","Data Science ⚡"],reviews:[{from:"Priya N.",rating:5,text:"Aarav made gradient descent finally click for me. Incredible patience.",tags:["👍 Very Clear","🧠 Deep Knowledge"],date:"10 Jan 2026"},{from:"Dev P.",rating:5,text:"Best ML sessions I've ever had. Practical and no fluff.",tags:["🎯 Practical"],date:"5 Jan 2026"},{from:"Rahul S.",rating:4,text:"Very knowledgeable, sometimes moves a bit fast.",tags:["⚡ Fast Paced"],date:"28 Dec 2025"}]},
  {name:"Mia Thomas",teaches:["React","TypeScript","Next.js"],level:"mid",coins:30,avatar:"MT",rating:4.6,sessions:78,completionRate:94,responseTime:"< 2 hrs",location:"Bengaluru, India",experience:"3 years",education:"B.E. CSE — VTU",bio:"Frontend developer at a SaaS startup. I teach React from hooks to advanced patterns, TypeScript typing, and Next.js for production apps.",teachingStyle:"Live code walkthroughs with GitHub repo sharing after each session.",availability:["Tue/Thu 6–8 PM","Sun 2–5 PM"],wantToLearn:["Python","System Design"],languages:["English","Hindi","Kannada"],verifiedBadges:["React ⚡","TypeScript ⚡"],reviews:[{from:"Kiran D.",rating:5,text:"Mia's React sessions are structured perfectly — from basics to context API in 3 sessions.",tags:["📚 Well Structured","💬 Interactive"],date:"9 Jan 2026"},{from:"Sneha K.",rating:4,text:"Great teacher, covers TypeScript really well.",tags:["🧠 Deep Knowledge"],date:"2 Jan 2026"}]},
  {name:"James Lee",teaches:["SQL","PostgreSQL","Database Design"],level:"mid",coins:28,avatar:"JL",rating:4.5,sessions:55,completionRate:91,responseTime:"< 3 hrs",location:"Chennai, India",experience:"4 years",education:"B.Tech IT — Anna University",bio:"Backend developer and database specialist. I focus on writing queries that actually perform — indexing, query planning, normalization, and real schema design.",teachingStyle:"Problem-based: we start with a slow query, fix it together.",availability:["Mon–Fri 8–10 PM","Sat flexible"],wantToLearn:["Machine Learning","Python"],languages:["English","Tamil"],verifiedBadges:["SQL ⚡","PostgreSQL 🌱"],reviews:[{from:"Aarav S.",rating:5,text:"James taught me query optimization in one session. My app went from 4s to 80ms.",tags:["🎯 Practical","🧠 Deep Knowledge"],date:"7 Jan 2026"},{from:"Mia T.",rating:4,text:"Solid SQL teacher. Great at explaining JOINs and CTEs.",tags:["👍 Very Clear"],date:"1 Jan 2026"}]},
  {name:"Riya Gupta",teaches:["Spanish","French","IELTS Prep"],level:"experienced",coins:40,avatar:"RG",rating:4.9,sessions:162,completionRate:99,responseTime:"< 30 min",location:"Delhi, India",experience:"6 years",education:"MA French — JNU Delhi",bio:"Language coach and certified DELF examiner. Lived in Paris for 3 years. I teach conversational Spanish and French with a zero-translation immersion approach.",teachingStyle:"Full immersion from session 1. Speaking before grammar.",availability:["Daily 6–8 AM","Weekends 10 AM–1 PM"],wantToLearn:["UI/UX Design","Photography"],languages:["English","Hindi","Spanish","French"],verifiedBadges:["Spanish 🔥","French 🔥","IELTS ⚡"],reviews:[{from:"Dev P.",rating:5,text:"Riya is phenomenal. Had my first full Spanish conversation after 4 sessions.",tags:["💬 Interactive","👍 Very Clear"],date:"11 Jan 2026"},{from:"James L.",rating:5,text:"Best language teacher on any platform I've tried.",tags:["🎯 Practical"],date:"4 Jan 2026"},{from:"Priya N.",rating:5,text:"French pronunciation fixed in 2 sessions. Absolute pro.",tags:["🧠 Deep Knowledge"],date:"29 Dec 2025"}]},
  {name:"Kiran Das",teaches:["Finance","Options Trading","Portfolio Theory"],level:"experienced",coins:50,avatar:"KD",rating:4.9,sessions:189,completionRate:100,responseTime:"< 45 min",location:"Mumbai, India",experience:"9 years",education:"MBA Finance — IIM Ahmedabad",bio:"Equity derivatives trader and finance educator. I demystify options Greeks, portfolio construction, and risk management for anyone from curious beginners to CFA aspirants.",teachingStyle:"Live market + real trade examples. Theory only when needed.",availability:["Mon–Sat 7–9 AM","Sat afternoon on request"],wantToLearn:["Python for Finance","Excel Automation"],languages:["English","Hindi","Bengali"],verifiedBadges:["Finance 🔥","Options 🔥","Portfolio Theory ⚡"],reviews:[{from:"Sneha K.",rating:5,text:"Kiran's options session was life-changing. I finally understand delta hedging.",tags:["🧠 Deep Knowledge","🎯 Practical"],date:"12 Jan 2026"},{from:"Rahul S.",rating:5,text:"Explained portfolio theory like a story. Never boring.",tags:["👍 Very Clear","💬 Interactive"],date:"6 Jan 2026"}]}
];

const INIT_LEADERBOARD = [
  {name:"Sneha Kapoor",coins:8420,sessions:203,level:"experienced"},
  {name:"Arjun Mehta",coins:7150,sessions:142,level:"experienced"},
  {name:"Kavya Reddy",coins:6890,sessions:178,level:"experienced"},
  {name:"Priya Nair",coins:4230,sessions:67,level:"mid"},
  {name:"Dev Patel",coins:3980,sessions:89,level:"mid"},
  {name:"You",coins:0,sessions:0,level:"beginner",isUser:true}
];

// ─── Demo store (localStorage fallback) ─────────────────────────────────────
const demoStore = {
  get users() { return JSON.parse(localStorage.getItem('sb_users')||'[]'); },
  save(users) { localStorage.setItem('sb_users', JSON.stringify(users)); },
  findByEmail(email) { return this.users.find(u=>u.email===email.toLowerCase()); },
  create(data) {
    const users = this.users;
    const u = {id:'demo-'+Date.now(),...data,level:'beginner',coins:0,earned:0,redeemed:0,sessions:0,verifiedSkills:[],activity:[],requests:[],incomingRequests:[]};
    users.push(u); this.save(users); return u;
  },
  update(id,updates) {
    const users = this.users;
    const i = users.findIndex(u=>u.id===id);
    if(i>=0){ Object.assign(users[i],updates); this.save(users); return users[i]; }
  }
};

// ─── Utility helpers ──────────────────────────────────────────────────────
const Stars = ({r,size=13}) => (
  <span>
    {Array.from({length:5},(_,i)=>(
      <span key={i} style={{color:i<Math.round(r)?'#ffd700':'var(--barter-border)',fontSize:size}}>★</span>
    ))}
  </span>
);

const LevelBadge = ({level}) => {
  const cfg = {
    experienced:{bg:'rgba(255,107,107,.15)',brd:'rgba(255,107,107,.3)',c:'#ff6b6b',icon:'🔥'},
    mid:{bg:'rgba(108,99,255,.15)',brd:'rgba(108,99,255,.3)',c:'#6c63ff',icon:'⚡'},
    beginner:{bg:'rgba(67,233,123,.15)',brd:'rgba(67,233,123,.3)',c:'#43e97b',icon:'🌱'},
  }[level]||{bg:'rgba(67,233,123,.15)',brd:'rgba(67,233,123,.3)',c:'#43e97b',icon:'🌱'};
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:100,fontSize:11,fontWeight:600,background:cfg.bg,border:`1px solid ${cfg.brd}`,color:cfg.c}}>
      {cfg.icon} {level}
    </span>
  );
};

const Avatar = ({text,size=44,fontSize=16}) => (
  <div style={{width:size,height:size,borderRadius:'50%',background:'linear-gradient(135deg,#6c63ff,#ff6b6b)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Clash Display,sans-serif',fontWeight:700,fontSize,color:'white',flexShrink:0}}>
    {text}
  </div>
);

const SkillChip = ({children,selected,onClick}) => (
  <span onClick={onClick} style={{padding:'6px 14px',borderRadius:100,fontSize:13,fontWeight:500,border:`1px solid ${selected?'#6c63ff':'var(--barter-border)'}`,background:selected?'rgba(108,99,255,.2)':'var(--barter-surface2)',color:selected?'#6c63ff':'var(--barter-muted)',cursor:onClick?'pointer':'default',userSelect:'none',transition:'all .15s'}}>
    {children}
  </span>
);

// ─── CSS injected once into <head> ──────────────────────────────────────────
const BARTER_CSS = `
  :root {
    --barter-bg: #0a0a0f;
    --barter-surface: #12121a;
    --barter-surface2: #1a1a28;
    --barter-border: #2a2a40;
    --barter-accent: #6c63ff;
    --barter-accent2: #ff6b6b;
    --barter-accent3: #43e97b;
    --barter-gold: #ffd700;
    --barter-muted: #6b6b8a;
    --barter-text: #e8e8f0;
    --barter-card-hover: #1e1e2e;
  }
  .barter-wrap { font-family:'Space Grotesk',sans-serif; background:var(--barter-bg); color:var(--barter-text); min-height:100vh; position:relative; }
  .barter-wrap::before { content:''; position:fixed; inset:0; background-image:linear-gradient(rgba(108,99,255,0.03)1px,transparent 1px),linear-gradient(90deg,rgba(108,99,255,0.03)1px,transparent 1px); background-size:40px 40px; pointer-events:none; z-index:0; }
  .barter-wrap * { box-sizing:border-box; }
  /* Grid */
  .b-grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
  .b-grid2 { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; }
  @media(max-width:768px){ .b-grid3,.b-grid2{ grid-template-columns:1fr; } }
  /* Card */
  .b-card { background:var(--barter-surface); border:1px solid var(--barter-border); border-radius:16px; padding:24px; transition:all .2s; }
  .b-card:hover { background:var(--barter-card-hover); border-color:var(--barter-accent); transform:translateY(-2px); box-shadow:0 12px 40px rgba(108,99,255,.15); }
  /* Buttons */
  .b-btn { padding:10px 22px; border-radius:8px; font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:14px; cursor:pointer; border:none; transition:all .2s; }
  .b-btn-primary { background:var(--barter-accent); color:white; }
  .b-btn-primary:hover { background:#7d75ff; transform:translateY(-1px); box-shadow:0 8px 24px rgba(108,99,255,.4); }
  .b-btn-ghost { background:transparent; color:var(--barter-muted); border:1px solid var(--barter-border)!important; }
  .b-btn-ghost:hover { color:var(--barter-text); border-color:var(--barter-accent)!important; }
  .b-btn-danger { background:var(--barter-accent2); color:white; }
  .b-btn-danger:hover { background:#ff8080; }
  .b-btn-success { background:var(--barter-accent3); color:#0a0a0f; }
  .b-btn-success:hover { background:#5fffaa; }
  .b-btn-gold { background:linear-gradient(135deg,#ffd700,#ffaa00); color:#1a1100; font-weight:700; }
  /* Match card */
  .b-match-card { background:var(--barter-surface); border:1px solid var(--barter-border); border-radius:16px; padding:22px; display:flex; align-items:center; gap:20px; transition:all .2s; }
  .b-match-card:hover { border-color:var(--barter-accent); background:var(--barter-card-hover); box-shadow:0 8px 32px rgba(108,99,255,.12); }
  /* Modal */
  .b-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); backdrop-filter:blur(8px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
  .b-modal { background:var(--barter-surface); border:1px solid var(--barter-border); border-radius:24px; padding:40px; width:100%; max-width:540px; max-height:90vh; overflow-y:auto; animation:bModalIn .2s ease; }
  .b-modal-wide { max-width:720px; }
  @keyframes bModalIn { from{transform:scale(.95);opacity:0} to{transform:scale(1);opacity:1} }
  /* Form inputs */
  .b-input { width:100%; background:var(--barter-surface2); border:1px solid var(--barter-border); color:var(--barter-text); padding:12px 16px; border-radius:10px; font-family:'Space Grotesk',sans-serif; font-size:15px; outline:none; transition:border-color .2s; }
  .b-input:focus { border-color:var(--barter-accent); box-shadow:0 0 0 3px rgba(108,99,255,.1); }
  .b-input option { background:var(--barter-surface); }
  .b-label { display:block; font-size:13px; font-weight:600; color:var(--barter-muted); margin-bottom:8px; letter-spacing:.5px; text-transform:uppercase; }
  /* Dash tabs */
  .b-dash-tab { padding:15px 22px; font-size:14px; font-weight:600; color:var(--barter-muted); cursor:pointer; border-bottom:2px solid transparent; transition:all .2s; }
  .b-dash-tab.active { color:var(--barter-accent); border-bottom-color:var(--barter-accent); }
  .b-dash-tab:hover { color:var(--barter-text); }
  /* Exam */
  .b-code-editor { width:100%; min-height:240px; background:#0d0d1a; border:none; color:#a9dc76; padding:24px; font-family:'JetBrains Mono',monospace; font-size:14px; line-height:1.7; resize:vertical; outline:none; }
  /* Toast */
  .b-toast { position:fixed; bottom:28px; right:28px; background:var(--barter-surface2); border:1px solid var(--barter-border); border-radius:12px; padding:14px 22px; z-index:2000; display:flex; align-items:center; gap:12px; transform:translateY(80px); opacity:0; transition:all .3s ease; font-size:14px; max-width:340px; color:var(--barter-text); }
  .b-toast.show { transform:translateY(0); opacity:1; }
  /* Progress bar */
  .b-progress { width:100%; height:8px; background:var(--barter-surface2); border-radius:100px; overflow:hidden; }
  .b-progress-fill { height:100%; background:linear-gradient(90deg,var(--barter-accent),var(--barter-accent3)); border-radius:100px; transition:width .6s ease; }
  /* Hero animations */
  @keyframes bFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
  @keyframes bBlink { 0%,100%{opacity:1} 50%{opacity:.4} }
  .b-fade1{animation:bFadeUp .6s .0s ease both}
  .b-fade2{animation:bFadeUp .6s .1s ease both}
  .b-fade3{animation:bFadeUp .6s .2s ease both}
  .b-fade4{animation:bFadeUp .6s .3s ease both}
  .b-fade5{animation:bFadeUp .6s .5s ease both}
  .b-pulse{animation:bPulse 2s infinite}
  .b-blink{animation:bBlink 1s infinite}
  /* Leaderboard */
  .b-lb-row { display:flex; align-items:center; gap:16px; padding:15px 18px; border-radius:12px; transition:background .2s; }
  .b-lb-row:hover { background:var(--barter-surface2); }
  /* Scrollbar */
  .b-modal::-webkit-scrollbar,.b-modal-wide::-webkit-scrollbar{width:5px}
  .b-modal::-webkit-scrollbar-thumb,.b-modal-wide::-webkit-scrollbar-thumb{background:var(--barter-border);border-radius:3px}
  /* Sections */
  .b-section { max-width:1200px; margin:0 auto; padding:72px 24px; }
  /* Session live */
  .b-live-dot { width:8px; height:8px; background:var(--barter-accent2); border-radius:50%; animation:bPulse 1.5s infinite; }
`;

if (!document.getElementById('barter-styles')) {
  const s = document.createElement('style');
  s.id = 'barter-styles';
  s.textContent = BARTER_CSS;
  document.head.appendChild(s);
}

// ─── Toast component ──────────────────────────────────────────────────────
const BarterToast = ({toast: t}) => (
  <div className={`b-toast${t.show?' show':''}`}>
    <span style={{fontSize:18}}>{t.icon}</span>
    <span>{t.msg}</span>
  </div>
);

// ─── Modal wrapper ────────────────────────────────────────────────────────
const BarterModal = ({open,onClose,children,wide=false}) => {
  if(!open) return null;
  return (
    <div className="b-modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className={`b-modal${wide?' b-modal-wide':''}`}>{children}</div>
    </div>
  );
};

// ─── SVG Pie Chart ────────────────────────────────────────────────────────
const PieChart = ({skills}) => {
  const svgRef = useRef(null);
  const colors = ['#6c63ff','#ff6b6b','#43e97b','#ffd700','#ff9f43'];
  useEffect(()=>{
    const svg = svgRef.current; if(!svg) return;
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    const n = skills.length; const ang = (2*Math.PI)/n; let start = -Math.PI/2;
    skills.forEach((_,i)=>{
      const end = start+ang;
      const x1=50+42*Math.cos(start),y1=50+42*Math.sin(start);
      const x2=50+42*Math.cos(end),y2=50+42*Math.sin(end);
      const la = ang>Math.PI?1:0;
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',`M50,50 L${x1},${y1} A42,42 0 ${la} 1 ${x2},${y2} Z`);
      path.setAttribute('fill',colors[i%colors.length]);
      path.setAttribute('stroke','#1a1a28'); path.setAttribute('stroke-width','2');
      svg.appendChild(path); start=end;
    });
    const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx','50');c.setAttribute('cy','50');c.setAttribute('r','22');c.setAttribute('fill','#1a1a28');
    svg.appendChild(c);
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x','50');t.setAttribute('y','54');t.setAttribute('text-anchor','middle');
    t.setAttribute('fill','#e8e8f0');t.setAttribute('font-size','10');t.setAttribute('font-weight','600');
    t.textContent=n+' skills'; svg.appendChild(t);
  },[skills]);
  return <svg ref={svgRef} viewBox="0 0 100 100" width={90} height={90} style={{flexShrink:0}}/>;
};

// ─── Main Barter component ────────────────────────────────────────────────
export default function Barter() {
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // ── State ──
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken]     = useState(()=>localStorage.getItem('sb_token')||null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [activePage, setActivePage]   = useState('home');
  const [dashTab, setDashTab]         = useState('overview');
  const [toast, setToast]             = useState({show:false,icon:'',msg:''});
  const [explorePeople, setExplorePeople] = useState(EXPLORE_PEOPLE);
  const [leaderboard, setLeaderboard] = useState(INIT_LEADERBOARD);

  // Modals
  const [loginModal, setLoginModal]     = useState(false);
  const [registerModal, setRegisterModal] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [analyticsModal, setAnalyticsModal] = useState(null); // profile object
  const [profileModal, setProfileModal] = useState(null);

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass]   = useState('');
  const [regTeach, setRegTeach] = useState([]);
  const [regLearn, setRegLearn] = useState([]);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass]   = useState('');

  // Explore filters
  const [exploreSearch, setExploreSearch] = useState('');
  const [exploreLevel, setExploreLevel]   = useState('');
  const [exploreCat, setExploreCat]       = useState('');

  // Exam
  const [examSkill, setExamSkill]   = useState('js');
  const [examLevel, setExamLevel]   = useState('beginner');
  const [examActive, setExamActive] = useState(false);
  const [examDone, setExamDone]     = useState(false);
  const [examQ, setExamQ]           = useState(0);
  const [examScore, setExamScore]   = useState(0);
  const [examSecs, setExamSecs]     = useState(900);
  const [examAnswer, setExamAnswer] = useState('');
  const [examResult, setExamResult] = useState(null);
  const examTimerRef = useRef(null);

  // Session
  const [sessionSkill, setSessionSkill]     = useState('JavaScript');
  const [sessionListeners, setSessionListeners] = useState('3');
  const [sessionLive, setSessionLive]       = useState(false);
  const [sessionSecs, setSessionSecs]       = useState(0);
  const [sessionCoins, setSessionCoins]     = useState(0);
  const [sessionRate, setSessionRate]       = useState(0);
  const sessionRef = useRef(null);

  // Redeem
  const [redeemAmt, setRedeemAmt]     = useState('');
  const [redeemMethod, setRedeemMethod] = useState('UPI Transfer');
  const [redeemHistory, setRedeemHistory] = useState([]);

  // My sessions
  const [sessionsTab, setSessionsTab] = useState('sent');
  const [sentRequests, setSentRequests]     = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Connect request modal
  const [reqSpeaker, setReqSpeaker]   = useState(null);
  const [reqSkill, setReqSkill]       = useState('');
  const [reqMessage, setReqMessage]   = useState('');

  // Feedback
  const [fbRating, setFbRating]       = useState(0);
  const [fbText, setFbText]           = useState('');
  const [fbTags, setFbTags]           = useState([]);
  const [fbSpeaker, setFbSpeaker]     = useState(null);
  const [fbCats, setFbCats]           = useState({clarity:0,depth:0,engagement:0,recommend:0});

  // ── Backend check on mount ─────────────────────────────────────────────
  useEffect(()=>{
    const check = async ()=>{
      try{
        const controller = new AbortController();
        const tid = setTimeout(()=>controller.abort(),2000);
        const r = await fetch(API_BASE.replace('/api','')+'/api/health',{signal:controller.signal});
        clearTimeout(tid);
        if(r.ok) setBackendOnline(true);
      } catch{ setBackendOnline(false); }
    };
    check();
    // Restore session
    const saved = localStorage.getItem('sb_current_user');
    if(saved){ try{ const u=JSON.parse(saved); if(u?.name) doLogin(u); }catch{ localStorage.removeItem('sb_current_user'); } }
  },[]);

  // ── Toast helper ───────────────────────────────────────────────────────
  const showToast = useCallback((icon,msg)=>{
    setToast({show:true,icon,msg});
    setTimeout(()=>setToast(t=>({...t,show:false})),3500);
  },[]);

  // ── apiFetch ───────────────────────────────────────────────────────────
  const apiFetch = useCallback(async (path,options={})=>{
    const headers = {'Content-Type':'application/json',...(options.headers||{})};
    if(authToken) headers['Authorization']='Bearer '+authToken;
    const r = await fetch(API_BASE+path,{...options,headers});
    const d = await r.json();
    if(!r.ok) throw new Error(d.error||'Request failed');
    return d;
  },[authToken,API_BASE]);

  // ── Auth ───────────────────────────────────────────────────────────────
  const doLogin = useCallback((user)=>{
    setCurrentUser(user);
    setActivePage('dashboard');
    const lb = [...INIT_LEADERBOARD];
    lb[5]={...lb[5],name:user.name,coins:user.coins||0};
    setLeaderboard(lb);
  },[]);

  const handleRegister = async ()=>{
    if(!regName){ showToast('⚠️','Please enter your name'); return; }
    if(!regEmail||!regEmail.includes('@')){ showToast('⚠️','Please enter a valid email'); return; }
    if(!regPass||regPass.length<8){ showToast('⚠️','Password must be at least 8 characters'); return; }
    try{
      let user;
      if(backendOnline){
        const d = await apiFetch('/auth/signup',{method:'POST',body:JSON.stringify({name:regName,email:regEmail,password:regPass,teachSkills:regTeach,learnSkills:regLearn})});
        localStorage.setItem('sb_token',d.token); setAuthToken(d.token);
        user={...d.user,coins:0,earned:0,redeemed:0,sessions:0,verifiedSkills:[],activity:['Account created — welcome! 🎉'],requests:[],incomingRequests:[],teachSkills:regTeach,learnSkills:regLearn};
      } else {
        if(demoStore.findByEmail(regEmail)){ showToast('❌','Email already registered. Try signing in.'); return; }
        const av=regName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
        user=demoStore.create({name:regName,email:regEmail,password:regPass,avatar:av,teachSkills:regTeach,learnSkills:regLearn});
      }
      localStorage.setItem('sb_current_user',JSON.stringify(user));
      setRegisterModal(false);
      doLogin(user);
      showToast('🎉',`Welcome to SkillBarter, ${regName}!`);
    } catch(e){ showToast('❌',e.message||'Registration failed.'); }
  };

  const handleLogin = async ()=>{
    if(!loginEmail||!loginPass){ showToast('⚠️','Please enter email and password'); return; }
    try{
      let user;
      if(backendOnline){
        const d = await apiFetch('/auth/login',{method:'POST',body:JSON.stringify({email:loginEmail,password:loginPass})});
        localStorage.setItem('sb_token',d.token); setAuthToken(d.token);
        user={...d.user,coins:d.user.coins||0,earned:d.user.earned||0,redeemed:d.user.redeemed||0,sessions:d.user.sessions||0,verifiedSkills:d.user.verifiedSkills||[],activity:d.user.activity||[],requests:[],incomingRequests:[],teachSkills:d.user.skills_offered||[],learnSkills:d.user.skills_wanted||[]};
      } else {
        const found=demoStore.findByEmail(loginEmail);
        if(!found){ showToast('❌','No account found. Please register first.'); return; }
        if(found.password!==loginPass){ showToast('❌','Incorrect password.'); return; }
        user=found;
      }
      localStorage.setItem('sb_current_user',JSON.stringify(user));
      setLoginModal(false);
      doLogin(user);
      showToast('👋',`Welcome back, ${user.name}!`);
      loadMyRequests(user);
    } catch(e){ showToast('❌',e.message||'Login failed.'); }
  };

  const handleLogout = ()=>{
    setCurrentUser(null); setAuthToken(null);
    localStorage.removeItem('sb_token'); localStorage.removeItem('sb_current_user');
    setActivePage('home');
    showToast('👋','You have been signed out.');
  };

  const updateUser = (updates)=>{
    setCurrentUser(u=>{
      const n={...u,...updates};
      localStorage.setItem('sb_current_user',JSON.stringify(n));
      if(!backendOnline) demoStore.update(n.id,n);
      return n;
    });
  };

  // ── Exam ───────────────────────────────────────────────────────────────
  const startExam = ()=>{
    setExamActive(true); setExamDone(false); setExamQ(0); setExamScore(0);
    setExamSecs(900); setExamAnswer(''); setExamResult(null);
    showToast('🛡️','Exam started. Anti-plagiarism monitoring active.');
    const handler = ()=>{ if(document.hidden) showToast('⚠️','Tab switch detected! This has been logged.'); };
    document.addEventListener('visibilitychange',handler);
    examTimerRef.current = setInterval(()=>{
      setExamSecs(s=>{
        if(s<=1){ clearInterval(examTimerRef.current); document.removeEventListener('visibilitychange',handler); finishExam(examQ,examScore); return 0; }
        return s-1;
      });
    },1000);
    return ()=>{ clearInterval(examTimerRef.current); document.removeEventListener('visibilitychange',handler); };
  };

  const submitAnswer = ()=>{
    if(examAnswer.trim().length<10){ showToast('⚠️','Answer too short'); return; }
    const qs = QUESTIONS[examSkill]||QUESTIONS.js;
    const nextQ = examQ+1;
    const nextScore = examScore+1;
    if(nextQ>=3){ finishExam(nextQ,nextScore); }
    else{ setExamQ(nextQ); setExamScore(nextScore); setExamAnswer(''); showToast('✅','Answer submitted!'); }
  };

  const skipQuestion = ()=>{
    const nextQ = examQ+1;
    if(nextQ>=3){ finishExam(nextQ,examScore); } else { setExamQ(nextQ); setExamAnswer(''); }
  };

  const finishExam = (q,score)=>{
    clearInterval(examTimerRef.current);
    setExamActive(false); setExamDone(true);
    const passed = score>=2;
    const levelLabel = examLevel==='experienced'?'🔥':examLevel==='mid'?'⚡':'🌱';
    setExamResult({passed,score,emoji:passed?'🏆':'😔',title:passed?'Exam Passed!':'Not Quite',msg:passed?`Score:${score}/3 — ${examSkill} verified at ${examLevel} level! Badge added.`:`Score:${score}/3 — You need 2/3. Keep practicing and try again!`});
    if(passed&&currentUser){
      const badge=`${examSkill.toUpperCase()} ${levelLabel}`;
      updateUser({verifiedSkills:[...new Set([...(currentUser.verifiedSkills||[]),badge])],activity:[`Exam passed: ${examSkill} ${examLevel}-level`,...(currentUser.activity||[])]});
      showToast('🎉',`${examSkill} skill verified! Badge added.`);
    }
  };

  // ── Session ────────────────────────────────────────────────────────────
  const startSession = ()=>{
    setSessionLive(true); setSessionSecs(0); setSessionCoins(0);
    const listeners = parseInt(sessionListeners)||3;
    const mult = currentUser?(currentUser.level==='experienced'?2.5:currentUser.level==='mid'?1.5:1):1;
    const rate = 0.5*listeners*mult; setSessionRate(rate);
    sessionRef.current = setInterval(()=>{
      setSessionSecs(s=>s+1);
      setSessionCoins(c=>c+rate/60);
    },1000);
  };

  const endSession = ()=>{
    clearInterval(sessionRef.current); setSessionLive(false);
    const earned = Math.floor(sessionCoins);
    if(currentUser){
      updateUser({coins:(currentUser.coins||0)+earned,earned:(currentUser.earned||0)+earned,sessions:(currentUser.sessions||0)+1,activity:[`Taught ${sessionSkill} (+${earned} coins)`,...(currentUser.activity||[])]});
      const lb=[...leaderboard]; lb[5]={...lb[5],coins:(currentUser.coins||0)+earned,sessions:(currentUser.sessions||0)+1};
      setLeaderboard(lb);
    }
    showToast('🎉',`Session ended! +${earned} coins!`);
    setTimeout(()=>{ setFbSpeaker(sessionSkill+' Teacher'); setFbRating(0); setFbText(''); setFbTags([]); setFbCats({clarity:0,depth:0,engagement:0,recommend:0}); setFeedbackModal(true); },800);
  };

  // ── Redeem ─────────────────────────────────────────────────────────────
  const handleRedeem = ()=>{
    const amt = parseInt(redeemAmt);
    if(!amt||amt<200){ showToast('⚠️','Minimum redemption is 200 coins'); return; }
    if(!currentUser||( currentUser.coins||0)<amt){ showToast('❌','Insufficient coins'); return; }
    updateUser({coins:(currentUser.coins||0)-amt,redeemed:(currentUser.redeemed||0)+amt});
    setRedeemHistory(h=>[{amt,method:redeemMethod,date:new Date().toLocaleDateString('en-IN')},...h]);
    setRedeemAmt('');
    showToast('💸',`₹${amt} redemption initiated via ${redeemMethod}!`);
  };

  // ── Connection requests ────────────────────────────────────────────────
  const openConnectModal = (person)=>{
    if(!currentUser){ setLoginModal(true); return; }
    setReqSpeaker(person); setReqSkill(person.teaches?.[0]||person.skills?.[0]||''); setReqMessage(''); setRequestModal(true);
  };

  const sendConnectionRequest = async ()=>{
    if(!reqSpeaker) return;
    try{
      if(backendOnline&&reqSpeaker.id&&!String(reqSpeaker.id).startsWith('demo-')){
        await apiFetch('/exchanges',{method:'POST',body:JSON.stringify({provider_id:reqSpeaker.id,message:reqMessage})});
        showToast('📧',`Request sent to ${reqSpeaker.name}!`);
      } else {
        const reqId='req-'+Date.now();
        const newReq={id:reqId,skill:reqSkill,speakerName:reqSpeaker.name,speakerId:reqSpeaker.id||'',message:reqMessage,status:'pending',meeting_link:null,created_at:new Date().toISOString()};
        updateUser({requests:[...(currentUser.requests||[]),newReq],activity:[`Sent session request to ${reqSpeaker.name} for ${reqSkill}`,...(currentUser.activity||[])]});
        showToast('📧',`Request sent to ${reqSpeaker.name}! (Demo mode)`);
      }
      setRequestModal(false);
      loadMyRequests(currentUser);
      setDashTab('sessions');
    } catch(e){ showToast('❌',e.message||'Failed to send request.'); }
  };

  const loadMyRequests = async (user=currentUser)=>{
    if(!user) return;
    setLoadingRequests(true);
    try{
      const real=(user.requests||[]).map(r=>({id:r.id,skill:r.skill,status:r.status,speaker_name:r.speakerName,speaker_avatar:r.speakerName?r.speakerName.split(' ').map(w=>w[0]).join(''):'?',speaker_level:'mid',meeting_link:r.meeting_link,created_at:r.created_at}));
      setSentRequests(real.length?real:[{id:'demo-1',skill:'Python',status:'accepted',speaker_name:'Aarav Shah',speaker_avatar:'AS',speaker_level:'experienced',meeting_link:'https://meet.google.com/abc-defg-hij',scheduled_at:new Date(Date.now()+86400000).toISOString(),created_at:new Date(Date.now()-3600000).toISOString()},{id:'demo-2',skill:'React',status:'pending',speaker_name:'Mia Thomas',speaker_avatar:'MT',speaker_level:'mid',meeting_link:null,created_at:new Date(Date.now()-7200000).toISOString()}]);
      setIncomingRequests(user.incomingRequests?.filter(r=>r.status==='pending')||[{id:'demo-i1',skill:'JavaScript',status:'pending',learner_name:'Rahul Singh',learner_avatar:'RS',learner_level:'beginner',learner_email:'rahul@example.com',message:'I want to learn JS basics!',created_at:new Date().toISOString()},{id:'demo-i2',skill:'SQL',status:'pending',learner_name:'Priya Nair',learner_avatar:'PN',learner_level:'mid',learner_email:'priya@example.com',message:'Need help with complex queries.',created_at:new Date(Date.now()-1800000).toISOString()}]);
    } finally{ setLoadingRequests(false); }
  };

  const respondToRequest = (req,action)=>{
    const demoLink=`https://meet.google.com/${Math.random().toString(36).slice(2,6)}-${Math.random().toString(36).slice(2,6)}-${Math.random().toString(36).slice(2,6)}`;
    const updated = incomingRequests.map(r=>r.id===req.id?{...r,status:action==='accept'?'accepted':'declined',meeting_link:action==='accept'?demoLink:null}:r);
    setIncomingRequests(updated);
    updateUser({activity:[action==='accept'?`✅ Accepted session from ${req.learner_name} for ${req.skill}`:`❌ Declined request from ${req.learner_name}`,...(currentUser.activity||[])]});
    showToast(action==='accept'?'✅':'❌',action==='accept'?`Accepted! Demo meeting link generated.`:`Declined request from ${req.learner_name}.`);
  };

  // ── Feedback ───────────────────────────────────────────────────────────
  const submitFeedback = ()=>{
    if(fbRating===0){ showToast('⚠️','Please select a star rating'); return; }
    if(fbSpeaker){
      const name = typeof fbSpeaker==='string'?fbSpeaker:fbSpeaker.name;
      setExplorePeople(ep=>ep.map(p=>p.name===name?{...p,reviews:[{from:currentUser?.name||'Anonymous',rating:fbRating,text:fbText||fbTags.join(', ')||'Great session!',tags:fbTags,date:new Date().toLocaleDateString('en-IN')},...p.reviews],rating:Math.round(([{rating:fbRating},...p.reviews].reduce((a,r)=>a+r.rating,0)/([{rating:fbRating},...p.reviews].length))*10)/10}:p));
    }
    if(currentUser) updateUser({activity:[`Left feedback for ${typeof fbSpeaker==='string'?fbSpeaker:fbSpeaker?.name||'session'} (${fbRating}★)`,...(currentUser.activity||[])]});
    setFeedbackModal(false); setFbSpeaker(null);
    showToast('🙏','Thank you! Your feedback helps the community.');
  };

  // ── Explore filter ─────────────────────────────────────────────────────
  const filteredExplore = explorePeople.filter(p=>{
    const q=exploreSearch.toLowerCase();
    return(!exploreLevel||p.level===exploreLevel)&&(!exploreCat||p.cat===exploreCat)&&
      (!q||p.name.toLowerCase().includes(q)||p.skills.some(s=>s.toLowerCase().includes(q)));
  });

  // ── Page navigation guard ──────────────────────────────────────────────
  const goPage = (page)=>{
    if(page==='leaderboard'||page==='dashboard'){
      if(!currentUser){ setLoginModal(true); return; }
    }
    if(page==='leaderboard'){
      const lb=[...leaderboard]; lb[5]={...lb[5],name:currentUser.name,coins:currentUser.coins||0};
      setLeaderboard(lb);
    }
    setActivePage(page);
  };

  // ── Timer display helper ───────────────────────────────────────────────
  const fmtTime=(s)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const SKILL_CHIPS=['JavaScript','Python','React','SQL','UI/UX Design','Finance','Guitar','Spanish','Excel','Photography'];

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="barter-wrap" style={{paddingTop:currentUser?0:0}}>

      {/* ── TOAST ── */}
      <BarterToast toast={toast}/>

      {/* ══════════════════════════════════════════════════════════════════
          HOME PAGE
      ══════════════════════════════════════════════════════════════════ */}
      {activePage==='home' && (
        <div style={{position:'relative',zIndex:1}}>
          {/* Hero */}
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',textAlign:'center',padding:'100px 24px 60px'}}>
            <div className="b-fade1" style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(108,99,255,.1)',border:'1px solid rgba(108,99,255,.3)',color:'#a09fff',padding:'6px 16px',borderRadius:100,fontSize:13,fontWeight:500,marginBottom:32}}>
              <span className="b-pulse" style={{width:6,height:6,background:'#43e97b',borderRadius:'50%',display:'inline-block'}}/>
              Live Platform — 2,847 skills being traded right now
            </div>
            <h1 className="b-fade2" style={{fontFamily:'Clash Display,sans-serif',fontSize:'clamp(44px,8vw,88px)',fontWeight:700,lineHeight:1.0,letterSpacing:'-2px',marginBottom:24,color:'var(--barter-text)'}}>
              Trade Skills.<br/>
              <span style={{background:'linear-gradient(135deg,#6c63ff,#ff6b6b,#43e97b)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Earn Real Value.</span>
            </h1>
            <p className="b-fade3" style={{fontSize:20,color:'var(--barter-muted)',maxWidth:560,lineHeight:1.6,marginBottom:48}}>
              Share what you know. Learn what you don't. Every session earns you <strong style={{color:'#ffd700'}}>SkillCoins</strong> redeemable as real money — verified, fair, anti-cheat.
            </p>
            <div className="b-fade4" style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
              <button className="b-btn b-btn-primary" style={{fontSize:16,padding:'14px 32px'}} onClick={()=>setRegisterModal(true)}>Start Bartering Free →</button>
              <button className="b-btn b-btn-ghost" style={{fontSize:16,padding:'14px 32px'}} onClick={()=>goPage('how')}>See How It Works</button>
            </div>
            <div className="b-fade5" style={{display:'flex',gap:48,marginTop:80,paddingTop:48,borderTop:'1px solid var(--barter-border)',flexWrap:'wrap',justifyContent:'center'}}>
              {[['14K+','Registered Experts'],['89K','Sessions Completed'],['₹4.2Cr','Points Redeemed'],['340+','Skills Available']].map(([n,l])=>(
                <div key={n} style={{textAlign:'center'}}>
                  <div style={{fontFamily:'Clash Display,sans-serif',fontSize:36,fontWeight:700,color:'var(--barter-accent)'}}>{n}</div>
                  <div style={{fontSize:13,color:'var(--barter-muted)',marginTop:4}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="b-section">
            <p style={{textAlign:'center',fontSize:13,letterSpacing:2,textTransform:'uppercase',color:'var(--barter-accent)',marginBottom:12}}>Platform Features</p>
            <h2 style={{fontFamily:'Clash Display,sans-serif',fontSize:36,fontWeight:700,textAlign:'center',marginBottom:48,color:'var(--barter-text)'}}>Everything you need to<br/>trade knowledge fairly</h2>
            <div className="b-grid3">
              {[['🎯','Skill Verification Exams','LeetCode-style coding challenges + knowledge tests. AI-powered plagiarism detection ensures your verified badge is earned, not copied.'],
                ['🔄','Smart Skill Matching','Tell us what you know and what you want to learn. Our algorithm connects you with the perfect barter partner instantly.'],
                ['💰','SkillCoin Economy','Earn points for every session you teach. Redeem as real money via UPI, bank transfer, or Amazon Pay.'],
                ['🏆','3-Tier Level System','Beginner → Mid → Experienced. Level up by passing harder exams. Higher levels earn more points.'],
                ['🛡️','Anti-Plagiarism Engine','Real-time code similarity detection, browser focus tracking, and randomized questions prevent cheating during exams.'],
                ['⭐','Rating & Reviews','Both teacher and learner rate each session. Build your reputation and unlock premium earning tiers.']
              ].map(([i,t,d])=>(
                <div key={t} className="b-card">
                  <div style={{fontSize:32,marginBottom:16}}>{i}</div>
                  <h3 style={{fontFamily:'Clash Display,sans-serif',fontSize:20,marginBottom:10,color:'var(--barter-text)'}}>{t}</h3>
                  <p style={{color:'var(--barter-muted)',fontSize:14,lineHeight:1.7}}>{d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Levels */}
          <div style={{background:'var(--barter-surface)',borderTop:'1px solid var(--barter-border)',borderBottom:'1px solid var(--barter-border)',padding:'80px 0'}}>
            <div className="b-section" style={{padding:'0 24px'}}>
              <h2 style={{fontFamily:'Clash Display,sans-serif',fontSize:36,fontWeight:700,marginBottom:8,color:'var(--barter-text)'}}>Skill Levels & Earnings</h2>
              <p style={{color:'var(--barter-muted)',fontSize:16,marginBottom:48}}>Prove your expertise — earn more as you level up</p>
              <div className="b-grid3">
                {[{l:'beginner',label:'🌱 Beginner',coins:'5–15',brd:'rgba(67,233,123,.3)',c:'#43e97b',perks:['✓ 1 skill verified','✓ Basic exam passed','✓ Community access','✗ Premium matching']},
                  {l:'mid',label:'⚡ Mid-Level',coins:'20–50',brd:'rgba(108,99,255,.5)',c:'#6c63ff',perks:['✓ 3+ skills verified','✓ Intermediate exam','✓ Priority matching','✓ Group sessions'],pop:true},
                  {l:'experienced',label:'🔥 Experienced',coins:'60–150',brd:'rgba(255,107,107,.3)',c:'#ff6b6b',perks:['✓ Expert exam verified','✓ Top of matching queue','✓ Mentor badge','✓ Bonus multipliers']}
                ].map(lv=>(
                  <div key={lv.l} style={{background:'var(--barter-surface)',border:`1px solid ${lv.brd}`,borderRadius:16,padding:36,textAlign:'center',position:'relative',transform:lv.pop?'scale(1.05)':'none',boxShadow:lv.pop?'0 20px 60px rgba(108,99,255,.2)':'none'}}>
                    {lv.pop&&<div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',background:'var(--barter-accent)',color:'white',fontSize:11,fontWeight:700,padding:'4px 16px',borderRadius:100,letterSpacing:1}}>POPULAR</div>}
                    <LevelBadge level={lv.l}/>
                    <div style={{fontFamily:'Clash Display,sans-serif',fontSize:40,fontWeight:700,color:lv.c,margin:'16px 0'}}>{lv.coins}</div>
                    <div style={{color:'var(--barter-muted)',fontSize:14}}>coins per 30-min session</div>
                    <div style={{marginTop:20,color:'var(--barter-muted)',fontSize:13,lineHeight:1.9}}>{lv.perks.map((p,i)=><div key={i}>{p}</div>)}</div>
                  </div>
                ))}
              </div>
              <p style={{textAlign:'center',marginTop:32,color:'var(--barter-muted)',fontSize:14}}>💡 100 SkillCoins = ₹100 redeemable via UPI/Bank Transfer</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════════ */}
      {activePage==='how' && (
        <div className="b-section" style={{position:'relative',zIndex:1,paddingTop:48}}>
          <h1 style={{fontFamily:'Clash Display,sans-serif',fontSize:48,fontWeight:700,marginBottom:8,color:'var(--barter-text)'}}>How SkillBarter Works</h1>
          <p style={{color:'var(--barter-muted)',fontSize:18,marginBottom:48}}>From registration to real earnings in 4 simple steps</p>
          {[['01','Register & Declare Your Skills','Sign up and tell us what skills you have (teaching) and what you want to learn. Choose from 340+ categories including programming, design, marketing, languages, music, finance, and more.'],
            ['02','Take the Skill Verification Exam','Each skill requires passing a timed test — LeetCode-style coding for tech skills, MCQ + practical for others. Our AI anti-plagiarism engine monitors browser focus, typing patterns, and code similarity in real time.'],
            ['03','Get Matched & Start Sessions','Our smart algorithm matches you with someone who has what you want to learn and wants what you know. Schedule a live 1-on-1 or group session. You teach your skill, they teach theirs — true barter!'],
            ['04','Earn SkillCoins → Redeem as Money','Every session you teach earns you SkillCoins based on your level. Accumulate coins and redeem them as real money — minimum ₹200 withdrawal via UPI, bank transfer, or Amazon Pay gift cards.']
          ].map(([n,t,d])=>(
            <div key={n} style={{display:'flex',gap:24,alignItems:'flex-start',padding:'24px 0',borderBottom:'1px solid var(--barter-border)'}}>
              <div style={{fontFamily:'Clash Display,sans-serif',fontSize:48,fontWeight:700,color:'var(--barter-border)',lineHeight:1,minWidth:60}}>{n}</div>
              <div>
                <h3 style={{fontFamily:'Clash Display,sans-serif',fontSize:22,marginBottom:8,color:'var(--barter-text)'}}>{t}</h3>
                <p style={{color:'var(--barter-muted)',fontSize:15,lineHeight:1.6}}>{d}</p>
              </div>
            </div>
          ))}
          <div style={{marginTop:48,textAlign:'center'}}>
            <button className="b-btn b-btn-primary" style={{fontSize:16,padding:'14px 36px'}} onClick={()=>setRegisterModal(true)}>Join Now — It's Free</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          EXPLORE SKILLS
      ══════════════════════════════════════════════════════════════════ */}
      {activePage==='explore' && (
        <div className="b-section" style={{position:'relative',zIndex:1,paddingTop:48}}>
          <h1 style={{fontFamily:'Clash Display,sans-serif',fontSize:40,fontWeight:700,marginBottom:8,color:'var(--barter-text)'}}>Explore Skills</h1>
          <p style={{color:'var(--barter-muted)',fontSize:16,marginBottom:32}}>Find experts to learn from or people who need your knowledge</p>

          {/* Filters */}
          <div style={{display:'flex',gap:12,marginBottom:32,flexWrap:'wrap'}}>
            <input className="b-input" style={{maxWidth:320,flex:1}} placeholder="Search skills, topics, people..." value={exploreSearch} onChange={e=>setExploreSearch(e.target.value)}/>
            <select className="b-input" style={{width:'auto'}} value={exploreLevel} onChange={e=>setExploreLevel(e.target.value)}>
              <option value="">All Levels</option>
              <option value="experienced">🔥 Experienced</option>
              <option value="mid">⚡ Mid-Level</option>
              <option value="beginner">🌱 Beginner</option>
            </select>
            <select className="b-input" style={{width:'auto'}} value={exploreCat} onChange={e=>setExploreCat(e.target.value)}>
              <option value="">All Categories</option>
              <option value="tech">💻 Tech</option>
              <option value="design">🎨 Design</option>
              <option value="language">🌐 Language</option>
              <option value="finance">📈 Finance</option>
              <option value="music">🎵 Music</option>
            </select>
          </div>

          {/* Cards */}
          <div className="b-grid3">
            {filteredExplore.length===0?(
              <div style={{gridColumn:'span 3',textAlign:'center',padding:'60px 0',color:'var(--barter-muted)'}}>
                <div style={{fontSize:48,marginBottom:16}}>🔍</div>
                <p>No results found. Try different filters.</p>
              </div>
            ):filteredExplore.map((p,idx)=>(
              <ExploreCard key={p.name} person={p} onProfile={()=>setProfileModal(p)} onAnalytics={()=>setAnalyticsModal(p)} onConnect={()=>openConnectModal(p)} />
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          LEADERBOARD
      ══════════════════════════════════════════════════════════════════ */}
      {activePage==='leaderboard' && (
        <div className="b-section" style={{position:'relative',zIndex:1,paddingTop:48}}>
          <h1 style={{fontFamily:'Clash Display,sans-serif',fontSize:40,fontWeight:700,marginBottom:8,color:'var(--barter-text)'}}>🏆 Leaderboard</h1>
          <p style={{color:'var(--barter-muted)',fontSize:16,marginBottom:32}}>Top earners this month — compete for bonus multipliers</p>
          <div className="b-card" style={{padding:8}}>
            {leaderboard.map((u,i)=>(
              <div key={i} className="b-lb-row" style={u.isUser?{background:'rgba(108,99,255,.08)',border:'1px solid rgba(108,99,255,.2)',borderRadius:12}:{}}>
                <div style={{fontFamily:'Clash Display,sans-serif',fontSize:20,fontWeight:700,width:32,textAlign:'center',color:i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'var(--barter-muted)'}}>
                  {i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}
                </div>
                <Avatar text={u.name[0]} size={40} fontSize={16}/>
                <div>
                  <div style={{fontWeight:600,fontSize:15,color:'var(--barter-text)'}}>{u.name}{u.isUser?' (You)':''}</div>
                  <LevelBadge level={u.level}/>
                </div>
                <div style={{marginLeft:'auto',textAlign:'right'}}>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:14,color:'#ffd700',fontWeight:600}}>🪙 {u.coins.toLocaleString()}</div>
                  <div style={{fontSize:11,color:'var(--barter-muted)'}}>{u.sessions} sessions</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          DASHBOARD (logged in)
      ══════════════════════════════════════════════════════════════════ */}
      {activePage==='dashboard' && currentUser && (
        <div style={{position:'relative',zIndex:1}}>
          {/* Dashboard header */}
          <div style={{background:'var(--barter-surface)',borderBottom:'1px solid var(--barter-border)',padding:'28px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <Avatar text={(currentUser.avatar||currentUser.name[0]).toUpperCase()} size={56} fontSize={22}/>
              <div>
                <div style={{fontFamily:'Clash Display,sans-serif',fontSize:22,fontWeight:700,color:'var(--barter-text)'}}>{currentUser.name}</div>
                <LevelBadge level={currentUser.level||'beginner'}/>
              </div>
            </div>
            <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,215,0,.1)',border:'1px solid rgba(255,215,0,.3)',padding:'10px 20px',borderRadius:12}}>
                <span style={{fontSize:20}}>🪙</span>
                <div>
                  <div style={{fontFamily:'Clash Display,sans-serif',fontSize:24,fontWeight:700,color:'#ffd700'}}>{currentUser.coins||0}</div>
                  <div style={{fontSize:12,color:'var(--barter-muted)'}}>SkillCoins</div>
                </div>
              </div>
              <button className="b-btn b-btn-ghost" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:4,padding:'0 48px',background:'var(--barter-surface)',borderBottom:'1px solid var(--barter-border)',overflowX:'auto'}}>
            {[['overview','Overview'],['exam','Take Exam'],['match','Find Match'],['session','Live Session'],['redeem','Redeem Coins'],['sessions','📬 My Sessions']].map(([id,label])=>(
              <div key={id} className={`b-dash-tab${dashTab===id?' active':''}`} onClick={()=>{ setDashTab(id); if(id==='sessions') loadMyRequests(); }}>
                {label}
              </div>
            ))}
          </div>

          {/* Tab content */}
          <div style={{maxWidth:1200,margin:'0 auto',padding:'40px 24px'}}>

            {/* ── OVERVIEW ── */}
            {dashTab==='overview' && (
              <div>
                <div className="b-grid3" style={{marginBottom:32}}>
                  {[['Sessions Taught',currentUser.sessions||0,'var(--barter-accent)'],['Total Coins Earned',currentUser.earned||0,'var(--barter-accent3)'],['Total Redeemed','₹'+(currentUser.redeemed||0),'#ffd700']].map(([l,v,c])=>(
                    <div key={l} className="b-card" style={{textAlign:'center'}}>
                      <div style={{fontFamily:'Clash Display,sans-serif',fontSize:36,fontWeight:700,color:c}}>{v}</div>
                      <div style={{color:'var(--barter-muted)',fontSize:14,marginTop:4}}>{l}</div>
                    </div>
                  ))}
                </div>
                <h3 style={{fontFamily:'Clash Display,sans-serif',fontSize:22,marginBottom:20,color:'var(--barter-text)'}}>Your Verified Skills</h3>
                <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:32}}>
                  {(currentUser.verifiedSkills||[]).length===0
                    ?<span style={{color:'var(--barter-muted)',fontSize:14}}>No verified skills yet. Take an exam!</span>
                    :(currentUser.verifiedSkills||[]).map(s=><SkillChip key={s} selected>{s} ✓</SkillChip>)
                  }
                </div>
                <h3 style={{fontFamily:'Clash Display,sans-serif',fontSize:22,marginBottom:20,color:'var(--barter-text)'}}>Recent Activity</h3>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {(currentUser.activity||[]).length===0
                    ?<div style={{color:'var(--barter-muted)',fontSize:14}}>No activity yet</div>
                    :(currentUser.activity||[]).slice(0,10).map((a,i)=>(
                      <div key={i} style={{padding:'12px 16px',background:'var(--barter-surface2)',borderRadius:10,fontSize:14,color:'var(--barter-muted)'}}>📌 {a}</div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* ── EXAM ── */}
            {dashTab==='exam' && (
              <div>
                <h2 style={{fontFamily:'Clash Display,sans-serif',fontSize:28,marginBottom:8,color:'var(--barter-text)'}}>Skill Verification Exam</h2>
                <p style={{color:'var(--barter-muted)',marginBottom:32}}>Pass the exam to get your skill verified. Anti-plagiarism monitoring is active throughout.</p>

                {!examActive && !examDone && (
                  <div style={{display:'flex',gap:16,marginBottom:24,alignItems:'flex-end',flexWrap:'wrap'}}>
                    <div style={{flex:1,minWidth:200}}>
                      <label className="b-label">Select Skill to Verify</label>
                      <select className="b-input" value={examSkill} onChange={e=>setExamSkill(e.target.value)}>
                        <option value="js">JavaScript</option>
                        <option value="py">Python</option>
                        <option value="react">React</option>
                        <option value="sql">SQL</option>
                        <option value="design">UI/UX Design</option>
                        <option value="finance">Finance & Investing</option>
                      </select>
                    </div>
                    <div style={{flex:1,minWidth:200}}>
                      <label className="b-label">Exam Level</label>
                      <select className="b-input" value={examLevel} onChange={e=>setExamLevel(e.target.value)}>
                        <option value="beginner">🌱 Beginner</option>
                        <option value="mid">⚡ Mid-Level</option>
                        <option value="experienced">🔥 Experienced</option>
                      </select>
                    </div>
                    <button className="b-btn b-btn-primary" onClick={startExam}>Start Exam</button>
                  </div>
                )}

                {examActive && (
                  <div>
                    <div style={{background:'var(--barter-surface)',border:'1px solid var(--barter-border)',borderRadius:20,overflow:'hidden'}}>
                      <div style={{background:'var(--barter-surface2)',padding:'20px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid var(--barter-border)'}}>
                        <div>
                          <div style={{fontSize:13,color:'var(--barter-muted)',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>Question {examQ+1} of 3</div>
                          <div style={{fontSize:17,fontWeight:600,color:'var(--barter-text)',maxWidth:600}}>{(QUESTIONS[examSkill]||QUESTIONS.js)[examQ]}</div>
                        </div>
                        <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:24,color:examSecs<=120?'var(--barter-accent2)':'var(--barter-accent3)',fontWeight:600,flexShrink:0,marginLeft:16}} className={examSecs<=120?'b-blink':''}>
                          {fmtTime(examSecs)}
                        </div>
                      </div>
                      <textarea className="b-code-editor" value={examAnswer} onChange={e=>setExamAnswer(e.target.value)} onPaste={e=>{e.preventDefault();showToast('🚫','Paste disabled during exam');}} placeholder="// Write your solution here..." spellCheck={false}/>
                      <div style={{padding:'16px 28px',display:'flex',gap:12,alignItems:'center',borderTop:'1px solid var(--barter-border)'}}>
                        <button className="b-btn b-btn-primary" onClick={submitAnswer}>Submit Answer</button>
                        <button className="b-btn b-btn-ghost" onClick={skipQuestion}>Skip</button>
                        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8,fontSize:12,color:'var(--barter-accent3)',background:'rgba(67,233,123,.08)',border:'1px solid rgba(67,233,123,.2)',padding:'6px 14px',borderRadius:100}}>
                          🛡️ Anti-plagiarism active
                        </div>
                      </div>
                    </div>
                    <div style={{marginTop:16,background:'rgba(255,107,107,.05)',border:'1px solid rgba(255,107,107,.15)',borderRadius:12,padding:16,fontSize:13,color:'var(--barter-muted)'}}>
                      ⚠️ Warnings: Copy-paste disabled · Tab switch detection active · Typing pattern analyzed · Questions randomized per user
                    </div>
                  </div>
                )}

                {examDone && examResult && (
                  <div style={{textAlign:'center',padding:'48px 24px'}}>
                    <div style={{fontSize:64,marginBottom:16}}>{examResult.emoji}</div>
                    <h2 style={{fontFamily:'Clash Display,sans-serif',fontSize:32,fontWeight:700,marginBottom:8,color:'var(--barter-text)'}}>{examResult.title}</h2>
                    <p style={{color:'var(--barter-muted)',marginBottom:28}}>{examResult.msg}</p>
                    <button className="b-btn b-btn-primary" onClick={()=>{setExamDone(false);setExamResult(null);}}>Try Another Exam</button>
                  </div>
                )}
              </div>
            )}

            {/* ── FIND MATCH ── */}
            {dashTab==='match' && (
              <div>
                <h2 style={{fontFamily:'Clash Display,sans-serif',fontSize:28,marginBottom:8,color:'var(--barter-text)'}}>Find Your Skill Match</h2>
                <p style={{color:'var(--barter-muted)',marginBottom:32}}>Experts ready to barter their skills with you</p>
                <div style={{display:'flex',flexDirection:'column',gap:16}}>
                  {MATCH_PROFILES.map((p,i)=>(
                    <MatchCard key={p.name} person={p} onAnalytics={()=>setAnalyticsModal(p)} onConnect={()=>openConnectModal(p)}/>
                  ))}
                </div>
              </div>
            )}

            {/* ── LIVE SESSION ── */}
            {dashTab==='session' && (
              <div>
                <h2 style={{fontFamily:'Clash Display,sans-serif',fontSize:28,marginBottom:8,color:'var(--barter-text)'}}>Live Session</h2>
                <p style={{color:'var(--barter-muted)',marginBottom:32}}>Simulate teaching a skill and watch your coins accumulate in real time</p>
                {!sessionLive?(
                  <div>
                    <div className="b-grid2" style={{marginBottom:24}}>
                      <div>
                        <label className="b-label">Teaching Skill</label>
                        <select className="b-input" value={sessionSkill} onChange={e=>setSessionSkill(e.target.value)}>
                          <option>JavaScript</option><option>Python</option><option>React</option><option>SQL</option>
                        </select>
                      </div>
                      <div>
                        <label className="b-label">Number of Listeners</label>
                        <select className="b-input" value={sessionListeners} onChange={e=>setSessionListeners(e.target.value)}>
                          <option value="1">1 listener</option><option value="2">2 listeners</option>
                          <option value="3">3 listeners</option><option value="5">5 listeners</option><option value="10">10 listeners</option>
                        </select>
                      </div>
                    </div>
                    <button className="b-btn b-btn-primary" onClick={startSession}>Start Session</button>
                  </div>
                ):(
                  <div>
                    <div style={{background:'var(--barter-surface)',border:'1px solid var(--barter-border)',borderRadius:20,padding:32,marginBottom:24}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--barter-accent2)',fontWeight:600,marginBottom:20}}>
                        <span className="b-live-dot"/>&nbsp;SESSION LIVE
                      </div>
                      <div style={{background:'var(--barter-surface2)',borderRadius:12,padding:'20px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div>
                          <div style={{fontSize:13,color:'var(--barter-muted)',marginBottom:4}}>Coins Earned This Session</div>
                          <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:32,color:'var(--barter-accent3)',fontWeight:600}}>{sessionCoins.toFixed(2)}</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:13,color:'var(--barter-muted)',marginBottom:4}}>Session Duration</div>
                          <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:24,color:'var(--barter-accent)'}}>{fmtTime(sessionSecs)}</div>
                        </div>
                      </div>
                      <div style={{marginTop:20}}>
                        <div style={{fontSize:13,color:'var(--barter-muted)',marginBottom:8}}>Earning rate: <span style={{color:'var(--barter-accent3)'}}>{sessionRate.toFixed(2)} coins/min</span></div>
                        <div className="b-progress"><div className="b-progress-fill" style={{width:Math.min((sessionSecs/1800)*100,100)+'%'}}/></div>
                        <div style={{fontSize:12,color:'var(--barter-muted)',marginTop:6}}>Session length: 30 min recommended</div>
                      </div>
                    </div>
                    <button className="b-btn b-btn-danger" onClick={endSession}>End Session</button>
                  </div>
                )}
              </div>
            )}

            {/* ── REDEEM ── */}
            {dashTab==='redeem' && (
              <div>
                <h2 style={{fontFamily:'Clash Display,sans-serif',fontSize:28,marginBottom:8,color:'var(--barter-text)'}}>Redeem SkillCoins</h2>
                <p style={{color:'var(--barter-muted)',marginBottom:32}}>Convert your coins to real money — minimum 200 coins</p>
                <div className="b-grid2">
                  <div style={{background:'linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,170,0,.05))',border:'1px solid rgba(255,215,0,.2)',borderRadius:16,padding:32,textAlign:'center'}}>
                    <div style={{color:'var(--barter-muted)',fontSize:14}}>Your current balance</div>
                    <div style={{fontFamily:'Clash Display,sans-serif',fontSize:56,fontWeight:700,color:'#ffd700',margin:'16px 0'}}>{currentUser.coins||0}</div>
                    <div style={{color:'var(--barter-muted)',fontSize:13,marginBottom:24}}>= ₹{currentUser.coins||0}</div>
                    <div style={{marginBottom:16,textAlign:'left'}}>
                      <label className="b-label">Redeem Amount (coins)</label>
                      <input className="b-input" type="number" value={redeemAmt} onChange={e=>setRedeemAmt(e.target.value)} placeholder="Enter coins to redeem" min="200"/>
                    </div>
                    <div style={{marginBottom:24,textAlign:'left'}}>
                      <label className="b-label">Payment Method</label>
                      <select className="b-input" value={redeemMethod} onChange={e=>setRedeemMethod(e.target.value)}>
                        <option>UPI Transfer</option><option>Bank Transfer (NEFT)</option>
                        <option>Amazon Pay Gift Card</option><option>Paytm Wallet</option>
                      </select>
                    </div>
                    <button className="b-btn b-btn-gold" style={{width:'100%'}} onClick={handleRedeem}>Redeem Now →</button>
                  </div>
                  <div>
                    <h3 style={{fontFamily:'Clash Display,sans-serif',fontSize:20,marginBottom:20,color:'var(--barter-text)'}}>Redemption History</h3>
                    <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:24}}>
                      {redeemHistory.length===0
                        ?<div style={{color:'var(--barter-muted)',fontSize:14}}>No redemptions yet. Start teaching to earn coins!</div>
                        :redeemHistory.map((h,i)=>(
                          <div key={i} style={{padding:'12px 16px',background:'rgba(67,233,123,.05)',border:'1px solid rgba(67,233,123,.15)',borderRadius:10,fontSize:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <span style={{color:'var(--barter-muted)'}}>₹{h.amt} via {h.method} · {h.date}</span>
                            <span style={{color:'var(--barter-accent3)',fontWeight:600}}>✓ Initiated</span>
                          </div>
                        ))
                      }
                    </div>
                    <div style={{background:'var(--barter-surface2)',borderRadius:12,padding:16,fontSize:13,color:'var(--barter-muted)',lineHeight:1.9}}>
                      📌 <strong style={{color:'var(--barter-text)'}}>Conversion Rate:</strong> 100 coins = ₹100<br/>
                      📌 <strong style={{color:'var(--barter-text)'}}>Min Withdrawal:</strong> 200 coins (₹200)<br/>
                      📌 <strong style={{color:'var(--barter-text)'}}>Processing Time:</strong> UPI instant · Bank 2-3 days<br/>
                      📌 <strong style={{color:'var(--barter-text)'}}>No fees</strong> on withdrawals above ₹500
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── MY SESSIONS ── */}
            {dashTab==='sessions' && (
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
                  <div>
                    <h2 style={{fontFamily:'Clash Display,sans-serif',fontSize:28,marginBottom:4,color:'var(--barter-text)'}}>📬 My Sessions</h2>
                    <p style={{color:'var(--barter-muted)',fontSize:14}}>Requests you sent, incoming requests, and confirmed meeting links</p>
                  </div>
                  <button className="b-btn b-btn-ghost" style={{fontSize:13}} onClick={()=>loadMyRequests()}>🔄 Refresh</button>
                </div>

                {/* Sub-tabs */}
                <div style={{display:'flex',gap:4,marginBottom:24,background:'var(--barter-surface2)',borderRadius:12,padding:4,width:'fit-content'}}>
                  {[['sent','Sent Requests'],['incoming','Incoming Requests'],['confirmed','✅ Confirmed']].map(([id,label])=>(
                    <button key={id} onClick={()=>setSessionsTab(id)} style={{padding:'8px 18px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:sessionsTab===id?'var(--barter-accent)':'transparent',color:sessionsTab===id?'white':'var(--barter-muted)',transition:'all .2s'}}>
                      {label}
                    </button>
                  ))}
                </div>

                {loadingRequests&&<div style={{color:'var(--barter-muted)',padding:32,textAlign:'center'}}>Loading…</div>}

                {/* Sent requests */}
                {!loadingRequests && sessionsTab==='sent' && (
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {sentRequests.filter(r=>r.status!=='accepted').length===0
                      ?<div style={{color:'var(--barter-muted)',fontSize:14,padding:32,textAlign:'center'}}>No pending requests sent yet.<br/><button className="b-btn b-btn-primary" style={{marginTop:12}} onClick={()=>setDashTab('match')}>Find a Match →</button></div>
                      :sentRequests.filter(r=>r.status!=='accepted').map(r=>(
                        <div key={r.id} style={{background:'var(--barter-surface)',border:`1px solid ${r.status==='declined'?'rgba(255,107,107,.3)':'var(--barter-border)'}`,borderRadius:14,padding:18,display:'flex',alignItems:'center',gap:16}}>
                          <Avatar text={r.speaker_avatar||r.speaker_name[0]} size={44} fontSize={16}/>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600,fontSize:15,color:'var(--barter-text)'}}>{r.speaker_name}</div>
                            <div style={{fontSize:13,color:'var(--barter-muted)',marginTop:2}}>Skill: <strong style={{color:'var(--barter-text)'}}>{r.skill}</strong></div>
                            <div style={{fontSize:12,color:'var(--barter-muted)',marginTop:2}}>{new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                          </div>
                          <div>
                            {r.status==='pending'&&<span style={{background:'rgba(255,215,0,.1)',border:'1px solid rgba(255,215,0,.3)',color:'#ffd700',padding:'5px 12px',borderRadius:100,fontSize:12,fontWeight:600}}>⏳ Pending</span>}
                            {r.status==='declined'&&<span style={{background:'rgba(255,107,107,.1)',border:'1px solid rgba(255,107,107,.3)',color:'var(--barter-accent2)',padding:'5px 12px',borderRadius:100,fontSize:12,fontWeight:600}}>❌ Declined</span>}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}

                {/* Incoming requests */}
                {!loadingRequests && sessionsTab==='incoming' && (
                  <div>
                    <div style={{background:'rgba(108,99,255,.06)',border:'1px solid rgba(108,99,255,.2)',borderRadius:12,padding:'14px 18px',marginBottom:16,fontSize:13,color:'var(--barter-muted)'}}>
                      👇 These are learners who want to learn from you. Accept to generate a meeting link.
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:12}}>
                      {incomingRequests.filter(r=>r.status==='pending').length===0
                        ?<div style={{color:'var(--barter-muted)',fontSize:14,padding:32,textAlign:'center'}}>No incoming requests yet.</div>
                        :incomingRequests.filter(r=>r.status==='pending').map(r=>(
                          <div key={r.id} style={{background:'var(--barter-surface)',border:'1px solid var(--barter-border)',borderRadius:14,padding:18}}>
                            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:12}}>
                              <Avatar text={r.learner_avatar||r.learner_name[0]} size={44} fontSize={16}/>
                              <div style={{flex:1}}>
                                <div style={{fontWeight:600,fontSize:15,color:'var(--barter-text)'}}>{r.learner_name}</div>
                                <div style={{fontSize:12,color:'var(--barter-muted)'}}>Wants to learn: <strong style={{color:'var(--barter-accent)'}}>{r.skill}</strong></div>
                                {r.learner_email&&<div style={{fontSize:11,color:'var(--barter-muted)'}}>📧 {r.learner_email}</div>}
                              </div>
                              <span style={{background:'rgba(255,215,0,.1)',border:'1px solid rgba(255,215,0,.3)',color:'#ffd700',padding:'4px 10px',borderRadius:100,fontSize:11,fontWeight:600,flexShrink:0}}>⏳ Pending</span>
                            </div>
                            {r.message&&<div style={{background:'var(--barter-surface2)',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13,color:'var(--barter-muted)',borderLeft:'3px solid var(--barter-accent)'}}>"{r.message}"</div>}
                            <div style={{display:'flex',gap:10}}>
                              <button className="b-btn b-btn-success" style={{flex:1,padding:10}} onClick={()=>respondToRequest(r,'accept')}>✅ Accept & Generate Meet Link</button>
                              <button className="b-btn b-btn-danger" style={{padding:'10px 16px'}} onClick={()=>respondToRequest(r,'decline')}>❌ Decline</button>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                {/* Confirmed */}
                {!loadingRequests && sessionsTab==='confirmed' && (
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {sentRequests.filter(r=>r.status==='accepted').length===0
                      ?<div style={{color:'var(--barter-muted)',fontSize:14,padding:32,textAlign:'center'}}>No confirmed sessions yet. Send a request to get started!</div>
                      :sentRequests.filter(r=>r.status==='accepted').map(r=>(
                        <div key={r.id} style={{background:'var(--barter-surface)',border:'2px solid rgba(67,233,123,.4)',borderRadius:14,padding:20}}>
                          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
                            <Avatar text={r.speaker_avatar||r.speaker_name[0]} size={44} fontSize={16}/>
                            <div style={{flex:1}}>
                              <div style={{fontWeight:600,fontSize:15,color:'var(--barter-text)'}}>{r.speaker_name}</div>
                              <div style={{fontSize:13,color:'var(--barter-muted)'}}>Teaching: <strong style={{color:'var(--barter-accent3)'}}>{r.skill}</strong></div>
                            </div>
                            <span style={{background:'rgba(67,233,123,.15)',border:'1px solid rgba(67,233,123,.4)',color:'var(--barter-accent3)',padding:'5px 12px',borderRadius:100,fontSize:12,fontWeight:600}}>✅ Confirmed</span>
                          </div>
                          {r.scheduled_at&&<div style={{fontSize:13,color:'var(--barter-muted)',marginBottom:12}}>📅 Scheduled: <strong style={{color:'#ffd700'}}>{new Date(r.scheduled_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'})}</strong></div>}
                          {r.meeting_link&&(
                            <div style={{background:'rgba(67,233,123,.05)',border:'1px solid rgba(67,233,123,.2)',borderRadius:10,padding:14,display:'flex',alignItems:'center',gap:12}}>
                              <span style={{fontSize:20}}>🎥</span>
                              <a href={r.meeting_link} target="_blank" rel="noopener noreferrer" style={{color:'var(--barter-accent3)',fontSize:14,fontWeight:600,flex:1,wordBreak:'break-all'}}>{r.meeting_link}</a>
                              <a href={r.meeting_link} target="_blank" rel="noopener noreferrer" className="b-btn b-btn-success" style={{flexShrink:0,textDecoration:'none',padding:'7px 14px',fontSize:13}}>Join →</a>
                            </div>
                          )}
                          <div style={{marginTop:10,display:'flex',gap:8,justifyContent:'flex-end'}}>
                            <button className="b-btn b-btn-ghost" style={{fontSize:12,padding:'6px 14px'}} onClick={()=>{setFbSpeaker(r.speaker_name);setFbRating(0);setFbText('');setFbTags([]);setFbCats({clarity:0,depth:0,engagement:0,recommend:0});setFeedbackModal(true);}}>⭐ Rate Session</button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM NAV — shown on all pages (except dashboard which has its own header)
      ══════════════════════════════════════════════════════════════════ */}
      {activePage!=='dashboard' && (
        <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:90,background:'rgba(10,10,15,0.95)',backdropFilter:'blur(20px)',borderTop:'1px solid var(--barter-border)',display:'flex',justifyContent:'center',gap:4,padding:'8px 24px'}}>
          {[['home','🏠 Home'],['explore','🔍 Explore'],['how','📖 How It Works'],['leaderboard','🏆 Leaderboard'],['dashboard','⚡ Dashboard']].map(([id,label])=>(
            <button key={id} onClick={()=>goPage(id)} style={{padding:'8px 18px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:activePage===id?'var(--barter-accent)':'transparent',color:activePage===id?'white':'var(--barter-muted)',transition:'all .15s'}}>
              {label}
            </button>
          ))}
          {!currentUser&&(
            <>
              <button className="b-btn b-btn-ghost" style={{padding:'8px 18px',fontSize:13}} onClick={()=>setLoginModal(true)}>Sign In</button>
              <button className="b-btn b-btn-primary" style={{padding:'8px 18px',fontSize:13}} onClick={()=>setRegisterModal(true)}>Get Started</button>
            </>
          )}
        </div>
      )}

      {/* Bottom padding for fixed bottom nav */}
      {activePage!=='dashboard' && <div style={{height:64}}/>}

      {/* ══════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════ */}

      {/* Register */}
      <BarterModal open={registerModal} onClose={()=>setRegisterModal(false)}>
        <h2 style={{fontFamily:'Clash Display,sans-serif',fontSize:28,marginBottom:8,color:'var(--barter-text)'}}>Create Account</h2>
        <p style={{color:'var(--barter-muted)',fontSize:14,marginBottom:32}}>Join thousands trading skills & earning real money</p>
        <div style={{marginBottom:20}}>
          <label className="b-label">Full Name</label>
          <input className="b-input" placeholder="Your full name" value={regName} onChange={e=>setRegName(e.target.value)}/>
        </div>
        <div style={{marginBottom:20}}>
          <label className="b-label">Email</label>
          <input className="b-input" type="email" placeholder="you@example.com" value={regEmail} onChange={e=>setRegEmail(e.target.value)}/>
        </div>
        <div style={{marginBottom:20}}>
          <label className="b-label">Password (min 8 chars)</label>
          <input className="b-input" type="password" placeholder="••••••••" value={regPass} onChange={e=>setRegPass(e.target.value)}/>
        </div>
        <div style={{marginBottom:20}}>
          <label className="b-label">Skills I Can Teach (select multiple)</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
            {SKILL_CHIPS.map(s=><SkillChip key={s} selected={regTeach.includes(s)} onClick={()=>setRegTeach(t=>t.includes(s)?t.filter(x=>x!==s):[...t,s])}>{s}</SkillChip>)}
          </div>
        </div>
        <div style={{marginBottom:24}}>
          <label className="b-label">Skills I Want to Learn (select multiple)</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
            {SKILL_CHIPS.map(s=><SkillChip key={s} selected={regLearn.includes(s)} onClick={()=>setRegLearn(t=>t.includes(s)?t.filter(x=>x!==s):[...t,s])}>{s}</SkillChip>)}
          </div>
        </div>
        <div style={{display:'flex',gap:12}}>
          <button className="b-btn b-btn-primary" style={{flex:1}} onClick={handleRegister}>Create Account →</button>
          <button className="b-btn b-btn-ghost" onClick={()=>setRegisterModal(false)}>Cancel</button>
        </div>
        <p style={{textAlign:'center',marginTop:16,color:'var(--barter-muted)',fontSize:13}}>
          Already have an account? <span onClick={()=>{setRegisterModal(false);setLoginModal(true);}} style={{color:'var(--barter-accent)',cursor:'pointer'}}>Sign in</span>
        </p>
      </BarterModal>

      {/* Login */}
      <BarterModal open={loginModal} onClose={()=>setLoginModal(false)}>
        <h2 style={{fontFamily:'Clash Display,sans-serif',fontSize:28,marginBottom:8,color:'var(--barter-text)'}}>Welcome Back</h2>
        <p style={{color:'var(--barter-muted)',fontSize:14,marginBottom:32}}>Sign in to your SkillBarter account</p>
        <div style={{marginBottom:20}}>
          <label className="b-label">Email</label>
          <input className="b-input" type="email" placeholder="you@example.com" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}/>
        </div>
        <div style={{marginBottom:24}}>
          <label className="b-label">Password</label>
          <input className="b-input" type="password" placeholder="Your password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
        </div>
        <div style={{display:'flex',gap:12}}>
          <button className="b-btn b-btn-primary" style={{flex:1}} onClick={handleLogin}>Sign In →</button>
          <button className="b-btn b-btn-ghost" onClick={()=>setLoginModal(false)}>Cancel</button>
        </div>
        <p style={{textAlign:'center',marginTop:16,color:'var(--barter-muted)',fontSize:13}}>
          Demo: use any email/password · <span onClick={()=>{setLoginModal(false);setRegisterModal(true);}} style={{color:'var(--barter-accent)',cursor:'pointer'}}>Create account</span>
        </p>
      </BarterModal>

      {/* Connection Request */}
      <BarterModal open={requestModal} onClose={()=>setRequestModal(false)}>
        <h2 style={{fontFamily:'Clash Display,sans-serif',fontSize:26,marginBottom:8,color:'var(--barter-text)'}}>Request a Session</h2>
        <p style={{color:'var(--barter-muted)',fontSize:14,marginBottom:28}}>Send a connection request to <strong style={{color:'var(--barter-text)'}}>{reqSpeaker?.name}</strong></p>
        <div style={{marginBottom:20}}>
          <label className="b-label">Skill you want to learn</label>
          <select className="b-input" value={reqSkill} onChange={e=>setReqSkill(e.target.value)}>
            {(reqSpeaker?.teaches||reqSpeaker?.skills||['Python','React']).map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{marginBottom:20}}>
          <label className="b-label">Message to speaker (optional)</label>
          <textarea className="b-input" rows={3} placeholder="Hi! I'd love to learn from you…" style={{resize:'none'}} value={reqMessage} onChange={e=>setReqMessage(e.target.value)}/>
        </div>
        <div style={{background:'var(--barter-surface2)',borderRadius:10,padding:14,marginBottom:20,fontSize:13,color:'var(--barter-muted)',lineHeight:1.7}}>
          📧 The speaker will receive a notification with your request.<br/>
          ✅ Once they accept, a <strong style={{color:'var(--barter-accent3)'}}>Google Meet link</strong> will appear on your dashboard.
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="b-btn b-btn-primary" style={{flex:1}} onClick={sendConnectionRequest}>Send Request →</button>
          <button className="b-btn b-btn-ghost" onClick={()=>setRequestModal(false)}>Cancel</button>
        </div>
      </BarterModal>

      {/* Feedback */}
      <BarterModal open={feedbackModal} onClose={()=>setFeedbackModal(false)}>
        <h2 style={{fontFamily:'Clash Display,sans-serif',fontSize:26,marginBottom:8,color:'var(--barter-text)'}}>Rate This Session</h2>
        <p style={{color:'var(--barter-muted)',fontSize:14,marginBottom:28}}>Your feedback helps other learners & rewards great teachers</p>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:13,color:'var(--barter-muted)',marginBottom:10,textTransform:'uppercase',letterSpacing:1}}>Overall Rating</div>
          <div style={{display:'flex',justifyContent:'center',gap:8,fontSize:40,cursor:'pointer'}}>
            {[1,2,3,4,5].map(v=>(
              <span key={v} onClick={()=>setFbRating(v)} style={{color:v<=fbRating?'#ffd700':'var(--barter-muted)',transition:'color .15s'}}>
                {v<=fbRating?'★':'☆'}
              </span>
            ))}
          </div>
          <div style={{fontSize:14,color:'var(--barter-muted)',marginTop:8,height:20}}>
            {['','😞 Poor','😐 Fair','🙂 Good','😊 Great','🤩 Excellent!'][fbRating]||''}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <label className="b-label">Quick Tags</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
            {['👍 Very Clear','⚡ Fast Paced','🎯 Practical','🧠 Deep Knowledge','💬 Interactive','📚 Well Structured','😴 Too Slow','🔁 Repetitive'].map(tag=>(
              <SkillChip key={tag} selected={fbTags.includes(tag)} onClick={()=>setFbTags(t=>t.includes(tag)?t.filter(x=>x!==tag):[...t,tag])}>{tag}</SkillChip>
            ))}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <label className="b-label">Written Review (optional)</label>
          <textarea className="b-input" rows={3} placeholder="Share your experience…" style={{resize:'none'}} value={fbText} onChange={e=>setFbText(e.target.value)}/>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="b-btn b-btn-primary" style={{flex:1}} onClick={submitFeedback}>Submit Feedback</button>
          <button className="b-btn b-btn-ghost" onClick={()=>setFeedbackModal(false)}>Skip</button>
        </div>
      </BarterModal>

      {/* Profile Modal */}
      {profileModal && (
        <BarterModal open={!!profileModal} onClose={()=>setProfileModal(null)} wide>
          <ProfileModalContent person={profileModal} onClose={()=>setProfileModal(null)} onConnect={()=>{setProfileModal(null);openConnectModal(profileModal);}} onFeedback={()=>{setProfileModal(null);setFbSpeaker(profileModal);setFbRating(0);setFbText('');setFbTags([]);setFbCats({clarity:0,depth:0,engagement:0,recommend:0});setFeedbackModal(true);}}/>
        </BarterModal>
      )}

      {/* Analytics Modal */}
      {analyticsModal && (
        <BarterModal open={!!analyticsModal} onClose={()=>setAnalyticsModal(null)} wide>
          <AnalyticsModalContent person={analyticsModal} onClose={()=>setAnalyticsModal(null)} onConnect={()=>{setAnalyticsModal(null);openConnectModal(analyticsModal);}} onFeedback={()=>{setAnalyticsModal(null);setFbSpeaker(analyticsModal);setFbRating(0);setFbText('');setFbTags([]);setFbCats({clarity:0,depth:0,engagement:0,recommend:0});setFeedbackModal(true);}}/>
        </BarterModal>
      )}

    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ExploreCard({person:p,onProfile,onAnalytics,onConnect}) {
  const levelIcon = p.level==='experienced'?'🔥':p.level==='mid'?'⚡':'🌱';
  return (
    <div className="b-card">
      <div style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:12}}>
        <Avatar text={p.avatar} size={48} fontSize={18}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}>
            <span style={{fontFamily:'Clash Display,sans-serif',fontSize:16,fontWeight:700,color:'var(--barter-text)'}}>{p.name}</span>
            <LevelBadge level={p.level}/>
          </div>
          <div style={{display:'flex',gap:4,alignItems:'center'}}>
            <Stars r={p.rating} size={12}/>
            <span style={{color:'var(--barter-muted)',fontSize:12}}>{p.rating} · {p.sessions} sessions</span>
          </div>
        </div>
      </div>
      <p style={{fontSize:13,color:'var(--barter-muted)',marginBottom:12,lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.bio}</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:12}}>
        {p.skills.map(s=><span key={s} style={{background:'var(--barter-surface2)',border:'1px solid var(--barter-border)',padding:'3px 10px',borderRadius:100,fontSize:11,color:'var(--barter-muted)'}}>{s}</span>)}
      </div>
      <div style={{fontSize:12,color:'var(--barter-muted)',marginBottom:12}}>
        📍 {p.location} &nbsp;·&nbsp; ⏱️ {p.responseTime} &nbsp;·&nbsp; ✅ {p.completionRate}%
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <span style={{color:'#ffd700',fontFamily:'JetBrains Mono,monospace',fontSize:13,flex:1}}>🪙 {p.coins} coins/session</span>
        <button className="b-btn b-btn-ghost" style={{padding:'5px 10px',fontSize:11}} onClick={onAnalytics}>📊 Stats</button>
        <button className="b-btn b-btn-ghost" style={{padding:'5px 10px',fontSize:11}} onClick={onProfile}>Profile</button>
        <button className="b-btn b-btn-primary" style={{padding:'5px 10px',fontSize:11}} onClick={onConnect}>Request</button>
      </div>
    </div>
  );
}

function MatchCard({person:p,onAnalytics,onConnect}) {
  return (
    <div className="b-match-card">
      <Avatar text={p.avatar} size={52} fontSize={20}/>
      <div style={{flex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
          <div style={{fontWeight:600,fontSize:16,color:'var(--barter-text)'}}>{p.name}</div>
          <LevelBadge level={p.level}/>
        </div>
        <div style={{fontSize:13,color:'var(--barter-muted)'}}>{p.teaches.join(' · ')}</div>
        <div style={{marginTop:6,display:'flex',alignItems:'center',gap:10,fontSize:12,color:'var(--barter-muted)',flexWrap:'wrap'}}>
          <Stars r={p.rating} size={12}/><span>{p.rating}</span>
          <span>·</span><span>{p.sessions} sessions</span>
          <span>·</span><span>✅ {p.completionRate}%</span>
        </div>
        <div style={{fontSize:12,color:'var(--barter-muted)',marginTop:4}}>📍 {p.location} &nbsp;·&nbsp; ⏱️ {p.responseTime}</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
        <div style={{fontFamily:'Clash Display,sans-serif',fontSize:20,fontWeight:700,color:'#ffd700'}}>{p.coins}</div>
        <div style={{fontSize:11,color:'var(--barter-muted)'}}>coins/session</div>
        <button className="b-btn b-btn-ghost" style={{padding:'5px 12px',fontSize:11,width:'100%'}} onClick={onAnalytics}>📊 View Analytics</button>
        <button className="b-btn b-btn-primary" style={{padding:'5px 12px',fontSize:11,width:'100%'}} onClick={onConnect}>🔗 Connect</button>
      </div>
    </div>
  );
}

function ProfileModalContent({person:p,onClose,onConnect,onFeedback}) {
  const levelIcon=p.level==='experienced'?'🔥':p.level==='mid'?'⚡':'🌱';
  return (
    <div>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,rgba(108,99,255,.15),rgba(255,107,107,.08))',borderRadius:16,padding:28,marginBottom:24,position:'relative'}}>
        <div style={{display:'flex',gap:20,alignItems:'flex-start'}}>
          <Avatar text={p.avatar} size={72} fontSize={28}/>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:6}}>
              <span style={{fontFamily:'Clash Display,sans-serif',fontSize:26,fontWeight:700,color:'var(--barter-text)'}}>{p.name}</span>
              <LevelBadge level={p.level}/>
            </div>
            <div style={{color:'var(--barter-muted)',fontSize:14,marginBottom:10}}>📍 {p.location} &nbsp;·&nbsp; 🎓 {p.education}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {(p.verifiedBadges||[]).map(b=><span key={b} style={{background:'rgba(67,233,123,.1)',border:'1px solid rgba(67,233,123,.3)',color:'var(--barter-accent3)',padding:'3px 10px',borderRadius:100,fontSize:11,fontWeight:600}}>✓ {b}</span>)}
            </div>
          </div>
          <div style={{textAlign:'right',flexShrink:0}}>
            <div style={{fontFamily:'Clash Display,sans-serif',fontSize:22,fontWeight:700,color:'#ffd700'}}>{p.rating}</div>
            <Stars r={p.rating} size={14}/>
            <div style={{fontSize:11,color:'var(--barter-muted)',marginTop:2}}>{p.sessions} sessions</div>
          </div>
        </div>
      </div>
      {/* Bio */}
      <div style={{marginBottom:24}}>
        <div style={{fontFamily:'Clash Display,sans-serif',fontSize:16,fontWeight:600,marginBottom:10,color:'var(--barter-text)'}}>About</div>
        <p style={{color:'var(--barter-muted)',fontSize:14,lineHeight:1.7}}>{p.bio}</p>
      </div>
      {/* Skills */}
      <div className="b-grid2" style={{marginBottom:24}}>
        <div style={{background:'var(--barter-surface2)',borderRadius:12,padding:16}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:10,color:'var(--barter-accent)'}}>🎯 Skills I Teach</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{(p.teaches||p.skills||[]).map(s=><SkillChip key={s} selected>{s}</SkillChip>)}</div>
        </div>
        <div style={{background:'var(--barter-surface2)',borderRadius:12,padding:16}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:10,color:'var(--barter-accent2)'}}>📚 Want to Learn</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{(p.wantToLearn||[]).map(s=><SkillChip key={s}>{s}</SkillChip>)}</div>
        </div>
      </div>
      {/* Meta */}
      <div style={{background:'var(--barter-surface2)',borderRadius:12,padding:16,marginBottom:24}}>
        <div className="b-grid2">
          <div><div style={{fontSize:12,color:'var(--barter-muted)',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Languages</div><div style={{fontSize:14,color:'var(--barter-text)'}}>{(p.languages||[]).join(' · ')}</div></div>
          <div><div style={{fontSize:12,color:'var(--barter-muted)',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Teaching Style</div><div style={{fontSize:14,color:'var(--barter-text)'}}>{p.teachingStyle}</div></div>
          <div style={{gridColumn:'span 2'}}>
            <div style={{fontSize:12,color:'var(--barter-muted)',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Availability</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{(p.availability||[]).map(a=><span key={a} style={{background:'rgba(108,99,255,.1)',border:'1px solid rgba(108,99,255,.25)',color:'var(--barter-accent)',padding:'4px 12px',borderRadius:8,fontSize:12}}>{a}</span>)}</div>
          </div>
        </div>
      </div>
      {/* Reviews */}
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:'Clash Display,sans-serif',fontSize:16,fontWeight:600,marginBottom:14,color:'var(--barter-text)'}}>Student Reviews</div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {(p.reviews||[]).map((r,i)=>(
            <div key={i} style={{background:'var(--barter-surface2)',borderRadius:12,padding:16}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--barter-accent),var(--barter-accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,color:'white'}}>{r.from[0]}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--barter-text)'}}>{r.from}</div>
                  <Stars r={r.rating} size={12}/>
                </div>
              </div>
              <div style={{fontSize:13,color:'var(--barter-muted)',lineHeight:1.6}}>"{r.text}"</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:'flex',gap:12}}>
        <button className="b-btn b-btn-primary" style={{flex:1,padding:14,fontSize:15}} onClick={onConnect}>📅 Request a Session</button>
        <button className="b-btn b-btn-ghost" style={{padding:'14px 16px',fontSize:13}} onClick={onFeedback}>⭐ Review</button>
        <button className="b-btn b-btn-ghost" style={{padding:'14px 16px'}} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function AnalyticsModalContent({person:p,onClose,onConnect,onFeedback}) {
  const colors=['#6c63ff','#ff6b6b','#43e97b','#ffd700','#ff9f43'];
  const skills = p.teaches||p.skills||[];
  const months=['Aug','Sep','Oct','Nov','Dec','Jan'];
  const sessData=months.map((_,i)=>Math.floor(p.sessions*(0.05+i*0.15+Math.random()*0.08)));
  const maxSess=Math.max(...sessData,1);
  const dist=[0,0,0,0,0];
  (p.reviews||[]).forEach(r=>{ if(r.rating>=1&&r.rating<=5) dist[r.rating-1]++; });
  const catKeys=['Clarity','Knowledge','Engagement','Recommend'];
  const catAvg=catKeys.map(()=>(3.6+Math.random()*1.2).toFixed(1));

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <Avatar text={p.avatar} size={52} fontSize={20}/>
          <div>
            <div style={{fontFamily:'Clash Display,sans-serif',fontSize:24,fontWeight:700,color:'var(--barter-text)'}}>{p.name}</div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}>
              <LevelBadge level={p.level}/>
              <span style={{fontSize:13,color:'var(--barter-muted)'}}>📍 {p.location}</span>
            </div>
            <div style={{marginTop:6,display:'flex',flexWrap:'wrap',gap:4}}>
              {(p.verifiedBadges||[]).map(b=><span key={b} style={{background:'rgba(67,233,123,.1)',border:'1px solid rgba(67,233,123,.3)',color:'var(--barter-accent3)',padding:'2px 8px',borderRadius:100,fontSize:11,fontWeight:600}}>✓ {b}</span>)}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'var(--barter-muted)',fontSize:22,cursor:'pointer',lineHeight:1}}>✕</button>
      </div>

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:24}}>
        {[['⭐',p.rating,'Avg Rating'],['📋',p.sessions,'Sessions'],['✅',p.completionRate+'%','Completion'],['💬',(p.reviews||[]).length,'Reviews']].map(([ic,v,l])=>(
          <div key={l} style={{background:'var(--barter-surface2)',borderRadius:12,padding:14,textAlign:'center'}}>
            <div style={{fontSize:18}}>{ic}</div>
            <div style={{fontFamily:'Clash Display,sans-serif',fontSize:22,fontWeight:700,color:'var(--barter-accent)',margin:'4px 0'}}>{v}</div>
            <div style={{fontSize:11,color:'var(--barter-muted)'}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        {/* Bar chart */}
        <div style={{background:'var(--barter-surface2)',borderRadius:14,padding:18}}>
          <div style={{fontWeight:600,fontSize:14,marginBottom:4,color:'var(--barter-text)'}}>📈 Sessions Per Month</div>
          <div style={{fontSize:11,color:'var(--barter-muted)',marginBottom:14}}>Teaching momentum over 6 months</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:8,height:90}}>
            {months.map((m,i)=>{
              const h=Math.round((sessData[i]/maxSess)*78)+4;
              return (
                <div key={m} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                  <div style={{fontSize:9,color:'var(--barter-accent3)',fontWeight:600}}>{sessData[i]}</div>
                  <div style={{width:'100%',height:h,background:'linear-gradient(180deg,#6c63ff,rgba(108,99,255,.25))',borderRadius:'4px 4px 0 0'}}/>
                  <div style={{fontSize:9,color:'var(--barter-muted)'}}>{m}</div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Rating distribution */}
        <div style={{background:'var(--barter-surface2)',borderRadius:14,padding:18}}>
          <div style={{fontWeight:600,fontSize:14,marginBottom:14,color:'var(--barter-text)'}}>⭐ Rating Breakdown</div>
          {[5,4,3,2,1].map(star=>{
            const cnt=dist[star-1];
            const pct=Math.round((cnt/Math.max((p.reviews||[]).length,1))*100);
            return (
              <div key={star} style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
                <span style={{fontSize:11,color:'#ffd700',width:22}}>{star}★</span>
                <div style={{flex:1,height:8,background:'var(--barter-border)',borderRadius:100,overflow:'hidden'}}>
                  <div style={{width:pct+'%',height:'100%',background:'linear-gradient(90deg,#ffd700,#ffaa00)',borderRadius:100}}/>
                </div>
                <span style={{fontSize:10,color:'var(--barter-muted)',width:14}}>{cnt}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        {/* Pie */}
        <div style={{background:'var(--barter-surface2)',borderRadius:14,padding:18}}>
          <div style={{fontWeight:600,fontSize:14,marginBottom:14,color:'var(--barter-text)'}}>🎯 Skills Taught</div>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <PieChart skills={skills}/>
            <div style={{display:'flex',flexDirection:'column',gap:5,flex:1}}>
              {skills.map((s,i)=>(
                <div key={s} style={{display:'flex',alignItems:'center',gap:6,fontSize:12}}>
                  <div style={{width:8,height:8,borderRadius:2,background:colors[i%colors.length],flexShrink:0}}/>
                  <span style={{color:'var(--barter-muted)'}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Quality bars */}
        <div style={{background:'var(--barter-surface2)',borderRadius:14,padding:18}}>
          <div style={{fontWeight:600,fontSize:14,marginBottom:14,color:'var(--barter-text)'}}>📊 Teaching Quality</div>
          {catKeys.map((k,i)=>(
            <div key={k} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4}}>
                <span style={{color:'var(--barter-muted)'}}>{k}</span>
                <span style={{color:colors[i],fontWeight:600}}>{catAvg[i]}/5</span>
              </div>
              <div style={{height:8,background:'var(--barter-border)',borderRadius:100,overflow:'hidden'}}>
                <div style={{width:(catAvg[i]/5*100)+'%',height:'100%',background:colors[i],borderRadius:100}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div style={{background:'var(--barter-surface2)',borderRadius:14,padding:20,marginBottom:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div style={{fontWeight:600,fontSize:14,color:'var(--barter-text)'}}>💬 Recent Reviews</div>
          <button className="b-btn b-btn-ghost" style={{padding:'4px 12px',fontSize:12}} onClick={onFeedback}>+ Leave Review</button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10,maxHeight:200,overflowY:'auto'}}>
          {(p.reviews||[]).map((r,i)=>(
            <div key={i} style={{borderBottom:'1px solid var(--barter-border)',paddingBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                <div style={{width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,#6c63ff,#ff6b6b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'white',flexShrink:0}}>{r.from[0]}</div>
                <span style={{fontSize:12,fontWeight:600,color:'var(--barter-text)'}}>{r.from}</span>
                <Stars r={r.rating} size={12}/>
                {r.date&&<span style={{fontSize:10,color:'var(--barter-muted)',marginLeft:'auto'}}>{r.date}</span>}
              </div>
              {r.tags?.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:3,marginBottom:5}}>{r.tags.map(t=><span key={t} style={{background:'rgba(108,99,255,.1)',border:'1px solid rgba(108,99,255,.2)',color:'var(--barter-accent)',padding:'1px 7px',borderRadius:100,fontSize:9}}>{t}</span>)}</div>}
              <div style={{fontSize:12,color:'var(--barter-muted)'}}>"{r.text}"</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'flex',gap:12}}>
        <button className="b-btn b-btn-primary" style={{flex:1}} onClick={onConnect}>📅 Book a Session</button>
        <button className="b-btn b-btn-ghost" style={{padding:'12px 20px'}} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

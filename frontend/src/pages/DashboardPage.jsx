// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import UserCard from '../components/shared/UserCard';
import { BtnPrimary, BtnGhost, StatusBadge, Spinner } from '../components/shared/UI';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const StatCard = ({ label, value, color }) => (
  <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:24, textAlign:'center' }}>
    <div style={{ fontFamily:'Clash Display, sans-serif', fontSize:36, fontWeight:700, color }}>{value}</div>
    <div style={{ color:'var(--muted)', fontSize:13, marginTop:4 }}>{label}</div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [exchanges, setExchanges]       = useState([]);
  const [matches, setMatches]           = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ex, ma, no] = await Promise.all([
          api.get('/exchanges'),
          api.get('/users/matches'),
          api.get('/messages/notifications'),
        ]);
        setExchanges(ex.data.exchanges || []);
        setMatches(ma.data.matches || []);
        setNotifications(no.data.notifications || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const active    = exchanges.filter(e => e.status === 'accepted');
  const pending   = exchanges.filter(e => e.status === 'pending');
  const completed = exchanges.filter(e => e.status === 'completed');
  const unread    = notifications.filter(n => !n.is_read);
  const profileOk = user?.skills_offered?.length > 0 && user?.skills_wanted?.length > 0;

  return (
    <div style={{ minHeight:'100vh', paddingTop:80, position:'relative', zIndex:1 }}>
      <Navbar />
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 24px' }}>

        {/* Hero Banner */}
        <div style={{ borderRadius:20, padding:'40px 48px', marginBottom:40, background:'linear-gradient(135deg,rgba(108,99,255,.15),rgba(255,107,107,.08))', border:'1px solid rgba(108,99,255,.2)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'rgba(108,99,255,.06)', pointerEvents:'none' }} />
          <div style={{ position:'relative' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent3)', display:'inline-block' }} />
              <span style={{ fontSize:13, color:'var(--accent3)', fontWeight:500 }}>Live Platform - Active Now</span>
            </div>
            <h1 style={{ fontFamily:'Clash Display, sans-serif', fontSize:'clamp(26px,4vw,46px)', fontWeight:700, lineHeight:1.1, marginBottom:10 }}>
              Hey, {user?.name?.split(' ')[0]}!
              <br />
              <span style={{ background:'linear-gradient(135deg,var(--accent),var(--accent2),var(--accent3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                {matches.length > 0 ? `${matches.length} skill match${matches.length > 1 ? 'es' : ''} waiting` : 'Start matching with experts'}
              </span>
            </h1>
            <p style={{ color:'var(--muted)', fontSize:15, marginBottom:24 }}>Trade skills, grow together. Every exchange builds your reputation.</p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <Link to="/search"><BtnPrimary style={{ fontSize:15, padding:'12px 28px' }}>Find Skills</BtnPrimary></Link>
              {!profileOk && <Link to="/profile/edit"><BtnGhost style={{ fontSize:15, padding:'12px 28px' }}>Complete Profile</BtnGhost></Link>}
            </div>
          </div>
        </div>

        {/* Profile nudge */}
        {!profileOk && (
          <div style={{ marginBottom:28, padding:16, borderRadius:12, background:'rgba(255,215,0,.05)', border:'1px solid rgba(255,215,0,.18)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:600, color:'#ffd700', fontSize:14 }}>Complete your profile</div>
                <div style={{ color:'var(--muted)', fontSize:12, marginTop:2 }}>Add skills to teach & learn to unlock matches!</div>
              </div>
            </div>
            <Link to="/profile/edit">
              <button style={{ padding:'8px 20px', borderRadius:8, background:'linear-gradient(135deg,#ffd700,#ffaa00)', color:'#1a1100', fontWeight:700, fontSize:13, border:'none', cursor:'pointer', whiteSpace:'nowrap' }}>Set up</button>
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:40 }}>
          <StatCard label="Active Exchanges" value={active.length} color="var(--accent)" />
          <StatCard label="Pending Requests" value={pending.length} color="#ffaa00" />
          <StatCard label="Completed" value={completed.length} color="var(--accent3)" />
          <StatCard label="Unread Alerts" value={unread.length} color="var(--accent2)" />
        </div>

        {/* Remaining code unchanged except emoji removals */}
      </div>
    </div>
  );
}
// src/pages/ProfilePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import { Avatar, LevelBadge, SkillChip, Stars } from '../components/shared/UI';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div style={{ minHeight:'100vh', paddingTop:80, position:'relative', zIndex:1 }}>
      <Navbar />
      <div style={{ maxWidth:860, margin:'0 auto', padding:'40px 24px' }}>

        {/* Banner + Avatar */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, overflow:'hidden', marginBottom:24 }}>
          <div style={{ height:120, background:'linear-gradient(135deg,rgba(108,99,255,.4),rgba(255,107,107,.3))' }} />
          <div style={{ padding:'0 32px 32px' }}>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:-28, marginBottom:20 }}>
              <div style={{ width:80, height:80, borderRadius:16, border:'4px solid var(--bg)', overflow:'hidden', flexShrink:0 }}>
                <Avatar name={user.name} photo={user.profile_photo} size={80} fontSize={28} />
              </div>
              <Link to="/profile/edit" style={{ textDecoration:'none' }}>
                <button style={{ padding:'9px 20px', borderRadius:8, background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', cursor:'pointer', fontSize:14, fontWeight:600, fontFamily:'Space Grotesk', transition:'all .2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)'; }}>
                  ✏️ Edit Profile
                </button>
              </Link>
            </div>

            <h1 style={{ fontFamily:'Clash Display, sans-serif', fontSize:28, fontWeight:700, marginBottom:4 }}>{user.name}</h1>
            {user.location && <p style={{ color:'var(--muted)', fontSize:14, marginBottom:6 }}>📍 {user.location}</p>}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <Stars rating={parseFloat(user.rating) || 0} size={16} />
              {user.rating_count > 0 && <span style={{ color:'var(--muted)', fontSize:13 }}>({user.rating_count} reviews)</span>}
              {user.level && <LevelBadge level={user.level} />}
            </div>
            {user.bio && <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.7 }}>{user.bio}</p>}
            <p style={{ color:'var(--muted)', fontSize:12, marginTop:12 }}>
              Member since {new Date(user.created_at).toLocaleDateString('en-US', { month:'long', year:'numeric' })}
            </p>
          </div>
        </div>

        {/* Skills Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:24 }}>
            <h3 style={{ fontFamily:'Clash Display, sans-serif', fontSize:18, fontWeight:700, marginBottom:4 }}>🎓 Skills I Teach</h3>
            <p style={{ color:'var(--muted)', fontSize:12, marginBottom:16 }}>What I can share with others</p>
            {!user.skills_offered?.length
              ? <p style={{ color:'var(--muted)', fontSize:13 }}>No skills added yet</p>
              : <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {user.skills_offered.map((s,i) => <SkillChip key={i} selected>{s.skill_name}</SkillChip>)}
                </div>
            }
          </div>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:24 }}>
            <h3 style={{ fontFamily:'Clash Display, sans-serif', fontSize:18, fontWeight:700, marginBottom:4 }}>📚 Skills I Want</h3>
            <p style={{ color:'var(--muted)', fontSize:12, marginBottom:16 }}>What I'm looking to learn</p>
            {!user.skills_wanted?.length
              ? <p style={{ color:'var(--muted)', fontSize:13 }}>No skills added yet</p>
              : <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {user.skills_wanted.map((s,i) => <SkillChip key={i}>{s.skill_name}</SkillChip>)}
                </div>
            }
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {[
            { to:'/exchanges', icon:'🤝', label:'My Exchanges' },
            { to:'/search',    icon:'🔍', label:'Find Skills' },
            { to:'/messages',  icon:'💬', label:'Messages' },
          ].map(a => (
            <Link key={a.to} to={a.to} style={{ textDecoration:'none' }}>
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:20, textAlign:'center', transition:'all .2s', cursor:'pointer' }}
                onMouseOver={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--card-hover)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface)'; }}>
                <div style={{ fontSize:28, marginBottom:6 }}>{a.icon}</div>
                <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{a.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

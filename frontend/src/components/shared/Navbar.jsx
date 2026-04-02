// src/components/shared/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [notifs, setNotifs] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => { try { const r = await api.get('/messages/notifications'); setNotifs(r.data.unreadCount||0); } catch {} };
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, [user]);

  const active = p => location.pathname === p;

  const links = [
    { to:'/dashboard', label:'Dashboard' },
    { to:'/barter',    label:'⚡ Barter Hub' },
    { to:'/search',    label:'Explore' },
    { to:'/exchanges', label:'Exchanges' },
    { to:'/messages',  label:`Messages${notifs>0?` (${notifs})`:''}` },
  ];

  const handleLogout = () => { logout(); toast.success('Signed out.'); navigate('/'); };

  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 48px', background:'rgba(10,10,15,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)' }}>
      <Link to="/dashboard" style={{ fontFamily:'Clash Display, sans-serif', fontSize:20, fontWeight:700, background:'linear-gradient(135deg,#6c63ff,#ff6b6b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', textDecoration:'none' }}>
        ⚡ SkillSwap
      </Link>

      <ul style={{ display:'flex', gap:24, listStyle:'none', margin:0, padding:0 }}>
        {links.map(l => (
          <li key={l.to}>
            <Link to={l.to} style={{ color: active(l.to)?'var(--text)':'var(--muted)', textDecoration:'none', fontSize:14, fontWeight:500, borderBottom:`2px solid ${active(l.to)?'var(--accent)':'transparent'}`, paddingBottom:2, transition:'color .2s' }}>
              {l.label}
            </Link>
          </li>
        ))}
        {user?.is_admin && (
          <li><Link to="/admin" style={{ color:'var(--muted)', textDecoration:'none', fontSize:14, fontWeight:500 }}>⚙ Admin</Link></li>
        )}
      </ul>

      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
        <Link to="/profile" style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 14px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text)', textDecoration:'none', fontSize:13, fontWeight:500 }}>
          <span style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'inline-flex', alignItems:'center', justifyContent:'center', fontFamily:'Clash Display', fontWeight:700, fontSize:11, color:'white', flexShrink:0 }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </span>
          {user?.name?.split(' ')[0]}
        </Link>
        <button onClick={handleLogout} style={{ padding:'8px 18px', borderRadius:8, background:'transparent', color:'var(--muted)', border:'1px solid var(--border)', cursor:'pointer', fontFamily:'Space Grotesk', fontWeight:600, fontSize:13 }}
          onMouseOver={e => { e.target.style.color='var(--accent2)'; e.target.style.borderColor='var(--accent2)'; }}
          onMouseOut={e => { e.target.style.color='var(--muted)'; e.target.style.borderColor='var(--border)'; }}>
          Sign Out
        </button>
      </div>
    </nav>
  );
};
export default Navbar;

// src/pages/MessagesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import { Spinner } from '../components/shared/UI';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function MessagesPage() {
  const { user } = useAuth();
  const [exchanges, setExchanges]       = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pending, setPending]           = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ex, no, pe] = await Promise.all([
          api.get('/exchanges?status=accepted'),
          api.get('/messages/notifications'),
          api.get('/exchanges?status=pending'),
        ]);
        setExchanges(ex.data.exchanges || []);
        setNotifications(no.data.notifications || []);
        setPending(pe.data.exchanges || []);
        await api.put('/messages/notifications/read');
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div style={{ minHeight:'100vh', paddingTop:80, position:'relative', zIndex:1 }}>
      <Navbar />
      <div style={{ maxWidth:900, margin:'0 auto', padding:'40px 24px' }}>
        <h1 style={{ fontFamily:'Clash Display, sans-serif', fontSize:40, fontWeight:700, marginBottom:8 }}>Messages & Notifications</h1>
        <p style={{ color:'var(--muted)', marginBottom:36 }}>Your active chats and platform alerts</p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:28 }}>

          {/* Active Chats */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:24 }}>
            <h2 style={{ fontFamily:'Clash Display, sans-serif', fontSize:18, fontWeight:700, marginBottom:16 }}>
              💬 Active Chats <span style={{ color:'var(--muted)', fontSize:15 }}>({exchanges.length})</span>
            </h2>
            {loading ? <Spinner /> : exchanges.length === 0
              ? <p style={{ color:'var(--muted)', fontSize:14, textAlign:'center', padding:'16px 0' }}>No active exchanges. Accept a request to start chatting!</p>
              : <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {exchanges.map(ex => {
                    const isReq = ex.requester_id === user?.id;
                    const other = isReq ? ex.provider_name : ex.requester_name;
                    return (
                      <Link key={ex.id} to={`/exchanges/${ex.id}`} style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:12, padding:'12px', borderRadius:10, transition:'background .2s' }}
                        onMouseOver={e => e.currentTarget.style.background='var(--surface2)'}
                        onMouseOut={e => e.currentTarget.style.background='transparent'}>
                        <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15, color:'white', flexShrink:0, fontFamily:'Clash Display' }}>
                          {other?.charAt(0)?.toUpperCase()}
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{other}</p>
                          {ex.unread_count > 0 && <p style={{ fontSize:12, color:'var(--accent3)', marginTop:1 }}>{ex.unread_count} unread message{ex.unread_count>1?'s':''}</p>}
                        </div>
                        <span style={{ color:'var(--muted)', fontSize:16 }}>→</span>
                      </Link>
                    );
                  })}
                </div>
            }
          </div>

          {/* Notifications */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:24 }}>
            <h2 style={{ fontFamily:'Clash Display, sans-serif', fontSize:18, fontWeight:700, marginBottom:16 }}>🔔 Notifications</h2>
            {loading ? <Spinner /> : notifications.length === 0
              ? <p style={{ color:'var(--muted)', fontSize:14, textAlign:'center', padding:'16px 0' }}>No notifications</p>
              : <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:300, overflowY:'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding:'10px 12px', borderRadius:10, background: n.is_read ? 'transparent' : 'rgba(108,99,255,.07)', border:`1px solid ${n.is_read ? 'transparent' : 'rgba(108,99,255,.2)'}` }}>
                      <p style={{ fontWeight:600, fontSize:13 }}>{n.title}</p>
                      <p style={{ color:'var(--muted)', fontSize:12, marginTop:2 }}>{n.body}</p>
                      <p style={{ color:'var(--muted)', fontSize:11, marginTop:3 }}>{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>

        {/* Pending Requests */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontFamily:'Clash Display, sans-serif', fontSize:18, fontWeight:700 }}>⏳ Pending Requests</h2>
            <Link to="/exchanges?status=pending" style={{ color:'var(--accent)', fontSize:13, textDecoration:'none' }}>View all →</Link>
          </div>
          {loading ? <Spinner />
            : pending.length === 0
              ? <p style={{ color:'var(--muted)', fontSize:14, textAlign:'center', padding:'8px 0' }}>No pending requests</p>
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
                  {pending.map(ex => {
                    const isReq = ex.requester_id === user?.id;
                    const other = isReq ? ex.provider_name : ex.requester_name;
                    return (
                      <Link key={ex.id} to={`/exchanges/${ex.id}`} style={{ textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderRadius:10, background:'rgba(255,170,0,.06)', border:'1px solid rgba(255,170,0,.15)', transition:'all .2s' }}
                        onMouseOver={e => e.currentTarget.style.background='rgba(255,170,0,.1)'}
                        onMouseOut={e => e.currentTarget.style.background='rgba(255,170,0,.06)'}>
                        <div>
                          <p style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{other}</p>
                          <p style={{ fontSize:12, color:'var(--muted)', marginTop:1 }}>{isReq ? 'Awaiting their response' : '⚡ Needs your response'}</p>
                        </div>
                        <span style={{ color:'#ffaa00', fontSize:16 }}>→</span>
                      </Link>
                    );
                  })}
                </div>
          }
        </div>
      </div>
    </div>
  );
}

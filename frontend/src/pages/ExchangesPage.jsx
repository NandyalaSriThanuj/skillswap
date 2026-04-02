// src/pages/ExchangesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import { BtnPrimary, BtnGhost, BtnSuccess, BtnDanger, StatusBadge, Spinner } from '../components/shared/UI';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ExchangesPage() {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');

  const fetchExchanges = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api.get(`/exchanges${params}`);
      setExchanges(res.data.exchanges || []);
    } catch {
      toast.error('Failed to load exchanges');
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchExchanges(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/exchanges/${id}/status`, { status });
      toast.success(`Exchange ${status}`);
      fetchExchanges();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const filters = [
    { v:'all',       l:'All' },
    { v:'pending',   l:'Pending' },
    { v:'accepted',  l:'Active' },
    { v:'completed', l:'Completed' },
  ];

  return (
    <div style={{ minHeight:'100vh', paddingTop:80, position:'relative', zIndex:1 }}>
      <Navbar />
      <div style={{ maxWidth:900, margin:'0 auto', padding:'40px 24px' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32 }}>
          <div>
            <h1 style={{ fontFamily:'Clash Display, sans-serif', fontSize:40, fontWeight:700 }}>
              My Exchanges
            </h1>
            <p style={{ color:'var(--muted)', marginTop:6 }}>
              Manage your skill barter requests
            </p>
          </div>

          <Link to="/search" style={{ textDecoration:'none' }}>
            <BtnPrimary style={{ padding:'10px 24px' }}>
              New Exchange
            </BtnPrimary>
          </Link>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:8, marginBottom:28 }}>
          {filters.map(f => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              style={{
                padding:'8px 20px',
                borderRadius:10,
                fontSize:13,
                fontWeight:600,
                cursor:'pointer',
                border:`1px solid ${filter===f.v ? 'var(--accent)' : 'var(--border)'}`,
                background: filter===f.v ? 'rgba(108,99,255,.2)' : 'var(--surface2)',
                color: filter===f.v ? 'var(--accent)' : 'var(--muted)',
                transition:'all .15s',
              }}
            >
              {f.l}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:80 }}>
            <Spinner size={48} />
          </div>
        ) : exchanges.length === 0 ? (
          <div style={{
            background:'var(--surface)',
            border:'1px solid var(--border)',
            borderRadius:16,
            padding:'80px 32px',
            textAlign:'center'
          }}>
            <h3 style={{ fontFamily:'Clash Display, sans-serif', fontSize:22, marginBottom:8 }}>
              No exchanges yet
            </h3>
            <p style={{ color:'var(--muted)', marginBottom:24 }}>
              Start by finding someone to exchange skills
            </p>
            <Link to="/search" style={{ textDecoration:'none' }}>
              <BtnPrimary>Find Skills</BtnPrimary>
            </Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {exchanges.map(ex => {
              const isReq   = ex.requester_id === user?.id;
              const other   = isReq ? ex.provider_name : ex.requester_name;
              const mySkill = isReq ? ex.requester_skill_name : ex.provider_skill_name;
              const theirSkill = isReq ? ex.provider_skill_name : ex.requester_skill_name;

              return (
                <div
                  key={ex.id}
                  style={{
                    background:'var(--surface)',
                    border:'1px solid var(--border)',
                    borderRadius:16,
                    padding:24,
                    transition:'border-color .2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor='rgba(108,99,255,.4)'}
                  onMouseOut={e => e.currentTarget.style.borderColor='var(--border)'}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>

                    {/* Avatar */}
                    <div style={{
                      width:48,
                      height:48,
                      borderRadius:'50%',
                      background:'linear-gradient(135deg,var(--accent),var(--accent2))',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      fontFamily:'Clash Display',
                      fontWeight:700,
                      fontSize:18,
                      color:'white',
                      flexShrink:0
                    }}>
                      {other?.charAt(0)?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:4 }}>
                        <span style={{ fontFamily:'Clash Display, sans-serif', fontWeight:700, fontSize:18 }}>
                          {other}
                        </span>
                        <StatusBadge status={ex.status} />
                        {ex.unread_count > 0 && (
                          <span style={{
                            background:'var(--accent)',
                            color:'white',
                            fontSize:11,
                            padding:'2px 8px',
                            borderRadius:100,
                            fontWeight:700
                          }}>
                            {ex.unread_count} new
                          </span>
                        )}
                      </div>

                      <p style={{ color:'var(--muted)', fontSize:13 }}>
                        <span style={{ color:'var(--accent)' }}>{mySkill || 'N/A'}</span>
                        <span style={{ color:'var(--border)', margin:'0 8px' }}>to</span>
                        <span style={{ color:'var(--accent2)' }}>{theirSkill || 'N/A'}</span>
                      </p>

                      <p style={{ color:'var(--muted)', fontSize:12, marginTop:3 }}>
                        {isReq ? 'You sent this' : 'They sent this'} · {new Date(ex.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', flexShrink:0 }}>
                      <Link to={`/exchanges/${ex.id}`} style={{ textDecoration:'none' }}>
                        <BtnGhost style={{ padding:'8px 16px', fontSize:13 }}>
                          View
                        </BtnGhost>
                      </Link>

                      {!isReq && ex.status === 'pending' && (
                        <>
                          <BtnSuccess
                            onClick={() => updateStatus(ex.id,'accepted')}
                            style={{ padding:'8px 16px', fontSize:13 }}
                          >
                            Accept
                          </BtnSuccess>

                          <BtnDanger
                            onClick={() => updateStatus(ex.id,'rejected')}
                            style={{ padding:'8px 16px', fontSize:13 }}
                          >
                            Decline
                          </BtnDanger>
                        </>
                      )}

                      {isReq && ex.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(ex.id,'cancelled')}
                          style={{
                            padding:'8px 16px',
                            fontSize:13,
                            borderRadius:8,
                            border:'1px solid var(--border)',
                            background:'transparent',
                            color:'var(--muted)',
                            cursor:'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      )}

                      {ex.status === 'accepted' && (
                        <button
                          onClick={() => updateStatus(ex.id,'completed')}
                          style={{
                            padding:'8px 16px',
                            fontSize:13,
                            borderRadius:8,
                            border:'1px solid rgba(67,233,123,.3)',
                            background:'rgba(67,233,123,.08)',
                            color:'var(--accent3)',
                            cursor:'pointer',
                            fontWeight:600
                          }}
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>

                  {ex.message && (
                    <div style={{
                      marginTop:14,
                      padding:'10px 14px',
                      borderRadius:10,
                      background:'var(--surface2)',
                      border:'1px solid var(--border)',
                      fontSize:13,
                      color:'var(--muted)',
                      fontStyle:'italic'
                    }}>
                      "{ex.message}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
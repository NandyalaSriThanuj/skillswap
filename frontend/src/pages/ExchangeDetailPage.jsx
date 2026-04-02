// src/pages/ExchangeDetailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../components/shared/Navbar';
import { BtnPrimary, BtnGhost, BtnSuccess, BtnDanger, StatusBadge, Input, Spinner } from '../components/shared/UI';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ExchangeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exchange, setExchange] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const endRef  = useRef(null);
  const sockRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [ex, ms] = await Promise.all([
          api.get(`/exchanges/${id}`),
          api.get(`/messages/${id}`)
        ]);
        setExchange(ex.data.exchange);
        setMessages(ms.data.messages || []);
      } catch {
        toast.error('Exchange not found');
        navigate('/exchanges');
      }
      finally { setLoading(false); }
    })();

    const SOCK = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    sockRef.current = io(SOCK);
    sockRef.current.emit('join_exchange', id);
    sockRef.current.emit('join_user', user?.id);
    sockRef.current.on('receive_message', d => {
      setMessages(p => [...p, d.message]);
    });

    return () => sockRef.current?.disconnect();
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  const sendMsg = async e => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    setSending(true);
    try {
      const res = await api.post(`/messages/${id}`, { content: newMsg });
      const msg = res.data.message;

      setMessages(p => [...p, msg]);
      sockRef.current?.emit('send_message', { exchangeId:id, message:msg });
      setNewMsg('');
    } catch {
      toast.error('Failed to send');
    }
    finally { setSending(false); }
  };

  const updateStatus = async status => {
    try {
      await api.put(`/exchanges/${id}/status`, { status });
      setExchange(p => ({ ...p, status }));
      toast.success(`Exchange ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', paddingTop:80, zIndex:1, position:'relative' }}>
      <Navbar />
      <div style={{ display:'flex', justifyContent:'center', padding:120 }}>
        <Spinner size={48} />
      </div>
    </div>
  );

  if (!exchange) return null;

  const isReq      = exchange.requester_id === user?.id;
  const other      = isReq ? exchange.provider_name : exchange.requester_name;
  const mySkill    = isReq ? exchange.requester_skill_name : exchange.provider_skill_name;
  const theirSkill = isReq ? exchange.provider_skill_name : exchange.requester_skill_name;
  const canChat    = ['pending','accepted'].includes(exchange.status);

  return (
    <div style={{ minHeight:'100vh', paddingTop:80, position:'relative', zIndex:1 }}>
      <Navbar />
      <div style={{ maxWidth:780, margin:'0 auto', padding:'40px 24px' }}>

        <button
          onClick={() => navigate('/exchanges')}
          style={{ background:'none', border:'none', color:'var(--muted)', fontSize:13, cursor:'pointer', marginBottom:20 }}
        >
          Back to Exchanges
        </button>

        {/* Exchange Info */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:24, marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
            <div>
              <h2 style={{ fontFamily:'Clash Display, sans-serif', fontSize:22, fontWeight:700, marginBottom:8 }}>
                Exchange with {other}
              </h2>

              <div style={{ display:'flex', gap:8, alignItems:'center', fontSize:13 }}>
                <span style={{ color:'var(--accent)' }}>You teach: {mySkill || '-'}</span>
                <span style={{ color:'var(--border)' }}>to</span>
                <span style={{ color:'var(--accent2)' }}>They teach: {theirSkill || '-'}</span>
              </div>
            </div>

            <StatusBadge status={exchange.status} />
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:10, marginTop:16, flexWrap:'wrap' }}>
            {!isReq && exchange.status === 'pending' && (
              <>
                <BtnSuccess onClick={() => updateStatus('accepted')} style={{ padding:'9px 20px' }}>
                  Accept Exchange
                </BtnSuccess>

                <BtnDanger onClick={() => updateStatus('rejected')} style={{ padding:'9px 20px' }}>
                  Decline
                </BtnDanger>
              </>
            )}

            {exchange.status === 'accepted' && (
              <button
                onClick={() => updateStatus('completed')}
                style={{
                  padding:'9px 20px',
                  borderRadius:8,
                  border:'1px solid rgba(67,233,123,.3)',
                  background:'rgba(67,233,123,.08)',
                  color:'var(--accent3)',
                  cursor:'pointer',
                  fontWeight:600,
                  fontSize:14
                }}
              >
                Mark Complete
              </button>
            )}

            {isReq && exchange.status === 'pending' && (
              <BtnGhost onClick={() => updateStatus('cancelled')} style={{ padding:'9px 20px' }}>
                Cancel Request
              </BtnGhost>
            )}
          </div>
        </div>

        {/* Chat */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
            <span
              style={{
                width:8,
                height:8,
                borderRadius:'50%',
                background: canChat ? 'var(--accent3)' : 'var(--muted)',
                display:'inline-block'
              }}
            />
            <span style={{ fontFamily:'Clash Display, sans-serif', fontWeight:700, fontSize:16 }}>
              Messages
            </span>
          </div>

          {/* Messages */}
          <div style={{ height:400, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:12 }}>
            {messages.length === 0 ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--muted)', textAlign:'center' }}>
                <p style={{ fontSize:14 }}>No messages yet. Start the conversation.</p>
              </div>
            ) : (
              messages.map(m => {
                const mine = m.sender_id === user?.id;
                return (
                  <div key={m.id} style={{ display:'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        maxWidth:'68%',
                        padding:'12px 16px',
                        borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: mine ? 'linear-gradient(135deg,var(--accent),rgba(108,99,255,.8))' : 'var(--surface2)',
                        border: mine ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      {!mine && (
                        <p style={{ fontSize:11, fontWeight:700, color:'var(--muted)', marginBottom:4 }}>
                          {m.sender_name}
                        </p>
                      )}

                      <p style={{ fontSize:14, lineHeight:1.6, color: mine ? 'white' : 'var(--text)' }}>
                        {m.content}
                      </p>

                      <p style={{ fontSize:11, color: mine ? 'rgba(255,255,255,.5)' : 'var(--muted)', marginTop:4, textAlign:'right' }}>
                        {new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          {canChat ? (
            <form onSubmit={sendMsg} style={{ padding:16, borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
              <Input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="Type a message"
                style={{ flex:1 }}
              />

              <BtnPrimary disabled={sending || !newMsg.trim()} style={{ padding:'12px 20px' }}>
                {sending ? 'Sending...' : 'Send'}
              </BtnPrimary>
            </form>
          ) : (
            <div style={{ padding:16, borderTop:'1px solid var(--border)', background:'var(--surface2)', textAlign:'center', fontSize:13, color:'var(--muted)' }}>
              This exchange is {exchange.status}. Messaging is disabled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
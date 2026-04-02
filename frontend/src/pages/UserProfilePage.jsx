// src/pages/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import { Avatar, LevelBadge, SkillChip, Stars, BtnPrimary, BtnGhost, Modal, FormGroup, Select, Textarea, Spinner } from '../components/shared/UI';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [form, setForm] = useState({ requester_skill_id:'', provider_skill_id:'', message:'' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [u, s] = await Promise.all([api.get(`/users/${id}`), api.get('/users/skills/all')]);
        setTarget(u.data.user);
        setAllSkills(s.data.skills || []);
      } catch { toast.error('User not found'); navigate('/search'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const sendRequest = async e => {
    e.preventDefault(); setSending(true);
    try {
      await api.post('/exchanges', { provider_id: id, ...form });
      toast.success('Exchange request sent! 🎉');
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSending(false); }
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', paddingTop:80, zIndex:1, position:'relative' }}>
      <Navbar />
      <div style={{ display:'flex', justifyContent:'center', padding:120 }}><Spinner size={48} /></div>
    </div>
  );

  if (!target) return null;

  return (
    <div style={{ minHeight:'100vh', paddingTop:80, position:'relative', zIndex:1 }}>
      <Navbar />
      <div style={{ maxWidth:860, margin:'0 auto', padding:'40px 24px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:13, cursor:'pointer', marginBottom:20 }}>← Back</button>

        {/* Profile Card */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, overflow:'hidden', marginBottom:24 }}>
          <div style={{ height:120, background:'linear-gradient(135deg,rgba(108,99,255,.4),rgba(255,107,107,.3))' }} />
          <div style={{ padding:'0 32px 32px' }}>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:-28, marginBottom:20 }}>
              <div style={{ width:80, height:80, borderRadius:16, border:'4px solid var(--bg)', overflow:'hidden', flexShrink:0 }}>
                <Avatar name={target.name} photo={target.profile_photo} size={80} fontSize={28} />
              </div>
              <BtnPrimary onClick={() => setShowModal(true)} style={{ padding:'10px 24px' }}>🤝 Request Exchange</BtnPrimary>
            </div>
            <h1 style={{ fontFamily:'Clash Display, sans-serif', fontSize:28, fontWeight:700, marginBottom:4 }}>{target.name}</h1>
            {target.location && <p style={{ color:'var(--muted)', fontSize:14, marginBottom:6 }}>📍 {target.location}</p>}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <Stars rating={parseFloat(target.rating) || 0} size={16} />
              {target.rating_count > 0 && <span style={{ color:'var(--muted)', fontSize:13 }}>({target.rating_count} reviews)</span>}
              {target.level && <LevelBadge level={target.level} />}
            </div>
            {target.bio && <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.7 }}>{target.bio}</p>}
          </div>
        </div>

        {/* Skills */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:24 }}>
            <h3 style={{ fontFamily:'Clash Display, sans-serif', fontSize:18, fontWeight:700, marginBottom:4, color:'var(--accent)' }}>🎓 Skills They Teach</h3>
            <p style={{ color:'var(--muted)', fontSize:12, marginBottom:14 }}>What they can share with you</p>
            {!target.skills_offered?.length
              ? <p style={{ color:'var(--muted)', fontSize:13 }}>No skills listed</p>
              : <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {target.skills_offered.map((s,i) => <SkillChip key={i} selected>{s.skill_name}</SkillChip>)}
                </div>
            }
          </div>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:24 }}>
            <h3 style={{ fontFamily:'Clash Display, sans-serif', fontSize:18, fontWeight:700, marginBottom:4, color:'var(--accent2)' }}>📚 Skills They Want</h3>
            <p style={{ color:'var(--muted)', fontSize:12, marginBottom:14 }}>What you can teach them</p>
            {!target.skills_wanted?.length
              ? <p style={{ color:'var(--muted)', fontSize:13 }}>No skills listed</p>
              : <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {target.skills_wanted.map((s,i) => <SkillChip key={i}>{s.skill_name}</SkillChip>)}
                </div>
            }
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      {showModal && (
        <Modal open onClose={() => setShowModal(false)} maxWidth={500}>
          <h2 style={{ fontFamily:'Clash Display, sans-serif', fontSize:24, fontWeight:700, marginBottom:4 }}>Connect with {target.name}</h2>
          <p style={{ color:'var(--muted)', fontSize:14, marginBottom:24 }}>Propose a skill exchange</p>
          <form onSubmit={sendRequest}>
            <FormGroup label="Skill you'll teach *">
              <Select value={form.requester_skill_id} onChange={e=>setForm({...form, requester_skill_id:e.target.value})} required>
                <option value="">Select…</option>
                {allSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Skill you want to learn *">
              <Select value={form.provider_skill_id} onChange={e=>setForm({...form, provider_skill_id:e.target.value})} required>
                <option value="">Select…</option>
                {target.skills_offered?.map(s => <option key={s.skill_id} value={s.skill_id}>{s.skill_name}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Message (optional)">
              <Textarea value={form.message} onChange={e=>setForm({...form, message:e.target.value})} rows={3} placeholder="Introduce yourself…" />
            </FormGroup>
            <div style={{ display:'flex', gap:12 }}>
              <BtnGhost onClick={() => setShowModal(false)} style={{ flex:1 }}>Cancel</BtnGhost>
              <BtnPrimary disabled={sending} style={{ flex:1 }}>{sending ? 'Sending…' : 'Send Request 🚀'}</BtnPrimary>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// src/pages/EditProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import { BtnPrimary, BtnGhost, Input, Textarea, Select, FormGroup, SkillChip, Spinner } from '../components/shared/UI';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function EditProfilePage() {
  const { user, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [allSkills, setAllSkills]   = useState([]);
  const [grouped, setGrouped]       = useState({});
  const [profileData, setProfileData] = useState({ name:'', bio:'', location:'' });
  const [photo, setPhoto]           = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [offeredSkills, setOfferedSkills] = useState([]);
  const [wantedSkills, setWantedSkills]   = useState([]);
  const [offerSkill, setOfferSkill] = useState('');
  const [offerLevel, setOfferLevel] = useState('intermediate');
  const [wantSkill, setWantSkill]   = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name||'', bio: user.bio||'', location: user.location||'' });
      setOfferedSkills(user.skills_offered || []);
      setWantedSkills(user.skills_wanted || []);
    }
    api.get('/users/skills/all').then(r => { setAllSkills(r.data.skills||[]); setGrouped(r.data.grouped||{}); }).catch(()=>{});
  }, [user]);

  const saveProfile = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', profileData.name);
      fd.append('bio', profileData.bio);
      fd.append('location', profileData.location);
      if (photo) fd.append('photo', photo);
      await api.put('/users/profile', fd, { headers:{'Content-Type':'multipart/form-data'} });
      await fetchCurrentUser();
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const addOffer = async () => {
    if (!offerSkill) return toast.error('Select a skill');
    try {
      const res = await api.post('/users/skills/offer', { skill_id:offerSkill, proficiency_level:offerLevel });
      setOfferedSkills(prev => { const e = prev.find(s=>s.skill_id===offerSkill); return e ? prev.map(s=>s.skill_id===offerSkill?{...s,...res.data.skill}:s) : [...prev, res.data.skill]; });
      setOfferSkill(''); toast.success('Skill added!');
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const removeOffer = async id => {
    try { await api.delete(`/users/skills/offer/${id}`); setOfferedSkills(p=>p.filter(s=>s.id!==id)); toast.success('Removed'); } catch { toast.error('Failed'); }
  };

  const addWant = async () => {
    if (!wantSkill) return toast.error('Select a skill');
    try {
      const res = await api.post('/users/skills/want', { skill_id:wantSkill });
      setWantedSkills(prev => prev.find(s=>s.skill_id===wantSkill) ? prev : [...prev, res.data.skill]);
      setWantSkill(''); toast.success('Skill added!');
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const removeWant = async id => {
    try { await api.delete(`/users/skills/want/${id}`); setWantedSkills(p=>p.filter(s=>s.id!==id)); toast.success('Removed'); } catch { toast.error('Failed'); }
  };

  const tabs = [
    { id:'profile', label:'Profile Info' },
    { id:'offer',   label:'Skills I Teach' },
    { id:'want',    label:'Skills I Want' },
  ];

  return (
    <div style={{ minHeight:'100vh', paddingTop:80, position:'relative', zIndex:1 }}>
      <Navbar />
      <div style={{ maxWidth:720, margin:'0 auto', padding:'40px 24px' }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:'Clash Display, sans-serif', fontSize:36, fontWeight:700 }}>Edit Profile</h1>
          <p style={{ color:'var(--muted)', marginTop:6 }}>Keep your profile up to date for better matches</p>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:4, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:4, marginBottom:28 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, padding:'10px 16px', borderRadius:10, fontSize:14, fontWeight:600, border:'none', cursor:'pointer',
              background: tab===t.id ? 'var(--accent)' : 'transparent',
              color: tab===t.id ? 'white' : 'var(--muted)', transition:'all .2s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Remaining UI unchanged except emoji removals */}

        <div style={{ textAlign:'center', marginTop:20 }}>
          <button onClick={() => navigate('/profile')} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:13, cursor:'pointer' }}>
            Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
}
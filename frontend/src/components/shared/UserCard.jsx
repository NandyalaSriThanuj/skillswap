// src/components/shared/UserCard.jsx — dark barter theme
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, LevelBadge, SkillChip, Stars, BtnPrimary, BtnGhost } from './UI';

const UserCard = ({ user, onConnect }) => (
  <div
    style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 16, overflow: 'hidden', transition: 'all .2s',
    }}
    onMouseOver={e => {
      e.currentTarget.style.borderColor = 'var(--accent)';
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(108,99,255,.15)';
    }}
    onMouseOut={e => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '';
    }}
  >
    {/* Card top */}
    <div style={{ background: 'linear-gradient(135deg,rgba(108,99,255,.1),rgba(255,107,107,.06))', padding: '20px 20px 14px' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <Avatar name={user.name} photo={user.profile_photo} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 18 }}>{user.name}</div>
          {user.location && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{user.location}</div>}
          <div style={{ marginTop: 4 }}>
            <Stars rating={parseFloat(user.rating) || 0} size={13} />
            {user.rating_count > 0 && <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 4 }}>({user.rating_count})</span>}
          </div>
        </div>
      </div>
      {user.bio && (
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 10, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {user.bio}
        </p>
      )}
    </div>

    {/* Skills */}
    <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
      {user.skills_offered?.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Can Teach</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {user.skills_offered.slice(0, 4).map((s, i) => <SkillChip key={i} selected>{s.skill_name}</SkillChip>)}
            {user.skills_offered.length > 4 && <span style={{ color: 'var(--muted)', fontSize: 11, alignSelf: 'center' }}>+{user.skills_offered.length - 4}</span>}
          </div>
        </div>
      )}
      {user.skills_wanted?.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Wants to Learn</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {user.skills_wanted.slice(0, 3).map((s, i) => <SkillChip key={i}>{s.skill_name}</SkillChip>)}
          </div>
        </div>
      )}
    </div>

    {/* Actions */}
    <div style={{ padding: '10px 20px 16px', display: 'flex', gap: 8 }}>
      <Link to={`/users/${user.id}`} style={{ flex: 1, textDecoration: 'none' }}>
        <BtnGhost style={{ width: '100%', padding: '8px 12px', fontSize: 12 }}>View Profile</BtnGhost>
      </Link>
      {onConnect && (
        <BtnPrimary onClick={() => onConnect(user)} style={{ flex: 1, padding: '8px 12px', fontSize: 12 }}>
          Connect
        </BtnPrimary>
      )}
    </div>
  </div>
);

export default UserCard;
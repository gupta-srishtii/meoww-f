import {useDialog} from '../../components/common/useDialog';
import {useCompanionStore} from '../../store/useCompanionStore';
import React, { useState, useEffect, useRef } from 'react';
import { Users, Heart, Sparkles, MessageCircle, Share2, Shield, Calendar, UserCheck, Star, Clock, Lock, Check } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { services } from '../../services';
import { CirclePost, CircleGroup, PsychologistProfile, ReactionType, FriendProfile, CircleChallenge } from '../../types/community';

export const CircleView: React.FC = () => {
  const [posts, setPosts] = useState<CirclePost[]>([]);
  const [circles, setCircles] = useState<CircleGroup[]>([]);
  const [psychologists, setPsychologists] = useState<PsychologistProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'circles' | 'psychologists' | 'friends' | 'challenges'>('feed');

  const [friends,setFriends]=useState<FriendProfile[]>([]),[challenges,setChallenges]=useState<CircleChallenge[]>([]),[selectedProfile,setSelectedProfile]=useState<FriendProfile|null>(null),[query,setQuery]=useState(''),[commentDrafts,setCommentDrafts]=useState<Record<string,string>>({}),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
  const profileDialog=useDialog(!!selectedProfile,()=>setSelectedProfile(null));
  // New Post Form
  const [newContent, setNewContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Booking Modal
  const [selectedPsy, setSelectedPsy] = useState<PsychologistProfile | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError,setBookingError]=useState('');const mutationPending=useRef(false),bookingEpoch=useRef(0);

  const bookingDialog=useDialog(!!selectedPsy,()=>setSelectedPsy(null));
  useEffect(() => {
    const failed=()=>setNotice('Some local community data could not load. Check browser storage and try again.');
    services.community.getFriends().then(setFriends).catch(failed);services.community.getChallenges().then(setChallenges).catch(failed);
    services.community.getPosts().then(setPosts).catch(failed);
    services.community.getCircles().then(setCircles).catch(failed);
    services.community.getPsychologists().then(setPsychologists).catch(failed);
  }, []);
  useEffect(()=>{bookingEpoch.current++;setBookingSuccess(null);setBookingError('');},[selectedPsy?.id]);
  const mutate=async(action:()=>Promise<void>,onError?:(error:unknown)=>void)=>{if(mutationPending.current)return;mutationPending.current=true;setBusy(true);try{await action();}catch(error){if(onError)onError(error);else setNotice('Could not save this change. Your input is still here; check browser storage and try again.');}finally{mutationPending.current=false;setBusy(false);}};

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    await mutate(async()=>{const post = await services.community.createPost(newContent, ['sanctuary'], isAnonymous);
    setPosts((prev) => [post, ...prev]);
    setNewContent('');setNotice('Your post is saved in this browser.');});
  };

  const handleReact = async (postId: string, type: ReactionType) => {
    await mutate(async()=>{const updated = await services.community.reactToPost(postId, type);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    setNotice(updated.userReaction?'Your reaction is saved.':'Your reaction was removed.');});
  };

  const handleBook = async (slot: string) => {
    if (!selectedPsy) return;
    const epoch=bookingEpoch.current,profile=selectedPsy;setBookingError('');
    await mutate(async()=>{const res=await services.community.bookSession(profile.id,slot);const fresh=await services.community.getPsychologists();setPsychologists(fresh);if(epoch!==bookingEpoch.current)return;if(res.success){setBookingSuccess('Demo reservation saved for '+profile.name+' / '+slot+'. No real appointment was created.');setSelectedPsy(fresh.find(item=>item.id===profile.id)||profile);}},error=>{if(epoch===bookingEpoch.current)setBookingError(error instanceof Error?error.message:'Could not save this demo reservation.');});

  };

  const toggleCircle=async(id:string)=>mutate(async()=>{const group=await services.community.toggleCircle(id);setCircles(a=>a.map(c=>c.id===id?group:c));setNotice(group.isJoined?'Joined this demo circle.':'Left this demo circle.');});
  const toggleFriend=async(id:string)=>mutate(async()=>{const friend=await services.community.toggleFriend(id);setFriends(items=>items.map(item=>item.id===id?friend:item));setNotice(friend.isFriend?'Demo connection saved.':'Demo connection removed.');});
  const updateChallenge=async(id:string,action:'join'|'progress')=>mutate(async()=>{const challenge=await services.community.updateChallenge(id,action);setChallenges(items=>items.map(item=>item.id===id?challenge:item));setNotice(action==='join'?(challenge.joined?'Joined this gentle challenge.':'Left this challenge. Your logged moments are kept.'):'Your moment is saved.');if(action==='progress'&&challenge.progress===challenge.goal)useCompanionStore.getState().celebrate();});
  const addComment=async(postId:string)=>{if(!commentDrafts[postId]?.trim())return;await mutate(async()=>{await services.community.addComment(postId,commentDrafts[postId]);setPosts(await services.community.getPosts());setCommentDrafts(drafts=>({...drafts,[postId]:''}));setNotice('Comment saved in this browser.');});};
  const visibleFriends=friends.filter(friend=>(friend.name+' '+friend.maitriId+' '+friend.interests.join(' ')).toLowerCase().includes(query.toLowerCase()));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Human Sanctuary
            </span>
            <span className="badge-demo">Demo Community</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>Maitri Circle</h1>
          <p style={{ fontSize: '13px', color: 'var(--theme-text-muted)' }}>
            Supportive peer reflections, topic circles, and a fictional practitioner directory.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`btn ${activeTab === 'feed' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px' }}
            onClick={() => setActiveTab('feed')}
          >
            Community Feed
          </button>
          <button
            className={`btn ${activeTab === 'circles' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px' }}
            onClick={() => setActiveTab('circles')}
          >
            Topic Circles
          </button>
          <button
            className={`btn ${activeTab === 'psychologists' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', borderColor: 'var(--status-vital)' }}
            onClick={() => setActiveTab('psychologists')}
          >
            Talk to a Psychologist
          </button>
        </div>
      </div>

      <p className="feature-notice" role="status">{notice}</p>
      <div className="community-extras"><button className={activeTab==='friends'?'btn btn-primary':'btn btn-secondary'} onClick={()=>setActiveTab('friends')}>Find your people</button><button className={activeTab==='challenges'?'btn btn-primary':'btn btn-secondary'} onClick={()=>setActiveTab('challenges')}>Gentle challenges</button><span>Local demo community / fictional profiles</span></div>
      {/* =========================================================================
          TAB 1: COMMUNITY FEED
          ========================================================================= */}
      {activeTab === 'feed' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Create Post Card */}
            <GlassCard>
              <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea
                  className="input-field"
                  aria-label="Share a thought with the demo Circle" maxLength={4000}
                  rows={3}
                  placeholder="Share a thoughtful milestone, posture breakthrough, or mindful reflection with the circle…"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  style={{ resize: 'none' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: 'var(--theme-text-muted)' }}>
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Post Anonymously (Mask Display Name & Handle)</span>
                  </label>

                  <button type="submit" className="btn btn-primary" disabled={busy||!newContent.trim()}>
                    Share with Circle
                  </button>
                </div>
              </form>
            </GlassCard>

            {/* Posts List */}
            {posts.map((post) => (
              <GlassCard key={post.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Author Info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: post.isAnonymous ? 'var(--surface-veil)' : 'var(--action)',
                        border: '1px solid var(--hairline)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: post.isAnonymous ? 'var(--theme-text-muted)' : 'var(--action-text)',
                        fontWeight: 800,
                        fontSize: '12px',
                      }}
                    >
                      {post.isAnonymous ? <Lock size={14} /> : post.authorName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{post.authorName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                        {post.authorHandle} · {post.createdAt}
                      </div>
                    </div>
                  </div>

                  <span className="glass-pill" style={{ fontSize: '10px' }}>
                    {post.tags[0] || 'Sanctuary'}
                  </span>
                </div>

                {/* Content */}
                <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--theme-text-main)' }}>
                  {post.content}
                </p>

                {/* Reaction Actions */}
                <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    className="glass-pill"
                    style={{
                      cursor: 'pointer',
                      background: post.userReaction === 'support' ? 'rgba(52, 211, 153, 0.2)' : undefined,
                      borderColor: post.userReaction === 'support' ? 'var(--status-vital)' : undefined,
                    }}
                    disabled={busy} aria-pressed={post.userReaction==='support'} onClick={() => handleReact(post.id, 'support')}
                  >
                    <span>🌱 Support ({post.reactions.support})</span>
                  </button>

                  <button
                    className="glass-pill"
                    style={{
                      cursor: 'pointer',
                      background: post.userReaction === 'relate' ? 'rgba(250, 204, 21, 0.2)' : undefined,
                      borderColor: post.userReaction === 'relate' ? 'var(--companion-gold)' : undefined,
                    }}
                    disabled={busy} aria-pressed={post.userReaction==='relate'} onClick={() => handleReact(post.id, 'relate')}
                  >
                    <span>🤝 Relate ({post.reactions.relate})</span>
                  </button>

                  <button
                    className="glass-pill"
                    style={{
                      cursor: 'pointer',
                      background: post.userReaction === 'celebrate' ? 'rgba(192, 132, 252, 0.2)' : undefined,
                      borderColor: post.userReaction === 'celebrate' ? '#c084fc' : undefined,
                    }}
                    disabled={busy} aria-pressed={post.userReaction==='celebrate'} onClick={() => handleReact(post.id, 'celebrate')}
                  >
                    <span>✨ Celebrate ({post.reactions.celebrate})</span>
                  </button>
                </div>

                <form className="comment-composer" onSubmit={event=>{event.preventDefault();void addComment(post.id);}}><input className="input-field" aria-label={'Comment on post by '+post.authorName} maxLength={1000} placeholder="Leave a kind thought..." value={commentDrafts[post.id]||''} onChange={event=>setCommentDrafts(drafts=>({...drafts,[post.id]:event.target.value}))}/><button className="btn btn-secondary" disabled={busy||!commentDrafts[post.id]?.trim()}>Reply</button></form>
                {/* Comments preview */}
                {post.comments.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {post.comments.map((c) => (
                      <div key={c.id} style={{ fontSize: '11px', background: 'var(--surface-veil)', padding: '6px 10px', borderRadius: '6px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--theme-text-main)' }}>{c.authorName}: </span>
                        <span style={{ color: 'var(--theme-text-muted)' }}>{c.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            ))}
          </div>

          {/* Right Column: Community Guidelines & Circles Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <GlassCard>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Maitri Sanctuary Guidelines</h4>
              <p style={{ fontSize: '12px', color: 'var(--theme-text-muted)', lineHeight: 1.5, marginBottom: '10px' }}>
                This is a quiet, non-judgmental space for somatic recovery and mindful pacing.
              </p>
              <ul style={{ fontSize: '11px', color: 'var(--theme-text-muted)', paddingLeft: '16px', lineHeight: 1.6 }}>
                <li>No toxic productivity or hustle posturing</li>
                <li>Anonymous posts are fully respected</li>
                <li>This demo feed is not monitored or connected to emergency support</li>
              </ul>
            </GlassCard>

            <GlassCard>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>Featured Circles</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {circles.map((c) => (
                  <div key={c.id} style={{ padding: '8px 10px', borderRadius: '6px', background: 'var(--surface-veil)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '12px' }}>{c.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--theme-text-muted)' }}>{c.membersCount} members</div>
                    </div>
                    <button className="glass-pill" disabled={busy} onClick={()=>toggleCircle(c.id)} aria-pressed={!!c.isJoined}>{c.isJoined?'Joined':'Join'}</button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TOPIC CIRCLES
          ========================================================================= */}
      {activeTab === 'circles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {circles.map((group) => (
            <GlassCard key={group.id} hoverEffect style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <Users size={18} style={{ color: 'var(--accent-text)' }} />
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                    {group.membersCount} members
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{group.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--theme-text-muted)', margin: '8px 0 14px', lineHeight: 1.5 }}>
                  {group.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {group.tags.map((t) => (
                    <span key={t} className="glass-pill" style={{ fontSize: '10px' }}>#{t}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '18px', borderTop: '1px solid var(--hairline)', paddingTop: '12px' }}>
                <button className="btn btn-secondary" disabled={busy} aria-pressed={!!group.isJoined} onClick={()=>toggleCircle(group.id)} style={{ width: '100%', fontSize: '12px' }}>
                  {group.isJoined ? 'Leave Circle' : 'Join Circle'}
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* =========================================================================
          TAB 3: PSYCHOLOGIST DIRECTORY ("Talk to Someone")
          ========================================================================= */}
      {activeTab === 'psychologists' && (
        <div>
          <div style={{ marginBottom: '18px', padding: '14px 20px', borderRadius: 'var(--radius-lg)', background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCheck size={18} style={{ color: 'var(--status-vital)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>Explore the practitioner directory</div>
                <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                  Fictional practitioner profiles. Credentials and availability are sample data.
                </div>
              </div>
            </div>
            <span className="badge-demo">Demo directory</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {psychologists.map((psy) => (
              <GlassCard key={psy.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{psy.name}</h3>
                      <div style={{ fontSize: '12px', color: 'var(--companion-gold-bright)', fontWeight: 600 }}>{psy.title}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--status-vital)', fontSize: '12px', fontWeight: 700 }}>
                      <Star size={13} fill="var(--status-vital)" />
                      <span>{psy.rating}</span>
                    </div>
                  </div>

                  <div className="mono" style={{ fontSize: '10px', color: 'var(--theme-text-muted)', marginBottom: '10px' }}>
                    {psy.credentials} · Tier: {psy.verificationLevel}
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--theme-text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
                    {psy.bio}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                    {psy.specialties.map((s) => (
                      <span key={s} className="glass-pill" style={{ fontSize: '10px' }}>{s}</span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: '12px' }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '12px' }}
                    onClick={() => setSelectedPsy(psy)}
                  >
                    <Calendar size={13} />
                    <span>Book Session (Demo)</span>
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Booking Modal */}
          {selectedPsy && (
            <div className="modal-backdrop" onClick={() => setSelectedPsy(null)}>
              <div ref={bookingDialog} role="dialog" aria-modal="true" aria-label="Demo appointment slots" className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)', background: 'var(--surface-veil)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Book Session with {selectedPsy.name}</h3>
                  <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>Select an available consultation slot</div>
                </div>

                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {bookingError&&<p role="alert" style={{color:'var(--status-alert)',fontSize:13}}>{bookingError}</p>}
                  {!selectedPsy.availableSlots.length&&<p>No sample slots remain for this profile in this browser.</p>}
                  {selectedPsy.availableSlots.map((slot) => (
                    <button
                      key={slot}
                      className="btn btn-secondary"
                      style={{ justifyContent: 'space-between', padding: '12px 16px' }}
                      disabled={busy} onClick={() => handleBook(slot)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} style={{ color: 'var(--companion-gold)' }} />
                        <span>{slot}</span>
                      </div>
                      <span className="badge-demo">Available</span>
                    </button>
                  ))}

                  {bookingSuccess && (
                    <div role="status" style={{ padding: '12px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid var(--status-vital)', color: 'var(--status-vital)', fontSize: '12px', textAlign: 'center' }}>
                      {bookingSuccess}
                    </div>
                  )}
                </div>

                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--hairline)', display: 'flex', justifyContent: 'flex-end', background: 'var(--surface-veil)' }}>
                  <button className="btn btn-secondary" onClick={() => setSelectedPsy(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab==='friends'&&<section className="friends-section"><div className="section-heading"><h2>A circle of familiar faces</h2><input className="input-field friend-search" aria-label="Search people by name or MAITRI ID" placeholder="Name, interest or MAITRI ID" value={query} onChange={event=>setQuery(event.target.value)}/></div>
       {!visibleFriends.length&&<p role="status">No demo profiles match this search. Try a name, interest or MAITRI ID.</p>}
       <div className="people-grid">{visibleFriends.map(friend=><article key={friend.id} className="person-card"><span className="profile-initial">{friend.name[0]}</span><h3>{friend.name}</h3><small>MAITRI ID / {friend.maitriId}</small><p>{friend.bio}</p><button className="text-button" onClick={()=>setSelectedProfile(friend)}>View profile</button><button className="btn btn-secondary" disabled={busy} aria-pressed={friend.isFriend} onClick={()=>toggleFriend(friend.id)}>{friend.isFriend?'Remove connection':'Add connection'}</button></article>)}</div></section>}
      {activeTab==='challenges'&&<section className="people-grid">{challenges.map(challenge=><article key={challenge.id} className="challenge-card"><span className="eyebrow">AT YOUR OWN PACE</span><h2>{challenge.title}</h2><p>{challenge.description}</p><progress value={challenge.progress} max={challenge.goal} aria-label={challenge.title}/><p>{challenge.progress} / {challenge.goal} moments logged</p><button className="btn btn-secondary" disabled={busy} aria-pressed={challenge.joined} onClick={()=>updateChallenge(challenge.id,'join')}>{challenge.joined?'Leave challenge':'Join challenge'}</button>{challenge.joined&&<button className="btn btn-primary" disabled={busy||challenge.progress>=challenge.goal} onClick={()=>updateChallenge(challenge.id,'progress')}>{challenge.progress>=challenge.goal?'Completed with kindness':'Log a moment'}</button>}</article>)}</section>}
      {selectedProfile&&<div className="modal-backdrop" onClick={()=>setSelectedProfile(null)}><div ref={profileDialog} role="dialog" aria-modal="true" aria-label="Community profile" className="modal-dialog profile-dialog" onClick={e=>e.stopPropagation()}><span className="eyebrow">DEMO PROFILE</span><h2>{selectedProfile.name}</h2><p>MAITRI ID / {selectedProfile.maitriId}</p><p>{selectedProfile.bio}</p><div>{selectedProfile.interests.map(i=><span key={i} className="glass-pill">{i}</span>)}</div><p>Only a public bio and interests are shared. Personal check-ins, journal entries and health data stay private.</p><button className="btn btn-secondary" onClick={()=>setSelectedProfile(null)}>Close profile</button></div></div>}
    </div>
  );
};

'use client';
import {useEffect,useMemo,useState} from 'react';
import {Plus,Search,X,UserRound,Pencil,Trash2,CheckCircle2} from 'lucide-react';
import {Shell,PageHeader} from '../components';
import {api} from '../lib/api';
const EMPTY={name:'',email:'',phone:''};
export default function Guests(){
  const [rows,setRows]=useState([]),[q,setQ]=useState(''),[open,setOpen]=useState(false),[editing,setEditing]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[form,setForm]=useState(EMPTY);
  const load=()=>api('/guests').then(setRows).catch(e=>setError(e.message));
  useEffect(()=>{load();if(new URLSearchParams(location.search).get('new'))startNew()},[]);
  const filtered=useMemo(()=>rows.filter(g=>`${g.name} ${g.email} ${g.phone}`.toLowerCase().includes(q.toLowerCase())),[rows,q]);
  function startNew(){setEditing(null);setForm(EMPTY);setError('');setOpen(true)}
  function startEdit(g){setEditing(g);setForm({name:g.name,email:g.email,phone:g.phone||''});setError('');setOpen(true)}
  async function submit(e){e.preventDefault();setBusy(true);setError('');setNotice('');try{if(editing){await api(`/guests/${editing.id}`,{method:'PUT',body:JSON.stringify(form)});setNotice('Guest details updated.')}else{await api('/guests',{method:'POST',body:JSON.stringify(form)});setNotice('Guest added and saved in this browser.')}setOpen(false);setEditing(null);setForm(EMPTY);await load()}catch(e){setError(e.message)}finally{setBusy(false)}}
  async function remove(g){if(!window.confirm(`Delete ${g.name}? Guests with reservation or invoice history cannot be deleted.`))return;setError('');setNotice('');try{await api(`/guests/${g.id}`,{method:'DELETE'});setNotice(`${g.name} deleted.`);await load()}catch(e){setError(e.message)}}
  return <Shell active="Guests"><PageHeader eyebrow="RELATIONSHIPS" title="Guests" description="Keep contact details accurate, search guest records, and edit them without losing booking history." action={<button className="primary" onClick={startNew}><Plus size={17}/> Add guest</button>}/>
    <div className="toolbar"><div className="search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, email or phone…"/></div><span className="muted">{filtered.length} guests</span></div>
    {error&&<div className="error banner" role="alert">{error}</div>}{notice&&<div className="success banner" role="status"><CheckCircle2 size={15}/>{notice}</div>}
    <div className="guest-grid">{filtered.map(g=><div className="guest-card" key={g.id}><div className="guest-avatar"><UserRound size={22}/></div><div className="guest-main"><h3>{g.name}</h3><span>{g.email}</span><span>{g.phone||'No phone number'}</span><div><b>{g.stays||0} stays</b><em>{g.tier||'STANDARD'}</em></div><div className="card-actions"><button className="secondary compact" onClick={()=>startEdit(g)}><Pencil size={13}/> Edit</button><button className="secondary compact" onClick={()=>remove(g)}><Trash2 size={13}/> Delete</button></div></div></div>)}</div>
    {!filtered.length&&<div className="card empty-state">No guests match your search. Add a guest to begin.</div>}
    {open&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setOpen(false)}}><div className="modal"><div className="modal-head"><h2>{editing?'Edit guest':'Add guest'}</h2><button className="icon-btn" onClick={()=>setOpen(false)} aria-label="Close"><X size={17}/></button></div>{error&&<div className="error banner">{error}</div>}<form className="modal-form" onSubmit={submit}><label>Full name<input required minLength={2} maxLength={80} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} autoFocus/></label><label>Email<input required type="email" maxLength={120} value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Phone<input type="tel" maxLength={24} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><p className="form-hint">Guest data is saved in this browser. Historical reservation and invoice links are preserved when editing.</p><button disabled={busy} className="primary full">{busy?'Saving…':editing?'Save changes':'Save guest'}</button></form></div></div>}
  </Shell>
}

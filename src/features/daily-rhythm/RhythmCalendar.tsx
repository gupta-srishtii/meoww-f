import React,{useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import {MoodCheckIn,JournalEntry} from '../../types/rhythm';
export const localDateKey=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');

export function RhythmCalendar({moods,journals,selected,onSelect}:{moods:MoodCheckIn[];journals:JournalEntry[];selected:string|null;onSelect:(value:string|null)=>void}){
  const [month,setMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1));
  const offset=(month.getDay()+6)%7,days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const shift=(step:number)=>setMonth(new Date(month.getFullYear(),month.getMonth()+step,1));
  return <section className="rhythm-calendar"><header><div><span className="eyebrow">A NOTEBOOK OF MOMENTS</span><h2>{month.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</h2></div><div><button className="btn btn-icon btn-secondary" aria-label="Previous month" onClick={()=>shift(-1)}><ChevronLeft size={18}/></button><button className="btn btn-icon btn-secondary" aria-label="Next month" onClick={()=>shift(1)}><ChevronRight size={18}/></button></div></header>
    <div className="calendar-grid">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=><span key={day} className="calendar-day">{day}</span>)}{Array.from({length:offset},(_,i)=><span key={'blank'+i}/>)}{Array.from({length:days},(_,i)=>{
      const key=localDateKey(new Date(month.getFullYear(),month.getMonth(),i+1));
      const checkins=moods.filter(m=>m.localDate===key),entries=journals.filter(j=>localDateKey(new Date(j.createdAt))===key);
      return <button key={key} className={selected===key?'selected':''} aria-pressed={selected===key} aria-label={key+', '+checkins.length+' check-ins, '+entries.length+' reflections'} onClick={()=>onSelect(key)}><span>{i+1}</span><span className="calendar-dots" aria-hidden="true">{checkins.length>0&&<i/>}{entries.length>0&&<i className="journal-dot"/>}</span></button>;
    })}</div><footer><p>Dots mark saved moments. Existing sample entries are demo data.</p><button className="text-button" onClick={()=>onSelect(null)}>Show all dates</button></footer>
  </section>;
}

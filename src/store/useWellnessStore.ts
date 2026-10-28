import {create} from 'zustand';
import {persist} from 'zustand/middleware';

export type ActivityKind = 'breath' | 'meditation' | 'focus' | 'yoga' | 'habit' | 'journal' | 'mood';
export interface WellnessActivity {id:string; kind:ActivityKind; title:string; createdAt:string; durationSeconds?:number;}
interface WellnessState {
  activities:WellnessActivity[];
  record:(kind:ActivityKind,title:string,durationSeconds?:number,id?:string)=>void;
}
export const useWellnessStore = create<WellnessState>()(persist((set,get)=>({
  activities:[],
  record:(kind,title,durationSeconds,id=crypto.randomUUID())=>{
    if(get().activities.some(a=>a.id===id))return;
    set({activities:[{id,kind,title,createdAt:new Date().toISOString(),durationSeconds},...get().activities].slice(0,300)});
  },
}),{name:'maitri_wellness_journey'}));

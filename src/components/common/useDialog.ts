import {useEffect, useRef} from 'react';

/** Focus containment, Escape and focus restoration for app dialogs. */
export function useDialog(open:boolean, close:()=>void) {
  const ref=useRef<HTMLDivElement>(null);
  const closeRef=useRef(close);closeRef.current=close;
  useEffect(()=>{
    if(!open)return;
    const previous=document.activeElement as HTMLElement|null;
    const root=ref.current;if(!root)return;
    root.setAttribute('tabindex','-1');root.focus();
    const onKey=(event:KeyboardEvent)=>{
      const dialogs=document.querySelectorAll('[role="dialog"]');
      if(dialogs[dialogs.length-1]!==root)return;
      if(event.key==='Escape'){event.preventDefault();closeRef.current();}
      if(event.key==='Tab'){
        const nodes=Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]')).filter(n=>n.getClientRects().length>0&&!n.closest('[inert],[aria-hidden="true"]'));
        if(!nodes.length){event.preventDefault();return;}
        if(event.shiftKey&&(document.activeElement===nodes[0]||document.activeElement===root)){event.preventDefault();nodes[nodes.length-1].focus();}
        else if(!event.shiftKey&&(document.activeElement===nodes[nodes.length-1]||document.activeElement===root)){event.preventDefault();nodes[0].focus();}
      }
    };
    document.addEventListener('keydown',onKey);
    return()=>{document.removeEventListener('keydown',onKey);if(previous?.isConnected)previous.focus();};
  },[open]);
  return ref;
}

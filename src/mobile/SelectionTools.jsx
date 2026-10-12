import React,{useState} from 'react';
import {rememberSelection} from '../vault/integrated-actions.js';
export default function SelectionTools({entry,selection,onSelect,change,busy}) {
 const [date,setDate]=useState(selection.date),[time,setTime]=useState(`${String(selection.hour).padStart(2,'0')}:${String(selection.minute).padStart(2,'0')}`);
 return <form className="integration-selection" onSubmit={async e=>{e.preventDefault();const [hour,minute]=time.split(':').map(Number),next={entryId:entry.id,date,hour,minute};if(await change(s=>rememberSelection(s,next),'운 선택을 저장했습니다.'))onSelect(next);}}><div className="integration-grid2"><label>선택일<input type="date" aria-label="운 선택일" required min="1900-01-01" max="2050-12-31" value={date} onChange={e=>setDate(e.target.value)}/></label><label>선택시각<input type="time" aria-label="운 선택시각" required value={time} onChange={e=>setTime(e.target.value)}/></label></div><button type="submit" disabled={busy} className="rr-primary-action">일·시운 적용 및 저장</button></form>;
}

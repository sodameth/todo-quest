import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════ DATA ═══════════════════════════════ */
const DIFFICULTY = {
  easy: { label: "쉬움", xp: 20, color: "#4ade80", emoji: "⭐", heal: 15 },
  medium: { label: "보통", xp: 50, color: "#facc15", emoji: "⭐⭐", heal: 30 },
  hard: { label: "어려움", xp: 100, color: "#f87171", emoji: "⭐⭐⭐", heal: 50 },
};
const LEVEL_XP = (lv) => lv * 80 + 40;
const DRAGON_STAGES = [
  { name:"아기 드래곤",hp:100,atk:5,desc:"작지만 불꽃을 뿜는다!",color:"#6ee7b7",bodyColor:"#34d399",eyeColor:"#fbbf24",wingColor:"#6ee7b7",size:0.55 },
  { name:"청년 드래곤",hp:250,atk:12,desc:"날개가 자라기 시작했다.",color:"#60a5fa",bodyColor:"#3b82f6",eyeColor:"#f87171",wingColor:"#93c5fd",size:0.7 },
  { name:"성체 드래곤",hp:500,atk:25,desc:"하늘을 뒤덮는 거대한 존재.",color:"#f87171",bodyColor:"#ef4444",eyeColor:"#fbbf24",wingColor:"#fca5a5",size:0.85 },
  { name:"고대 드래곤",hp:1000,atk:40,desc:"전설 속의 최종 보스.",color:"#a78bfa",bodyColor:"#7c3aed",eyeColor:"#f87171",wingColor:"#c4b5fd",size:0.95 },
  { name:"어둠의 드래곤왕",hp:2000,atk:70,desc:"세계를 멸망시키려 한다!",color:"#f59e0b",bodyColor:"#1a1a2e",eyeColor:"#ef4444",wingColor:"#374151",size:1.0 },
];
const HERO_TITLES = ["초보 모험가","견습 전사","숙련된 검사","정예 기사","영웅","전설의 용사","신화의 전사","드래곤 슬레이어","세계의 수호자","불멸의 영웅"];
function getHeroTitle(lv){return HERO_TITLES[Math.min(Math.floor((lv-1)/3),HERO_TITLES.length-1)]}
function getHeroStats(lv){return{maxHp:80+lv*20,atk:8+lv*4,def:3+lv*2}}
function getHeroTier(lv){if(lv<=2)return 0;if(lv<=5)return 1;if(lv<=9)return 2;if(lv<=15)return 3;return 4}
const HERO_TIERS = [
  {armor:"#8B7355",weapon:"#999",cape:null,aura:null,helmet:false,shield:false,label:"천옷"},
  {armor:"#6B8E6B",weapon:"#B8B8B8",cape:"#5C7A5C",aura:null,helmet:false,shield:true,label:"가죽"},
  {armor:"#4682B4",weapon:"#E8E8E8",cape:"#1E3A5F",aura:null,helmet:true,shield:true,label:"강철"},
  {armor:"#DAA520",weapon:"#FFD700",cape:"#8B0000",aura:"#FFD70044",helmet:true,shield:true,label:"황금"},
  {armor:"#E8E8FF",weapon:"#FF6B6B",cape:"#6B0099",aura:"#E8E8FF55",helmet:true,shield:true,label:"전설"},
];
const DEADLINE_PRESETS = [{label:"30분",min:30},{label:"1시간",min:60},{label:"2시간",min:120},{label:"3시간",min:180},{label:"6시간",min:360},{label:"12시간",min:720},{label:"24시간",min:1440}];
const CAT_COLORS = ["#60a5fa","#a78bfa","#4ade80","#fbbf24","#f87171","#f97316","#ec4899","#14b8a6","#e879f9","#84cc16"];
const CAT_EMOJIS = ["📌","💼","📚","💪","🏠","🎨","🎵","🍽️","🛒","🏃","💻","✈️","🎯","🔧","📱","🌱","🐾","❤️","🧹","💰"];
function formatCountdown(ms){if(ms<=0)return null;const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;if(h>0)return`${h}시간 ${m}분 ${sec}초`;if(m>0)return`${m}분 ${sec}초`;return`${sec}초`}

/* ─── SKILLS ─── */
const SKILLS = [
  {id:"heal",name:"치유",desc:"HP 25% 회복",emoji:"💚",unlock:2,cooldown:3,color:"#4ade80"},
  {id:"crit",name:"치명타",desc:"다음 공격 2.5배",emoji:"⚡",unlock:4,cooldown:4,color:"#fbbf24"},
  {id:"shield",name:"방어막",desc:"다음 피격 데미지 80% 감소",emoji:"🛡️",unlock:6,cooldown:5,color:"#60a5fa"},
  {id:"fury",name:"분노",desc:"3턴간 공격력 2배",emoji:"🔥",unlock:9,cooldown:6,color:"#ef4444"},
];

/* ─── ITEMS ─── */
const ITEM_POOL = [
  {id:"potion_s",name:"작은 포션",desc:"HP 30 회복",emoji:"🧪",type:"consumable",rarity:"common",effect:{heal:30}},
  {id:"potion_m",name:"중간 포션",desc:"HP 80 회복",emoji:"🧴",type:"consumable",rarity:"uncommon",effect:{heal:80}},
  {id:"potion_l",name:"큰 포션",desc:"HP 200 회복",emoji:"⚗️",type:"consumable",rarity:"rare",effect:{heal:200}},
  {id:"sword_1",name:"날카로운 검",desc:"공격력 +5",emoji:"🗡️",type:"equip_atk",rarity:"common",effect:{atk:5}},
  {id:"sword_2",name:"마법검",desc:"공격력 +12",emoji:"⚔️",type:"equip_atk",rarity:"uncommon",effect:{atk:12}},
  {id:"sword_3",name:"용살검",desc:"공격력 +25",emoji:"🔱",type:"equip_atk",rarity:"rare",effect:{atk:25}},
  {id:"shield_1",name:"나무 방패",desc:"방어력 +3",emoji:"🪵",type:"equip_def",rarity:"common",effect:{def:3}},
  {id:"shield_2",name:"강철 방패",desc:"방어력 +8",emoji:"🛡️",type:"equip_def",rarity:"uncommon",effect:{def:8}},
  {id:"shield_3",name:"드래곤 방패",desc:"방어력 +18",emoji:"🔰",type:"equip_def",rarity:"rare",effect:{def:18}},
  {id:"xp_book",name:"경험의 서",desc:"XP 50 즉시 획득",emoji:"📖",type:"consumable",rarity:"uncommon",effect:{xp:50}},
];
const RARITY_COLOR = {common:"#9ca3af",uncommon:"#60a5fa",rare:"#a78bfa",legendary:"#fbbf24"};
function rollLoot(stage){
  const count = 1 + (Math.random()<0.3?1:0);
  const items = [];
  for(let i=0;i<count;i++){
    const r = Math.random();
    const pool = r<0.15 ? ITEM_POOL.filter(x=>x.rarity==="rare") : r<0.45 ? ITEM_POOL.filter(x=>x.rarity==="uncommon") : ITEM_POOL.filter(x=>x.rarity==="common");
    items.push({...pool[Math.floor(Math.random()*pool.length)], uid: `loot_${Date.now()}_${Math.random().toString(36).slice(2,8)}_${i}`});
  }
  return items;
}

/* ─── ACHIEVEMENTS ─── */
const ACHIEVEMENTS = [
  {id:"first_quest",name:"첫 발걸음",desc:"첫 번째 퀘스트 완료",emoji:"🌱",check:(s)=>s.completedCount>=1},
  {id:"quest_10",name:"모험가",desc:"퀘스트 10개 완료",emoji:"📋",check:(s)=>s.completedCount>=10},
  {id:"quest_50",name:"퀘스트 마스터",desc:"퀘스트 50개 완료",emoji:"📜",check:(s)=>s.completedCount>=50},
  {id:"first_kill",name:"드래곤 헌터",desc:"첫 드래곤 처치",emoji:"🐉",check:(s)=>s.dragonsKilled>=1},
  {id:"kill_5",name:"드래곤 슬레이어",desc:"드래곤 5마리 처치",emoji:"🔥",check:(s)=>s.dragonsKilled>=5},
  {id:"combo_3",name:"연속 달성!",desc:"3 콤보 달성",emoji:"🔥",check:(s)=>s.maxCombo>=3},
  {id:"combo_10",name:"콤보 마스터",desc:"10 콤보 달성",emoji:"💥",check:(s)=>s.maxCombo>=10},
  {id:"level_5",name:"성장하는 전사",desc:"레벨 5 달성",emoji:"⬆️",check:(s)=>s.level>=5},
  {id:"level_10",name:"베테랑",desc:"레벨 10 달성",emoji:"🏅",check:(s)=>s.level>=10},
  {id:"ontime_5",name:"시간 엄수",desc:"시간 내 완료 5회",emoji:"⏰",check:(s)=>s.onTimeCount>=5},
  {id:"hard_3",name:"도전자",desc:"어려움 퀘스트 3개 완료",emoji:"💪",check:(s)=>s.hardCount>=3},
  {id:"daily_3",name:"일일 미션 수행자",desc:"일일 퀘스트 3회 완료",emoji:"🎯",check:(s)=>s.dailyCompleted>=3},
  {id:"pet_first",name:"동물 친구",desc:"첫 펫 획득",emoji:"🐾",check:(s)=>s.petCount>=1},
];

/* ─── PETS ─── */
const PET_POOL = [
  {id:"cat",name:"고양이",emoji:"🐱",skill:"치유의 야옹",desc:"매 턴 HP 5 회복",effect:{healPerTurn:5},color:"#fbbf24"},
  {id:"wolf",name:"늑대",emoji:"🐺",skill:"공격 지원",desc:"매 공격 시 추가 데미지 +8",effect:{bonusDmg:8},color:"#94a3b8"},
  {id:"owl",name:"올빼미",emoji:"🦉",skill:"지혜의 눈",desc:"XP 획득량 20% 증가",effect:{xpBonus:0.2},color:"#a78bfa"},
  {id:"phoenix",name:"불사조",emoji:"🐦‍🔥",skill:"부활의 불꽃",desc:"HP 0 시 1회 50%로 부활",effect:{revive:true},color:"#ef4444"},
  {id:"turtle",name:"거북이",emoji:"🐢",skill:"단단한 등껍질",desc:"받는 데미지 30% 감소",effect:{dmgReduce:0.3},color:"#4ade80"},
  {id:"dragon_baby",name:"아기 용",emoji:"🐲",skill:"용의 브레스",desc:"추가 데미지 +15 & HP 3 회복",effect:{bonusDmg:15,healPerTurn:3},color:"#f97316"},
];

/* ─── DAILY QUESTS ─── */
function generateDailyQuest(seed) {
  const quests = [
    {type:"complete_any",target:3,desc:"퀘스트 3개 완료하기",emoji:"📋",xp:60,label:"아무 퀘스트 3개"},
    {type:"complete_hard",target:1,desc:"어려움 퀘스트 1개 완료하기",emoji:"💪",xp:80,label:"어려움 1개"},
    {type:"complete_ontime",target:2,desc:"시간 내에 퀘스트 2개 완료하기",emoji:"⏰",xp:70,label:"제시간에 2개"},
    {type:"battle_win",target:1,desc:"전투에서 1회 승리하기",emoji:"⚔️",xp:50,label:"전투 1승"},
    {type:"combo_reach",target:3,desc:"3 콤보 달성하기",emoji:"🔥",xp:60,label:"3 콤보"},
    {type:"use_skill",target:2,desc:"스킬 2회 사용하기",emoji:"⚡",xp:40,label:"스킬 2회"},
  ];
  return {...quests[seed % quests.length], progress:0, completed:false, day: seed};
}

/* ═══════════════════════════ SVG COMPONENTS ═══════════════════════════ */
const HeroSVG=({tier,size=120,animate=false,shaking=false,hpRatio=1})=>{const t=HERO_TIERS[tier]||HERO_TIERS[0];const w=hpRatio<0.3;return(
<svg width={size} height={size} viewBox="0 0 120 120" style={{animation:shaking?"heroShake 0.35s ease":animate?"heroBreathe 2.5s ease-in-out infinite":"none",filter:w?"saturate(0.4) brightness(0.8)":`drop-shadow(0 4px 12px ${t.aura||"rgba(0,0,0,0.3)"})`,transition:"filter 0.3s"}}>
{t.aura&&<circle cx="60" cy="65" r="50" fill="none" stroke={t.aura} strokeWidth="3" opacity="0.6"><animate attributeName="r" values="46;52;46" dur="2s" repeatCount="indefinite"/></circle>}
{t.cape&&<path d="M42,52 L38,105 Q60,115 82,105 L78,52" fill={t.cape} opacity="0.85"><animate attributeName="d" values="M42,52 L38,105 Q60,115 82,105 L78,52;M42,52 L36,107 Q60,112 84,107 L78,52;M42,52 L38,105 Q60,115 82,105 L78,52" dur="3s" repeatCount="indefinite"/></path>}
<rect x="48" y="90" width="10" height="20" rx="3" fill="#5C4033"/><rect x="62" y="90" width="10" height="20" rx="3" fill="#5C4033"/>
<rect x="46" y="104" width="14" height="8" rx="4" fill={tier>=2?t.armor:"#6B4226"}/><rect x="60" y="104" width="14" height="8" rx="4" fill={tier>=2?t.armor:"#6B4226"}/>
<rect x="42" y="52" width="36" height="40" rx="6" fill={t.armor}/><rect x="46" y="56" width="28" height="8" rx="2" fill={tier>=3?"#FFF5":"#0002"} opacity="0.5"/>
<rect x="30" y="55" width="12" height="28" rx="5" fill={t.armor}/><rect x="78" y="55" width="12" height="28" rx="5" fill={t.armor}/>
<circle cx="36" cy="86" r="5" fill="#FDBCB4"/><circle cx="84" cy="86" r="5" fill="#FDBCB4"/>
{t.shield&&<g transform="translate(22,62)"><path d="M0,0 L16,0 L16,20 L8,26 L0,20 Z" fill={tier>=3?"#DAA520":"#6B8E6B"} stroke="#FFF3" strokeWidth="1"/></g>}
<g transform="translate(82,50) rotate(15)"><rect x="-2" y="-30" width="4" height="26" rx="1" fill={t.weapon}/><polygon points="-5,-30 5,-30 0,-40" fill={t.weapon}/><rect x="-6" y="-6" width="12" height="3" rx="1.5" fill="#8B6914"/></g>
<circle cx="60" cy="40" r="16" fill="#FDBCB4"/><path d="M44,36 Q44,22 60,22 Q76,22 76,36" fill="#4A3728"/>
<circle cx="54" cy="40" r="2.5" fill="#2C1810"/><circle cx="66" cy="40" r="2.5" fill="#2C1810"/><circle cx="55" cy="39" r="1" fill="#FFF"/><circle cx="67" cy="39" r="1" fill="#FFF"/>
<path d={w?"M56,47 Q60,45 64,47":"M56,47 Q60,50 64,47"} fill="none" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round"/>
{t.helmet&&<><path d="M43,34 Q43,16 60,14 Q77,16 77,34" fill={tier>=3?"#DAA520":"#6B8E8B"} opacity="0.9"/><rect x="55" y="12" width="10" height="6" rx="2" fill={tier>=4?"#FF6B6B":"#888"}/></>}
{tier>=3&&<><circle cx="35" cy="30" r="2" fill="#FFD700" opacity="0.8"><animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/></circle></>}
</svg>)};

const DragonSVG=({stage,shaking=false,size=140,hit=false})=>{const d=DRAGON_STAGES[stage];const s=d.size;return(
<svg width={size} height={size} viewBox="0 0 140 140" style={{animation:shaking?"dragonShake 0.35s ease":"dragonFloat 3s ease-in-out infinite",filter:hit?`brightness(2) drop-shadow(0 0 20px ${d.color})`:`drop-shadow(0 6px 16px ${d.color}66)`,transition:"filter 0.15s",transform:`scale(${0.7+s*0.3})`}}>
<circle cx="70" cy="75" r={45*s} fill={d.color} opacity="0.08"><animate attributeName="r" values={`${42*s};${48*s};${42*s}`} dur="3s" repeatCount="indefinite"/></circle>
<path d={`M${70-20*s},60 Q${70-55*s},20 ${70-50*s},55 Q${70-40*s},45 ${70-15*s},65`} fill={d.wingColor} stroke={d.bodyColor} strokeWidth="1.5" opacity="0.8"/>
<path d={`M${70+20*s},60 Q${70+55*s},20 ${70+50*s},55 Q${70+40*s},45 ${70+15*s},65`} fill={d.wingColor} stroke={d.bodyColor} strokeWidth="1.5" opacity="0.8"/>
<path d={`M${70+10*s},85 Q${70+35*s},95 ${70+45*s},80 Q${70+50*s},70 ${70+55*s},72`} fill="none" stroke={d.bodyColor} strokeWidth={5*s} strokeLinecap="round"/>
<ellipse cx="70" cy={78} rx={22*s} ry={18*s} fill={d.bodyColor}/><ellipse cx="70" cy={82} rx={14*s} ry={12*s} fill={d.color} opacity="0.3"/>
<ellipse cx={70-12*s} cy={96} rx={6*s} ry={8*s} fill={d.bodyColor}/><ellipse cx={70+12*s} cy={96} rx={6*s} ry={8*s} fill={d.bodyColor}/>
<ellipse cx="70" cy={38*s+12} rx={14*s} ry={10*s} fill={d.bodyColor}/>
<line x1={70-8*s} y1={38*s+5} x2={70-14*s} y2={38*s-8} stroke={d.color} strokeWidth={2.5*s} strokeLinecap="round"/>
<line x1={70+8*s} y1={38*s+5} x2={70+14*s} y2={38*s-8} stroke={d.color} strokeWidth={2.5*s} strokeLinecap="round"/>
<ellipse cx={70-5*s} cy={38*s+10} rx={3.5*s} ry={3*s} fill={d.eyeColor}/><ellipse cx={70+5*s} cy={38*s+10} rx={3.5*s} ry={3*s} fill={d.eyeColor}/>
<ellipse cx={70-5*s} cy={38*s+10} rx={1.5*s} ry={2.5*s} fill="#111"/><ellipse cx={70+5*s} cy={38*s+10} rx={1.5*s} ry={2.5*s} fill="#111"/>
{stage===4&&<polygon points={`${70-10},${38*s} ${70-6},${38*s-10} ${70-2},${38*s-3} ${70+2},${38*s-12} ${70+6},${38*s-3} ${70+10},${38*s}`} fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>}
</svg>)};

const SlashEffect=({onDone})=>{useEffect(()=>{const t=setTimeout(onDone,600);return()=>clearTimeout(t)},[onDone]);return(
<svg width="180" height="180" viewBox="0 0 180 180" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none",zIndex:50}}>
<line x1="20" y1="160" x2="160" y2="20" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" opacity="0"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.5;1" dur="0.5s" fill="freeze"/></line>
<line x1="160" y1="140" x2="30" y2="30" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" opacity="0"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.5;1" dur="0.5s" fill="freeze" begin="0.08s"/></line>
</svg>)};

const FireBreath=({onDone})=>{useEffect(()=>{const t=setTimeout(onDone,700);return()=>clearTimeout(t)},[onDone]);return(
<svg width="120" height="80" viewBox="0 0 120 80" style={{position:"absolute",bottom:"30%",left:"-20px",pointerEvents:"none",zIndex:50}}>
{[0,1,2].map(i=>(<ellipse key={i} cx={100-i*25} cy={40+i*5} rx={20-i*3} ry={15-i*2} fill={i===0?"#FF4444":i===1?"#FF8C00":"#FFD700"} opacity="0"><animate attributeName="opacity" values="0;0.8;0" dur="0.6s" fill="freeze" begin={`${i*0.1}s`}/></ellipse>))}
</svg>)};

const DamageNumber=({value,color,x,y,onDone})=>{useEffect(()=>{const t=setTimeout(onDone,900);return()=>clearTimeout(t)},[onDone]);return(
<div style={{position:"absolute",left:x,top:y,color,fontWeight:900,fontSize:"1.4rem",fontFamily:"'Press Start 2P',monospace",textShadow:`0 0 10px ${color},0 2px 4px #000`,animation:"dmgFloat 0.9s ease-out forwards",pointerEvents:"none",zIndex:60}}>{value>0?`-${value}`:value}</div>)};

const LevelUpEffect=({level,onDone})=>{useEffect(()=>{const t=setTimeout(onDone,2200);return()=>clearTimeout(t)},[onDone]);return(
<div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.65)",backdropFilter:"blur(4px)",animation:"lvlOverlay 2.2s ease forwards",pointerEvents:"none"}}>
<div style={{textAlign:"center",animation:"lvlBounce 0.6s ease-out"}}>
<div style={{fontSize:"4rem",marginBottom:8,animation:"lvlSpin 0.8s ease"}}>⬆️</div>
<div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"1.2rem",color:"#FFD700",textShadow:"0 0 30px #FFD70088"}}>LEVEL UP!</div>
<div style={{fontSize:"2.2rem",fontWeight:900,color:"#FFF",textShadow:"0 0 20px #FFD700"}}>Lv.{level}</div>
<div style={{fontSize:"0.85rem",color:"#FBBF24",marginTop:8}}>{getHeroTitle(level)}</div>
</div></div>)};

/* ─── small helpers ─── */
const FloatingText=({text,color})=>{const[v,setV]=useState(true);useEffect(()=>{setTimeout(()=>setV(false),900)},[]);if(!v)return null;return(<span style={{position:"absolute",top:"-10px",left:"50%",transform:"translateX(-50%)",color,fontWeight:900,fontSize:"1.2rem",animation:"floatUp 1s ease-out forwards",pointerEvents:"none",textShadow:`0 0 8px ${color}`,zIndex:100}}>{text}</span>)};
const ProgressBar=({value,max,color,height=14,label})=>(<div style={{position:"relative",width:"100%",height,borderRadius:7,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}><div style={{width:`${Math.max(0,(value/max)*100)}%`,height:"100%",background:`linear-gradient(90deg,${color},${color}aa)`,borderRadius:7,transition:"width 0.4s ease",boxShadow:`0 0 10px ${color}44`}}/>{label&&<span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.6rem",fontWeight:700,color:"#fff",textShadow:"0 1px 2px #000"}}>{label}</span>}</div>);
const Badge=({emoji,name,earned,small})=>(<div title={name} style={{width:small?32:40,height:small?32:40,borderRadius:10,background:earned?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.02)",border:`1.5px solid ${earned?"rgba(251,191,36,0.4)":"rgba(255,255,255,0.06)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:small?"1rem":"1.3rem",filter:earned?"none":"grayscale(1) opacity(0.3)",transition:"all 0.3s",cursor:"default"}}>{emoji}</div>);

/* ─── MODALS ─── */
const ProofModal=({todo,onConfirm,onClose})=>{const[img,setImg]=useState(null);const[url,setUrl]=useState(null);const[drag,setDrag]=useState(false);const fRef=useRef(null);
const hf=(f)=>{if(!f||!f.type.startsWith("image/"))return;setImg(f);setUrl(URL.createObjectURL(f))};
const d=DIFFICULTY[todo.difficulty];
return(<div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
<div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(160deg,#1e1932,#16131f)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"24px 22px",width:"100%",maxWidth:420,animation:"modalIn 0.25s ease-out"}}>
<div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:"1.6rem",marginBottom:6}}>📸</div><h3 style={{fontSize:"1rem",fontWeight:900,color:"#e8e0f0",marginBottom:4}}>퀘스트 완료 인증</h3><p style={{fontSize:"0.75rem",color:"#8b7fa0"}}>사진 인증은 선택사항입니다.</p></div>
<div style={{background:"rgba(255,255,255,0.04)",borderRadius:12,padding:"10px 14px",marginBottom:16,border:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:10}}>
<span style={{fontSize:"0.6rem",color:d.color,fontWeight:700,background:`${d.color}18`,padding:"3px 8px",borderRadius:6}}>{d.emoji}</span>
<span style={{flex:1,fontSize:"0.85rem",color:"#e8e0f0"}}>{todo.text}</span><span style={{fontSize:"0.7rem",color:d.color,fontWeight:700}}>+{d.xp}xp</span></div>
{!url?(<div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);hf(e.dataTransfer?.files?.[0])}} onClick={()=>fRef.current?.click()} style={{border:`2px dashed ${drag?"#818cf8":"rgba(255,255,255,0.12)"}`,borderRadius:14,padding:"28px 20px",textAlign:"center",cursor:"pointer",background:drag?"rgba(129,140,248,0.06)":"rgba(0,0,0,0.15)",marginBottom:16}}>
<input ref={fRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>hf(e.target.files?.[0])}/><div style={{fontSize:"1.8rem",marginBottom:6,opacity:0.5}}>📷</div><p style={{fontSize:"0.75rem",color:"#a09ab0"}}>사진 인증 (선택)</p></div>
):(<div style={{marginBottom:16,position:"relative"}}><img src={url} alt="인증" style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:14,border:"2px solid rgba(74,222,128,0.3)"}}/><button onClick={()=>{setImg(null);setUrl(null)}} style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,0.6)",color:"#e8e0f0",border:"none",borderRadius:20,padding:"4px 10px",fontSize:"0.65rem",cursor:"pointer",fontFamily:"inherit"}}>🔄 다시</button></div>)}
<div style={{display:"flex",gap:8}}>
<button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#8b7fa0",fontWeight:700,fontSize:"0.85rem",cursor:"pointer",fontFamily:"inherit"}}>취소</button>
<button onClick={()=>onConfirm(url||null)} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:img?"linear-gradient(135deg,#4ade80,#22c55e)":"linear-gradient(135deg,#6366f1,#8b5cf6)",color:img?"#0f0c18":"#fff",fontWeight:900,fontSize:"0.85rem",cursor:"pointer",fontFamily:"inherit"}}>{img?"📸 인증과 함께 완료!":"⚔️ 바로 완료하기"}</button>
</div></div></div>)};

const UndoModal=({todo,onConfirm,onClose})=>{const d=DIFFICULTY[todo.difficulty];return(
<div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
<div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(160deg,#1e1932,#16131f)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:20,padding:"24px 22px",width:"100%",maxWidth:380,textAlign:"center",animation:"modalIn 0.25s ease-out"}}>
<div style={{fontSize:"2rem",marginBottom:8}}>⚠️</div>
<h3 style={{fontSize:"0.95rem",fontWeight:900,color:"#f87171",marginBottom:8}}>퀘스트 완료를 취소할까요?</h3>
<p style={{fontSize:"0.78rem",color:"#a09ab0",marginBottom:6}}>{todo.text}</p>
<div style={{background:"rgba(248,113,113,0.08)",borderRadius:10,padding:"10px 14px",marginBottom:20,border:"1px solid rgba(248,113,113,0.15)"}}>
<p style={{fontSize:"0.75rem",color:"#f87171",fontWeight:700}}>경험치 {d.xp}xp 차감 & 콤보 초기화</p></div>
<div style={{display:"flex",gap:8}}>
<button onClick={onClose} style={{flex:1,padding:"11px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#8b7fa0",fontWeight:700,fontSize:"0.85rem",cursor:"pointer",fontFamily:"inherit"}}>아니오</button>
<button onClick={()=>onConfirm(todo.id,d.xp)} style={{flex:1,padding:"11px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"#fff",fontWeight:900,fontSize:"0.85rem",cursor:"pointer",fontFamily:"inherit"}}>취소하기</button>
</div></div></div>)};

/* ─── LOOT MODAL ─── */
const LootModal=({items,onClose})=>(<div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
<div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(160deg,#1e1932,#16131f)",border:"1px solid rgba(251,191,36,0.3)",borderRadius:20,padding:"24px 22px",width:"100%",maxWidth:380,textAlign:"center",animation:"modalIn 0.25s ease-out"}}>
<div style={{fontSize:"2.5rem",marginBottom:8,animation:"victoryBounce 1s infinite"}}>🎁</div>
<h3 style={{fontSize:"1rem",fontWeight:900,color:"#fbbf24",marginBottom:16}}>전리품 획득!</h3>
{items.map((it,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",marginBottom:6,borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${RARITY_COLOR[it.rarity]}33`}}>
<span style={{fontSize:"1.5rem"}}>{it.emoji}</span>
<div style={{flex:1,textAlign:"left"}}><div style={{fontSize:"0.8rem",color:"#e8e0f0",fontWeight:700}}>{it.name}</div><div style={{fontSize:"0.6rem",color:RARITY_COLOR[it.rarity]}}>{it.desc}</div></div>
<span style={{fontSize:"0.55rem",color:RARITY_COLOR[it.rarity],fontWeight:700,textTransform:"uppercase"}}>{it.rarity}</span></div>))}
<button onClick={onClose} style={{marginTop:16,width:"100%",padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#fbbf24,#f59e0b)",color:"#1a1028",fontWeight:900,fontSize:"0.85rem",cursor:"pointer",fontFamily:"inherit"}}>확인</button>
</div></div>);

/* ─── ACHIEVEMENT TOAST ─── */
const AchievementToast=({achievement,onDone})=>{const[fading,setFading]=useState(false);useEffect(()=>{const f=setTimeout(()=>setFading(true),8500);const t=setTimeout(onDone,10000);return()=>{clearTimeout(f);clearTimeout(t)}},[onDone]);return(
<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:3000,background:"linear-gradient(135deg,#1e1932ee,#16131fee)",border:"1.5px solid rgba(251,191,36,0.4)",borderRadius:16,padding:"12px 20px",display:"flex",alignItems:"center",gap:12,animation:fading?"slideUp 1.5s ease-out forwards":"slideDown 0.4s ease-out",boxShadow:"0 8px 30px rgba(0,0,0,0.5)"}}>
<span style={{fontSize:"1.8rem"}}>{achievement.emoji}</span>
<div><div style={{fontSize:"0.6rem",color:"#fbbf24",fontWeight:700,marginBottom:2}}>🏅 업적 달성!</div>
<div style={{fontSize:"0.85rem",color:"#e8e0f0",fontWeight:700}}>{achievement.name}</div>
<div style={{fontSize:"0.6rem",color:"#8b7fa0"}}>{achievement.desc}</div></div></div>)};

/* ═══════════════════════════ MAIN APP ═══════════════════════════ */
export default function TodoRPG(){
  const[todos,setTodos]=useState([]);
  const[input,setInput]=useState("");
  const[difficulty,setDifficulty]=useState("easy");
  const[deadlineMin,setDeadlineMin]=useState(30);

  /* categories */
  const[categories,setCategories]=useState([]);
  const[selectedCat,setSelectedCat]=useState(null); // for new todo
  const[filterCat,setFilterCat]=useState("all"); // for filtering list
  const[showCatManager,setShowCatManager]=useState(false);
  const[newCatName,setNewCatName]=useState("");
  const[newCatEmoji,setNewCatEmoji]=useState("📌");

  const[hero,setHero]=useState({level:1,xp:0,hp:100});
  const[dragonStage,setDragonStage]=useState(0);
  const[dragonHp,setDragonHp]=useState(DRAGON_STAGES[0].hp);
  const[battleLog,setBattleLog]=useState([]);
  const[screen,setScreen]=useState("todo"); // todo|battle|inventory|achievements
  const[now,setNow]=useState(Date.now());
  const[floats,setFloats]=useState([]);
  const[completedCount,setCompletedCount]=useState(0);
  const[victoryDragons,setVictoryDragons]=useState(0);

  /* combo */
  const[combo,setCombo]=useState(0);
  const[maxCombo,setMaxCombo]=useState(0);
  const comboTimer=useRef(null);

  /* animation */
  const[heroShaking,setHeroShaking]=useState(false);
  const[dragonShaking,setDragonShaking]=useState(false);
  const[dragonHit,setDragonHit]=useState(false);
  const[showSlash,setShowSlash]=useState(false);
  const[showFire,setShowFire]=useState(false);
  const[dmgNums,setDmgNums]=useState([]);
  const[showLevelUp,setShowLevelUp]=useState(null);
  const[attacking,setAttacking]=useState(false);

  /* modals */
  const[proofModal,setProofModal]=useState(null);
  const[undoModal,setUndoModal]=useState(null);
  const[lootModal,setLootModal]=useState(null);
  const[achToast,setAchToast]=useState(null);

  /* skills */
  const[skillCooldowns,setSkillCooldowns]=useState({});
  const[activeBuffs,setActiveBuffs]=useState({crit:false,shield:false,fury:0});
  const[skillUseCount,setSkillUseCount]=useState(0);

  /* items & equipment */
  const[inventory,setInventory]=useState([]);
  const[equipped,setEquipped]=useState({atk:null,def:null});

  /* achievements */
  const[unlockedAch,setUnlockedAch]=useState([]);
  const[hardCount,setHardCount]=useState(0);
  const[onTimeCount,setOnTimeCount]=useState(0);

  /* pets */
  const[pets,setPets]=useState([]);
  const[activePet,setActivePet]=useState(null);
  const[usedRevive,setUsedRevive]=useState(false);

  /* daily quest */
  const dayKey=Math.floor(Date.now()/(1000*60*60*24));
  const[dailyQuest,setDailyQuest]=useState(()=>generateDailyQuest(dayKey));
  const[dailyCompleted,setDailyCompleted]=useState(0);

  /* drag kill count for achievements */
  const[dragonsKilled,setDragonsKilled]=useState(0);

  const floatId=useRef(0);const dmgId=useRef(0);const logRef=useRef(null);const prevLevel=useRef(hero.level);

  const stats=getHeroStats(hero.level);
  const xpNeeded=LEVEL_XP(hero.level);
  const dragon=DRAGON_STAGES[dragonStage];
  const heroTier=getHeroTier(hero.level);

  /* equipment bonuses */
  const equipAtk=equipped.atk?equipped.atk.effect.atk:0;
  const equipDef=equipped.def?equipped.def.effect.def:0;
  const totalAtk=stats.atk+equipAtk;
  const totalDef=stats.def+equipDef;

  /* pet bonus */
  const petBonus=activePet?.effect||{};
  const xpMultiplier=(1+(petBonus.xpBonus||0))*(combo>=10?2.0:combo>=5?1.5:combo>=3?1.2:1.0);

  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight},[battleLog]);
  useEffect(()=>{if(hero.level>prevLevel.current)setShowLevelUp(hero.level);prevLevel.current=hero.level},[hero.level]);
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]);

  /* debuff tick */
  useEffect(()=>{const t=setInterval(()=>{
    setTodos(prev=>{const overdue=prev.filter(t=>!t.done&&t.deadline&&Date.now()>t.deadline+10*60*1000);
    if(overdue.length>0){const dmg=overdue.length*3;setHero(h=>{if(h.hp<=0)return h;const newHp=Math.max(0,h.hp-dmg);return{...h,hp:newHp}});addFloat(`💀 -${dmg} HP`,"#f87171")}return prev});
  },60000);return()=>clearInterval(t)},[]);

  /* check achievements */
  const checkAch=useCallback((extra={})=>{
    const s={completedCount:extra.cc??completedCount,dragonsKilled:extra.dk??dragonsKilled,maxCombo:extra.mc??maxCombo,level:extra.lv??hero.level,onTimeCount:extra.ot??onTimeCount,hardCount:extra.hc??hardCount,dailyCompleted:extra.dc??dailyCompleted,petCount:pets.length+(extra.newPet?1:0)};
    ACHIEVEMENTS.forEach(a=>{if(!unlockedAch.includes(a.id)&&a.check(s)){setUnlockedAch(p=>[...p,a.id]);setAchToast(a)}});
  },[completedCount,dragonsKilled,maxCombo,hero.level,onTimeCount,hardCount,dailyCompleted,pets,unlockedAch]);

  /* daily quest check */
  useEffect(()=>{const d=Math.floor(Date.now()/(1000*60*60*24));if(d!==dailyQuest.day)setDailyQuest(generateDailyQuest(d))},[now]);

  const addFloat=(text,color)=>{const id=++floatId.current;setFloats(f=>[...f,{text,color,id}]);setTimeout(()=>setFloats(f=>f.filter(x=>x.id!==id)),1000)};
  const addDmg=(v,c,x,y)=>{const id=++dmgId.current;setDmgNums(d=>[...d,{value:v,color:c,x,y,id}])};
  const removeDmg=useCallback(id=>{setDmgNums(d=>d.filter(x=>x.id!==id))},[]);

  /* ─── TODO ACTIONS ─── */
  const addTodo=()=>{if(!input.trim())return;const t=Date.now();setTodos(p=>[...p,{id:t,text:input.trim(),difficulty,done:false,proofUrl:null,createdAt:t,deadline:t+deadlineMin*60*1000,deadlineMin,category:selectedCat}]);setInput("")};

  const addCategory=()=>{
    if(!newCatName.trim())return;
    const id="cat_"+Date.now();
    setCategories(c=>[...c,{id,name:newCatName.trim(),emoji:newCatEmoji,color:CAT_COLORS[c.length%CAT_COLORS.length]}]);
    setNewCatName("");setNewCatEmoji("📌");
    setShowCatManager(true);
  };
  const deleteCategory=(catId)=>{
    setCategories(c=>c.filter(x=>x.id!==catId));
    setTodos(t=>t.map(todo=>todo.category===catId?{...todo,category:null}:todo));
    if(filterCat===catId)setFilterCat("all");
    if(selectedCat===catId)setSelectedCat(null);
  };

  const confirmComplete=(todoId,proofUrl)=>{
    setTodos(t=>t.map(todo=>{
      if(todo.id===todoId&&!todo.done){
        const diff=DIFFICULTY[todo.difficulty];
        const baseXp=diff.xp;
        const xp=Math.floor(baseXp*xpMultiplier);
        gainXp(xp);
        /* HP recovery from quest completion */
        const healAmt=diff.heal;
        setHero(h=>({...h,hp:Math.min(getHeroStats(h.level).maxHp, h.hp+healAmt)}));
        addFloat(`+${healAmt} HP`,"#4ade80");
        if(todo.difficulty==="hard")setHardCount(h=>h+1);
        const isOnTime=todo.deadline&&Date.now()<=todo.deadline;
        if(isOnTime)setOnTimeCount(o=>o+1);
        /* combo */
        const newCombo=combo+1;
        setCombo(newCombo);
        setMaxCombo(m=>Math.max(m,newCombo));
        if(comboTimer.current)clearTimeout(comboTimer.current);
        comboTimer.current=setTimeout(()=>setCombo(0),30*60*1000);
        /* daily */
        updateDaily("complete_any");
        if(todo.difficulty==="hard")updateDaily("complete_hard");
        if(isOnTime)updateDaily("complete_ontime");
        if(newCombo>=3)updateDaily("combo_reach");
        setTimeout(()=>checkAch({cc:completedCount+1,mc:Math.max(maxCombo,newCombo)}),100);
        return{...todo,done:true,proofUrl};
      }return todo;
    }));
    setCompletedCount(c=>c+1);setProofModal(null);
  };

  const confirmUndo=(todoId,xpLost)=>{
    setTodos(t=>t.map(todo=>todo.id===todoId?{...todo,done:false,proofUrl:null}:todo));
    loseXp(xpLost);setCombo(0);setCompletedCount(c=>Math.max(0,c-1));setUndoModal(null);
  };
  const deleteTodo=id=>setTodos(t=>t.filter(x=>x.id!==id));

  const updateDaily=(type)=>{setDailyQuest(prev=>{if(prev.completed||prev.type!==type)return prev;const np=prev.progress+1;if(np>=prev.target){setDailyCompleted(d=>d+1);gainXp(prev.xp);addFloat(`🎯 일일 미션 +${prev.xp}XP`,"#fbbf24");setTimeout(()=>checkAch({dc:dailyCompleted+1}),200);return{...prev,progress:np,completed:true}}return{...prev,progress:np}})};

  const gainXp=(amount)=>{setHero(prev=>{let xp=prev.xp+amount,lv=prev.level,nd=LEVEL_XP(lv);while(xp>=nd){xp-=nd;lv++;nd=LEVEL_XP(lv)}const ns=getHeroStats(lv);return{level:lv,xp,hp:lv>prev.level?ns.maxHp:prev.hp}});addFloat(`+${amount} XP`,"#facc15")};
  const loseXp=(amount)=>{setHero(prev=>{let xp=prev.xp-amount,lv=prev.level;while(xp<0&&lv>1){lv--;xp+=LEVEL_XP(lv)}if(xp<0)xp=0;const ns=getHeroStats(lv);return{level:lv,xp,hp:Math.min(prev.hp,ns.maxHp)}});addFloat(`-${amount} XP`,"#f87171")};

  /* ─── SKILLS ─── */
  const useSkill=(skill)=>{
    if(skillCooldowns[skill.id]>0)return;
    setSkillCooldowns(c=>({...c,[skill.id]:skill.cooldown}));
    setSkillUseCount(c=>c+1);
    updateDaily("use_skill");
    if(skill.id==="heal"){const heal=Math.floor(stats.maxHp*0.25);setHero(h=>({...h,hp:Math.min(stats.maxHp,h.hp+heal)}));addFloat(`+${heal} HP`,"#4ade80");setBattleLog(b=>[...b,`💚 치유! HP ${heal} 회복!`])}
    else if(skill.id==="crit"){setActiveBuffs(b=>({...b,crit:true}));setBattleLog(b=>[...b,"⚡ 치명타 준비! 다음 공격 2.5배!"])}
    else if(skill.id==="shield"){setActiveBuffs(b=>({...b,shield:true}));setBattleLog(b=>[...b,"🛡️ 방어막 활성화! 다음 피격 80% 감소!"])}
    else if(skill.id==="fury"){setActiveBuffs(b=>({...b,fury:3}));setBattleLog(b=>[...b,"🔥 분노! 3턴간 공격력 2배!"])}
  };

  /* ─── ITEMS ─── */
  const useItem=(item,idx)=>{
    if(item.type==="consumable"){
      if(item.effect.heal){const h=item.effect.heal;setHero(p=>({...p,hp:Math.min(getHeroStats(p.level).maxHp,p.hp+h)}));addFloat(`+${h} HP`,"#4ade80")}
      if(item.effect.xp){gainXp(item.effect.xp)}
      setInventory(inv=>inv.filter((_,j)=>j!==idx));
    } else if(item.type==="equip_atk"){
      const oldItem=equipped.atk;
      setEquipped(e=>({...e,atk:item}));
      setInventory(inv=>{let next=inv.filter((_,j)=>j!==idx);if(oldItem)next=[...next,oldItem];return next});
      addFloat(`⚔️ ${item.name} 장착!`,"#fbbf24");
    } else if(item.type==="equip_def"){
      const oldItem=equipped.def;
      setEquipped(e=>({...e,def:item}));
      setInventory(inv=>{let next=inv.filter((_,j)=>j!==idx);if(oldItem)next=[...next,oldItem];return next});
      addFloat(`🛡️ ${item.name} 장착!`,"#60a5fa");
    }
  };
  const unequipItem=(slot)=>{
    const item=equipped[slot];
    if(!item)return;
    setEquipped(e=>({...e,[slot]:null}));
    setInventory(inv=>[...inv,item]);
    addFloat(`${item.name} 해제`,"#8b7fa0");
  };

  /* ─── BATTLE ─── */
  const attack=()=>{
    if(attacking)return;setAttacking(true);
    let atkMult=1;if(activeBuffs.crit){atkMult=2.5;setActiveBuffs(b=>({...b,crit:false}))}
    if(activeBuffs.fury>0)atkMult*=2;
    const heroDmg=Math.max(1,Math.floor((totalAtk*atkMult)-dragon.atk*0.2+Math.random()*6)+(petBonus.bonusDmg||0));
    const rawDragonDmg=Math.max(1,dragon.atk-totalDef+Math.floor(Math.random()*4));
    const dragonDmg=activeBuffs.shield?Math.floor(rawDragonDmg*0.2):Math.floor(rawDragonDmg*(1-(petBonus.dmgReduce||0)));
    if(activeBuffs.shield)setActiveBuffs(b=>({...b,shield:false}));
    if(activeBuffs.fury>0)setActiveBuffs(b=>({...b,fury:b.fury-1}));

    /* cooldown tick */
    setSkillCooldowns(c=>{const n={};Object.keys(c).forEach(k=>{if(c[k]>0)n[k]=c[k]-1});return n});

    setShowSlash(true);
    setTimeout(()=>{
      setDragonShaking(true);setDragonHit(true);
      setTimeout(()=>{setDragonShaking(false);setDragonHit(false)},350);
      addDmg(heroDmg,atkMult>1?"#FF4444":"#FFD700","55%","15%");
    },200);

    const newDhp=Math.max(0,dragonHp-heroDmg);
    const logs=[`⚔️ 용사가 ${heroDmg}의 피해를 입혔다!${atkMult>1?" (강화!)":""}`];

    setTimeout(()=>{
      setDragonHp(newDhp);
      /* pet heal per turn */
      if(petBonus.healPerTurn){setHero(h=>({...h,hp:Math.min(stats.maxHp,h.hp+petBonus.healPerTurn)}))}

      if(newDhp<=0){
        logs.push(`🎉 ${dragon.name} 처치!`);
        const bonusXp=(dragonStage+1)*60;
        logs.push(`💎 보너스 +${bonusXp}XP!`);
        gainXp(bonusXp);
        const loot=rollLoot(dragonStage);
        setInventory(inv=>[...inv,...loot]);
        /* chance to get a pet */
        if(Math.random()<0.25&&pets.length<PET_POOL.length){
          const available=PET_POOL.filter(p=>!pets.find(pp=>pp.id===p.id));
          if(available.length>0){const newPet=available[Math.floor(Math.random()*available.length)];
            setPets(p=>[...p,newPet]);loot.push({...newPet,name:`🐾 ${newPet.name}`,desc:newPet.skill,rarity:"legendary",emoji:newPet.emoji});
            logs.push(`🐾 새 동료 ${newPet.name} 합류!`);
            setTimeout(()=>checkAch({newPet:true,dk:dragonsKilled+1}),300)}}
        setDragonsKilled(d=>d+1);
        updateDaily("battle_win");
        setTimeout(()=>{setLootModal(loot);checkAch({dk:dragonsKilled+1})},800);
        if(dragonStage<DRAGON_STAGES.length-1){const next=dragonStage+1;setDragonStage(next);setDragonHp(DRAGON_STAGES[next].hp);logs.push(`🐲 ${DRAGON_STAGES[next].name} 등장!`)}
        else{setVictoryDragons(v=>v+1);setScreen("victory")}
        setBattleLog(b=>[...b,...logs]);setAttacking(false);setUsedRevive(false);return;
      }

      setTimeout(()=>{
        setShowFire(true);
        setTimeout(()=>{
          setHeroShaking(true);setTimeout(()=>setHeroShaking(false),350);
          addDmg(dragonDmg,"#EF4444","20%","45%");
          setHero(prev=>{
            const newHp=Math.max(0,prev.hp-dragonDmg);
            if(newHp<=0){
              if(petBonus.revive&&!usedRevive){
                setUsedRevive(true);
                logs.push(`🐦‍🔥 ${activePet.name}의 부활! HP 50% 회복!`);
                setBattleLog(b=>[...b,...logs]);
                setAttacking(false);
                return{...prev,hp:Math.floor(stats.maxHp*0.5)};
              }
              logs.push("💔 용사가 쓰러졌다...");setBattleLog(b=>[...b,...logs]);
              setTimeout(()=>setScreen("todo"),1500);
              return{...prev,hp:0};
            }
            logs.push(`🔥 ${dragon.name}이(가) ${dragonDmg} 피해!${activeBuffs.shield?" (방어막!)":""}`);
            setBattleLog(b=>[...b,...logs]);return{...prev,hp:newHp};
          });
          setAttacking(false);
        },300);
      },400);
    },500);
  };

  const restartAfterVictory=()=>{setDragonStage(0);setDragonHp(DRAGON_STAGES[0].hp);setBattleLog([]);setScreen("todo")};
  const canBattle=hero.level>=2&&hero.hp>0;
  const isDead=hero.hp<=0;
  const overdueCount=todos.filter(t=>!t.done&&t.deadline&&now>t.deadline+10*60*1000).length;

  /* ═══════════════════ RENDER ═══════════════════ */
  return(
  <div style={{minHeight:"100vh",background:"linear-gradient(170deg,#0f0c18 0%,#1a1028 40%,#12141f 100%)",color:"#e8e0f0",fontFamily:"'Noto Sans KR','Segoe UI',sans-serif",position:"relative",overflow:"hidden"}}>
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&family=Press+Start+2P&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    @keyframes floatUp{0%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-50px)}}
    @keyframes heroShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px) rotate(-2deg)}40%{transform:translateX(8px) rotate(2deg)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
    @keyframes dragonShake{0%,100%{transform:translateX(0)}20%{transform:translateX(8px) rotate(2deg)}40%{transform:translateX(-8px) rotate(-2deg)}60%{transform:translateX(5px)}80%{transform:translateX(-5px)}}
    @keyframes heroBreathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    @keyframes dragonFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(250,204,21,0.2)}50%{box-shadow:0 0 40px rgba(250,204,21,0.4)}}
    @keyframes victoryBounce{0%,100%{transform:scale(1) rotate(0)}25%{transform:scale(1.2) rotate(-5deg)}50%{transform:scale(1.3) rotate(5deg)}75%{transform:scale(1.1) rotate(-3deg)}}
    @keyframes modalIn{0%{opacity:0;transform:scale(0.92) translateY(12px)}100%{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes dmgFloat{0%{opacity:1;transform:translateY(0) scale(1)}30%{transform:translateY(-20px) scale(1.3)}100%{opacity:0;transform:translateY(-60px) scale(0.8)}}
    @keyframes lvlOverlay{0%{opacity:0}10%{opacity:1}80%{opacity:1}100%{opacity:0}}
    @keyframes lvlBounce{0%{transform:scale(0.3) translateY(40px);opacity:0}60%{transform:scale(1.15);opacity:1}100%{transform:scale(1)}}
    @keyframes lvlSpin{0%{transform:rotate(0) scale(0.5)}50%{transform:rotate(180deg) scale(1.3)}100%{transform:rotate(360deg) scale(1)}}
    @keyframes heroAttackLunge{0%{transform:translateX(0)}40%{transform:translateX(60px) rotate(5deg)}60%{transform:translateX(60px) rotate(5deg)}100%{transform:translateX(0)}}
    @keyframes overduePulse{0%,100%{border-color:rgba(239,68,68,0.25)}50%{border-color:rgba(239,68,68,0.55)}}
    @keyframes debuffShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}
    @keyframes slideDown{0%{opacity:0;transform:translateX(-50%) translateY(-30px)}100%{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes slideUp{0%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-30px)}}
    @keyframes comboPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
    .todo-item:hover{background:rgba(255,255,255,0.06)!important}
    .btn:hover:not(:disabled){filter:brightness(1.15);transform:scale(1.03)}
    .btn:active:not(:disabled){transform:scale(0.97)}
    input::placeholder{color:#6b5f7b}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
  `}</style>

  {/* Stars */}
  <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
    {Array.from({length:30}).map((_,i)=>(<div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:Math.random()*3+1,height:Math.random()*3+1,borderRadius:"50%",background:"#fff",opacity:Math.random()*0.4+0.1,animation:`pulse ${2+Math.random()*3}s ease-in-out infinite`}}/>))}
  </div>

  {showLevelUp&&<LevelUpEffect level={showLevelUp} onDone={()=>setShowLevelUp(null)}/>}
  {achToast&&<AchievementToast achievement={achToast} onDone={()=>setAchToast(null)}/>}
  {proofModal&&<ProofModal todo={proofModal} onConfirm={url=>confirmComplete(proofModal.id,url)} onClose={()=>setProofModal(null)}/>}
  {undoModal&&<UndoModal todo={undoModal} onConfirm={confirmUndo} onClose={()=>setUndoModal(null)}/>}
  {lootModal&&<LootModal items={lootModal} onClose={()=>setLootModal(null)}/>}

  <div style={{position:"relative",zIndex:1,maxWidth:520,margin:"0 auto",padding:"16px 16px 40px"}}>

    {/* Header */}
    <div style={{textAlign:"center",marginBottom:20}}>
      <h1 style={{fontFamily:"'Press Start 2P',monospace",fontSize:"1rem",color:"#facc15",textShadow:"0 0 20px rgba(250,204,21,0.4),0 2px 0 #b8860b",letterSpacing:2,marginBottom:4}}>⚔️ TODO QUEST ⚔️</h1>
      <p style={{fontSize:"0.7rem",color:"#8b7fa0"}}>할 일을 완료하고 용사를 키워 드래곤을 처치하라!</p>
    </div>

    {/* Hero Card */}
    <div style={{background:"linear-gradient(135deg,rgba(30,25,50,0.95),rgba(20,18,35,0.95))",border:"1px solid rgba(250,204,21,0.2)",borderRadius:16,padding:"14px 16px",marginBottom:12,animation:"glow 3s ease-in-out infinite",position:"relative"}}>
      {floats.map(f=><FloatingText key={f.id} {...f}/>)}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{textAlign:"center"}}>
          <HeroSVG tier={heroTier} size={80} animate hpRatio={hero.hp/stats.maxHp}/>
          {activePet&&<div style={{fontSize:"0.55rem",color:activePet.color,marginTop:-2}}>{activePet.emoji} {activePet.name}</div>}
        </div>
        <div style={{flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
            <span style={{fontWeight:900,fontSize:"0.9rem",color:"#facc15"}}>Lv.{hero.level} {getHeroTitle(hero.level)}</span>
            {combo>0&&<span style={{fontSize:"0.6rem",color:"#f97316",fontWeight:900,animation:"comboPulse 0.8s infinite",background:"rgba(249,115,22,0.15)",padding:"2px 8px",borderRadius:10}}>🔥 {combo}콤보 x{combo>=10?"2.0":combo>=5?"1.5":combo>=3?"1.2":"1.0"}</span>}
          </div>
          <div style={{marginBottom:4}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.6rem",marginBottom:1}}><span style={{color:"#ef4444"}}>❤️ HP</span><span>{hero.hp}/{stats.maxHp}</span></div>
            <ProgressBar value={hero.hp} max={stats.maxHp} color="#ef4444" height={9}/>
          </div>
          <div style={{marginBottom:4}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.6rem",marginBottom:1}}><span style={{color:"#818cf8"}}>✨ XP</span><span>{hero.xp}/{xpNeeded}</span></div>
            <ProgressBar value={hero.xp} max={xpNeeded} color="#818cf8" height={9}/>
          </div>
          <div style={{display:"flex",gap:10,fontSize:"0.65rem",color:"#a5b4fc",flexWrap:"wrap"}}>
            <span>⚔️ {totalAtk}{equipAtk>0?`(+${equipAtk})`:""}</span>
            <span>🛡️ {totalDef}{equipDef>0?`(+${equipDef})`:""}</span>
            <span style={{color:"#8b7fa0"}}>완료{completedCount} 처치{victoryDragons}</span>
          </div>
          {overdueCount>0&&<div style={{marginTop:4,padding:"3px 8px",borderRadius:6,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",fontSize:"0.55rem",color:"#f87171",fontWeight:700,animation:"debuffShake 2s infinite"}}>💀 시간 초과 {overdueCount}건 · HP 감소 중</div>}
          {isDead&&<div style={{marginTop:4,padding:"6px 10px",borderRadius:8,background:"rgba(239,68,68,0.15)",border:"1.5px solid rgba(239,68,68,0.35)",textAlign:"center"}}>
            <div style={{fontSize:"0.75rem",color:"#f87171",fontWeight:900,marginBottom:2}}>💀 용사가 쓰러졌습니다!</div>
            <div style={{fontSize:"0.55rem",color:"#f8717199"}}>퀘스트를 완료하면 HP가 회복됩니다 (쉬움 +15 / 보통 +30 / 어려움 +50)</div>
          </div>}
        </div>
      </div>
    </div>

    {/* Daily Quest Banner */}
    <div style={{background:dailyQuest.completed?"rgba(74,222,128,0.08)":"rgba(251,191,36,0.06)",border:`1px solid ${dailyQuest.completed?"rgba(74,222,128,0.2)":"rgba(251,191,36,0.15)"}`,borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:"1.2rem"}}>{dailyQuest.emoji}</span>
      <div style={{flex:1}}>
        <div style={{fontSize:"0.6rem",color:dailyQuest.completed?"#4ade80":"#fbbf24",fontWeight:700,marginBottom:1}}>🎯 일일 퀘스트{dailyQuest.completed?" ✓ 완료!":""}</div>
        <div style={{fontSize:"0.75rem",color:"#e8e0f0"}}>{dailyQuest.desc}</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:"0.7rem",fontWeight:900,color:dailyQuest.completed?"#4ade80":"#fbbf24"}}>{dailyQuest.progress}/{dailyQuest.target}</div>
        <div style={{fontSize:"0.55rem",color:"#8b7fa0"}}>+{dailyQuest.xp}xp</div>
      </div>
    </div>

    {/* Tabs */}
    <div style={{display:"flex",gap:4,marginBottom:12}}>
      {[
        {id:"todo",label:"📋 할 일",color:"#6366f1"},
        {id:"battle",label:"⚔️ 전투",color:"#ef4444",lock:!canBattle,lockLabel:isDead?"💀 HP 필요":hero.level<2?"🔒 Lv.2":"⚔️ 전투"},
        {id:"inventory",label:`🎒 ${inventory.length}`,color:"#f59e0b"},
        {id:"achievements",label:`🏅 ${unlockedAch.length}`,color:"#a78bfa"},
      ].map(tab=>(<button key={tab.id} onClick={()=>!tab.lock&&setScreen(tab.id)} style={{flex:1,padding:"8px 4px",borderRadius:10,border:"none",cursor:tab.lock?"not-allowed":"pointer",fontWeight:700,fontSize:"0.72rem",fontFamily:"inherit",background:screen===tab.id?`linear-gradient(135deg,${tab.color},${tab.color}cc)`:"rgba(255,255,255,0.04)",color:screen===tab.id?"#fff":tab.lock?"#4a4258":"#8b7fa0",transition:"all 0.2s",opacity:tab.lock?0.4:1}}>{tab.lock?tab.lockLabel||tab.label:tab.label}</button>))}
    </div>

    {/* ═══ VICTORY ═══ */}
    {screen==="victory"&&(<div style={{background:"linear-gradient(135deg,rgba(30,25,50,0.97),rgba(40,20,60,0.97))",border:"2px solid #facc15",borderRadius:20,padding:"36px 24px",textAlign:"center"}}>
      <div style={{fontSize:"4rem",animation:"victoryBounce 1s ease-in-out infinite",marginBottom:12}}>🏆</div>
      <h2 style={{fontFamily:"'Press Start 2P',monospace",fontSize:"1rem",color:"#facc15",marginBottom:8}}>축하합니다!</h2>
      <HeroSVG tier={heroTier} size={90} animate/>
      <p style={{color:"#c4b5fd",marginBottom:6,fontSize:"0.9rem"}}>모든 드래곤을 처치했습니다!</p>
      <p style={{color:"#8b7fa0",marginBottom:20,fontSize:"0.75rem"}}>Lv.{hero.level} {getHeroTitle(hero.level)} · 완료 {completedCount}건</p>
      <button onClick={restartAfterVictory} className="btn" style={{padding:"12px 32px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#facc15,#eab308)",color:"#1a1028",fontWeight:900,fontSize:"0.9rem",cursor:"pointer",fontFamily:"inherit"}}>🔄 새로운 모험 시작</button>
    </div>)}

    {/* ═══ TODO ═══ */}
    {screen==="todo"&&(<div>
      {/* Category Filter Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:10,overflowX:"auto",paddingBottom:4}}>
        <button onClick={()=>setFilterCat("all")} style={{padding:"5px 12px",borderRadius:8,border:"none",background:filterCat==="all"?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.03)",color:filterCat==="all"?"#e8e0f0":"#5a4f6b",fontWeight:700,fontSize:"0.65rem",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0}}>
          전체 ({todos.length})
        </button>
        <button onClick={()=>setFilterCat("none")} style={{padding:"5px 12px",borderRadius:8,border:"none",background:filterCat==="none"?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.03)",color:filterCat==="none"?"#8b7fa0":"#5a4f6b",fontWeight:700,fontSize:"0.65rem",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0}}>
          미분류 ({todos.filter(t=>!t.category).length})
        </button>
        {categories.map(cat=>{
          const count=todos.filter(t=>t.category===cat.id).length;
          return(<button key={cat.id} onClick={()=>setFilterCat(cat.id)} style={{padding:"5px 12px",borderRadius:8,border:"none",background:filterCat===cat.id?`${cat.color}18`:"rgba(255,255,255,0.03)",color:filterCat===cat.id?cat.color:"#5a4f6b",fontWeight:700,fontSize:"0.65rem",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0,outline:filterCat===cat.id?`1.5px solid ${cat.color}33`:"none"}}>
            {cat.emoji} {cat.name} ({count})
          </button>);
        })}
      </div>

      {/* Input Area */}
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:14,marginBottom:12,border:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTodo()} placeholder="새로운 퀘스트를 입력하세요..." style={{flex:1,padding:"9px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(0,0,0,0.3)",color:"#e8e0f0",fontSize:"0.85rem",fontFamily:"inherit",outline:"none"}}/>
          <button onClick={addTodo} className="btn" style={{padding:"9px 16px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:"0.85rem",fontFamily:"inherit",whiteSpace:"nowrap"}}>+</button>
        </div>
        {/* Category selector for new todo */}
        <div style={{marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:5}}>
            <span style={{fontSize:"0.6rem",color:"#8b7fa0"}}>📂 카테고리</span>
            {categories.length>0&&<button onClick={()=>setShowCatManager(!showCatManager)} style={{fontSize:"0.5rem",color:"#5a4f6b",background:"none",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,padding:"1px 6px",cursor:"pointer",fontFamily:"inherit",marginLeft:"auto"}}>⚙️ 관리</button>}
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
            <button onClick={()=>setSelectedCat(null)} style={{padding:"4px 10px",borderRadius:7,border:"none",background:selectedCat===null?"rgba(255,255,255,0.12)":"transparent",color:selectedCat===null?"#e8e0f0":"#5a4f6b",fontWeight:700,fontSize:"0.6rem",cursor:"pointer",fontFamily:"inherit",outline:selectedCat===null?"1.5px solid rgba(255,255,255,0.2)":"1.5px solid transparent"}}>없음</button>
            {categories.map(cat=>(<button key={cat.id} onClick={()=>setSelectedCat(cat.id)} style={{padding:"4px 10px",borderRadius:7,border:"none",background:selectedCat===cat.id?`${cat.color}22`:"transparent",color:selectedCat===cat.id?cat.color:"#5a4f6b",fontWeight:700,fontSize:"0.6rem",cursor:"pointer",fontFamily:"inherit",outline:selectedCat===cat.id?`1.5px solid ${cat.color}44`:"1.5px solid transparent",transition:"all 0.15s"}}>{cat.emoji} {cat.name}</button>))}
            <button onClick={()=>setShowCatManager(true)} style={{width:26,height:26,borderRadius:7,border:"1.5px dashed rgba(255,255,255,0.15)",background:"transparent",color:"#5a4f6b",fontSize:"0.85rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}} title="카테고리 추가">+</button>
          </div>
        </div>
        {/* Inline Category Add / Manager */}
        {showCatManager&&<div style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:12,marginBottom:8,border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:"0.65rem",color:"#fbbf24",fontWeight:700}}>📂 {categories.length>0?"카테고리 관리":"새 카테고리 만들기"}</span>
            <button onClick={()=>setShowCatManager(false)} style={{marginLeft:"auto",background:"none",border:"none",color:"#5a4f6b",cursor:"pointer",fontSize:"0.8rem",lineHeight:1}}>✕</button>
          </div>
          {/* Existing categories */}
          {categories.length>0&&<div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
            {categories.map(cat=>(<div key={cat.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${cat.color}22`}}>
              <span style={{fontSize:"0.9rem"}}>{cat.emoji}</span>
              <span style={{flex:1,fontSize:"0.75rem",color:cat.color,fontWeight:700}}>{cat.name}</span>
              <span style={{fontSize:"0.5rem",color:"#5a4f6b"}}>{todos.filter(t=>t.category===cat.id).length}개</span>
              <button onClick={()=>deleteCategory(cat.id)} style={{background:"none",border:"none",color:"#4a4258",cursor:"pointer",fontSize:"0.8rem",lineHeight:1,padding:"0 2px"}}>×</button>
            </div>))}
          </div>}
          {/* Add new category */}
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <div style={{position:"relative"}}>
              <select value={newCatEmoji} onChange={e=>setNewCatEmoji(e.target.value)} style={{appearance:"none",width:34,height:34,borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(0,0,0,0.3)",color:"#e8e0f0",fontSize:"1rem",textAlign:"center",cursor:"pointer",padding:0}}>
                {CAT_EMOJIS.map(e=>(<option key={e} value={e}>{e}</option>))}
              </select>
            </div>
            <input type="text" value={newCatName} onChange={e=>setNewCatName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCategory()} placeholder="카테고리 이름" maxLength={10} style={{flex:1,padding:"7px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(0,0,0,0.3)",color:"#e8e0f0",fontSize:"0.75rem",fontFamily:"inherit",outline:"none"}}/>
            <button onClick={addCategory} className="btn" style={{padding:"7px 14px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontWeight:700,fontSize:"0.7rem",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>추가</button>
          </div>
        </div>}
        <div style={{display:"flex",gap:4,marginBottom:8}}>
          {Object.entries(DIFFICULTY).map(([key,d])=>(<button key={key} onClick={()=>setDifficulty(key)} style={{flex:1,padding:"5px 0",borderRadius:7,border:"none",background:difficulty===key?`${d.color}22`:"transparent",color:difficulty===key?d.color:"#6b5f7b",fontWeight:700,fontSize:"0.6rem",cursor:"pointer",fontFamily:"inherit",outline:difficulty===key?`1.5px solid ${d.color}44`:"1.5px solid transparent"}}>{d.emoji} {d.label}<br/><span style={{fontSize:"0.5rem",opacity:0.8}}>+{d.xp}xp +{d.heal}hp</span></button>))}
        </div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
          <span style={{fontSize:"0.6rem",color:"#8b7fa0",marginRight:4,lineHeight:"24px"}}>⏰</span>
          {DEADLINE_PRESETS.map(p=>(<button key={p.min} onClick={()=>setDeadlineMin(p.min)} style={{padding:"3px 8px",borderRadius:6,border:"none",background:deadlineMin===p.min?"rgba(251,191,36,0.15)":"transparent",color:deadlineMin===p.min?"#fbbf24":"#5a4f6b",fontWeight:700,fontSize:"0.6rem",cursor:"pointer",fontFamily:"inherit"}}>{p.label}</button>))}
        </div>
      </div>

      {/* Todo List */}
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {(()=>{
          const filtered=(filterCat==="all"?todos:filterCat==="none"?todos.filter(t=>!t.category):todos.filter(t=>t.category===filterCat))
            .slice().sort((a,b)=>{if(a.done!==b.done)return a.done?1:-1;if(!a.done&&!b.done)return(a.deadline||Infinity)-(b.deadline||Infinity);return 0});
          if(filtered.length===0)return <div style={{textAlign:"center",padding:"36px 20px",color:"#5a4f6b",fontSize:"0.8rem"}}><div style={{fontSize:"2rem",marginBottom:8,opacity:0.5}}>{filterCat==="all"?"📜":"📂"}</div>{filterCat==="all"?"퀘스트를 추가해서 모험을 시작하세요!":"이 카테고리에 퀘스트가 없습니다"}</div>;
          return filtered.map(todo=>{
          const d=DIFFICULTY[todo.difficulty];const remaining=todo.deadline-now;const grace=(todo.deadline+10*60*1000)-now;
          const isOverdue=!todo.done&&remaining<0;const isDebuff=!todo.done&&grace<0;const isUrgent=!todo.done&&!isOverdue&&remaining<5*60*1000&&remaining>0;
          const cat=todo.category?categories.find(c=>c.id===todo.category):null;
          return(<div key={todo.id} className="todo-item" style={{display:"flex",alignItems:"stretch",gap:0,borderRadius:10,overflow:"hidden",background:todo.done?"rgba(74,222,128,0.05)":isDebuff?"rgba(239,68,68,0.06)":"rgba(255,255,255,0.03)",border:`1px solid ${todo.done?"rgba(74,222,128,0.15)":isDebuff?"rgba(239,68,68,0.3)":isUrgent?"rgba(251,191,36,0.3)":"rgba(255,255,255,0.05)"}`,animation:isDebuff?"overduePulse 2s infinite":"none"}}>
            <div style={{width:3,flexShrink:0,background:todo.done?"#4ade80":isDebuff?"#ef4444":isUrgent?"#fbbf24":isOverdue?"#f97316":cat?cat.color:"transparent"}}/>
            <div style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"9px 12px 9px 8px"}}>
              <button onClick={()=>todo.done?setUndoModal(todo):setProofModal(todo)} style={{width:26,height:26,borderRadius:7,border:`2px solid ${todo.done?"#4ade80":d.color}`,background:todo.done?"#4ade8033":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",flexShrink:0,color:todo.done?"#4ade80":"transparent"}}>{todo.done?"✓":""}</button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  {cat&&<span style={{fontSize:"0.5rem",color:cat.color,background:`${cat.color}15`,padding:"1px 5px",borderRadius:4,fontWeight:700,flexShrink:0}}>{cat.emoji} {cat.name}</span>}
                  <span style={{fontSize:"0.8rem",textDecoration:todo.done?"line-through":"none",color:todo.done?"#6b5f7b":"#e8e0f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{todo.text}</span>
                </div>
                {!todo.done&&<div style={{fontSize:"0.55rem",marginTop:2,color:isDebuff?"#ef4444":isOverdue?"#f97316":isUrgent?"#fbbf24":"#8b7fa0",fontWeight:isDebuff||isUrgent?700:400}}>
                  {isDebuff?`💀 ${formatCountdown(-grace)} 초과`:isOverdue?`⚠️ 유예 ${formatCountdown(grace)}`:isUrgent?`🔥 ${formatCountdown(remaining)}`:`⏰ ${formatCountdown(remaining)}`}
                </div>}
              </div>
              <span style={{fontSize:"0.55rem",color:d.color,fontWeight:700,background:`${d.color}12`,padding:"2px 6px",borderRadius:5,whiteSpace:"nowrap"}}>{todo.done?"✓":"+"}{d.xp}<span style={{color:"#4ade80"}}> +{d.heal}hp</span></span>
              <button onClick={()=>deleteTodo(todo.id)} style={{background:"none",border:"none",color:"#4a4258",cursor:"pointer",fontSize:"0.9rem",padding:"0 2px",lineHeight:1}}>×</button>
            </div>
          </div>);
        })})()}
      </div>
    </div>)}

    {/* ═══ BATTLE ═══ */}
    {screen==="battle"&&(<div>
      <div style={{background:"linear-gradient(180deg,rgba(15,10,30,0.95) 0%,rgba(40,15,15,0.9) 50%,rgba(20,15,10,0.95) 100%)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:18,padding:"16px 14px 20px",marginBottom:12,position:"relative",overflow:"hidden",minHeight:240}}>
        <div style={{textAlign:"center",marginBottom:6}}><span style={{fontFamily:"'Press Start 2P',monospace",fontSize:"0.5rem",color:"#f8717155",letterSpacing:3}}>— BATTLE —</span></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",padding:"0 4px",minHeight:170,position:"relative"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",animation:attacking&&!heroShaking?"heroAttackLunge 0.8s ease":"none",position:"relative",zIndex:10}}>
            <HeroSVG tier={heroTier} size={85} animate={!attacking} shaking={heroShaking} hpRatio={hero.hp/stats.maxHp}/>
            <ProgressBar value={hero.hp} max={stats.maxHp} color="#4ade80" height={7} label={`${hero.hp}`}/>
          </div>
          {showSlash&&<SlashEffect onDone={()=>setShowSlash(false)}/>}
          {showFire&&<FireBreath onDone={()=>setShowFire(false)}/>}
          {dmgNums.map(d=><DamageNumber key={d.id} {...d} onDone={()=>removeDmg(d.id)}/>)}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",position:"relative",zIndex:10}}>
            <DragonSVG stage={dragonStage} shaking={dragonShaking} size={115} hit={dragonHit}/>
            <div style={{width:90}}><ProgressBar value={dragonHp} max={dragon.hp} color="#ef4444" height={7} label={`${dragonHp}`}/></div>
            <div style={{fontSize:"0.5rem",color:"#f87171",marginTop:2}}>{dragon.name} ({dragonStage+1}/{DRAGON_STAGES.length})</div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div style={{display:"flex",gap:4,marginBottom:8}}>
        {SKILLS.filter(s=>hero.level>=s.unlock).map(skill=>{
          const cd=skillCooldowns[skill.id]||0;const active=skill.id==="crit"&&activeBuffs.crit||skill.id==="shield"&&activeBuffs.shield||skill.id==="fury"&&activeBuffs.fury>0;
          return(<button key={skill.id} onClick={()=>cd===0&&!attacking&&useSkill(skill)} disabled={cd>0||attacking} title={`${skill.name}: ${skill.desc}`} style={{
            flex:1,padding:"8px 4px",borderRadius:10,border:`1.5px solid ${active?skill.color+"88":cd>0?"transparent":skill.color+"33"}`,
            background:active?`${skill.color}22`:cd>0?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)",
            color:cd>0?"#4a4258":skill.color,fontWeight:700,fontSize:"0.65rem",cursor:cd>0?"not-allowed":"pointer",fontFamily:"inherit",textAlign:"center",opacity:cd>0?0.5:1,transition:"all 0.2s",position:"relative"
          }}>
            <div style={{fontSize:"1rem"}}>{skill.emoji}</div>
            <div>{skill.name}</div>
            {cd>0&&<div style={{fontSize:"0.5rem",color:"#f87171"}}>CD:{cd}</div>}
          </button>);
        })}
      </div>

      <button className="btn" onClick={attack} disabled={attacking} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:attacking?"#555":"linear-gradient(135deg,#dc2626,#b91c1c)",color:"#fff",fontWeight:900,fontSize:"1rem",fontFamily:"inherit",cursor:attacking?"wait":"pointer",marginBottom:10,boxShadow:attacking?"none":"0 4px 15px rgba(220,38,38,0.4)",opacity:attacking?0.6:1}}>{attacking?"⏳ 전투 중...":"⚔️ 공격하기!"}</button>

      <div ref={logRef} style={{background:"rgba(0,0,0,0.3)",borderRadius:10,padding:10,maxHeight:130,overflowY:"auto",border:"1px solid rgba(255,255,255,0.05)"}}>
        {battleLog.length===0?<div style={{color:"#4a4258",fontSize:"0.7rem",textAlign:"center",padding:8}}>전투 시작!</div>:
        battleLog.slice(-15).map((log,i)=>(<div key={i} style={{fontSize:"0.68rem",color:log.includes("처치")||log.includes("보너스")||log.includes("합류")?"#4ade80":log.includes("쓰러")?"#f87171":log.includes("등장")?"#facc15":"#a09ab0",padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,0.02)"}}>{log}</div>))}
      </div>
    </div>)}

    {/* ═══ INVENTORY ═══ */}
    {screen==="inventory"&&(<div>
      {/* Current Stats Summary */}
      <div style={{background:"linear-gradient(135deg,rgba(30,25,50,0.9),rgba(20,18,35,0.9))",borderRadius:14,padding:14,marginBottom:12,border:"1px solid rgba(250,204,21,0.15)"}}>
        <div style={{fontSize:"0.7rem",color:"#fbbf24",fontWeight:700,marginBottom:8}}>📊 전투 스탯</div>
        <div style={{display:"flex",gap:12}}>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:"0.55rem",color:"#8b7fa0",marginBottom:2}}>공격력</div>
            <div style={{fontSize:"1.1rem",fontWeight:900,color:"#ef4444"}}>{totalAtk}</div>
            <div style={{fontSize:"0.5rem",color:"#8b7fa0"}}>기본 {stats.atk}{equipAtk>0?<span style={{color:"#fbbf24"}}> +{equipAtk}</span>:""}</div>
          </div>
          <div style={{width:1,background:"rgba(255,255,255,0.06)"}}/>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:"0.55rem",color:"#8b7fa0",marginBottom:2}}>방어력</div>
            <div style={{fontSize:"1.1rem",fontWeight:900,color:"#60a5fa"}}>{totalDef}</div>
            <div style={{fontSize:"0.5rem",color:"#8b7fa0"}}>기본 {stats.def}{equipDef>0?<span style={{color:"#fbbf24"}}> +{equipDef}</span>:""}</div>
          </div>
          <div style={{width:1,background:"rgba(255,255,255,0.06)"}}/>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:"0.55rem",color:"#8b7fa0",marginBottom:2}}>HP</div>
            <div style={{fontSize:"1.1rem",fontWeight:900,color:"#4ade80"}}>{hero.hp}</div>
            <div style={{fontSize:"0.5rem",color:"#8b7fa0"}}>/ {stats.maxHp}</div>
          </div>
        </div>
      </div>

      {/* Equipped Slots */}
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:14,marginBottom:12,border:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{fontSize:"0.7rem",color:"#fbbf24",fontWeight:700,marginBottom:10}}>⚔️ 장착 중</div>
        <div style={{display:"flex",gap:8}}>
          {[{slot:"atk",label:"무기",statLabel:"공격력",empty:"🗡️",statColor:"#ef4444"},{slot:"def",label:"방패",statLabel:"방어력",empty:"🛡️",statColor:"#60a5fa"}].map(s=>{
            const item=equipped[s.slot];
            return(<div key={s.slot} style={{flex:1,padding:"12px 10px",borderRadius:12,background:item?"rgba(0,0,0,0.25)":"rgba(0,0,0,0.12)",border:`1.5px solid ${item?RARITY_COLOR[item.rarity]+"55":"rgba(255,255,255,0.06)"}`,textAlign:"center",transition:"all 0.2s"}}>
              <div style={{fontSize:"1.8rem",marginBottom:4}}>{item?item.emoji:s.empty}</div>
              <div style={{fontSize:"0.7rem",color:item?RARITY_COLOR[item.rarity]:"#5a4f6b",fontWeight:700,marginBottom:2}}>{item?item.name:`${s.label} 없음`}</div>
              {item&&<div style={{fontSize:"0.65rem",color:s.statColor,fontWeight:700,marginBottom:4}}>{s.statLabel} +{item.type==="equip_atk"?item.effect.atk:item.effect.def}</div>}
              {!item&&<div style={{fontSize:"0.55rem",color:"#4a4258",marginBottom:4}}>비어 있음</div>}
              {item&&<button onClick={()=>unequipItem(s.slot)} className="btn" style={{padding:"5px 14px",borderRadius:7,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#e8e0f0",fontSize:"0.6rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>해제하기</button>}
            </div>);
          })}
        </div>
      </div>

      {/* Pets */}
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:14,marginBottom:12,border:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{fontSize:"0.7rem",color:"#a78bfa",fontWeight:700,marginBottom:8}}>🐾 동료 ({pets.length}/{PET_POOL.length})</div>
        {pets.length===0?<div style={{fontSize:"0.7rem",color:"#5a4f6b",textAlign:"center",padding:12}}>드래곤을 처치하면 동료를 얻을 수 있어요!</div>:
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {pets.map(pet=>(<button key={pet.id} onClick={()=>setActivePet(activePet?.id===pet.id?null:pet)} style={{padding:"8px 12px",borderRadius:10,border:`1.5px solid ${activePet?.id===pet.id?pet.color+"66":"rgba(255,255,255,0.06)"}`,background:activePet?.id===pet.id?`${pet.color}15`:"rgba(0,0,0,0.15)",cursor:"pointer",textAlign:"center",fontFamily:"inherit"}}>
            <div style={{fontSize:"1.3rem"}}>{pet.emoji}</div>
            <div style={{fontSize:"0.6rem",color:pet.color,fontWeight:700}}>{pet.name}</div>
            <div style={{fontSize:"0.5rem",color:"#8b7fa0"}}>{pet.skill}</div>
            {activePet?.id===pet.id&&<div style={{fontSize:"0.45rem",color:pet.color,marginTop:2}}>✓ 활성</div>}
          </button>))}
        </div>}
      </div>

      {/* Inventory Items - separated by type */}
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:14,border:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{fontSize:"0.7rem",color:"#f59e0b",fontWeight:700,marginBottom:10}}>🎒 아이템 ({inventory.length})</div>
        {inventory.length===0?<div style={{fontSize:"0.7rem",color:"#5a4f6b",textAlign:"center",padding:16}}>전리품이 없습니다. 드래곤을 처치하세요!</div>:
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {/* Equipment items first, then consumables */}
          {[...inventory].sort((a,b)=>{const order={equip_atk:0,equip_def:1,consumable:2};return(order[a.type]||9)-(order[b.type]||9)}).map((item,sortedIdx)=>{
            const origIdx=inventory.indexOf(item);
            const isEquipType=item.type==="equip_atk"||item.type==="equip_def";
            const currentEquip=item.type==="equip_atk"?equipped.atk:item.type==="equip_def"?equipped.def:null;
            const statDiff=isEquipType?(item.type==="equip_atk"?(item.effect.atk-(currentEquip?.effect?.atk||0)):(item.effect.def-(currentEquip?.effect?.def||0))):0;
            return(<div key={item.uid||origIdx} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:10,background:"rgba(0,0,0,0.15)",border:`1px solid ${RARITY_COLOR[item.rarity]}22`,transition:"all 0.2s"}}>
              <span style={{fontSize:"1.3rem",width:32,textAlign:"center"}}>{item.emoji}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:"0.75rem",color:"#e8e0f0",fontWeight:700}}>{item.name}</span>
                  <span style={{fontSize:"0.45rem",color:RARITY_COLOR[item.rarity],fontWeight:700,textTransform:"uppercase",background:`${RARITY_COLOR[item.rarity]}15`,padding:"1px 5px",borderRadius:4}}>{item.rarity}</span>
                </div>
                <div style={{fontSize:"0.55rem",color:"#8b7fa0",marginTop:1}}>{item.desc}</div>
                {isEquipType&&statDiff!==0&&<div style={{fontSize:"0.55rem",marginTop:2,fontWeight:700,color:statDiff>0?"#4ade80":"#f87171"}}>
                  {currentEquip?`현재 장비 대비 ${statDiff>0?"+":""}${statDiff}`:"장착 시 스탯 증가"}
                </div>}
              </div>
              <button onClick={()=>useItem(item,origIdx)} className="btn" style={{
                padding:"6px 14px",borderRadius:8,border:"none",flexShrink:0,
                background:item.type==="consumable"?"linear-gradient(135deg,#4ade80,#22c55e)":item.type==="equip_atk"?"linear-gradient(135deg,#ef4444,#dc2626)":"linear-gradient(135deg,#60a5fa,#3b82f6)",
                color:item.type==="consumable"?"#0f0c18":"#fff",
                fontSize:"0.6rem",fontWeight:800,cursor:"pointer",fontFamily:"inherit",
              }}>{item.type==="consumable"?"사용":isEquipType?(currentEquip?"교체":"장착"):""}</button>
            </div>);
          })}
        </div>}
      </div>
    </div>)}

    {/* ═══ ACHIEVEMENTS ═══ */}
    {screen==="achievements"&&(<div>
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:14,border:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{fontSize:"0.7rem",color:"#fbbf24",fontWeight:700,marginBottom:12}}>🏅 업적 ({unlockedAch.length}/{ACHIEVEMENTS.length})</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {ACHIEVEMENTS.map(a=>{const earned=unlockedAch.includes(a.id);return(
            <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:earned?"rgba(251,191,36,0.06)":"rgba(0,0,0,0.15)",border:`1px solid ${earned?"rgba(251,191,36,0.2)":"rgba(255,255,255,0.04)"}`,opacity:earned?1:0.5}}>
              <Badge emoji={a.emoji} name={a.name} earned={earned} small/>
              <div style={{flex:1}}>
                <div style={{fontSize:"0.8rem",color:earned?"#fbbf24":"#6b5f7b",fontWeight:700}}>{a.name}</div>
                <div style={{fontSize:"0.6rem",color:earned?"#8b7fa0":"#4a4258"}}>{a.desc}</div>
              </div>
              {earned&&<span style={{fontSize:"0.6rem",color:"#4ade80",fontWeight:700}}>✓</span>}
            </div>);
          })}
        </div>
      </div>
    </div>)}

  </div></div>);
}

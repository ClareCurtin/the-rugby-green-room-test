window.RGR_PUBLIC_KEY="sb_publishable_PaX_NOTb1QfB-kSDI_PrbA_IXtV40s5";
(function frontend(){
"use strict";
const BASE="https://wvuaxfofmgsaryvujrtc.supabase.co";
const API=BASE+"/functions/v1/rugby-phone-test/api/fixtures";
const KEY=window.RGR_PUBLIC_KEY;
const $=id=>document.getElementById(id);
let token="",refresh="",person=null,profile=null,rooms=[],venues=[],collections=[],matches=[],activeRoom=null,refreshTimer=null,roomPoll=null;
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dateLabel=t=>t?new Date(t).toLocaleString(undefined,{weekday:"short",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):"Time to be confirmed";
const css=document.createElement("style");css.textContent=`
#rgr-auth{position:fixed;inset:0;background:#052b20;z-index:99999;overflow:auto;display:grid;place-items:center;padding:24px 16px;color:#112f26}#rgr-auth[hidden]{display:none!important}
#rgr-auth .login-card{width:min(440px,100%);padding:26px;border-radius:20px;background:#f8f3e8;box-shadow:0 25px 85px #00190d}
#rgr-auth img{width:210px;max-height:135px;object-fit:contain;display:block;margin:auto}
#rgr-auth input,.rgr-input,.rgr-select{display:block;width:100%;box-sizing:border-box;padding:13px;border:1px solid #bec8bf;background:white;color:#12372a;font:inherit;border-radius:11px;margin:7px 0 13px}
#rgr-auth label,.rgr-field{display:block;font-size:13px;font-weight:700;margin:11px 0}
#rgr-auth button,.rgr-btn{display:inline-block;border:none;border-radius:11px;background:#124b37;color:white;min-height:44px;padding:11px 15px;font-weight:750;cursor:pointer;font:inherit}
#rgr-auth button{width:100%;margin:5px 0}
#rgr-auth button.secondary,.rgr-btn.secondary{color:#124b37;background:#e5eadd}
#rgr-auth #rgr-auth-msg{font-size:13px;color:#9b3c31;line-height:1.4}
#rgr-greeting{margin:14px 17px 18px;padding:19px;border-radius:15px;background:#e9ede4;color:#123b2c}
#rgr-greeting h2{font-family:Georgia,serif;font-size:26px;margin:0 0 5px;color:#123b2c}
#rgr-greeting p{margin:0;font-size:14px;color:#3d5a4e}
.rgr-card{border:1px solid #d7dfd5;background:#fff;border-radius:14px;padding:15px;margin:10px 0;color:#113528}
.rgr-card h3{margin:5px 0;color:#123d2f;font-family:Georgia,serif}
.rgr-card p{margin:6px 0 10px;line-height:1.45;color:#4b6155;font-size:13px}
.rgr-card small{font-size:11px;color:#718174}
.rgr-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.rgr-row>*{min-width:0}
.rgr-tag{display:inline-block;background:#e3e9df;border-radius:50px;padding:4px 8px;font-size:11px;color:#285039}
.rgr-status{padding:10px 0;color:#5a655c;font-size:12px}
.rgr-chat{min-height:140px;max-height:420px;overflow:auto;background:#eef1e9;padding:14px;border-radius:13px;margin:12px 0}
.rgr-bubble{background:white;border-radius:13px;padding:10px;margin:8px 0;font-size:14px}
.rgr-bubble small{display:block;font-weight:bold;margin-bottom:5px;color:#246045}
.rgr-inline{display:flex;gap:8px}.rgr-inline input{flex:1;min-width:0}
.rgr-checkboxes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:14px 0}
.rgr-checkboxes label{display:flex;gap:7px;align-items:center;background:#f7f8f5;border:1px solid #d5dfd5;padding:10px;border-radius:9px;font-size:12px;font-weight:700}
.rgr-checkboxes input{width:17px;height:17px;accent-color:#11633c}
.rgr-room-list{display:grid;gap:9px;margin-top:12px}.rgr-room-list button{text-align:left;background:#edf3ec;border:1px solid #cfded2;color:#124a36;border-radius:12px;padding:14px;font-weight:700}
#screen-shop .shop-area>.notice{display:none}#screen-fixtures .gf-page>.notice,#screen-fixtures .gf-footnote,.gf-source-label{display:none}
#screen-find .map-stage,#screen-find .map-demo{display:none}
#screen-find .venue-list{padding:0 16px 20px}
#screen-rooms .mini-feed{display:none}#screen-rooms .pad>.notice{display:none}
#screen-home .fixt{display:none}
#screen-family .rgr-room{padding:18px 16px 110px;background:#f8f6ed;min-height:80vh}
#screen-family .rgr-room h1{font-family:Georgia,serif;font-size:30px;color:#143c2d}
#rgr-profile-teams{padding:6px 0}
`;
document.head.append(css);
const originURL=location.origin+location.pathname;
const login=document.createElement("div");login.id="rgr-auth";login.hidden=true;login.innerHTML=`
<div class="login-card"><div style="background:#073a29;border-radius:12px;padding:10px"><img src="./official-logo.png" alt="Off The Bench Ireland"/></div>
<h2 style="font-family:Georgia,serif;margin:18px 0 6px">The Rugby Green Room</h2>
<p style="margin:4px 0 18px;font-size:14px">Find the match. Find your people. Find the craic.</p>
<form id="rgr-auth-form">
<div id="rgr-signup-name" hidden><label>First name<input id="rgr-first" autocomplete="given-name" maxlength="70"></label></div>
<label>Email address<input type="email" id="rgr-email" required autocomplete="email"></label>
<label>Password<input type="password" id="rgr-pass" required minlength="6" autocomplete="current-password"></label>
<button id="rgr-submit" type="submit">Sign in</button></form>
<button class="secondary" type="button" id="rgr-switch">New here? Create an account</button>
<p id="rgr-auth-msg" role="status"></p></div>`;
document.body.append(login);
login.querySelector('img').src=document.querySelector('.brandbar img')?.src||'';
let registering=false;
$("rgr-switch").onclick=()=>{
 registering=!registering;$("rgr-signup-name").hidden=!registering;
 $("rgr-submit").textContent=registering?"Create account":"Sign in";
 $("rgr-switch").textContent=registering?"Already registered? Sign in":"New here? Create an account";
 $("rgr-auth-msg").textContent="";
};
function saveSession(v){
 if(v.access_token){token=v.access_token;refresh=v.refresh_token||refresh;localStorage.setItem("rgr_session",JSON.stringify({token,refresh}));}
}
function clearSession(){token="";refresh="";localStorage.removeItem("rgr_session");person=null;profile=null;login.hidden=false;clearInterval(roomPoll);}
async function auth(path,body){
 const res=await fetch(BASE+"/auth/v1/"+path,{method:"POST",headers:{"content-type":"application/json","apikey":KEY},body:JSON.stringify(body)});
 const val=await res.json().catch(()=>({}));if(!res.ok)throw Error(val.msg||val.error_description||val.message||val.error||"Sign-in failed");return val;
}
async function renew(){
 if(!refresh)return false;
 try{const r=await auth("token?grant_type=refresh_token",{refresh_token:refresh});saveSession(r);return true;}catch{return false;}
}
async function api(path,opts={}){
 const req=()=>fetch(BASE+path,{method:opts.method||"GET",headers:{"apikey":KEY,"authorization":"Bearer "+token,"content-type":"application/json","prefer":opts.prefer||""},body:opts.body?JSON.stringify(opts.body):undefined});
 let res=await req();if(res.status===401&&await renew())res=await req();
 if(!res.ok){let v=await res.json().catch(()=>({}));throw Error(v.message||v.error||v.msg||("Request failed: "+res.status));}
 if(res.status===204||res.status===201&&(!opts.prefer||!opts.prefer.includes("representation")))return null;
 let raw=await res.text();return raw?JSON.parse(raw):null;
}
$("rgr-auth-form").onsubmit=async ev=>{
 ev.preventDefault();const email=$("rgr-email").value.trim(),password=$("rgr-pass").value;
 $("rgr-auth-msg").textContent="Checking your details…";$("rgr-submit").disabled=true;
 try{
  if(registering){
   const first=$("rgr-first").value.trim();if(!first)throw Error("Please enter your first name.");
   const v=await auth("signup?redirect_to="+encodeURIComponent(originURL),{email,password,data:{first_name:first}});
   if(v.access_token){saveSession(v);await start();}
   else $("rgr-auth-msg").textContent="Check your email, confirm your address, then return here and sign in.";
  }else{const v=await auth("token?grant_type=password",{email,password});saveSession(v);await start();}
 }catch(e){$("rgr-auth-msg").textContent=e.message;}finally{$("rgr-submit").disabled=false;}
};
function displayError(el,e){el.innerHTML='<div class="rgr-card"><p>'+escapeHtml(e.message||e)+'</p></div>';}
async function loadProfile(){
 const x=await api("/rest/v1/supporter_profiles?select=first_name,home_area,preferred_teams&user_id=eq."+person.id);
 profile=x?.[0]||{first_name:person.user_metadata?.first_name||"Supporter",home_area:"Dublin",preferred_teams:[]};
 if(!Array.isArray(profile.preferred_teams))profile.preferred_teams=[];
 const card=document.querySelector("#screen-profile .profile-card");
 if(card){card.querySelector("h2").textContent=profile.first_name;card.querySelector("p").textContent=person.email;card.querySelector(".profile-avatar").textContent=profile.first_name.slice(0,1).toUpperCase();}
 const greeting=$("rgr-greeting");if(greeting){greeting.querySelector("h2").textContent="Welcome back, "+profile.first_name+".";
 greeting.querySelector("p").textContent="Which match are we watching, and where's your crowd today?";}
 for(let id of ["profile-city","city","local-place"]){let select=$(id);if(select&&[...select.options].some(o=>o.value===profile.home_area))select.value=profile.home_area;}
 drawTeams();
}
const teamNames=["Ireland Men","Ireland Women","Ireland U20","Leinster","Munster","Ulster","Connacht","England","Scotland","Wales","France","Italy","South Africa","New Zealand","Australia","Argentina","Japan","Fiji","Other"];
function drawTeams(){
 const old=$("profile-team");if(old)old.style.display="none";
 let wrap=$("rgr-profile-teams");if(!wrap){wrap=document.createElement("div");wrap.id="rgr-profile-teams";old?.insertAdjacentElement("afterend",wrap);}
 wrap.innerHTML='<strong style="font-size:15px">Teams I follow (choose as many as you like)</strong><div class="rgr-checkboxes">'+teamNames.map(t=>'<label><input type="checkbox" value="'+escapeHtml(t)+'" '+(profile?.preferred_teams.includes(t)?"checked":"")+'>'+escapeHtml(t)+'</label>').join("")+'</div>';
 const oldLabel=document.querySelector('label[for="profile-team"]');if(oldLabel)oldLabel.style.display="none";
 const saved=document.querySelector("#screen-profile .formbox button");if(saved){saved.textContent="SAVE MY PREFERENCES";saved.onclick=savePreferences;}
 $("prefs-status").textContent="Choose the teams you follow; you do not have to follow every Irish team.";
 if(!$("rgr-sign-out")){let b=document.createElement("button");b.id="rgr-sign-out";b.className="rgr-btn secondary";b.textContent="Sign out";b.style.margin="14px 0 30px 18px";b.onclick=async()=>{try{await auth("logout",{});}catch{}clearSession();};$("screen-profile").append(b);}
}
async function savePreferences(){
 const area=$("profile-city").value,teams=[...document.querySelectorAll("#rgr-profile-teams input:checked")].map(x=>x.value);
 $("prefs-status").textContent="Saving…";
 try{await api("/rest/v1/supporter_profiles?user_id=eq."+person.id,{method:"PATCH",body:{home_area:area,preferred_teams:teams,updated_at:new Date().toISOString()}});profile.home_area=area;profile.preferred_teams=teams;$("prefs-status").textContent="Preferences saved to your supporter account.";}
 catch(e){$("prefs-status").textContent=e.message;}
}
window.savePreferences=savePreferences;
async function loadVenues(){
 venues=await api("/rest/v1/green_venues?select=name,city,address,description,website,screening_status&published=eq.true&order=city.asc,name.asc");
 // Keep the location picker aligned with actual published venue locations.
 const venueSelect=$("city");if(venueSelect){for(const city of [...new Set(venues.map(v=>v.city))].sort()){if(![...venueSelect.options].some(o=>o.value.toLowerCase()===city.toLowerCase())){const option=new Option(city,city);venueSelect.add(option);}}}
 const mapNote=$("screen-find").querySelector(".micro");if(mapNote)mapNote.textContent="Real venues · confirm your match";
 drawVenues();
}
function drawVenues(){
 const city=$("city")?.value||"Dublin",host=document.querySelector("#screen-find .venue-list");
 if(!host)return;
 const list=venues.filter(v=>v.city.toLowerCase()===city.toLowerCase());
 $("selected-city").textContent=city;
 const note=$("radius-note");if(note)note.textContent=list.length?"Rugby-friendly places in "+city:"No listed pubs yet in "+city;
 host.innerHTML=list.length?list.map(v=>`<div class="rgr-card"><span class="rgr-tag">Rugby viewing venue</span><h3>${escapeHtml(v.name)}</h3><p>${escapeHtml(v.address)}</p><p>${escapeHtml(v.description)}</p><small>Check the specific match with the pub before travelling.</small><div style="margin-top:13px"><a class="rgr-btn" href="${escapeHtml(v.website)}" target="_blank" rel="noopener noreferrer">Venue website ↗</a></div></div>`).join(""):'<div class="rgr-card"><h3>Help put '+escapeHtml(city)+' on the map</h3><p>We haven’t yet confirmed a venue here. Try another city or ask the local Green Room.</p><button class="rgr-btn" onclick="go(\'rooms\')">Ask your local room</button></div>';
}
window.updateFinder=drawVenues;
async function loadCollections(){
 collections=await api("/rest/v1/otb_collections?select=slug,name,category,description,sort_order&published=eq.true&order=sort_order.asc");
 const cards=[...document.querySelectorAll("#screen-shop .shop-card")];cards.forEach((card,i)=>{if(!collections[i])return;card.querySelector("strong").textContent=collections[i].name;card.querySelector("span").textContent=collections[i].category;card.querySelector("small").textContent="See the collection ↗";});
 const header=document.querySelector("#screen-shop .shop-brandline");if(header)header.textContent="Off The Bench Ireland · rugby lifestyle collections";
 const desc=document.querySelector("#screen-shop .shop-info");if(desc)desc.innerHTML="<strong>Made for the love of rugby. Designed for life beyond the game.</strong><p>Explore nine Off The Bench lifestyle collections featuring original rugby humour and everyday essentials. These are product concepts; stock and checkout are not available yet.</p>";
}
// Competition titles are public-facing; source feed slugs must never appear in the UI.
const competitionNames=Object.freeze({
 "six-nations":"Six Nations (Men)",
 "Six Nations (Men)":"Six Nations (Men)",
 "guinness-six-nations":"Six Nations (Men)",
 "six-nations-women":"Six Nations (Women)",
 "womens-six-nations":"Six Nations (Women)",
 "women-six-nations":"Six Nations (Women)",
 "Six Nations (Women)":"Six Nations (Women)",
 "urc":"United Rugby Championship",
 "United Rugby Championship":"United Rugby Championship",
 "champions-cup":"Investec Champions Cup",
 "European Rugby Champions Cup":"Investec Champions Cup",
 "Investec Champions Cup":"Investec Champions Cup",
 "challenge-cup":"EPCR Challenge Cup",
 "EPCR Challenge Cup":"EPCR Challenge Cup",
 "nations-championship":"World Rugby Nations Championship",
 "Nations Championship":"World Rugby Nations Championship",
 "World Rugby Nations Championship":"World Rugby Nations Championship",
 "world-cup":"Rugby World Cup",
 "Rugby World Cup (Men)":"Rugby World Cup",
 "Rugby World Cup":"Rugby World Cup"
});
const excludedCompetitionKeys=new Set(["premiership","Premiership Rugby","Gallagher Premiership","Gallagher PREM"]);
function competitionTitle(raw){
 const key=String(raw||"").trim();
 return competitionNames[key] || key.replace(/-/g," ").replace(/\\b\\w/g,c=>c.toUpperCase()) || "Other Rugby";
}
function normalizeFixtures(data){
 const byKey=new Map();
 function add(row){
  const source=String(row.competition||row.competition_name||row.competition_key||"").trim();
  if(excludedCompetitionKeys.has(source))return;
  const comp=competitionTitle(source),day=row.match_date||"";
  if(!day||!row.home_team||!row.away_team)return;
  const teams=[row.home_team,row.away_team].map(t=>t.trim().toLowerCase()).sort();
  const key=day+"|"+teams.join("|")+"|"+comp;
  const prior=byKey.get(key);
  const match={competition:comp,match_date:day,kickoff_at:row.kickoff_at,home_team:row.home_team,away_team:row.away_team,venue:row.venue,home_score:row.home_score,away_score:row.away_score};
  if(!prior){byKey.set(key,match);return;}
  if(!prior.kickoff_at&&match.kickoff_at)prior.kickoff_at=match.kickoff_at;
  if(!prior.venue&&match.venue)prior.venue=match.venue;
  // Use verified full-time results where the matching fixture record lacks a score.
  if(prior.home_score==null&&match.home_score!=null&&match.away_score!=null){
   const sameOrder=prior.home_team.trim().toLowerCase()===match.home_team.trim().toLowerCase();
   prior.home_score=sameOrder?match.home_score:match.away_score;
   prior.away_score=sameOrder?match.away_score:match.home_score;
  }
 }
 for(const group of ["staging","canonical","archive"])for(const row of (data[group]||[]))add(row);
 return [...byKey.values()].sort((a,b)=>(a.kickoff_at||a.match_date).localeCompare(b.kickoff_at||b.match_date));
}
async function loadFixtures(){
 let res=await fetch(API,{headers:{"authorization":"Bearer "+token,"apikey":KEY}});
 if(res.status===401&&await renew())res=await fetch(API,{headers:{"authorization":"Bearer "+token,"apikey":KEY}});
 if(!res.ok)throw Error("Fixtures currently unavailable ("+res.status+")");
 matches=normalizeFixtures(await res.json());
 const comps=[...new Set(matches.map(x=>x.competition))].sort(),years=[...new Set(matches.map(x=>x.match_date.slice(0,4)))].sort().reverse();
 $("gf-competition").innerHTML='<option value="__all__">All competitions</option>'+comps.map(c=>'<option value="'+escapeHtml(c)+'">'+escapeHtml(c)+'</option>').join("");
 $("gf-season").innerHTML='<option value="__all__">All seasons</option>'+years.map(y=>'<option value="'+y+'">'+y+'</option>').join("");
 // Show the next match across competitions and seasons by default.
 $("gf-season").value="__all__";
 $("gf-competition").value="__all__";
 $("gf-count").textContent="Choose a competition, season or team";
 $("gf-directory").innerHTML=comps.map(c=>'<button class="gf-dir-pill" data-comp="'+escapeHtml(c)+'">'+escapeHtml(c)+'</button>').join("");
 $("gf-directory").querySelectorAll("button").forEach(b=>b.onclick=()=>{$("gf-competition").value=b.dataset.comp;drawFixtures();});
 const matchSelect=$("match");if(matchSelect){matchSelect.innerHTML='<option value="">Any match</option>'+matches.filter(isFutureFixture).sort((a,b)=>fixtureTime(a)-fixtureTime(b)).slice(0,120).map(m=>'<option value="'+escapeHtml(m.home_team+" v "+m.away_team)+'">'+escapeHtml(m.home_team+" v "+m.away_team+" · "+m.match_date)+'</option>').join("");}
 drawFixtures();homeFixture();
}
function homeFixture(){
 const next=matches.filter(m=>isFutureFixture(m)).sort((a,b)=>fixtureTime(a)-fixtureTime(b))[0];
 let el=$("rgr-home-match");if(!el)return;
 el.innerHTML=next?`<div class="rgr-card"><small>${escapeHtml(next.competition)}</small><h3>${escapeHtml(next.home_team)} v ${escapeHtml(next.away_team)}</h3><p>${escapeHtml(dateLabel(next.kickoff_at)||next.match_date)}</p><button class="rgr-btn" onclick="go('fixtures')">Find more matches</button></div>`:'<div class="rgr-card"><h3>Find your next match</h3><p>Explore the rugby calendar and choose the teams you follow.</p><button class="rgr-btn" onclick="go(\'fixtures\')">Browse fixtures</button></div>';
}
function fixtureTime(m){return new Date(m.kickoff_at||m.match_date+"T23:59:59Z").getTime();}
function isFutureFixture(m){return m.home_score==null&&m.away_score==null&&fixtureTime(m)>=Date.now();}
function drawFixtures(){
 const comp=$("gf-competition").value,year=$("gf-season").value,search=$("gf-search").value.toLowerCase().trim(),irish=$("gf-irish").classList.contains("gf-active");
 const rows=matches.filter(m=>(comp==="__all__"||m.competition===comp)&&(year==="__all__"||m.match_date.startsWith(year))&&(!search||(m.home_team+" "+m.away_team).toLowerCase().includes(search))&&(!irish||/ireland|leinster|munster|ulster|connacht/i.test(m.home_team+" "+m.away_team)));
 const future=rows.filter(isFutureFixture).sort((a,b)=>fixtureTime(a)-fixtureTime(b));
 const past=rows.filter(m=>!isFutureFixture(m)).sort((a,b)=>fixtureTime(b)-fixtureTime(a));
 const count=$("gf-count");if(count)count.textContent=future.length+" upcoming · "+past.length+" past matches";
 const root=$("gf-results");
 const card=m=>'<div class="rgr-card"><small>'+escapeHtml(m.competition)+' · '+escapeHtml(m.match_date)+'</small><h3>'+escapeHtml(m.home_team)+' '+(m.home_score==null?"v":m.home_score+" – "+m.away_score)+' '+escapeHtml(m.away_team)+'</h3><p>'+(m.kickoff_at?escapeHtml(dateLabel(m.kickoff_at)):"Kick-off time to be confirmed")+(m.venue?" · "+escapeHtml(m.venue):"")+'</p></div>';
 root.innerHTML='<section aria-label="Upcoming rugby fixtures"><h2 style="padding:18px 0 4px">Upcoming fixtures</h2>'+(future.length?future.slice(0,120).map(card).join(""):'<div class="rgr-card">No upcoming fixtures found for these filters.</div>')+'</section><details class="rgr-past" style="margin-top:24px"><summary style="font-weight:800;font-size:19px;cursor:pointer">Past matches ('+past.length+')</summary>'+past.slice(0,120).map(card).join("")+(past.length>120?'<p class="rgr-status">Showing most recent 120 results. Narrow the filters to see more.</p>':'')+'</details>';
 if(future.length>120)root.insertAdjacentHTML("beforeend",'<div class="rgr-status">Showing the first 120 upcoming fixtures. Narrow your filters to see more.</div>');
}
window.gfDraw=drawFixtures;
async function loadRooms(){
 rooms=await api("/rest/v1/green_rooms?select=id,kind,name,city,description,match_label,match_kickoff,invite_code&order=created_at.asc");
 const privateRooms=rooms.filter(x=>x.kind==="family");
 const list=$("rgr-private-list");
 if(list)list.innerHTML=privateRooms.length?privateRooms.map(x=>`<button class="rgr-btn secondary" type="button" data-id="${x.id}">${escapeHtml(x.name)}${x.match_label?" · "+escapeHtml(x.match_label):""}</button>`).join(""):'<p style="font-size:13px">Your private rooms will appear here. Create one to invite family or friends.</p>';
 list?.querySelectorAll("button").forEach(b=>b.onclick=()=>openRoom(b.dataset.id));
 const local=rooms.find(x=>x.kind==="local"&&x.city===$("local-place")?.value);
 if(local){$("local-title").textContent=local.name;const btn=$("join-local-btn");btn.textContent="Join "+local.name;btn.onclick=()=>joinLocal(local.id);}
 else {$("local-title").textContent=$("local-place").value+" Green Room";$("join-local-btn").textContent="Room not available yet";$("join-local-btn").onclick=()=>alert("This local Green Room has not been set up yet.");}
}
window.updateLocalRoom=()=>{const local=rooms.find(x=>x.kind==="local"&&x.city===$("local-place").value);if(!local){$("local-title").textContent=$("local-place").value+" Green Room";$("join-local-btn").textContent="Room not available yet";$("join-local-btn").onclick=()=>alert("This local Green Room has not been set up yet.");return;}$("local-title").textContent=local.name;$("join-local-btn").textContent="Join "+local.name;$("join-local-btn").onclick=()=>joinLocal(local.id);};
window.joinLocalRoom=async()=>{const local=rooms.find(x=>x.kind==="local"&&x.city===$("local-place").value);if(local)await joinLocal(local.id);};
async function joinLocal(id){
 try{await api("/rest/v1/rpc/join_local_green_room",{method:"POST",body:{p_room:id}});await openRoom(id);}
 catch(e){alert(e.message);}
}
async function createPrivate(ev){
 ev.preventDefault();let btn=$("rgr-create-btn");btn.disabled=true;
 const name=$("rgr-room-name").value.trim(),match=$("rgr-room-match").value.trim();
 $("rgr-room-error").textContent="Creating your private Green Room…";
 try{const raw=await api("/rest/v1/rpc/create_private_green_room",{method:"POST",body:{p_name:name,p_match:match}});const id=typeof raw==="string"?raw:raw?.id||raw?.[0]?.id;
  if(!id)throw Error("Room creation did not return a room ID.");
  await openRoom(id);
  if(!activeRoom||activeRoom.id!==id)throw Error("Your room was created but could not be opened. Please refresh your rooms.");
  $("rgr-room-name").value="";$("rgr-room-match").value="";$("rgr-room-error").textContent="";}

 catch(e){$("rgr-room-error").textContent=e.message;}finally{btn.disabled=false;}
}
async function openRoom(id){
 activeRoom=rooms.find(r=>r.id===id);
 if(!activeRoom){const direct=await api("/rest/v1/green_rooms?select=id,kind,name,city,description,match_label,match_kickoff,invite_code&id=eq."+encodeURIComponent(id));activeRoom=direct?.[0]||null;if(activeRoom)rooms.push(activeRoom);}
 if(!activeRoom)throw Error("This Green Room could not be found or you do not have permission to access it.");
 const screen=$("screen-family");
 screen.innerHTML=`<div class="rgr-room"><p style="font-size:12px;letter-spacing:.12em;color:#986f2d">${activeRoom.kind==="family"?"INVITE-ONLY · FAMILY & FRIENDS":"LOCAL GREEN ROOM"}</p><h1>${escapeHtml(activeRoom.name)}</h1>${activeRoom.match_label?'<p>Watching: '+escapeHtml(activeRoom.match_label)+'</p>':'<p>Find your crowd. Share the match.</p>'}<div class="rgr-row">${activeRoom.kind==="family"?'<button class="rgr-btn" id="rgr-invite">Invite family & friends ↗</button>':''}<button class="rgr-btn secondary" id="rgr-back-rooms">All Green Rooms</button></div><div class="rgr-chat" id="rgr-messages"><p>Loading messages…</p></div><form id="rgr-chat-form" class="rgr-inline"><input id="rgr-chat-text" class="rgr-input" maxlength="1200" autocomplete="off" required placeholder="Message your room…"><button class="rgr-btn" type="submit">Send</button></form><p class="rgr-status" id="rgr-chat-status">Only members of this room can read these messages.</p></div>`;
 $("rgr-back-rooms").onclick=()=>{activeRoom=null;window.go("rooms");};
 if($("rgr-invite"))$("rgr-invite").onclick=()=>shareRoom(activeRoom.invite_code);
 $("rgr-chat-form").onsubmit=sendMessage;
 window.go("family");
 await readMessages();
 clearInterval(roomPoll);roomPoll=setInterval(()=>{if(activeRoom?.id===id)readMessages(true);},6000);
}
async function readMessages(silent=false){
 if(!activeRoom)return;const id=activeRoom.id;
 try{const msgs=await api("/rest/v1/green_room_messages?select=author_name,body,created_at&room_id=eq."+id+"&order=created_at.asc&limit=150");if(!activeRoom||activeRoom.id!==id)return;
 const host=$("rgr-messages");if(!host)return;
 const scrolled=host.scrollTop+host.clientHeight>=host.scrollHeight-50;
 host.innerHTML=msgs.length?msgs.map(m=>'<div class="rgr-bubble"><small>'+escapeHtml(m.author_name)+' · '+new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+'</small>'+escapeHtml(m.body)+'</div>').join(""):'<p style="font-size:14px">This room is ready. Start the conversation!</p>';
 if(scrolled)host.scrollTop=host.scrollHeight;
 }catch(e){if(!silent)$("rgr-chat-status").textContent=e.message;}
}
async function sendMessage(ev){
 ev.preventDefault();if(!activeRoom)return;
 let el=$("rgr-chat-text"),message=el.value.trim();if(!message)return;el.disabled=true;
 try{await api("/rest/v1/green_room_messages",{method:"POST",body:{room_id:activeRoom.id,author_id:person.id,body:message}});el.value="";await readMessages();}
 catch(e){$("rgr-chat-status").textContent=e.message;}finally{el.disabled=false;el.focus();}
}
async function shareRoom(code){
 if(!code)return alert("No invitation available for this room.");
 const url=originURL+"?invite="+encodeURIComponent(code);
 const title="Join our Rugby Green Room — Wherever we're watching. Le Chéile.";
 try{if(navigator.share){await navigator.share({title,text:"Watch the match with us in The Rugby Green Room!",url});}
 else if(navigator.clipboard){await navigator.clipboard.writeText(url);alert("Invitation link copied. Paste it into WhatsApp.");}
 else prompt("Copy this invite link to WhatsApp:",url);
 }catch(e){if(e.name!=="AbortError")prompt("Copy this link:",url);}
}
async function checkInvite(){
 const code=new URLSearchParams(location.search).get("invite");if(!code)return;
 try{
  const id=await api("/rest/v1/rpc/join_private_green_room",{method:"POST",body:{p_code:code}});
  history.replaceState(null,"",originURL);
  await loadRooms();await openRoom(id);
 }catch(e){alert("Couldn't join that room: "+e.message);}
}
function setUpInterface(){
 const hero=$("screen-home").querySelector(".hero");
 const greeting=document.createElement("div");greeting.id="rgr-greeting";greeting.innerHTML="<h2>Welcome back.</h2><p>Which match are we watching, and where's your crowd today?</p>";hero.insertAdjacentElement("afterend",greeting);
 const next=document.createElement("div");next.id="rgr-home-match";$("screen-home").querySelector(".section-title").insertAdjacentElement("afterend",next);
 const searchNote=$("screen-find").querySelector(".map-label");if(searchNote)searchNote.textContent="FIND RUGBY NEAR YOU";
 const n=$("screen-rooms").querySelector(".local-room-card");if(n){let feed=n.querySelector(".mini-feed");if(feed)feed.remove();let label=n.querySelector(".eyebrow");if(label)label.textContent="LIVE LOCAL RUGBY CHAT";let p=n.querySelector("p");if(p)p.textContent="Join supporters in your selected county or city. Start a discussion, share match-day plans and ask where the game is on.";}
 const holder=document.createElement("div");holder.innerHTML=`<div class="section-title" style="margin:25px 0 10px"><h2>Your private rooms</h2></div><div id="rgr-private-list" class="rgr-room-list"></div><div class="rgr-card" style="margin-top:18px"><h3>Create a family or friends Green Room</h3><p>Pick a room name and a match. Then share a private invite link on WhatsApp. Everyone signs in using their own account.</p><form id="rgr-create-form"><label class="rgr-field">Group name<input id="rgr-room-name" class="rgr-input" placeholder="The Friday Night Crew" minlength="2" maxlength="90" required></label><label class="rgr-field">Match to watch (optional)<input id="rgr-room-match" class="rgr-input" placeholder="Ireland v France"></label><button id="rgr-create-btn" type="submit" class="rgr-btn">Create private room</button><p id="rgr-room-error" class="rgr-status"></p></form></div>`;
 $("screen-rooms").querySelector(".pad").append(holder);
 $("rgr-create-form").onsubmit=createPrivate;
 const privateCard=$("screen-rooms").querySelector(".private-room-card");if(privateCard){let b=privateCard.querySelector("button");if(b){b.textContent="CREATE OR OPEN A PRIVATE ROOM →";b.onclick=()=>{$("rgr-create-form").scrollIntoView({behavior:"smooth"});};}}
 const profileTeam=$("profile-team");if(profileTeam)profileTeam.style.display="none";
 const oldGo=window.go;window.go=function(name){if(name==="family"&&!activeRoom)return oldGo("rooms");oldGo(name);};
}
async function start(){
 const user=await api("/auth/v1/user");person=user;login.hidden=true;
 await loadProfile();
 const jobs=await Promise.allSettled([loadFixtures(),loadVenues(),loadCollections(),loadRooms()]);
 for(let i=0;i<jobs.length;i++)if(jobs[i].status==="rejected")console.warn("Green Room data",i,jobs[i].reason);
 await checkInvite();
}
async function init(){
 setUpInterface();const prior=JSON.parse(localStorage.getItem("rgr_session")||"{}");token=prior.token||"";refresh=prior.refresh||"";
 const query=new URLSearchParams(location.hash.slice(1));
 if(query.get("access_token")){token=query.get("access_token");refresh=query.get("refresh_token")||"";saveSession({access_token:token,refresh_token:refresh});history.replaceState(null,"",originURL);}
 if(!token){login.hidden=false;return;}
 try{await start();}catch(e){if(await renew()){try{await start();return;}catch{} }clearSession();}
}
init();
})();
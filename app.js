const $ = (s) => document.querySelector(s);
const STORAGE_KEY = "nexora_ai_chats_v1";
const SETTINGS_KEY = "nexora_ai_settings_v1";
let chats = loadChats();
let currentChatId = null;
let isSending = false;

function loadChats(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return []} }
function saveChats(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(chats)); }
function loadSettings(){ try{return JSON.parse(localStorage.getItem(SETTINGS_KEY)||"{}")}catch{return {}} }
function saveSettings(){ localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings)); }
let settings = loadSettings();
$("#apiEndpoint").value = settings.endpoint || "";
updateMode();

function updateMode(){ const live=Boolean(settings.endpoint); $("#modeLabel").textContent=live?"Connected backend":"Demo mode"; }
function makeId(){return "chat_"+Date.now()+"_"+Math.random().toString(36).slice(2,7)}
function activeChat(){return chats.find(c=>c.id===currentChatId)}
function newChat(){currentChatId=makeId();chats.unshift({id:currentChatId,title:"New conversation",messages:[],updated:Date.now()});saveChats();renderHistory();renderChat();$("#messageInput").focus();closeSidebar()}
function ensureChat(){if(!activeChat())newChat();return activeChat()}
function renderHistory(){
  const list=$("#historyList");list.innerHTML="";
  chats.slice(0,30).forEach(chat=>{
    const b=document.createElement("button");b.className="history-item"+(chat.id===currentChatId?" selected":"");
    b.innerHTML='<span class="hist-symbol">◈</span><span></span>';b.lastChild.textContent=chat.title||"New conversation";
    b.addEventListener("click",()=>{currentChatId=chat.id;renderHistory();renderChat();closeSidebar()});list.appendChild(b);
  });
}
function renderChat(){
  const chat=activeChat();const welcome=$("#welcome"),messages=$("#messages");
  messages.innerHTML="";
  if(!chat||!chat.messages.length){welcome.style.display="block";messages.classList.remove("visible");return}
  welcome.style.display="none";messages.classList.add("visible");
  chat.messages.forEach((m,i)=>appendMessage(m.role,m.content,false,i));
}
function appendMessage(role,content,animate=true,index=null){
  const wrap=document.createElement("div");wrap.className="message "+(role==="user"?"user":"assistant");
  const avatar=document.createElement("div");avatar.className="message-avatar";avatar.textContent=role==="user"?"A":"✦";
  const body=document.createElement("div");body.className="message-content";body.textContent=content;
  wrap.append(avatar,body);$("#messages").appendChild(wrap);
  if(role==="assistant"){
    const actions=document.createElement("div");actions.className="message-actions";
    const copy=document.createElement("button");copy.textContent="Copy response";copy.onclick=()=>{navigator.clipboard?.writeText(content).then(()=>toast("Copied to clipboard")).catch(()=>toast("Copy is not available in this browser"))};
    actions.appendChild(copy);body.appendChild(actions);
  }
  if(animate)$("#messages").scrollTop=$("#messages").scrollHeight;
  $("#chatArea").scrollTop=$("#chatArea").scrollHeight;
}
function showTyping(){
  const wrap=document.createElement("div");wrap.className="message assistant";wrap.id="typing";
  const av=document.createElement("div");av.className="message-avatar";av.textContent="✦";
  const body=document.createElement("div");body.className="message-content";body.innerHTML='<span class="typing-dots"><i></i><i></i><i></i></span>';
  wrap.append(av,body);$("#messages").appendChild(wrap);
}
function removeTyping(){$("#typing")?.remove()}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2300)}
function demoReply(message){
  const lower=message.toLowerCase();
  if(/hello|hi\b|salam|assalam/.test(lower))return "Hello! 👋 I'm NEXORA, your AI workspace demo. I can help you plan, write, learn, brainstorm and build projects. What would you like to work on?";
  if(/website|html|css|javascript|code/.test(lower))return "Great idea! Here's a practical way to approach it:\n\n1. Define the main goal and audience.\n2. Sketch the pages and user journey.\n3. Build the responsive interface with HTML and CSS.\n4. Add interactions with JavaScript.\n5. Test on mobile and desktop.\n6. Connect a secure backend for real data or AI features.\n\nTell me what kind of website you're building and I can help break it into steps.\n\n— Demo response: connect your own AI backend in Settings for real AI answers.";
  if(/business|money|earn|paisa|idea/.test(lower))return "A useful starting point is to solve one clear problem for a specific customer. For example, help local shops display products online, collect enquiries and manage orders. Start with one small demo, show it to potential customers, and improve it from their feedback.\n\nThis is a sample demo answer, not live AI output. Connect an AI backend in Settings to enable real AI responses.";
  return "Thanks for your message! I'm currently running in Demo mode, so I can show the chat experience but I am not connected to an AI model yet.\n\nTo activate real AI:\n1. Set up a small secure backend.\n2. Store your AI provider API key on the server, never in this website's JavaScript.\n3. Make the backend accept your message and return an AI reply.\n4. Paste your backend URL into Settings.\n\nYour message: “"+message+"”";
}
async function getReply(message){
  if(!settings.endpoint)return demoReply(message);
  const response=await fetch(settings.endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message})});
  if(!response.ok)throw new Error("Backend returned HTTP "+response.status);
  const data=await response.json();
  if(!data.reply||typeof data.reply!=="string")throw new Error("Backend response must contain a string named reply");
  return data.reply;
}
async function sendMessage(text){
  const message=(text??$("#messageInput").value).trim();if(!message||isSending)return;
  const chat=ensureChat();isSending=true;$("#sendBtn").disabled=true;
  chat.messages.push({role:"user",content:message});
  if(chat.messages.length===1)chat.title=message.length>29?message.slice(0,29)+"…":message;
  chat.updated=Date.now();saveChats();renderHistory();renderChat();$("#messageInput").value="";resizeInput();
  showTyping();
  try{
    const reply=await getReply(message);removeTyping();chat.messages.push({role:"assistant",content:reply});chat.updated=Date.now();saveChats();renderChat();renderHistory();
  }catch(err){
    removeTyping();const msg="I couldn't reach your AI backend. Please check the endpoint and server, then try again.\n\nTechnical detail: "+err.message;
    chat.messages.push({role:"assistant",content:msg});saveChats();renderChat();
  }finally{isSending=false;$("#sendBtn").disabled=false;$("#messageInput").focus()}
}
function resizeInput(){const el=$("#messageInput");el.style.height="auto";el.style.height=Math.min(el.scrollHeight,140)+"px"}
function closeSidebar(){$("#sidebar").classList.remove("open")}
$("#newChatBtn").addEventListener("click",newChat);
$("#sendBtn").addEventListener("click",()=>sendMessage());
$("#messageInput").addEventListener("input",resizeInput);
$("#messageInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage()}});
document.querySelectorAll(".prompt-card").forEach(btn=>btn.addEventListener("click",()=>sendMessage(btn.dataset.prompt)));
$("#settingsBtn").addEventListener("click",()=>$("#settingsModal").hidden=false);
document.querySelectorAll("[data-close]").forEach(btn=>btn.addEventListener("click",()=>$("#"+btn.dataset.close).hidden=true));
$("#saveSettingsBtn").addEventListener("click",()=>{settings.endpoint=$("#apiEndpoint").value.trim();saveSettings();updateMode();$("#settingsModal").hidden=true;toast(settings.endpoint?"Backend endpoint saved":"Demo mode enabled")});
$("#openSidebar").addEventListener("click",()=>$("#sidebar").classList.add("open"));
$("#closeSidebar").addEventListener("click",closeSidebar);
$("#clearHistoryBtn").addEventListener("click",()=>{if(confirm("Delete all saved conversations from this browser?")){chats=[];currentChatId=null;saveChats();renderHistory();renderChat();toast("Chat history cleared")}});
$("#exploreBtn").addEventListener("click",()=>{toast("Choose one of the prompt ideas on the home screen");closeSidebar()});
$("#profileBtn").addEventListener("click",()=>toast("Personal workspace"));
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();newChat()}if(e.key==="Escape"){$("#settingsModal").hidden=true;closeSidebar()}});
renderHistory();renderChat();

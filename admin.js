// admin.js - handles admin authentication and dashboard
(function(){
  const qs = s => document.querySelector(s);
  const PTS = 'wx_posts';
  const USR = 'wx_users';
  const getPosts = ()=> JSON.parse(localStorage.getItem(PTS) || '[]');
  const getUsers = ()=> JSON.parse(localStorage.getItem(USR) || '[]');

  function initMatrix(){ // same small matrix init to keep pages consistent
    const canvas = document.getElementById('matrix');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
    window.addEventListener('resize', resize);
    resize();
    const cols = Math.floor(canvas.width / 14);
    const drops = new Array(cols).fill(1);
    const letters = '01#@$%&*<>/ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    function draw(){
      ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#00ff7a'; ctx.font = '14px Share Tech Mono, monospace';
      for(let i=0;i<drops.length;i++){
        const text = letters.charAt(Math.floor(Math.random()*letters.length));
        ctx.fillText(text, i*14, drops[i]*16);
        if(drops[i]*16 > canvas.height && Math.random() > 0.975) drops[i]=0;
        drops[i]++;
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  function adminLoginCheck(){
    const section = qs('#adminLoginSection');
    const panel = qs('#adminPanel');
    const form = qs('#adminAuthForm');
    if(!form) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const u = qs('#admUser').value.trim();
      const p = qs('#admPass').value;
      if(u === 'admin' && p === 'Anuga123'){
        section.classList.add('hidden');
        panel.classList.remove('hidden');
        renderDashboard();
      } else {
        alert('Invalid admin credentials');
      }
    });
  }

  function renderDashboard(){
    const posts = getPosts();
    const users = getUsers();
    const viewCount = posts.reduce((s,p)=>s + (p.views||0), 0);
    qs('#viewCount').textContent = viewCount;
    qs('#userCount').textContent = users.length;
    qs('#postCount').textContent = posts.length;

    const root = qs('#adminPostsList');
    if(!root) return;
    root.innerHTML = posts.length ? posts.slice().reverse().map(p=>`
      <article class="post" data-id="${p.id}">
        ${p.image ? `<img src="${p.image}" alt="">` : ''}
        <h4>${escapeHtml(p.title)}</h4>
        <p>${escapeHtml(p.description)}</p>
        <div class="meta">
          <span>By ${escapeHtml(p.author||'anon')}</span>
          <span>${p.views||0} views</span>
        </div>
        <div style="margin-top:8px">
          <button class="openBtn">Open Link</button>
          <button class="delBtn" style="margin-left:8px">Delete</button>
        </div>
      </article>
    `).join('') : '<p class="note">No posts yet</p>';

    // attach handlers
    root.querySelectorAll('.openBtn').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const id = e.target.closest('.post').dataset.id;
        const p = posts.find(x=>x.id===id);
        if(p && p.link) window.open(p.link, '_blank');
      });
    });

    root.querySelectorAll('.delBtn').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const id = e.target.closest('.post').dataset.id;
        if(!confirm('Delete this post?')) return;
        const newPosts = posts.filter(x=>x.id !== id);
        localStorage.setItem(PTS, JSON.stringify(newPosts));
        renderDashboard();
      });
    });
  }

  function escapeHtml(unsafe){ return unsafe.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' })[m]); }

  document.addEventListener('DOMContentLoaded', ()=>{
    initMatrix();
    adminLoginCheck();
  });
})();

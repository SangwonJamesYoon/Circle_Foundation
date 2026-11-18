/* YGL Monthly AI Collective — vanilla JavaScript, local-first demo */
(() => {
  'use strict';

  const STATE_API = '/api/state';
  const MEMBER_NAMES = ['윤', '길', '이'];
  const MEMBER_TONES = { '윤': '', '길': 'gold', '이': 'blue' };
  const PAGE_NAMES = {
    overview: 'Overview', schedule: '일정 투표', meetings: '회의록',
    items: '실행 아이템', members: '멤버', library: 'AI 라이브러리', guide: '스터디 운영 가이드'
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const esc = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const monthISO = () => todayISO().slice(0, 7);
  const plusDays = (date, days) => {
    const d = new Date(`${date}T12:00:00`);
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const initialCandidates = () => {
    const base = todayISO();
    const y = Number(base.slice(0, 4));
    const m = Number(base.slice(5, 7));
    const lastDay = new Date(y, m, 0).getDate();
    const offsets = [10, 15, 17, 22];
    return offsets.map(offset => plusDays(base, offset))
      .filter((date, index, arr) => date > base && arr.indexOf(date) === index);
  };

  const defaultData = () => ({
    version: 1,
    voteMonth: monthISO(),
    candidateDates: initialCandidates(),
    votes: {},
    meetings: [
      {
        id: 'meeting_demo_1', date: plusDays(todayISO(), -18), title: 'AI를 잘 쓰는 사람들의 공통점',
        category: '월간 정기모임', summary: '각자 사용 중인 AI 도구와 실제 업무 적용 사례를 공유하고, 다음 달 실험 주제를 정리한 샘플 회의록입니다.',
        agenda: '1. 최근 한 달간 AI 활용 경험 공유\n2. 각자 가장 효과적이었던 프롬프트 소개\n3. 다음 달 공통 실험 주제 논의',
        discussion: '반복 업무를 AI에 맡기되, 결과물의 품질 기준과 검증 절차를 먼저 정의해야 한다는 의견을 나눴습니다. 도구 자체보다 문제 정의와 업무 흐름 설계가 중요하다는 점을 확인했습니다.',
        decisions: '• 각자 실제 업무에서 반복 작업 1개를 선정해 자동화 가능성을 실험한다.\n• 다음 모임에서는 결과물과 전후 소요 시간을 함께 공유한다.',
        actions: '윤 — 업무 적용 후보 2개 정리\n길 — 프롬프트 구조 사례 조사\n이 — 자동화 도구 비교 및 테스트',
        attendees: MEMBER_NAMES, sample: true
      }
    ],
    tasks: [
      { id: 'task_demo_1', title: '반복 보고서 작성 업무에 AI 적용', owner: '윤', progress: 65, due: plusDays(todayISO(), 9), description: '보고서 초안 작성부터 요약·검수까지의 흐름을 정리하고, 적용 전후 시간을 비교합니다.', category: '업무 적용' },
      { id: 'task_demo_2', title: 'Claude 프로젝트 기반 리서치 실험', owner: '길', progress: 80, due: plusDays(todayISO(), 5), description: '프로젝트 지식과 문서 컨텍스트를 활용한 리서치 워크플로우를 실험합니다.', category: '도구 실험' },
      { id: 'task_demo_3', title: '로컬 LLM과 RAG 기본 구조 학습', owner: '이', progress: 35, due: plusDays(todayISO(), 18), description: '로컬 실행 환경과 검색 증강 생성의 기본 구조를 정리하고 작은 예제를 실행합니다.', category: '기술 학습' },
      { id: 'task_demo_4', title: '프롬프트 라이브러리 초안 정리', owner: '길', progress: 45, due: plusDays(todayISO(), 14), description: '재사용 가능한 프롬프트를 목적·입력·출력·검증 기준으로 분류합니다.', category: '지식 정리' },
      { id: 'task_demo_5', title: 'AI 자동화 사례 3개 분석', owner: '이', progress: 15, due: plusDays(todayISO(), 25), description: '실제 업무에 연결할 수 있는 자동화 사례를 조사하고 적용 난이도를 비교합니다.', category: '사례 조사' },
      { id: 'task_demo_6', title: 'ChatGPT 데이터 분석 기능 활용', owner: '윤', progress: 100, due: plusDays(todayISO(), -2), description: '업무 데이터의 탐색·요약·시각화 과정과 유의점을 정리했습니다.', category: '도구 실험' }
    ],
    resources: [
      { id: 'resource_1', title: 'ChatGPT', category: 'AI ASSISTANT', description: '문서 작성, 데이터 분석, 아이디어 발산과 업무 자동화 실험.', url: 'https://chatgpt.com/' },
      { id: 'resource_2', title: 'Claude', category: 'AI ASSISTANT', description: '긴 문서 분석, 프로젝트 지식 관리, 글쓰기와 코딩 보조.', url: 'https://claude.ai/' },
      { id: 'resource_3', title: 'Perplexity', category: 'AI SEARCH', description: '출처 기반 리서치와 빠른 정보 탐색을 위한 검색 도구.', url: 'https://www.perplexity.ai/' },
      { id: 'resource_4', title: 'NotebookLM', category: 'KNOWLEDGE', description: '업로드한 자료를 중심으로 요약하고 질문하는 리서치 환경.', url: 'https://notebooklm.google.com/' },
      { id: 'resource_5', title: 'Prompt Pattern', category: 'PROMPT', description: '역할·맥락·과업·제약·출력 형식으로 프롬프트를 구조화하는 기본 틀.', url: 'https://www.promptingguide.ai/' },
      { id: 'resource_6', title: 'GitHub', category: 'BUILD', description: '실험 코드와 작은 자동화 도구를 버전 관리하고 공유하는 공간.', url: 'https://github.com/' }
    ]
  });

  async function fetchServerState() {
    try {
      const res = await fetch(STATE_API);
      if (!res.ok) throw new Error(`서버 응답 오류 (${res.status})`);
      return await res.json();
    } catch (error) {
      console.warn('YGL 서버에서 데이터를 불러오지 못했습니다.', error);
      return null;
    }
  }

  async function loadData() {
    const saved = await fetchServerState();
    if (saved && saved.version === 1 && Array.isArray(saved.tasks) && Array.isArray(saved.meetings)) return { ...defaultData(), ...saved };
    return defaultData();
  }

  let data = defaultData();
  let currentPage = 'overview';
  let selectedVoter = MEMBER_NAMES[0];
  let taskFilter = 'all';
  let taskSearch = '';
  let meetingSearch = '';
  let toastTimer;

  async function persist(message) {
    try {
      const res = await fetch(STATE_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || `서버 응답 오류 (${res.status})`);
      }
      if (message) toast(message);
    } catch (error) {
      console.error(error);
      toast('서버에 저장하지 못했습니다. 인터넷 연결 또는 서버 상태를 확인해 주세요.');
    }
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  function formatDate(date, options = {}) {
    if (!date) return '날짜 미정';
    const d = new Date(`${date}T12:00:00`);
    if (Number.isNaN(d.getTime())) return date;
    return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: options.weekday ? 'short' : undefined }).format(d);
  }
  function shortDate(date) {
    if (!date) return { month: '--', day: '--', weekday: '' };
    const d = new Date(`${date}T12:00:00`);
    return { month: `${d.getMonth() + 1}월`, day: d.getDate(), weekday: ['일','월','화','수','목','금','토'][d.getDay()] };
  }
  function memberAvatar(name, extra = '') {
    return `<span class="member-avatar ${MEMBER_TONES[name] || ''} ${extra}">${esc(name || '?')}</span>`;
  }
  function taskStatus(progress) {
    if (Number(progress) >= 100) return { label: '완료', cls: 'done' };
    if (Number(progress) <= 0) return { label: '시작 전', cls: 'todo' };
    return { label: '진행 중', cls: 'progress' };
  }
  function avgProgress(tasks) {
    if (!tasks.length) return 0;
    return Math.round(tasks.reduce((sum, task) => sum + (Number(task.progress) || 0), 0) / tasks.length);
  }
  function votesFor(date) {
    return MEMBER_NAMES.filter(name => (data.votes[`${data.voteMonth}:${name}`] || []).includes(date));
  }
  function candidates() {
    return (data.candidateDates || []).filter(date => date.startsWith(data.voteMonth)).sort();
  }
  function setPage(page) {
    if (!PAGE_NAMES[page]) return;
    currentPage = page;
    $$('.nav-link[data-page]').forEach(button => button.classList.toggle('active', button.dataset.page === page));
    $('#breadcrumbCurrent').textContent = PAGE_NAMES[page];
    $('#sidebar').classList.remove('open');
    renderPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderPage() {
    const root = $('#mainContent');
    const renderers = { overview: renderOverview, schedule: renderSchedule, meetings: renderMeetings, items: renderItems, members: renderMembers, library: renderLibrary, guide: renderGuide };
    root.innerHTML = renderers[currentPage]();
    bindPageEvents();
  }

  function pageHeading(eyebrow, title, description, action = '') {
    return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${action ? `<div class="heading-actions">${action}</div>` : ''}</div>`;
  }

  function renderOverview() {
    const tasks = data.tasks;
    const completed = tasks.filter(t => Number(t.progress) >= 100).length;
    const active = tasks.filter(t => Number(t.progress) > 0 && Number(t.progress) < 100).length;
    const upcoming = candidates().sort((a,b) => votesFor(b).length - votesFor(a).length)[0];
    const topTasks = [...tasks].filter(t => Number(t.progress) < 100).sort((a,b) => (a.due || '9999').localeCompare(b.due || '9999')).slice(0, 4);
    const perMember = MEMBER_NAMES.map(name => {
      const list = tasks.filter(t => t.owner === name);
      return { name, count: list.length, avg: avgProgress(list) };
    });
    const currentMonthLabel = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(new Date(`${data.voteMonth}-01T12:00:00`));
    const meetingCount = data.meetings.length;
    return `
      <section class="hero-panel">
        <div class="hero-copy"><div class="eyebrow">THINK · TEST · TRANSFORM</div><h2>호기심을 실험으로,<br><em>실험을 성과로.</em></h2><p>세 사람이 함께 배우고, 직접 써보고, 실제 업무의 변화로 연결하는 월간 AI 스터디 YGL의 협업 공간입니다.</p></div>
        <div class="hero-right"><div class="hero-meta"><span>THIS MONTH</span><b>${esc(currentMonthLabel)}</b></div><div class="hero-date"><strong>03</strong><span>CURIOUS MINDS · ONE COLLECTIVE</span></div></div>
      </section>
      <section class="metrics-grid">
        <article class="metric-card"><div class="metric-top"><span>전체 실행 아이템</span><span class="metric-icon">◈</span></div><div class="metric-value">${tasks.length}<small>건</small></div></article>
        <article class="metric-card"><div class="metric-top"><span>진행 중</span><span class="metric-icon">↗</span></div><div class="metric-value">${active}<small>건</small></div></article>
        <article class="metric-card"><div class="metric-top"><span>완료</span><span class="metric-icon">✓</span></div><div class="metric-value">${completed}<small>건</small></div></article>
        <article class="metric-card"><div class="metric-top"><span>누적 회의록</span><span class="metric-icon">▤</span></div><div class="metric-value">${meetingCount}<small>건</small></div></article>
      </section>
      <div class="section-row"><div><h2>Collective at a glance</h2><p>함께 움직이는 일과 사람들의 현재 상태</p></div><button class="text-link" data-go="items">전체 아이템 보기 ↗</button></div>
      <section class="dashboard-grid">
        <article class="panel"><div class="panel-head"><h3>우선순위 실행 아이템</h3><span>UP NEXT</span></div>
          ${topTasks.length ? topTasks.map(task => `<div class="mini-task"><div><strong>${esc(task.title)}</strong><small>${esc(task.owner)} · ${esc(task.category || '일반')} · ${task.due ? `마감 ${formatDate(task.due)}` : '마감일 미정'}</small></div><span class="progress-label">${Number(task.progress) || 0}%</span><div class="progress-track"><div class="progress-fill" style="width:${Math.max(0,Math.min(100,Number(task.progress)||0))}%"></div></div></div>`).join('') : `<div class="empty-state"><b>아직 등록된 아이템이 없습니다.</b>첫 번째 실험을 등록해 보세요.</div>`}
        </article>
        <article class="panel"><div class="panel-head"><h3>멤버별 평균 진척도</h3><span>BY MEMBER</span></div><div class="member-progress">
          ${perMember.map(item => `<div class="member-progress-row">${memberAvatar(item.name)}<div><strong>${item.name}</strong><small>${item.count}개 아이템</small><div class="progress-track"><div class="progress-fill" style="width:${item.avg}%"></div></div></div><span class="member-pct">${item.avg}%</span></div>`).join('')}
        </div></article>
      </section>
      <section class="upcoming-strip">
        <article class="upcoming-card"><div><div class="eyebrow">MOST VOTED DATE</div><h3>${upcoming ? formatDate(upcoming, {weekday:true}) : '아직 후보 날짜가 없습니다.'}</h3><p>${upcoming ? `${votesFor(upcoming).length}/3명 응답 · ${votesFor(upcoming).join(' · ') || '첫 투표를 기다리는 중'}` : '일정 투표에서 후보 날짜를 추가하세요.'}</p></div>${upcoming ? `<div class="date-tile"><strong>${shortDate(upcoming).day}</strong><small>${shortDate(upcoming).month}</small></div>` : `<button class="btn small ghost" data-go="schedule">투표 시작 ↗</button>`}</article>
        <article class="upcoming-card"><div><div class="eyebrow">STUDY PRINCIPLE</div><h3>작게 실험하고, 함께 축적하기</h3><p>매월 하나의 질문을 정하고 실제 결과물로 배움을 남깁니다.</p></div><div class="date-tile"><strong>Y</strong><small>GL</small></div></article>
      </section>`;
  }

  function renderSchedule() {
    const month = data.voteMonth || monthISO();
    const selected = data.votes[`${month}:${selectedVoter}`] || [];
    const dates = candidates();
    const monthLabel = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(new Date(`${month}-01T12:00:00`));
    return `${pageHeading('MONTHLY SCHEDULING', '모두의 시간을 맞추는 일.', '가능한 날짜를 선택해 주세요. 세 사람의 응답을 한눈에 비교하고 다음 모임을 정합니다.', '<button class="btn ghost" data-action="clear-my-votes">내 투표 초기화</button>')}
      <section class="vote-layout">
        <article class="vote-panel">
          <div class="panel-head"><div><h3>${esc(monthLabel)} 스터디 일정</h3><span>날짜를 선택하면 즉시 저장됩니다.</span></div><input type="month" class="month-input" id="voteMonth" value="${esc(month)}" aria-label="투표 월 선택"></div>
          <p class="vote-instruction">현재 투표자: <b>${esc(selectedVoter)}</b> · 참석 가능한 날짜를 복수 선택할 수 있습니다. 다른 멤버의 투표를 입력하려면 아래 이름을 바꾸세요.</p>
          <div class="member-switch" aria-label="투표자 선택">${MEMBER_NAMES.map(name => `<button data-voter="${name}" class="${selectedVoter === name ? 'selected' : ''}">${name}</button>`).join('')}</div>
          <div class="vote-date-list" style="margin-top:16px">
            ${dates.length ? dates.map(date => {
              const d = shortDate(date); const voters = votesFor(date); const isSelected = selected.includes(date);
              return `<button class="vote-date ${isSelected ? 'selected' : ''}" data-vote-date="${date}"><span class="vote-date-main"><span class="date-tile"><strong>${d.day}</strong><small>${d.month}</small></span><span><strong>${formatDate(date, {weekday:true})}</strong><small>${voters.length ? `응답: ${voters.join(' · ')}` : '아직 응답이 없습니다.'}</small></span></span><span class="vote-date-right"><span class="vote-count">${voters.length}/3<small>응답 인원</small><span class="vote-bar"><span style="width:${voters.length/3*100}%"></span></span></span><span class="check-pill">✓</span></span></button>`;
            }).join('') : `<div class="empty-state"><b>등록된 후보 날짜가 없습니다.</b>아래에서 날짜를 추가해 주세요.</div>`}
          </div>
          <div class="date-add-row"><input type="date" id="newCandidateDate" value="${month}-15" /><button class="btn small" data-action="add-candidate">+ 후보 날짜 추가</button></div>
          <div class="vote-note">투표는 서버에 저장되어 윤·길·이 세 사람이 각자 다른 기기에서 접속해도 같은 데이터를 보고 투표할 수 있습니다.</div>
        </article>
        <article class="vote-panel">
          <div class="panel-head"><h3>투표 현황</h3><span>RESPONSE OVERVIEW</span></div>
          <p class="vote-instruction">날짜별 참석 가능 인원과 각 멤버의 응답 상태입니다.</p>
          ${dates.length ? dates.map(date => { const voters = votesFor(date); const d = shortDate(date); return `<div class="vote-member-row"><div><b>${d.month} ${d.day}일 (${d.weekday})</b><div class="vote-bar" style="width:130px"><span style="width:${voters.length/3*100}%"></span></div></div><div class="member-tags">${MEMBER_NAMES.map(name => `<i title="${name}" style="opacity:${voters.includes(name) ? 1 : .32}">${name}</i>`).join('')}</div></div>`; }).join('') : `<div class="empty-state">후보 날짜를 추가하면 이곳에 현황이 표시됩니다.</div>`}
          <div class="vote-note"><b>운영 팁</b><br>모든 멤버가 응답한 뒤 가장 많은 인원이 가능한 날짜를 우선 후보로 삼고, 최종 확정 일정은 회의록에 기록하세요.</div>
          <button class="btn green" style="width:100%;margin-top:17px" data-go="meetings">회의록에 일정 확정 기록하기 ↗</button>
        </article>
      </section>`;
  }

  function renderMeetings() {
    const list = [...data.meetings].sort((a,b) => (b.date || '').localeCompare(a.date || ''))
      .filter(item => `${item.title} ${item.summary} ${item.category}`.toLowerCase().includes(meetingSearch.toLowerCase()));
    return `${pageHeading('KNOWLEDGE CAPTURE', '배움은 기록될 때 자산이 됩니다.', '논의한 내용과 결정 사항, 다음 액션을 남겨 스터디의 지식을 축적합니다.', '<button class="btn green" data-action="new-meeting">+ 회의록 작성</button>')}
      <div class="toolbar"><div class="search-box"><input id="meetingSearch" type="search" placeholder="회의 제목 또는 키워드 검색" value="${esc(meetingSearch)}"></div><span class="eyebrow">${list.length} RECORDS</span></div>
      <section class="meeting-grid">${list.length ? list.map(item => `<article class="meeting-card"><div class="meeting-card-top"><span>${formatDate(item.date)}</span><span>${item.sample ? 'SAMPLE' : 'YGL NOTES'}</span></div><h3>${esc(item.title)}</h3><p>${esc(item.summary || '요약이 아직 작성되지 않았습니다.')}</p><span class="tag">${esc(item.category || '월간 정기모임')}</span><div class="meeting-card-foot"><span>참석 ${Array.isArray(item.attendees) ? item.attendees.length : 0}명</span><button data-meeting-detail="${esc(item.id)}">기록 보기 ↗</button></div></article>`).join('') : `<div class="empty-state" style="grid-column:1/-1"><b>검색 결과가 없습니다.</b>새 회의록을 작성하거나 검색어를 바꿔보세요.</div>`}</section>`;
  }

  function renderItems() {
    const list = [...data.tasks].filter(task => {
      const matchesOwner = taskFilter === 'all' || task.owner === taskFilter;
      const matchesSearch = `${task.title} ${task.description} ${task.category}`.toLowerCase().includes(taskSearch.toLowerCase());
      return matchesOwner && matchesSearch;
    }).sort((a,b) => (a.due || '9999').localeCompare(b.due || '9999'));
    const action = '<button class="btn green" data-action="new-task">+ 아이템 추가</button>';
    return `${pageHeading('EXECUTION TRACKER', '배움을 실행으로 연결합니다.', '각자 맡은 실험과 업무 적용 아이템의 진척도를 공유하고, 다음 행동을 명확히 합니다.', action)}
      <div class="toolbar"><div class="search-box"><input id="taskSearch" type="search" placeholder="아이템 검색" value="${esc(taskSearch)}"></div><select class="filter-select" id="taskFilter"><option value="all" ${taskFilter==='all'?'selected':''}>전체 멤버</option>${MEMBER_NAMES.map(name => `<option value="${name}" ${taskFilter===name?'selected':''}>${name}</option>`).join('')}</select><span class="eyebrow">${list.length} ITEMS</span></div>
      <section class="task-grid">${list.length ? list.map(task => {
        const status = taskStatus(task.progress);
        return `<article class="task-card"><div class="task-card-top"><span class="tag">${esc(task.category || 'GENERAL')}</span><span class="status ${status.cls}">${status.label}</span></div><h3>${esc(task.title)}</h3><p>${esc(task.description || '설명이 없습니다.')}</p><div class="task-card-bottom"><span class="owner-chip">${memberAvatar(task.owner)} ${esc(task.owner)} · ${task.due ? `~ ${formatDate(task.due)}` : '마감일 미정'}</span><span class="task-progress">${Math.max(0,Math.min(100,Number(task.progress)||0))}% <button class="text-link" data-edit-task="${esc(task.id)}">편집 ↗</button></span></div><div class="progress-track" style="margin-top:12px"><div class="progress-fill" style="width:${Math.max(0,Math.min(100,Number(task.progress)||0))}%"></div></div></article>`;
      }).join('') : `<div class="empty-state" style="grid-column:1/-1"><b>조건에 맞는 아이템이 없습니다.</b>필터를 바꾸거나 새 아이템을 추가해 보세요.</div>`}</section>`;
  }

  function renderMembers() {
    return `${pageHeading('PEOPLE & OWNERSHIP', '세 사람, 서로 다른 관점.', '각자의 관심사와 실행 아이템을 공유합니다. 역할은 고정하지 않고 매월 필요에 따라 함께 조정합니다.', '<button class="btn ghost" data-go="items">아이템 관리 ↗</button>')}
      <section class="member-cards">${MEMBER_NAMES.map(name => {
        const list = data.tasks.filter(task => task.owner === name);
        const avg = avgProgress(list); const done = list.filter(task => Number(task.progress) >= 100).length;
        return `<article class="member-card"><div class="member-card-head">${memberAvatar(name)}<div><h3>${name}</h3><small>YGL STUDY MEMBER</small></div></div><div class="member-card-stat"><span>평균 진척도</span><strong>${avg}%</strong></div><div class="progress-track"><div class="progress-fill" style="width:${avg}%"></div></div><div class="member-card-stat" style="margin:12px 0 0"><span>진행 아이템 ${list.length}개</span><strong>완료 ${done}개</strong></div><div class="member-task-list">${list.length ? list.map(task => `<div><b>${esc(task.title)}</b><span>${Number(task.progress)||0}%</span></div>`).join('') : '<div>등록된 아이템 없음</div>'}</div><button class="text-link" style="margin-top:10px" data-filter-member="${name}">${name}의 아이템 보기 ↗</button></article>`;
      }).join('')}</section>
      <section class="panel"><div class="panel-head"><h3>YGL Collaboration Principles</h3><span>HOW WE WORK</span></div><div class="guide-grid"><div><div class="eyebrow">01 · OPEN LEARNING</div><p style="color:#718077;font-size:10px;line-height:1.8">잘 아는 것보다 배우는 과정을 투명하게 공유합니다. 실패와 시행착오도 다음 실험의 재료로 남깁니다.</p></div><div><div class="eyebrow">02 · REAL APPLICATION</div><p style="color:#718077;font-size:10px;line-height:1.8">도구 소개에 그치지 않고 실제 업무 또는 생활의 문제에 적용해 작동하는 결과를 만듭니다.</p></div></div></section>`;
  }

  function renderLibrary() {
    return `${pageHeading('SHARED KNOWLEDGE BASE', '좋은 도구와 방법을 함께 축적합니다.', '스터디에서 참고하는 AI 도구, 학습 자료, 재사용할 만한 프롬프트를 모아둡니다.', '<button class="btn green" data-action="new-resource">+ 자료 추가</button>')}
      <div class="toolbar"><span class="eyebrow">${data.resources.length} RESOURCES · CURATED BY YGL</span><button class="text-link" data-action="show-prompt">프롬프트 템플릿 보기 ↗</button></div>
      <section class="resource-grid">${data.resources.map((resource, index) => `<article class="resource-card"><div class="resource-icon">${['✳','◉','⌕','▤','✎','⌘'][index % 6]}</div><div class="eyebrow" style="margin-top:13px">${esc(resource.category || 'RESOURCE')}</div><h3>${esc(resource.title)}</h3><p>${esc(resource.description || '')}</p><div style="display:flex;justify-content:space-between;gap:10px"><a href="${safeUrl(resource.url)}" target="_blank" rel="noopener noreferrer">열어보기 ↗</a><button data-edit-resource="${esc(resource.id)}">편집</button></div></article>`).join('') || '<div class="empty-state" style="grid-column:1/-1">아직 자료가 없습니다.</div>'}</section>`;
  }

  function renderGuide() {
    return `${pageHeading('OPERATING MODEL', '좋은 스터디는 좋은 리듬에서.', '월간 스터디를 부담 없이 지속하기 위한 기본 운영 방식입니다.', '<button class="btn ghost" data-action="import-data">데이터 가져오기 ⇧</button>')}
      <section class="guide-grid">
        <article class="guide-card"><div class="eyebrow">MONTHLY RHYTHM</div><h3>한 달의 운영 사이클</h3><p>일정 조율부터 실행 결과 회고까지, 매월 같은 리듬으로 반복합니다.</p><div class="guide-steps"><div class="guide-step"><b>01</b><div><strong>일정 투표</strong><small>월 초 각자 가능한 날짜를 복수 선택하고 모임 일정을 확정합니다.</small></div></div><div class="guide-step"><b>02</b><div><strong>아이템 업데이트</strong><small>각자 진행 중인 실험의 진척도와 막힌 지점을 최신 상태로 바꿉니다.</small></div></div><div class="guide-step"><b>03</b><div><strong>월간 모임</strong><small>각자 배운 점과 실제 적용 사례를 공유하고 다음 달 질문을 정합니다.</small></div></div><div class="guide-step"><b>04</b><div><strong>회의록과 액션</strong><small>결정 사항, 담당자, 다음 행동을 기록해 실행으로 연결합니다.</small></div></div></div></article>
        <article class="guide-card"><div class="eyebrow">MEETING DESIGN</div><h3>권장 회의 아젠다 · 90분</h3><p>발표보다 대화와 실험 공유에 시간을 씁니다. 각자 1개의 결과물 또는 질문을 가져옵니다.</p><div class="guide-steps"><div class="guide-step"><b>15</b><div><strong>체크인 & 지난 액션</strong><small>지난 모임 이후의 변화와 완료 여부를 확인합니다.</small></div></div><div class="guide-step"><b>30</b><div><strong>실험 공유</strong><small>각자 10분 이내로 문제·시도·결과·배운 점을 공유합니다.</small></div></div><div class="guide-step"><b>30</b><div><strong>함께 실습 / 토론</strong><small>한 가지 주제를 골라 같이 써보고 비교합니다.</small></div></div><div class="guide-step"><b>15</b><div><strong>다음 액션 확정</strong><small>다음 달까지 해볼 일과 담당자를 정리합니다.</small></div></div></div></article>
        <article class="guide-card"><div class="eyebrow">DATA & PRIVACY</div><h3>데이터 저장과 공유</h3><p>입력한 정보는 Node.js 서버(data/store.json)에 저장되어 세 사람이 같은 데이터를 함께 봅니다. 서버가 꺼져 있으면 저장·동기화가 되지 않으니 서버를 계속 실행해 두세요.</p><div class="guide-steps"><div class="guide-step"><b>⇩</b><div><strong>백업하기</strong><small>상단 다운로드 아이콘으로 현재 데이터를 JSON 파일로 저장합니다.</small></div></div><div class="guide-step"><b>⇧</b><div><strong>복원 / 공유하기</strong><small>가져오기로 JSON을 복원할 수 있습니다. 멤버 간 공유는 파일을 주고받는 방식으로 가능합니다.</small></div></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:15px"><button class="btn small" data-action="export-data">JSON 백업 다운로드</button><button class="btn small ghost" data-action="import-data">JSON 가져오기</button><button class="btn small danger" data-action="reset-data">샘플 데이터 초기화</button></div></article>
        <article class="guide-card"><div class="eyebrow">A SIMPLE AGREEMENT</div><h3>우리의 세 가지 약속</h3><div class="guide-steps"><div class="guide-step"><b>01</b><div><strong>완벽함보다 실행</strong><small>작은 실험을 빠르게 시도하고 결과를 공유합니다.</small></div></div><div class="guide-step"><b>02</b><div><strong>도구보다 문제</strong><small>새로운 도구를 쓰는 것 자체보다 해결할 문제를 먼저 정의합니다.</small></div></div><div class="guide-step"><b>03</b><div><strong>비교보다 협력</strong><small>서로의 속도와 관심사를 존중하며 배움을 보탭니다.</small></div></div></div></article>
      </section>`;
  }

  function bindPageEvents() {
    const root = $('#mainContent');
    $('#voteMonth')?.addEventListener('change', event => {
      const value = event.target.value;
      if (!value) return;
      data.voteMonth = value;
      selectedVoter = MEMBER_NAMES[0];
      if (!data.candidateDates.some(date => date.startsWith(value))) data.candidateDates.push(`${value}-15`);
      persist('투표 월을 변경했습니다.'); renderPage();
    });
    root.querySelectorAll('[data-voter]').forEach(button => button.addEventListener('click', () => { selectedVoter = button.dataset.voter; renderPage(); }));
    root.querySelectorAll('[data-vote-date]').forEach(button => button.addEventListener('click', () => {
      const date = button.dataset.voteDate;
      const key = `${data.voteMonth}:${selectedVoter}`;
      const current = data.votes[key] || [];
      data.votes[key] = current.includes(date) ? current.filter(value => value !== date) : [...current, date];
      persist('투표를 저장했습니다.'); renderPage();
    }));
    $('#meetingSearch')?.addEventListener('input', event => { meetingSearch = event.target.value; const pos = event.target.selectionStart; renderPage(); const el = $('#meetingSearch'); el.focus(); el.setSelectionRange(pos, pos); });
    $('#taskSearch')?.addEventListener('input', event => { taskSearch = event.target.value; const pos = event.target.selectionStart; renderPage(); const el = $('#taskSearch'); el.focus(); el.setSelectionRange(pos, pos); });
    $('#taskFilter')?.addEventListener('change', event => { taskFilter = event.target.value; renderPage(); });
    root.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => setPage(button.dataset.go)));
    root.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => handleAction(button.dataset.action)));
    root.querySelectorAll('[data-meeting-detail]').forEach(button => button.addEventListener('click', () => openMeeting(button.dataset.meetingDetail)));
    root.querySelectorAll('[data-edit-task]').forEach(button => button.addEventListener('click', () => openTaskForm(button.dataset.editTask)));
    root.querySelectorAll('[data-edit-resource]').forEach(button => button.addEventListener('click', () => openResourceForm(button.dataset.editResource)));
    root.querySelectorAll('[data-filter-member]').forEach(button => button.addEventListener('click', () => { taskFilter = button.dataset.filterMember; setPage('items'); }));
  }

  function handleAction(action) {
    switch (action) {
      case 'new-task': openTaskForm(); break;
      case 'new-meeting': openMeetingForm(); break;
      case 'new-resource': openResourceForm(); break;
      case 'show-prompt': openPromptTemplate(); break;
      case 'add-candidate': addCandidate(); break;
      case 'clear-my-votes':
        if (confirm(`${selectedVoter}님의 ${data.voteMonth} 투표를 초기화할까요?`)) { data.votes[`${data.voteMonth}:${selectedVoter}`] = []; persist('내 투표를 초기화했습니다.'); renderPage(); }
        break;
      case 'export-data': exportData(); break;
      case 'import-data': $('#importInput').click(); break;
      case 'reset-data':
        if (confirm('현재 저장된 데이터를 모두 샘플 상태로 초기화할까요? 이 작업은 되돌릴 수 없습니다.')) { data = defaultData(); selectedVoter = MEMBER_NAMES[0]; persist('샘플 데이터로 초기화했습니다.'); setPage('overview'); }
        break;
    }
  }

  function addCandidate() {
    const input = $('#newCandidateDate');
    if (!input?.value) { toast('추가할 날짜를 선택해 주세요.'); return; }
    const date = input.value;
    if (!date.startsWith(data.voteMonth)) { toast('현재 선택한 월의 날짜만 추가할 수 있습니다.'); return; }
    if (date < todayISO()) { toast('지난 날짜는 후보로 추가할 수 없습니다.'); return; }
    if (data.candidateDates.includes(date)) { toast('이미 등록된 날짜입니다.'); return; }
    data.candidateDates.push(date); persist('후보 날짜를 추가했습니다.'); renderPage();
  }

  function openModal(title, subtitle, body, options = {}) {
    $('#modalRoot').innerHTML = `<div class="modal-backdrop" data-close-modal><section class="modal ${options.wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><div><div class="eyebrow">${esc(subtitle || 'YGL WORKSPACE')}</div><h2>${esc(title)}</h2></div><button class="modal-close" type="button" data-close-modal aria-label="닫기">×</button></div>${body}</section></div>`;
    $('#modalRoot').querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', event => { if (event.target === el) closeModal(); }));
    $('#modalRoot').querySelector('.modal-close')?.addEventListener('click', closeModal);
    $('#modalRoot').querySelector('.modal')?.addEventListener('click', event => event.stopPropagation());
  }
  function closeModal() { $('#modalRoot').innerHTML = ''; }

  function openTaskForm(id) {
    const task = id ? data.tasks.find(item => item.id === id) : null;
    const body = `<form id="taskForm"><div class="form-grid"><div class="field full"><label for="taskTitle">아이템 제목 *</label><input id="taskTitle" name="title" required maxlength="90" placeholder="예: 회의록 작성 자동화 실험" value="${esc(task?.title || '')}"></div><div class="field"><label for="taskOwner">담당 멤버</label><select id="taskOwner" name="owner">${MEMBER_NAMES.map(name => `<option ${task?.owner === name ? 'selected' : ''}>${name}</option>`).join('')}</select></div><div class="field"><label for="taskCategory">분류</label><select id="taskCategory" name="category">${['업무 적용','도구 실험','기술 학습','지식 정리','사례 조사','기타'].map(cat => `<option ${task?.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}</select></div><div class="field"><label for="taskDue">목표 날짜</label><input type="date" id="taskDue" name="due" value="${esc(task?.due || '')}"></div><div class="field"><label for="taskProgress">진척도 <b id="progressValue">${Number(task?.progress ?? 0)}%</b></label><input type="range" id="taskProgress" name="progress" min="0" max="100" step="5" value="${Number(task?.progress ?? 0)}"></div><div class="field full"><label for="taskDescription">설명 및 다음 행동</label><textarea id="taskDescription" name="description" placeholder="무엇을 실험하고, 어떤 결과를 만들 예정인가요?">${esc(task?.description || '')}</textarea></div></div><div class="modal-actions">${task ? `<button type="button" class="btn danger small" id="deleteTask">삭제</button>` : '<span></span>'}<div class="modal-actions-right"><button type="button" class="btn ghost" data-close-form>취소</button><button class="btn green" type="submit">${task ? '변경사항 저장' : '아이템 등록'}</button></div></div></form>`;
    openModal(task ? '아이템 수정' : '새 실행 아이템', 'EXECUTION TRACKER', body);
    $('#taskProgress').addEventListener('input', event => { $('#progressValue').textContent = `${event.target.value}%`; });
    $('#taskForm').addEventListener('submit', event => {
      event.preventDefault(); const form = new FormData(event.target);
      const item = { id: task?.id || uid('task'), title: String(form.get('title')).trim(), owner: form.get('owner'), category: form.get('category'), due: form.get('due'), progress: Number(form.get('progress')), description: String(form.get('description')).trim() };
      if (task) data.tasks = data.tasks.map(existing => existing.id === task.id ? item : existing); else data.tasks.unshift(item);
      persist(task ? '아이템을 수정했습니다.' : '새 아이템을 등록했습니다.'); closeModal(); renderPage();
    });
    $('#deleteTask')?.addEventListener('click', () => { if (confirm('이 아이템을 삭제할까요?')) { data.tasks = data.tasks.filter(item => item.id !== task.id); persist('아이템을 삭제했습니다.'); closeModal(); renderPage(); } });
    $('#modalRoot').querySelector('[data-close-form]')?.addEventListener('click', closeModal);
  }

  function openMeetingForm(id) {
    const item = id ? data.meetings.find(meeting => meeting.id === id) : null;
    const body = `<form id="meetingForm"><div class="form-grid"><div class="field full"><label for="meetingTitle">회의 제목 *</label><input id="meetingTitle" name="title" required maxlength="90" value="${esc(item?.title || '')}" placeholder="예: 11월 AI 스터디 — 에이전트 활용 실험"></div><div class="field"><label for="meetingDate">회의 날짜</label><input type="date" id="meetingDate" name="date" value="${esc(item?.date || todayISO())}"></div><div class="field"><label for="meetingCategory">회의 유형</label><select id="meetingCategory" name="category">${['월간 정기모임','온라인 체크인','실습 워크숍','기타'].map(value => `<option ${item?.category === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div><div class="field full"><label for="meetingSummary">한 줄 요약</label><input id="meetingSummary" name="summary" maxlength="180" value="${esc(item?.summary || '')}" placeholder="이번 회의의 핵심 내용을 요약해 주세요."></div><div class="field full"><label for="meetingAgenda">아젠다</label><textarea id="meetingAgenda" name="agenda">${esc(item?.agenda || '')}</textarea></div><div class="field full"><label for="meetingDiscussion">논의 내용 / 배운 점</label><textarea id="meetingDiscussion" name="discussion">${esc(item?.discussion || '')}</textarea></div><div class="field full"><label for="meetingDecisions">결정 사항</label><textarea id="meetingDecisions" name="decisions">${esc(item?.decisions || '')}</textarea></div><div class="field full"><label for="meetingActions">다음 액션 (담당자 포함)</label><textarea id="meetingActions" name="actions">${esc(item?.actions || '')}</textarea></div></div><div class="modal-actions">${item ? `<button type="button" class="btn danger small" id="deleteMeeting">삭제</button>` : '<span></span>'}<div class="modal-actions-right"><button type="button" class="btn ghost" data-close-form>취소</button><button class="btn green" type="submit">${item ? '변경사항 저장' : '회의록 저장'}</button></div></div></form>`;
    openModal(item ? '회의록 수정' : '새 회의록', 'KNOWLEDGE CAPTURE', body, { wide: true });
    $('#meetingForm').addEventListener('submit', event => {
      event.preventDefault(); const form = new FormData(event.target);
      const updated = { id: item?.id || uid('meeting'), date: form.get('date'), title: String(form.get('title')).trim(), category: form.get('category'), summary: String(form.get('summary')).trim(), agenda: String(form.get('agenda')).trim(), discussion: String(form.get('discussion')).trim(), decisions: String(form.get('decisions')).trim(), actions: String(form.get('actions')).trim(), attendees: MEMBER_NAMES, sample: false };
      if (item) data.meetings = data.meetings.map(existing => existing.id === item.id ? updated : existing); else data.meetings.push(updated);
      persist(item ? '회의록을 수정했습니다.' : '회의록을 저장했습니다.'); closeModal(); renderPage();
    });
    $('#deleteMeeting')?.addEventListener('click', () => { if (confirm('이 회의록을 삭제할까요?')) { data.meetings = data.meetings.filter(existing => existing.id !== item.id); persist('회의록을 삭제했습니다.'); closeModal(); renderPage(); } });
    $('#modalRoot').querySelector('[data-close-form]')?.addEventListener('click', closeModal);
  }

  function openMeeting(id) {
    const item = data.meetings.find(meeting => meeting.id === id);
    if (!item) return;
    const block = (title, value) => `<div class="detail-block"><h4>${title}</h4><p>${esc(value || '기록된 내용이 없습니다.')}</p></div>`;
    const body = `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="tag">${esc(item.category || '월간 정기모임')}</span><span style="font-size:10px;color:#819087">${formatDate(item.date, {weekday:true})}</span></div><p style="font-size:11px;line-height:1.8;color:#6f8076;margin:15px 0">${esc(item.summary || '')}</p>${block('AGENDA', item.agenda)}${block('DISCUSSION & LEARNINGS', item.discussion)}${block('DECISIONS', item.decisions)}${block('NEXT ACTIONS', item.actions)}<div class="modal-actions"><span style="font-size:9px;color:#91a097">${item.sample ? '예시 데이터' : 'YGL 기록'}</span><div class="modal-actions-right"><button class="btn ghost" data-detail-close>닫기</button><button class="btn green" data-detail-edit>수정하기 ↗</button></div></div>`;
    openModal(item.title, 'MEETING NOTES', body, { wide: true });
    $('#modalRoot').querySelector('[data-detail-close]').addEventListener('click', closeModal);
    $('#modalRoot').querySelector('[data-detail-edit]').addEventListener('click', () => openMeetingForm(id));
  }

  function openResourceForm(id) {
    const item = id ? data.resources.find(resource => resource.id === id) : null;
    const body = `<form id="resourceForm"><div class="field"><label for="resourceTitle">자료명 *</label><input id="resourceTitle" name="title" required maxlength="80" value="${esc(item?.title || '')}"></div><div class="form-grid"><div class="field"><label for="resourceCategory">분류</label><input id="resourceCategory" name="category" value="${esc(item?.category || 'RESOURCE')}" placeholder="예: AI TOOL"></div><div class="field"><label for="resourceUrl">웹사이트 주소</label><input id="resourceUrl" name="url" type="url" placeholder="https://" value="${esc(item?.url || '')}"></div></div><div class="field"><label for="resourceDescription">설명</label><textarea id="resourceDescription" name="description">${esc(item?.description || '')}</textarea></div><div class="modal-actions">${item ? `<button type="button" class="btn danger small" id="deleteResource">삭제</button>` : '<span></span>'}<div class="modal-actions-right"><button type="button" class="btn ghost" data-close-form>취소</button><button type="submit" class="btn green">저장</button></div></div></form>`;
    openModal(item ? '자료 수정' : '새 자료 추가', 'SHARED KNOWLEDGE BASE', body);
    $('#resourceForm').addEventListener('submit', event => {
      event.preventDefault(); const form = new FormData(event.target); const url = String(form.get('url') || '').trim();
      if (url && !/^https?:\/\//i.test(url)) { toast('웹사이트 주소는 http 또는 https로 시작해야 합니다.'); return; }
      const updated = { id: item?.id || uid('resource'), title: String(form.get('title')).trim(), category: String(form.get('category')).trim(), url, description: String(form.get('description')).trim() };
      if (item) data.resources = data.resources.map(existing => existing.id === item.id ? updated : existing); else data.resources.push(updated);
      persist(item ? '자료를 수정했습니다.' : '자료를 추가했습니다.'); closeModal(); renderPage();
    });
    $('#deleteResource')?.addEventListener('click', () => { if (confirm('이 자료를 삭제할까요?')) { data.resources = data.resources.filter(existing => existing.id !== item.id); persist('자료를 삭제했습니다.'); closeModal(); renderPage(); } });
    $('#modalRoot').querySelector('[data-close-form]')?.addEventListener('click', closeModal);
  }

  function openPromptTemplate() {
    const prompt = `[역할]\n당신은 [분야]의 실무 전문가입니다.\n\n[목표]\n이번 작업으로 달성하려는 결과는 [구체적 결과]입니다.\n\n[맥락과 입력]\n- 업무 배경: [상황]\n- 참고 자료: [자료 또는 링크]\n- 대상 독자: [누가 사용할 결과물인지]\n\n[요청 작업]\n1. 문제를 먼저 구조화합니다.\n2. 필요한 가정과 누락 정보를 구분합니다.\n3. 실행 가능한 초안을 작성합니다.\n4. 결과의 정확성과 실무 적용 가능성을 점검합니다.\n\n[제약 조건]\n- 확인할 수 없는 사실은 추측하지 말고 표시합니다.\n- 모호한 표현과 불필요한 장황함을 줄입니다.\n- 실제 업무에 바로 적용할 수 있는 수준으로 작성합니다.\n\n[출력 형식]\n[표 / 단계별 가이드 / 보고서 / 체크리스트 등]\n\n[검증 기준]\n완료 전에 사실성, 누락, 실행 가능성, 읽기 쉬운 구조를 자체 점검합니다.`;
    openModal('실무형 프롬프트 기본 템플릿', 'YGL PROMPT PATTERN', `<p style="font-size:10px;color:#7d8b82;line-height:1.7;margin:0 0 13px">목표·맥락·작업·제약·출력·검증 기준을 포함한 재사용 템플릿입니다. 대괄호 안의 내용을 실제 상황에 맞게 바꿔 사용하세요.</p><div class="field"><textarea id="promptText" style="min-height:330px;font-family:monospace;font-size:10px">${esc(prompt)}</textarea></div><div class="modal-actions"><span></span><div class="modal-actions-right"><button class="btn ghost" data-prompt-close>닫기</button><button class="btn green" data-prompt-copy>템플릿 복사</button></div></div>`, { wide: true });
    $('#modalRoot').querySelector('[data-prompt-close]').addEventListener('click', closeModal);
    $('#modalRoot').querySelector('[data-prompt-copy]').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText($('#promptText').value); toast('프롬프트 템플릿을 복사했습니다.'); }
      catch { $('#promptText').select(); document.execCommand('copy'); toast('프롬프트 템플릿을 복사했습니다.'); }
    });
  }

  function safeUrl(url) {
    const value = String(url || '').trim();
    return /^https?:\/\//i.test(value) ? esc(value) : '#';
  }

  function exportData() {
    const payload = { ...data, exportedAt: new Date().toISOString(), exportedFrom: 'YGL Monthly AI Collective' };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `YGL_backup_${todayISO()}.json`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    toast('JSON 백업 파일을 다운로드했습니다.');
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        if (!imported || !Array.isArray(imported.tasks) || !Array.isArray(imported.meetings) || !Array.isArray(imported.resources)) throw new Error('필수 데이터가 없습니다.');
        if (!confirm('가져온 데이터로 현재 브라우저의 YGL 데이터를 덮어쓸까요?')) return;
        data = { ...defaultData(), ...imported, version: 1 };
        delete data.exportedAt; delete data.exportedFrom;
        persist('데이터를 성공적으로 가져왔습니다.'); setPage('overview');
      } catch (error) { console.error(error); toast('올바른 YGL JSON 백업 파일이 아닙니다.'); }
      $('#importInput').value = '';
    };
    reader.onerror = () => toast('파일을 읽지 못했습니다.');
    reader.readAsText(file);
  }

  // Global navigation and utilities
  $$('.nav-link[data-page]').forEach(button => button.addEventListener('click', () => setPage(button.dataset.page)));
  $('.brand').addEventListener('click', event => { event.preventDefault(); setPage('overview'); });
  $('#mobileMenu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('#topMembers').addEventListener('click', () => setPage('members'));
  $('#exportBtn').addEventListener('click', exportData);
  $('#importInput').addEventListener('change', event => { const file = event.target.files?.[0]; if (file) importData(file); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
  $('#todayLabel').textContent = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' }).format(new Date());

  async function init() {
    $('#mainContent').innerHTML = '<div class="empty-state"><b>데이터를 불러오는 중입니다...</b>잠시만 기다려 주세요.</div>';
    data = await loadData();
    renderPage();
  }
  init();
})();

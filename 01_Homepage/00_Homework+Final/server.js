// YGL Monthly AI Collective — Node.js(Express) 서버
// 기존 정적 사이트(public/)를 그대로 서빙하고, 데이터 저장소를
// 브라우저 localStorage에서 서버 파일(data/store.json)로 옮기는 역할을 합니다.
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

app.use(express.json({ limit: '2mb' }));
app.use(express.static(PUBLIC_DIR));

function readState() {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return raw.trim() ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('[YGL] 저장된 데이터를 읽는 중 오류가 발생했습니다:', error);
    return null;
  }
}

function writeState(state) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function isValidState(body) {
  return Boolean(
    body &&
    body.version === 1 &&
    Array.isArray(body.tasks) &&
    Array.isArray(body.meetings) &&
    Array.isArray(body.resources)
  );
}

// 전체 데이터 조회 — 브라우저가 처음 열릴 때 호출
app.get('/api/state', (req, res) => {
  const state = readState();
  res.json(state || {});
});

// 전체 데이터 저장 — 투표/회의록/아이템/자료가 바뀔 때마다 호출
app.put('/api/state', (req, res) => {
  const body = req.body;
  if (!isValidState(body)) {
    return res.status(400).json({ error: '데이터 형식이 올바르지 않아 저장할 수 없습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.' });
  }
  try {
    writeState(body);
    res.json({ ok: true });
  } catch (error) {
    console.error('[YGL] 데이터 저장 중 오류가 발생했습니다:', error);
    res.status(500).json({ error: '서버에서 데이터를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.' });
  }
});

// 정의되지 않은 API 경로
app.use('/api', (req, res) => {
  res.status(404).json({ error: '요청한 기능을 서버에서 찾을 수 없습니다.' });
});

// 예상치 못한 서버 오류를 사용자에게 이해할 수 있는 메시지로 전달
app.use((err, req, res, next) => {
  console.error('[YGL] 서버 오류:', err);
  res.status(500).json({ error: '서버에서 알 수 없는 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`YGL 서버가 실행 중입니다: http://localhost:${PORT}`);
});

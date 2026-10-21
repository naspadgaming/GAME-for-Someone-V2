const loginPanel = document.getElementById('loginPanel');
const inboxPanel = document.getElementById('inboxPanel');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('password');
const loginStatus = document.getElementById('loginStatus');
const inboxStatus = document.getElementById('inboxStatus');
const cardsList = document.getElementById('cardsList');
const cardCount = document.getElementById('cardCount');
const downloadAllButton = document.getElementById('downloadAllButton');
let inboxPassword = '';
let cards = [];

function showStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('error', isError);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(value));
}

function downloadFile(filename, contents, type) {
  const blob = new Blob([contents], {type});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  let safe = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(safe)) safe = `'${safe}`;
  return `"${safe.replaceAll('"', '""')}"`;
}

function downloadCsv() {
  const rows = [['Waktu diterima', 'Ucapan'], ...cards.map(card => [formatDate(card.created_at), card.message])];
  const csv = '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  downloadFile('ucapan-pemain.csv', csv, 'text/csv;charset=utf-8');
}

function renderCards() {
  cardsList.replaceChildren();
  cardCount.textContent = `${cards.length} ucapan${cards.length === 1 ? '' : ''}`;
  downloadAllButton.disabled = cards.length === 0;

  if (!cards.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Belum ada ucapan yang masuk. Nanti pesan pemain akan tampil di sini.';
    cardsList.append(empty);
    return;
  }

  for (const card of cards) {
    const article = document.createElement('article');
    article.className = 'greeting-card';
    const time = document.createElement('time');
    time.dateTime = card.created_at;
    time.textContent = formatDate(card.created_at);
    const message = document.createElement('p');
    message.className = 'message';
    message.textContent = card.message;
    const download = document.createElement('button');
    download.className = 'secondary download-one';
    download.type = 'button';
    download.textContent = 'Unduh .txt';
    download.addEventListener('click', () => {
      downloadFile(`ucapan-${card.id}.txt`, `${formatDate(card.created_at)}\n\n${card.message}\n`, 'text/plain;charset=utf-8');
    });
    article.append(time, message, download);
    cardsList.append(article);
  }
}

async function loadCards() {
  inboxStatus.textContent = 'Memuat ucapan...';
  inboxStatus.classList.remove('error');
  try {
    const response = await fetch('/api/cards', {
      headers: {Authorization: `Bearer ${inboxPassword}`},
      cache: 'no-store'
    });
    const contentType = response.headers.get('content-type') || '';
    if(!contentType.includes('application/json')){
      throw new Error('API inbox belum tersedia di deployment ini. Periksa konfigurasi Vercel lalu deploy ulang.');
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Tidak dapat memuat inbox.');
    cards = result;
    renderCards();
    showStatus(inboxStatus, cards.length ? '' : '');
  } catch (error) {
    if (error.message === 'Password inbox salah.') {
      inboxPassword = '';
      inboxPanel.classList.add('hidden');
      loginPanel.classList.remove('hidden');
      showStatus(loginStatus, error.message, true);
    } else {
      showStatus(inboxStatus, error.message || 'Gagal memuat inbox.', true);
    }
  }
}

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  showStatus(loginStatus, '');
  inboxPassword = passwordInput.value;
  loginPanel.classList.add('hidden');
  inboxPanel.classList.remove('hidden');
  await loadCards();
  passwordInput.value = '';
});

document.getElementById('refreshButton').addEventListener('click', loadCards);
document.getElementById('downloadAllButton').addEventListener('click', downloadCsv);
document.getElementById('logoutButton').addEventListener('click', () => {
  inboxPassword = '';
  cards = [];
  cardsList.replaceChildren();
  inboxPanel.classList.add('hidden');
  loginPanel.classList.remove('hidden');
  showStatus(loginStatus, 'Kamu sudah keluar dari inbox.');
});

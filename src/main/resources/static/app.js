const API = '/api/roupas';
let roupas = [];

async function carregar() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    roupas = await res.json();
    renderTabela(roupas);
    atualizarStats(roupas);
  } catch (e) {
    document.getElementById('tabela-body').innerHTML =
      `<tr><td colspan="8" class="no-data">
        ❌ Não foi possível conectar ao servidor.<br>
        <small>Verifique se o Spring Boot está rodando na porta 8080.</small>
      </td></tr>`;
  }
}

function renderTabela(lista) {
  const tbody = document.getElementById('tabela-body');

  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="no-data">👕 Nenhum produto encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(r => {
    const valorTotal = (r.preco || 0) * (r.quantidade || 0);
    const valorFormatado = valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const precoFormatado = Number(r.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const classeQtd = (r.quantidade || 0) <= 5 ? 'qtd-baixa' : 'qtd-ok';

    return `
      <tr>
        <td><span class="badge badge-codigo">${r.codigo}</span></td>
        <td><strong>${r.produto}</strong></td>
        <td><span class="badge badge-tamanho">${r.tamanho}</span></td>
        <td>${r.cor || '—'}</td>
        <td>${precoFormatado}</td>
        <td class="${classeQtd}">${r.quantidade ?? 0} un.</td>
        <td class="valor-total">${valorFormatado}</td>
        <td>
          <button class="btn btn-edit btn-sm" onclick="editar(${r.id})">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deletar(${r.id}, '${r.produto.replace(/'/g, "\\'")}')">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

function atualizarStats(lista) {
  const totalQuantidade = lista.reduce((soma, r) => soma + (r.quantidade || 0), 0);
  const valorTotal = lista.reduce((soma, r) => soma + (r.preco || 0) * (r.quantidade || 0), 0);
  const valorFormatado = valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const baixo = lista.filter(r => (r.quantidade || 0) <= 5).length;

  document.getElementById('stat-total').textContent      = lista.length;
  document.getElementById('stat-quantidade').textContent = totalQuantidade;
  document.getElementById('stat-valor').textContent      = valorFormatado;
  document.getElementById('stat-baixo').textContent      = baixo;
}

function filtrar() {
  const termo = document.getElementById('search').value.toLowerCase();
  const tipo  = document.getElementById('tipo-busca').value;

  const filtrado = roupas.filter(r => {
    if (tipo === 'codigo') return r.codigo.toLowerCase().includes(termo);
    return r.produto.toLowerCase().includes(termo);
  });

  renderTabela(filtrado);
}

function atualizarPlaceholder() {
  const tipo = document.getElementById('tipo-busca').value;
  const input = document.getElementById('search');
  input.placeholder = tipo === 'codigo' ? '🔍 Buscar por código...' : '🔍 Buscar por produto...';
  input.value = '';
  renderTabela(roupas);
}

function abrirModal(roupa = null) {
  document.getElementById('edit-id').value = roupa ? roupa.id : '';
  document.getElementById('modal-titulo').textContent = roupa ? '✏️ Editar Produto' : '➕ Novo Produto';

  document.getElementById('f-codigo').value     = roupa?.codigo     || '';
  document.getElementById('f-produto').value    = roupa?.produto    || '';
  document.getElementById('f-tamanho').value    = roupa?.tamanho    || 'M';
  document.getElementById('f-cor').value        = roupa?.cor        || '';
  document.getElementById('f-preco').value      = roupa?.preco      || '';
  document.getElementById('f-quantidade').value = roupa?.quantidade ?? '';
  document.getElementById('f-descricao').value  = roupa?.descricao  || '';

  atualizarPreview();
  document.getElementById('overlay').classList.add('active');
}

function fecharModal() {
  document.getElementById('overlay').classList.remove('active');
}

function fecharModalFora(e) {
  if (e.target === document.getElementById('overlay')) fecharModal();
}

function editar(id) {
  const roupa = roupas.find(r => r.id === id);
  if (roupa) abrirModal(roupa);
}

function atualizarPreview() {
  const preco = parseFloat(document.getElementById('f-preco').value) || 0;
  const qtd   = parseInt(document.getElementById('f-quantidade').value) || 0;
  const total = preco * qtd;

  const previewDiv = document.getElementById('valor-preview');
  const previewVal = document.getElementById('preview-valor');

  if (preco > 0 && qtd > 0) {
    previewVal.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    previewDiv.style.display = 'block';
  } else {
    previewDiv.style.display = 'none';
  }
}

async function salvar() {
  const id      = document.getElementById('edit-id').value;
  const codigo  = document.getElementById('f-codigo').value.trim();
  const produto = document.getElementById('f-produto').value.trim();
  const preco   = document.getElementById('f-preco').value;

  if (!codigo)  { toast('Preencha o Código!', 'error'); return; }
  if (!produto) { toast('Preencha o nome do Produto!', 'error'); return; }
  if (!preco)   { toast('Preencha o Preço!', 'error'); return; }

  const body = {
    codigo,
    produto,
    tamanho:    document.getElementById('f-tamanho').value,
    cor:        document.getElementById('f-cor').value,
    preco:      parseFloat(preco),
    quantidade: parseInt(document.getElementById('f-quantidade').value) || 0,
    descricao:  document.getElementById('f-descricao').value,
  };

  try {
    const res = await fetch(id ? `${API}/${id}` : API, {
      method:  id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    });

    if (res.status === 409) { toast('Esse código já está em uso por outro produto!', 'error'); return; }
    if (!res.ok) throw new Error();

    fecharModal();
    toast(id ? 'Produto atualizado!' : 'Produto cadastrado!', 'success');
    await carregar();
  } catch {
    toast('Erro ao salvar. Verifique o servidor.', 'error');
  }
}

async function deletar(id, produto) {
  if (!confirm(`Tem certeza que deseja excluir "${produto}"?`)) return;

  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    toast('Produto removido!', 'success');
    await carregar();
  } catch {
    toast('Erro ao excluir.', 'error');
  }
}

function toast(msg, tipo = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `show ${tipo}`;
  setTimeout(() => { el.className = ''; }, 3000);
}

carregar();

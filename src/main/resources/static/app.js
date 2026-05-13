const API = '/api/roupas';
let roupas = [];

async function carregar() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    roupas = await res.json();
    filtrar();
    atualizarStats(roupas);
  } catch (e) {
    document.getElementById('tabela-body').innerHTML =
      `<tr><td colspan="10" class="no-data">❌ Não foi possível conectar ao servidor.<br>
       <small>Verifique se o Spring Boot está rodando na porta 8080.</small></td></tr>`;
  }
}

function renderTabela(lista) {
  const tbody = document.getElementById('tabela-body');
  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="no-data">👕 Nenhum produto encontrado.</td></tr>`;
    return;
  }
  tbody.innerHTML = lista.map(r => {
    const valorTotal     = (r.preco || 0) * (r.quantidade || 0);
    const valorFormatado = valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const precoFormatado = Number(r.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const classeQtd      = (r.quantidade || 0) <= 5 ? 'qtd-baixa' : 'qtd-ok';
    const fotoHtml       = r.imagem
      ? `<img src="/uploads/${r.imagem}" class="thumb" alt="${r.produto}" onclick="abrirLightbox('/uploads/${r.imagem}', '${r.produto.replace(/'/g, "\\'")}')" title="Clique para ampliar" />`
      : `<div class="thumb-empty">📷</div>`;

    const eVendido = r.vendido === true || r.vendido === 1;
    const vendidoHtml = eVendido
      ? `<div class="badge-vendido">✅ Vendido</div>
         <div class="venda-info">${r.comprador || ''}</div>
         <div class="venda-info">${r.dataVenda ? formatarData(r.dataVenda) : ''}</div>`
      : `<span class="badge-estoque">🏷️ Em Estoque</span>`;

    const dataVendaStr = r.dataVenda
      ? (Array.isArray(r.dataVenda)
          ? r.dataVenda[0] + '-' + String(r.dataVenda[1]).padStart(2,'0') + '-' + String(r.dataVenda[2]).padStart(2,'0')
          : r.dataVenda)
      : '';

    const acoesHtml = eVendido
      ? `<button class="btn btn-edit btn-sm" onclick="editarVendaPorId(${r.id})" title="Editar venda">✏️</button>
         <button class="btn btn-danger btn-sm" onclick="deletar(${r.id}, '${r.produto.replace(/'/g, "\\'")}')">🗑️</button>`
      : `<button class="btn btn-venda btn-sm" onclick="abrirVendaPorId(${r.id})" title="Registrar venda">🛍️</button>
         <button class="btn btn-edit btn-sm" onclick="editar(${r.id})" title="Editar">✏️</button>
         <button class="btn btn-danger btn-sm" onclick="deletar(${r.id}, '${r.produto.replace(/'/g, "\\'")}')">🗑️</button>`;

    return `
      <tr class="${eVendido ? 'row-vendido' : ''}">
        <td>${fotoHtml}</td>
        <td><span class="badge badge-codigo">${r.codigo}</span></td>
        <td><strong>${r.produto}</strong></td>
        <td><span class="badge badge-tamanho">${r.tamanho}</span></td>
        <td>${r.cor || '—'}</td>
        <td>${precoFormatado}</td>
        <td class="${classeQtd}">${r.quantidade ?? 0} un.</td>
        <td class="valor-total">${valorFormatado}</td>
        <td>${vendidoHtml}</td>
        <td class="acoes-td">${acoesHtml}</td>
      </tr>`;
  }).join('');
}

function formatarData(data) {
  if (!data) return '';
  const d = Array.isArray(data) ? `${data[0]}-${String(data[1]).padStart(2,'0')}-${String(data[2]).padStart(2,'0')}` : data;
  const [ano, mes, dia] = d.split('-');
  return `${dia}/${mes}/${ano}`;
}

function atualizarStats(lista) {
  const emEstoque      = lista.filter(r => r.vendido !== true && r.vendido !== 1);
  const vendidos       = lista.filter(r => r.vendido === true || r.vendido === 1);
  const totalQuantidade = emEstoque.reduce((s, r) => s + (r.quantidade || 0), 0);
  const valorTotal      = emEstoque.reduce((s, r) => s + (r.preco || 0) * (r.quantidade || 0), 0);
  const baixo           = emEstoque.filter(r => (r.quantidade || 0) <= 5).length;
  const maisCaro        = emEstoque.length ? emEstoque.reduce((a, b) => (a.preco || 0) >= (b.preco || 0) ? a : b) : null;

  document.getElementById('stat-total').textContent      = lista.length;
  document.getElementById('stat-quantidade').textContent = totalQuantidade;
  document.getElementById('stat-valor').textContent      = valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById('stat-baixo').textContent      = baixo;
  document.getElementById('stat-vendidos').textContent   = vendidos.length;

  if (maisCaro) {
    document.getElementById('stat-mais-caro-preco').textContent = Number(maisCaro.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('stat-mais-caro-nome').textContent  = maisCaro.produto;
  }
}

function filtrar() {
  const termo  = document.getElementById('search').value.toLowerCase();
  const tipo   = document.getElementById('tipo-busca').value;
  const status = document.getElementById('filtro-status').value;

  const filtrado = roupas.filter(r => {
    const matchBusca = tipo === 'codigo'
      ? r.codigo.toLowerCase().includes(termo)
      : r.produto.toLowerCase().includes(termo);
    const matchStatus = status === 'todos'
      ? true
      : status === 'vendido' ? (r.vendido === true || r.vendido === 1) : (r.vendido !== true && r.vendido !== 1);
    return matchBusca && matchStatus;
  });

  renderTabela(filtrado);
}

function atualizarPlaceholder() {
  const tipo  = document.getElementById('tipo-busca').value;
  const input = document.getElementById('search');
  input.placeholder = tipo === 'codigo' ? '🔍 Buscar por código...' : '🔍 Buscar por produto...';
  input.value = '';
  filtrar();
}

function abrirModal(roupa = null) {
  const isEdicao = !!roupa;
  document.getElementById('edit-id').value            = roupa ? roupa.id : '';
  document.getElementById('modal-titulo').textContent = roupa ? '✏️ Editar Produto' : '➕ Novo Produto';
  document.getElementById('f-codigo').value           = roupa?.codigo     || '';
  document.getElementById('f-produto').value          = roupa?.produto    || '';
  document.getElementById('f-tamanho').value          = roupa?.tamanho    || 'M';
  document.getElementById('f-cor').value              = roupa?.cor        || '';
  document.getElementById('f-preco').value            = roupa?.preco      || '';
  document.getElementById('f-quantidade').value       = roupa?.quantidade ?? 1;
  document.getElementById('f-descricao').value        = roupa?.descricao  || '';
  document.getElementById('f-lote').value             = 1;

  document.getElementById('grupo-lote').style.display = isEdicao ? 'none' : 'block';
  atualizarLoteHint();

  const preview     = document.getElementById('img-preview');
  const placeholder = document.getElementById('upload-placeholder');
  if (roupa?.imagem) {
    preview.src = `/uploads/${roupa.imagem}`;
    preview.style.display     = 'block';
    placeholder.style.display = 'none';
  } else {
    preview.src = '';
    preview.style.display     = 'none';
    placeholder.style.display = 'flex';
  }
  document.getElementById('f-imagem').value = '';

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
  const div   = document.getElementById('valor-preview');
  const val   = document.getElementById('preview-valor');
  if (preco > 0 && qtd > 0) {
    val.textContent   = (preco * qtd).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    div.style.display = 'block';
  } else {
    div.style.display = 'none';
  }
}

function atualizarLoteHint() {
  const lote  = parseInt(document.getElementById('f-lote').value) || 1;
  const hint  = document.getElementById('lote-hint');
  hint.textContent = lote === 1
    ? '1 unidade será cadastrada'
    : `${lote} unidades serão cadastradas como registros separados`;
}

document.addEventListener('DOMContentLoaded', () => {
  const loteInput = document.getElementById('f-lote');
  if (loteInput) loteInput.addEventListener('input', atualizarLoteHint);
});

function previewImagem(event) {
  const file = event.target.files[0];
  if (!file) return;
  const preview     = document.getElementById('img-preview');
  const placeholder = document.getElementById('upload-placeholder');
  const reader      = new FileReader();
  reader.onload = e => {
    preview.src               = e.target.result;
    preview.style.display     = 'block';
    placeholder.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

async function salvar() {
  const id      = document.getElementById('edit-id').value;
  const codigo  = document.getElementById('f-codigo').value.trim();
  const produto = document.getElementById('f-produto').value.trim();
  const preco   = document.getElementById('f-preco').value;
  const lote    = parseInt(document.getElementById('f-lote').value) || 1;

  if (!codigo)  { toast('Preencha o Código!', 'error'); return; }
  if (!produto) { toast('Preencha o nome do Produto!', 'error'); return; }
  if (!preco)   { toast('Preencha o Preço!', 'error'); return; }

  const body = {
    codigo,
    produto,
    tamanho:    document.getElementById('f-tamanho').value,
    cor:        document.getElementById('f-cor').value,
    preco:      parseFloat(preco),
    quantidade: parseInt(document.getElementById('f-quantidade').value) || 1,
    descricao:  document.getElementById('f-descricao').value,
  };

  try {
    let url    = id ? `${API}/${id}` : (lote > 1 ? `${API}/lote?quantidade=${lote}` : API);
    let method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.status === 409) {
      toast('Esse código já está em uso por outro lote!', 'error');
      return;
    }
    if (!res.ok) throw new Error();

    const salvo = await res.json();
    const fileInput = document.getElementById('f-imagem');

    if (fileInput.files.length > 0) {
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      if (Array.isArray(salvo) && salvo.length > 1) {
        // Lote com múltiplos itens: usa endpoint especial que aplica
        // a imagem em todos os registros de uma vez
        const ids = salvo.map(r => r.id).join(',');
        await fetch(`${API}/lote/imagem?ids=${ids}`, { method: 'POST', body: formData });
      } else {
        // Produto único ou edição
        const idParaImagem = Array.isArray(salvo) ? salvo[0].id : salvo.id;
        await fetch(`${API}/${idParaImagem}/imagem`, { method: 'POST', body: formData });
      }
    }

    fecharModal();
    const msg = id ? 'Produto atualizado!' : (lote > 1 ? `${lote} produtos cadastrados!` : 'Produto cadastrado!');
    toast(msg, 'success');
    await carregar();
  } catch {
    toast('Erro ao salvar. Verifique o servidor.', 'error');
  }
}

function abrirVendaPorId(id) {
  const r = roupas.find(x => x.id === id);
  if (!r) return;
  abrirVenda(r.id, r.produto);
}

function editarVendaPorId(id) {
  const r = roupas.find(x => x.id === id);
  if (!r) return;
  const dataStr = r.dataVenda
    ? (Array.isArray(r.dataVenda)
        ? r.dataVenda[0] + '-' + String(r.dataVenda[1]).padStart(2,'0') + '-' + String(r.dataVenda[2]).padStart(2,'0')
        : r.dataVenda)
    : '';
  editarVenda(r.id, r.produto, r.comprador || '', dataStr);
}

function abrirVenda(id, produto) {
  document.getElementById('venda-id').value                 = id;
  document.getElementById('venda-modo').value               = 'novo';
  document.getElementById('venda-titulo').textContent       = '🛍️ Registrar Venda';
  document.getElementById('venda-produto-nome').textContent = produto;
  document.getElementById('f-comprador').value              = '';
  document.getElementById('f-data-venda').value             = new Date().toISOString().split('T')[0];
  document.getElementById('overlay-venda').classList.add('active');
}

function editarVenda(id, produto, compradorAtual, dataAtual) {
  document.getElementById('venda-id').value                 = id;
  document.getElementById('venda-modo').value               = 'editar';
  document.getElementById('venda-titulo').textContent       = '✏️ Editar Venda';
  document.getElementById('venda-produto-nome').textContent = produto;
  document.getElementById('f-comprador').value              = compradorAtual || '';
  document.getElementById('f-data-venda').value             = dataAtual || new Date().toISOString().split('T')[0];
  document.getElementById('overlay-venda').classList.add('active');
}

function fecharVenda() {
  document.getElementById('overlay-venda').classList.remove('active');
}

function fecharVendaFora(e) {
  if (e.target === document.getElementById('overlay-venda')) fecharVenda();
}

async function confirmarVenda() {
  const id        = document.getElementById('venda-id').value;
  const modo      = document.getElementById('venda-modo').value;
  const comprador = document.getElementById('f-comprador').value.trim();
  const dataVenda = document.getElementById('f-data-venda').value;

  if (!comprador) { toast('Preencha o nome do comprador!', 'error'); return; }
  if (!dataVenda) { toast('Preencha a data da venda!', 'error'); return; }

  try {
    const res = await fetch(`${API}/${id}/venda`, {
      method:  modo === 'editar' ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ comprador, dataVenda })
    });
    if (!res.ok) throw new Error();
    fecharVenda();
    toast(modo === 'editar' ? 'Venda atualizada!' : 'Venda registrada!', 'success');
    await carregar();
  } catch {
    toast('Erro ao salvar venda.', 'error');
  }
}

function deletar(id, produto) {
  confirmar(
    'Tem certeza que deseja excluir o produto abaixo?',
    produto,
    async () => {
      try {
        const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        toast('Produto removido!', 'success');
        await carregar();
      } catch {
        toast('Erro ao excluir.', 'error');
      }
    }
  );
}

function confirmar(msg, nome, onConfirm) {
  document.getElementById('confirm-msg').innerHTML = `${msg}<br><strong>${nome}</strong>`;
  const overlay = document.getElementById('overlay-confirm');
  overlay.classList.add('active');
  const btn  = document.getElementById('confirm-ok');
  const novo = btn.cloneNode(true);
  btn.parentNode.replaceChild(novo, btn);
  novo.addEventListener('click', () => {
    overlay.classList.remove('active');
    onConfirm();
  });
}

function negarConfirm() {
  document.getElementById('overlay-confirm').classList.remove('active');
}

function abrirLightbox(src, alt) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');
  img.src         = src;
  cap.textContent = alt;
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function fecharLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    fecharLightbox();
    fecharVenda();
    fecharModal();
    negarConfirm();
  }
});

function toast(msg, tipo = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `show ${tipo}`;
  setTimeout(() => { el.className = ''; }, 3000);
}

carregar();

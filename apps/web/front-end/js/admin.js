// =============================================
// ADMIN.JS - VOYAGE
// =============================================

// Verificar se está logado
const adminLogado = localStorage.getItem('voyage_admin');
if (!adminLogado) {
    window.location.href = './login.html';
}

function getAdminEmail() {
    try {
        const admin = JSON.parse(localStorage.getItem('voyage_admin') || '{}');
        return admin.email || '';
    } catch {
        return '';
    }
}

// =============================================
// Recarregar a pagina em cas de sucesso
// =============================================

function mostrarSucessoERecarregar(mensagem) {
    // Remove aviso antigo, se existir
    const antigo = document.getElementById('aviso-sucesso-admin');
    if (antigo) antigo.remove();

    let segundos = 5;

    const box = document.createElement('div');
    box.id = 'aviso-sucesso-admin';
    box.innerHTML = `
        <div style="
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 9999;
            background: #166534;
            color: #fff;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
            min-width: 280px;
            font-family: system-ui, sans-serif;
        ">
            <div style="font-weight: 700; margin-bottom: 6px;">✅ ${mensagem}</div>
            <div style="font-size: 0.9rem; opacity: 0.95;">
                A página será atualizada em <strong id="contador-reload">${segundos}</strong>s...
            </div>
        </div>
    `;
    document.body.appendChild(box);

    const timer = setInterval(() => {
        segundos -= 1;
        const el = document.getElementById('contador-reload');
        if (el) el.textContent = segundos;

        if (segundos <= 0) {
            clearInterval(timer);
            window.location.reload();
        }
    }, 1000);
}


// =============================================
// NAVEGAÇÃO ENTRE SEÇÕES
// =============================================
function mostrarSecao(secao) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(secao).classList.add('active');

    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    const link = document.querySelector(`[data-section="${secao}"]`);
    if (link) link.classList.add('active');

    // Carrega os dados da seção
    if (secao === 'noticias') carregarNoticias();
    if (secao === 'parceiros') carregarParceiros();
    if (secao === 'regioes') carregarRegioes();
    if (secao === 'dashboard') carregarDashboard();
}

// =============================================
// DASHBOARD - CONTADORES
// =============================================
async function carregarDashboard() {
    try {
        const [noticias, parceiros, regioes] = await Promise.all([
            supabase.from('news').select('id', { count: 'exact', head: true }),
            supabase.from('partners').select('id', { count: 'exact', head: true }),
            supabase.from('regions').select('id', { count: 'exact', head: true })
        ]);

        document.getElementById('count-noticias').textContent = noticias.count || 0;
        document.getElementById('count-parceiros').textContent = parceiros.count || 0;
        document.getElementById('count-regioes').textContent = regioes.count || 0;
    } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
    }
}

// =============================================
// NOTÍCIAS
// =============================================
async function carregarNoticias() {
    const tbody = document.getElementById('tabela-noticias');
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Carregando...</td></tr>`;

    try {
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="bi bi-newspaper"></i>
                        <p>Nenhuma notícia cadastrada ainda</p>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.titulo}</td>
                <td>${item.autor || '-'}</td>
                <td>
                    <span class="badge ${item.publicada ? 'badge-success' : 'badge-muted'}">
                        ${item.publicada ? 'Publicada' : 'Rascunho'}
                    </span>
                </td>
                <td>${formatarData(item.created_at)}</td>
<td class="actions">
    <button class="btn-icon btn-edit" title="Editar"
        onclick='abrirModal("noticia", ${JSON.stringify(item)})'>
        <i class="bi bi-pencil"></i>
    </button>
    <button class="btn-icon btn-delete" title="Excluir"
        onclick="deletarItem('news', '${item.id}')">
        <i class="bi bi-trash"></i>
    </button>
</td>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Erro ao carregar notícias</td></tr>`;
    }
}

// =============================================
// PARCEIROS
// =============================================
async function carregarParceiros() {
    const tbody = document.getElementById('tabela-parceiros');
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Carregando...</td></tr>`;

    try {
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        <i class="bi bi-people"></i>
                        <p>Nenhum parceiro cadastrado ainda</p>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.nome}</td>
                <td>${item.descricao || '-'}</td>
                <td>
                    <span class="badge ${item.ativo ? 'badge-success' : 'badge-muted'}">
                        ${item.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
<td class="actions">
    <button class="btn-icon btn-edit" title="Editar"
        onclick='abrirModal("parceiro", ${JSON.stringify(item)})'>
        <i class="bi bi-pencil"></i>
    </button>
    <button class="btn-icon btn-delete" title="Excluir"
        onclick="deletarItem('partners', '${item.id}')">
        <i class="bi bi-trash"></i>
    </button>
</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Erro ao carregar parceiros</td></tr>`;
    }
}

// =============================================
// REGIÕES
// =============================================
async function carregarRegioes() {
    const tbody = document.getElementById('tabela-regioes');
    tbody.innerHTML = `<tr><td colspan="3" class="empty-state">Carregando...</td></tr>`;

    try {
        const { data, error } = await supabase
            .from('regions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="empty-state">
                        <i class="bi bi-geo-alt"></i>
                        <p>Nenhuma região cadastrada ainda</p>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.nome}</td>
                <td>${item.descricao || '-'}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" title="Editar"
                        onclick='abrirModal("regiao", ${JSON.stringify(item)})'>
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-icon btn-delete" title="Excluir"
                        onclick="deletarItem('regions', '${item.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="3" class="empty-state">Erro ao carregar regiões</td></tr>`;
    }
}

// =============================================
// DELETAR ITEM
// =============================================
async function deletarItem(tabela, id) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    const email = getAdminEmail();
    if (!email) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = './login.html';
        return;
    }

    try {
        const { data, error } = await supabase.rpc('admin_deletar_item', {
            p_email: email,
            p_tabela: tabela,
            p_id: id
        });

        if (error) throw error;
        if (!data || data.ok !== true) {
            alert('Não foi possível excluir.');
            return;
        }

        let msg = 'Item excluído com sucesso!';
        if (tabela === 'news') msg = 'Notícia excluída com sucesso!';
        if (tabela === 'partners') msg = 'Parceiro excluído com sucesso!';
        if (tabela === 'regions') msg = 'Região excluída com sucesso!';

        mostrarSucessoERecarregar(msg);
        carregarDashboard();
    } catch (err) {
        console.error(err);
        alert('Erro ao excluir item.');
    }
}

// =============================================
// MODAL
// =============================================
let tipoAtual = null;
let idEditando = null;

function abrirModal(tipo, item = null) {
    tipoAtual = tipo;
    idEditando = item ? item.id : null;

    const modal = document.getElementById('modal');
    const titulo = document.getElementById('modal-titulo');
    const campos = document.getElementById('campos-modal');

    let html = '';

    if (tipo === 'noticia') {
        titulo.textContent = item ? 'Editar Notícia' : 'Nova Notícia';
        html = `
            <div class="form-group">
                <label>Título</label>
                <input type="text" name="titulo" required value="${item ? escapeHtml(item.titulo || '') : ''}">
            </div>
            <div class="form-group">
                <label>Conteúdo</label>
                <textarea name="conteudo" required>${item ? escapeHtml(item.conteudo || '') : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Autor</label>
                <input type="text" name="autor" value="${item ? escapeHtml(item.autor || '') : ''}">
            </div>
            <div class="form-group">
                <label>URL da Imagem</label>
                <input type="text" name="imagem_url" value="${item ? escapeHtml(item.imagem_url || '') : ''}">
            </div>
        `;
    }

    if (tipo === 'parceiro') {
        titulo.textContent = item ? 'Editar Parceiro' : 'Novo Parceiro';
        html = `
            <div class="form-group">
                <label>Nome</label>
                <input type="text" name="nome" required value="${item ? escapeHtml(item.nome || '') : ''}">
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <textarea name="descricao">${item ? escapeHtml(item.descricao || '') : ''}</textarea>
            </div>
            <div class="form-group">
                <label>URL do Logo</label>
                <input type="text" name="logo_url" value="${item ? escapeHtml(item.logo_url || '') : ''}">
            </div>
            <div class="form-group">
                <label>Site</label>
                <input type="text" name="site_url" value="${item ? escapeHtml(item.site_url || '') : ''}">
            </div>
        `;
    }

    if (tipo === 'regiao') {
        titulo.textContent = item ? 'Editar Região' : 'Nova Região';
        html = `
            <div class="form-group">
                <label>Nome</label>
                <input type="text" name="nome" required value="${item ? escapeHtml(item.nome || '') : ''}">
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <textarea name="descricao">${item ? escapeHtml(item.descricao || '') : ''}</textarea>
            </div>
            <div class="form-group">
                <label>URL da Imagem</label>
                <input type="text" name="imagem_url" value="${item ? escapeHtml(item.imagem_url || '') : ''}">
            </div>
        `;
    }

    campos.innerHTML = html;
    modal.classList.add('active');
}

function escapeHtml(texto) {
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function fecharModal() {
    document.getElementById('modal').classList.remove('active');
    tipoAtual = null;
    idEditando = null;
}

function fecharModal() {
    document.getElementById('modal').classList.remove('active');
    tipoAtual = null;
}

// =============================================
// SALVAR (INSERT)
// =============================================
document.getElementById('form-modal').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const dados = Object.fromEntries(formData.entries());
    const email = getAdminEmail();

    if (!email) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = './login.html';
        return;
    }

    try {
        let result;

        // ===== EDITAR =====
        if (idEditando) {
            if (tipoAtual === 'noticia') {
                result = await supabase.rpc('admin_atualizar_noticia', {
                    p_email: email,
                    p_id: idEditando,
                    p_titulo: dados.titulo,
                    p_conteudo: dados.conteudo,
                    p_autor: dados.autor || null,
                    p_imagem_url: dados.imagem_url || null
                });
            }
            if (tipoAtual === 'parceiro') {
                result = await supabase.rpc('admin_atualizar_parceiro', {
                    p_email: email,
                    p_id: idEditando,
                    p_nome: dados.nome,
                    p_descricao: dados.descricao || null,
                    p_logo_url: dados.logo_url || null,
                    p_site_url: dados.site_url || null
                });
            }
            if (tipoAtual === 'regiao') {
                result = await supabase.rpc('admin_atualizar_regiao', {
                    p_email: email,
                    p_id: idEditando,
                    p_nome: dados.nome,
                    p_descricao: dados.descricao || null,
                    p_imagem_url: dados.imagem_url || null
                });
            }
        }
        // ===== CRIAR =====
        else {
            if (tipoAtual === 'noticia') {
                result = await supabase.rpc('admin_inserir_noticia', {
                    p_email: email,
                    p_titulo: dados.titulo,
                    p_conteudo: dados.conteudo,
                    p_autor: dados.autor || null,
                    p_imagem_url: dados.imagem_url || null
                });
            }
            if (tipoAtual === 'parceiro') {
                result = await supabase.rpc('admin_inserir_parceiro', {
                    p_email: email,
                    p_nome: dados.nome,
                    p_descricao: dados.descricao || null,
                    p_logo_url: dados.logo_url || null,
                    p_site_url: dados.site_url || null
                });
            }
            if (tipoAtual === 'regiao') {
                result = await supabase.rpc('admin_inserir_regiao', {
                    p_email: email,
                    p_nome: dados.nome,
                    p_descricao: dados.descricao || null,
                    p_imagem_url: dados.imagem_url || null
                });
            }
        }

        const { data, error } = result || {};

        if (error) throw error;
        if (!data || data.ok !== true) {
            alert(data && data.erro === 'nao_autorizado'
                ? 'Você não tem permissão.'
                : 'Erro ao salvar.');
            return;
        }

        fecharModal();

        let msg = idEditando ? 'Item atualizado com sucesso!' : 'Item salvo com sucesso!';
        if (tipoAtual === 'noticia') {
            msg = idEditando ? 'Notícia atualizada com sucesso!' : 'Notícia adicionada com sucesso!';
        }
        if (tipoAtual === 'parceiro') {
            msg = idEditando ? 'Parceiro atualizado com sucesso!' : 'Parceiro adicionado com sucesso!';
        }
        if (tipoAtual === 'regiao') {
            msg = idEditando ? 'Região atualizada com sucesso!' : 'Região adicionada com sucesso!';
        }

        mostrarSucessoERecarregar(msg);

    } catch (err) {
        console.error(err);
        alert('Erro ao salvar. Verifique o console.');
    }
});

// =============================================
// LOGOUT
// =============================================
function logout() {
    localStorage.removeItem('voyage_admin');
    window.location.href = './login.html';
}

// =============================================
// UTILITÁRIOS
// =============================================
function formatarData(dataISO) {
    if (!dataISO) return '-';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
}

// =============================================
// INICIALIZAÇÃO
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    carregarDashboard();
});
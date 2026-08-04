// =========================================
// ARTHUR RECOMENDA - PÁGINA DE CATEGORIA (PAGINAÇÃO)
// =========================================
import { produtos } from './produtos.js';

document.addEventListener('DOMContentLoaded', () => {
    const catPage = document.querySelector('.categoria-page');
    if (!catPage) return;

    const params = new URLSearchParams(window.location.search);
    const catKey = params.get('cat');
    const titleEl = document.getElementById('cat-title');
    const gridEl = document.getElementById('prod-grid');
    const paginationEl = document.getElementById('pagination-container');

    // Configuração da Paginação
    let currentPage = 1;
    const itemsPerPage = 12; // 12 produtos por página

    if (!catKey) {
        titleEl.textContent = "Categoria não encontrada";
        return;
    }

    // Função para normalizar (ignorar acentos e maiúsculas)
    const normalizar = (texto) => texto ? texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

    // Filtro aplicando a normalização
    const filtered = produtos.filter(p => normalizar(p.categoriaKey) === normalizar(catKey));

    if (filtered.length === 0) {
        titleEl.textContent = "Nenhum produto encontrado";
        paginationEl.innerHTML = '';
        return;
    }

    // Pega o nome bonito da categoria do primeiro produto encontrado
    titleEl.textContent = filtered[0].categoria;

    // Função para renderizar a página atual
    function renderPage(page) {
        currentPage = page;
        
        // Calcula o início e o fim do fatiamento do array
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = filtered.slice(start, end);

        // Renderiza os cards compactos com a nota embaixo
        gridEl.innerHTML = pageItems.map(p => `
            <a href="produto.html?id=${p.id}" class="product-card">
                <div class="product-card__img-wrap">
                    <img src="${p.imagem}" alt="${p.nome}" class="product-card__img" width="200" height="200" loading="lazy">
                </div>
                <div class="product-card__info">
                    <h3 class="product-card__title">${p.nome}</h3>
                    <div class="product-card__bottom">
                        <span class="product-card__price">${p.precoAtual}</span>
                        <span class="product-card__badge product-card__badge--score">${p.notaArthur}</span>
                    </div>
                </div>
            </a>
        `).join('');

        renderPagination();
        
        // Rola para o topo da lista suavemente ao trocar de página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Função para renderizar os botões de paginação
    function renderPagination() {
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        
        // Se só tem 1 página, não mostra paginação
        if (totalPages <= 1) {
            paginationEl.innerHTML = '';
            return;
        }

        let buttons = '';
        
        // Botão Anterior
        buttons += `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;

        // Botões numéricos
        for (let i = 1; i <= totalPages; i++) {
            buttons += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        // Botão Próximo
        buttons += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;

        paginationEl.innerHTML = buttons;

        // Adiciona os eventos de clique nos botões
        paginationEl.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.disabled) {
                    renderPage(parseInt(btn.dataset.page));
                }
            });
        });
    }

    // Inicializa renderizando a página 1
    renderPage(1);
});
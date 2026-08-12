// =========================================
// ARTHUR RECOMENDA - PÁGINA DE CATEGORIA (PAGINAÇÃO + BUSCA)
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
    const searchInput = document.getElementById('cat-search-input');

    // Configuração da Paginação
    let currentPage = 1;
    const itemsPerPage = 12; // 12 produtos por página

    if (!catKey) {
        titleEl.textContent = "Categoria não encontrada";
        return;
    }

    // Função para normalizar (ignorar acentos e maiúsculas)
    const normalizar = (texto) => texto ? texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

    // Base de produtos da categoria (fixa)
    const baseProducts = produtos.filter(p => normalizar(p.categoriaKey) === normalizar(catKey));
    // Lista atual (muda quando a pessoa digita na busca)
    let currentProducts = baseProducts;

    if (baseProducts.length === 0) {
        titleEl.textContent = "Nenhum produto encontrado";
        paginationEl.innerHTML = '';
        return;
    }

    // Pega o nome bonito da categoria do primeiro produto encontrado
    titleEl.textContent = baseProducts[0].categoria;






    // FUNÇÃO: PEGAR O MELHOR PRODUTO DA CATEGORIA E COLOCAR NO DESTAQUE
    function renderizarDestaqueCategoria() {
        const destaqueContainer = document.getElementById('cat-featured-product');
        if (!destaqueContainer || baseProducts.length === 0) return;

        // Pega o produto com a maior nota Arthur dentro desta categoria
        const produtoDestaque = [...baseProducts].sort((a, b) => b.notaArthur - a.notaArthur)[0];

        // Monta o visual do preço (riscado, desconto e atual)
        let oldPriceHTML = produtoDestaque.precoAnterior ? `<span class="card-old-price">${produtoDestaque.precoAnterior}</span>` : '';
        let discountHTML = produtoDestaque.desconto ? `<span class="card-discount">${produtoDestaque.desconto}</span>` : '';

        destaqueContainer.innerHTML = `
            <span class="cat-featured-tag">⭐ Top da Categoria</span>
            <a href="produto.html?id=${produtoDestaque.id}" class="cat-featured-card">
                <img src="${produtoDestaque.imagem}" alt="${produtoDestaque.nome}">
                <div class="cat-featured-info">
                    <strong>${produtoDestaque.nome}</strong>
                    <div class="card-price-top">
                        ${oldPriceHTML}
                        ${discountHTML}
                    </div>
                    <span class="product-card__price">${produtoDestaque.precoAtual}</span>
                    <span class="cat-featured-btn">Ver Análise</span>
                </div>
            </a>
        `;
    }

    // Chama a função para preencher o destaque
    renderizarDestaqueCategoria();








        // Lógica de Busca dentro da Categoria (Com Debounce para não tremer no iOS)
    let debounceTimer;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer); // Cancela a busca anterior se a pessoa digitou rápido
            debounceTimer = setTimeout(() => {
                const query = normalizar(e.target.value.trim());
                
                if (query.length > 0) {
                    currentProducts = baseProducts.filter(p => normalizar(p.nome).includes(query));
                } else {
                    currentProducts = baseProducts;
                }
                
                currentPage = 1; 
                renderPage(1);
            }, 300); // Espera 300ms (0,3 segundos) após a pessoa parar de digitar para buscar
        });
    }

    // Função para renderizar a página atual
    function renderPage(page) {
        currentPage = page;
        
        // Calcula o início e o fim do fatiamento do array
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = currentProducts.slice(start, end);

        // Se a busca não achou nada
        if (currentProducts.length === 0) {
            gridEl.innerHTML = `<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1; padding: 40px;">Nenhum produto encontrado com este nome nesta categoria.</p>`;
            paginationEl.innerHTML = '';
            return;
        }

                // Renderiza os cards compactos com a nota embaixo
        gridEl.innerHTML = pageItems.map(p => `
            <a href="produto.html?id=${p.id}" class="product-card">
                <div class="product-card__img-wrap">
                    <img src="${p.imagem}" alt="${p.nome}" class="product-card__img" width="200" height="200" loading="lazy">
                </div>
                <div class="product-card__info">
                    <h3 class="product-card__title">${p.nome}</h3>
                    <div class="product-card__bottom">
                        <div class="card-price-top">
                            ${p.precoAnterior ? `<span class="card-old-price">${p.precoAnterior}</span>` : ''}
                            ${p.desconto ? `<span class="card-discount">${p.desconto}</span>` : ''}
                        </div>
                        <span class="product-card__price">${p.precoAtual}</span>
                    </div>
                </div>
            </a>
        `).join('');

        renderPagination();
    }

    // Função para renderizar os botões de paginação (Inteligente)
    function renderPagination() {
        const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
        
        // Se só tem 1 página, não mostra paginação
        if (totalPages <= 1) {
            paginationEl.innerHTML = '';
            return;
        }

        let buttons = '';
        
        // Botão Anterior
        buttons += `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;

        // Lógica inteligente para não mostrar todos os números (1 ... 4 5 6 ... 10)
        const maxButtons = 3;
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages, currentPage + 1);

        if (currentPage <= 2) endPage = Math.min(totalPages, maxButtons);
        if (currentPage >= totalPages - 1) startPage = Math.max(1, totalPages - 2);

        if (startPage > 1) {
            buttons += `<button class="page-btn ${1 === currentPage ? 'active' : ''}" data-page="1">1</button>`;
            if (startPage > 2) {
                buttons += `<span class="page-dots">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons += `<span class="page-dots">...</span>`;
            }
            buttons += `<button class="page-btn ${totalPages === currentPage ? 'active' : ''}" data-page="${totalPages}">${totalPages}</button>`;
        }

        // Botão Próximo
        buttons += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;

        paginationEl.innerHTML = buttons;


                paginationEl.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.disabled) {
                    renderPage(parseInt(btn.dataset.page));
                    window.scrollTo({ top: 0, behavior: 'smooth' }); // <--- COLOQUE AQUI
                }
            });
        });
    }

    // Inicializa renderizando a página 1
    renderPage(1);
});
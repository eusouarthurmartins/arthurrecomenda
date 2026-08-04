// =========================================
// ARTHUR RECOMENDA - BUSCA HOME (ISOLADO)
// =========================================
import { produtos } from './produtos.js';

// Função mágica para remover acentos e deixar minúsculo
function normalizarTexto(texto) {
    if (!texto) return '';
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInputDesktop = document.getElementById('search-input-home');
    const searchInputMobile = document.getElementById('search-input-mobile');
    const searchToggle = document.getElementById('searchToggle');
    const searchMobileBox = document.getElementById('searchMobileBox');
    const closeSearchMobile = document.getElementById('closeSearchMobile');

    // 1. Lógica de Abrir e Fechar a Lupa (Mobile)
    if (searchToggle && searchMobileBox) {
        searchToggle.addEventListener('click', () => {
            searchMobileBox.classList.add('is-active');
            if (searchInputMobile) searchInputMobile.focus();
        });
    }

    if (closeSearchMobile && searchMobileBox) {
        closeSearchMobile.addEventListener('click', () => {
            searchMobileBox.classList.remove('is-active');
            if (searchInputMobile) searchInputMobile.value = '';
        });
    }

    // 2. Função que renderiza os resultados na página principal
    function renderizarResultadosBusca(query) {
        const catalogContainer = document.getElementById('catalogo-dinamico');
        if (!catalogContainer) return;

        const queryNormalizada = normalizarTexto(query);
        const filtered = produtos.filter(p => normalizarTexto(p.nome).includes(queryNormalizada));

        // Limpa o catálogo atual
        catalogContainer.innerHTML = '';
        catalogContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Ícone de Seta para a Esquerda
        const iconArrowLeft = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: -2px;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`;

        if (filtered.length === 0) {
            catalogContainer.innerHTML = `
                <div class="container" style="text-align: center; padding: 60px 0;">
                    <h2>Nenhum produto encontrado para "${query}"</h2>
                    <p style="color: var(--text-secondary); margin-top: 16px;">Tente buscar por outra palavra ou verifique a ortografia.</p>
                    <br>
                    <button onclick="window.location.href='index.html'" class="btn btn--primary">${iconArrowLeft}Voltar ao Catálogo</button>
                </div>
            `;
            return;
        }

        // Cria a seção de resultados com o botão de Voltar (Verde e com seta)
        const section = document.createElement('section');
        section.className = 'catalog-section';
        section.innerHTML = `
            <div class="container">
                <div class="catalog__header">
                    <h2>Resultados para: ${query}</h2>
                    <button id="clear-search-btn" class="btn btn--primary btn--small">${iconArrowLeft}Voltar</button>
                </div>
                <div class="search-results-grid" id="search-results-grid"></div>
            </div>
        `;
        catalogContainer.appendChild(section);

        // Adiciona a função de limpar a busca e voltar
        const clearBtn = document.getElementById('clear-search-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                // Limpa os campos de texto
                if (searchInputDesktop) searchInputDesktop.value = '';
                if (searchInputMobile) searchInputMobile.value = '';
                // Recarrega a página para restaurar o catálogo original
                window.location.href = 'index.html';
            });
        }

        const grid = document.getElementById('search-results-grid');
        
        // Adiciona os cards dos produtos na grade
        filtered.forEach(produto => {
            const card = document.createElement('a');
            card.href = `produto.html?id=${produto.id}`;
            card.className = 'product-card';
            
            card.innerHTML = `
                <div class="product-card__img-wrap">
                    <img src="${produto.imagem}" alt="${produto.nome}" class="product-card__img" loading="lazy">
                    <span class="product-card__badge product-card__badge--score">${produto.notaArthur}</span>
                    <span class="product-card__badge product-card__badge--status ${produto.statusClass}">${produto.statusRadar}</span>
                </div>
                <div class="product-card__info">
                    <h3 class="product-card__title">${produto.nome}</h3>
                    <p class="product-card__price">${produto.precoAtual}</p>
                </div>`;
            grid.appendChild(card);
        });
    }

    // 3. Capturar o "Enter" no Desktop e no Mobile
    function handleSearchSubmit(inputElement) {
        if (!inputElement) return;
        
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Evita recarregar a página
                const query = inputElement.value.trim();
                if (query.length < 2) return; // Só busca se digitar 2 letras ou mais
                
                renderizarResultadosBusca(query);
                
                // Se for mobile, fecha a caixa de busca após o Enter
                if (searchMobileBox && searchMobileBox.classList.contains('is-active')) {
                    searchMobileBox.classList.remove('is-active');
                }
            }
        });
    }

    handleSearchSubmit(searchInputDesktop);
    handleSearchSubmit(searchInputMobile);
});
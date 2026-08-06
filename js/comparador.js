import { produtos } from './produtos.js';

document.addEventListener('DOMContentLoaded', () => {
    const comparadorPage = document.querySelector('.comparador-page');
    if (!comparadorPage) return;

    let state = {
        items: [null, null],
        currentCategory: null
    };

    let currentPage = 1;
    const itemsPerPage = 8; // Mostra 8 produtos por página

    const catGrid = document.getElementById('comp-cat-grid');
    const catToggle = document.getElementById('cat-toggle');
    const catToggleText = document.getElementById('cat-toggle-text');
    const visualProductsBox = document.getElementById('comp-visual-products');
    const visualProdsGrid = document.getElementById('comp-prods-grid');
    const visualProdTitle = document.getElementById('visual-prod-title');
    const resultSection = document.getElementById('result-section');
    const resultTableContainer = document.getElementById('result-table-container');
    const vereditoContainer = document.getElementById('veredito-container');

    function encurtarNome(nome, max = 30) {
        if (!nome) return '';
        return nome.length > max ? nome.substring(0, max) + '...' : nome;
    }

    // 1. Inicializa Categorias e Botão Toggle
    function initCategories() {
        if (catToggle) {
            catToggle.addEventListener('click', () => {
                const isVisible = catGrid.style.display === 'flex';
                catGrid.style.display = isVisible ? 'none' : 'flex';
                catToggle.classList.toggle('open', !isVisible);
            });
        }

        if (!catGrid) return;
        const uniqueCats = [];
        const seen = new Set();
        produtos.forEach(p => {
            if (p.categoriaKey && !seen.has(p.categoriaKey)) {
                seen.add(p.categoriaKey);
                uniqueCats.push({ key: p.categoriaKey, name: p.categoria });
            }
        });

        const icons = { 
            casa: '⌂', tecnologia: '◉', 'organização': '▣', carro: '▰', cozinha: '♨', 
            ferramentas: '⚒', esporte: '◐', infantil: '◌', influencer: '◈', 'Saude & Beleza': '✦', pets: '♡' 
        };

        catGrid.innerHTML = '';
        uniqueCats.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'cat-btn';
            btn.innerHTML = `<span class="cat-btn__icon">${icons[cat.key] || '◈'}</span> ${cat.name}`;
            btn.addEventListener('click', () => showVisualProducts(cat.key, cat.name));
            catGrid.appendChild(btn);
        });
    }

    // 2. Mostra Produtos ao escolher categoria ou na carga inicial
    function showVisualProducts(catKey, catName, isInitialLoad = false) {
                // Fecha o menu suspenso ao selecionar
        if (catGrid) catGrid.style.display = 'none';
        if (catToggle) catToggle.classList.remove('open');
        state.currentCategory = catKey;
        state.items = [null, null]; 
        currentPage = 1; // Reseta para a página 1
        resultSection.style.display = 'none';
        
        if (visualProdTitle) visualProdTitle.textContent = '';
        visualProductsBox.style.display = 'block';
        renderProductGrid();
        
        if (!isInitialLoad) {
            visualProductsBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // 3. Renderiza a Grade de Produtos com Paginação
    function renderProductGrid() {
        if (!visualProdsGrid) return;
        
        let prods = [];
        if (state.currentCategory === 'all') {
            prods = produtos;
        } else {
            prods = produtos.filter(p => p.categoriaKey === state.currentCategory);
        }
        
        const totalPages = Math.ceil(prods.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = 1;
        
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = prods.slice(start, end);

        visualProdsGrid.innerHTML = '';

        pageItems.forEach(p => {
            const isSelected1 = state.items[0] && state.items[0].id === p.id;
            const isSelected2 = state.items[1] && state.items[1].id === p.id;
            const isAnySelected = isSelected1 || isSelected2;

            const card = document.createElement('div');
            card.className = 'visual-prod-card';
            if (isAnySelected) card.classList.add('is-selected');

            const buttonText = isAnySelected ? 'Selecionado ✓' : 'Selecionar';
            const buttonClass = isAnySelected ? 'btn--secondary' : 'btn--primary';

            card.innerHTML = `
                <img src="${p.imagem}" alt="${p.nome}">
                <div class="visual-prod-card__info">
                    <strong>${encurtarNome(p.nome, 40)}</strong>
                    <span class="visual-prod-card__price">${p.precoAtual || 'Sob consulta'}</span>
                    <span class="visual-prod-card__score">Nota: ${p.notaArthur || 'N/A'}</span>
                </div>
                <button class="btn ${buttonClass} btn--small btn-select" style="margin-top: 12px;">${buttonText}</button>
            `;

            card.querySelector('.btn-select').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleProductSelection(p);
            });
            visualProdsGrid.appendChild(card);
        });

        renderPagination(totalPages);
    }

       // 3.1 Renderiza os botões de página (Paginação Inteligente)
    function renderPagination(totalPages) {
        const paginationContainer = document.getElementById('comp-pagination');
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return; // Se só tem 1 página, não mostra botões

        let buttons = '';
        
        // Botão Anterior
        buttons += `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;

        // Lógica para esconder números distantes
        const maxButtons = 3; // Quantos números mostrar perto da página atual
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages, currentPage + 1);

        // Se estiver no começo (ex: pag 2), mostra 1, 2, 3
        if (currentPage <= 2) {
            endPage = Math.min(totalPages, maxButtons);
        }
        // Se estiver no final (ex: pag 75 de 76), mostra 74, 75, 76
        if (currentPage >= totalPages - 1) {
            startPage = Math.max(1, totalPages - 2);
        }

        // Botão 1 e "..."
        if (startPage > 1) {
            buttons += `<button class="page-btn ${1 === currentPage ? 'active' : ''}" data-page="1">1</button>`;
            if (startPage > 2) {
                buttons += `<span class="page-dots">...</span>`;
            }
        }

        // Botões do meio (perto da página atual)
        for (let i = startPage; i <= endPage; i++) {
            buttons += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        // "..." e Botão Final
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons += `<span class="page-dots">...</span>`;
            }
            buttons += `<button class="page-btn ${totalPages === currentPage ? 'active' : ''}" data-page="${totalPages}">${totalPages}</button>`;
        }

        // Botão Próximo
        buttons += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;

        paginationContainer.innerHTML = buttons;

        paginationContainer.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.disabled) {
                    currentPage = parseInt(btn.dataset.page);
                    renderProductGrid();
                    visualProductsBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
    // 4. Lógica de Selecionar (Max 2)
    function toggleProductSelection(produto) {
        if (state.items[0] && state.items[0].id === produto.id) {
            state.items[0] = null;
            if (state.items[1]) { state.items[0] = state.items[1]; state.items[1] = null; }
        } else if (state.items[1] && state.items[1].id === produto.id) {
            state.items[1] = null;
        } else {
            if (!state.items[0]) {
                state.items[0] = produto;
            } else if (!state.items[1]) {
                state.items[1] = produto;
            } else {
                state.items[0] = state.items[1];
                state.items[1] = produto;
            }
        }

        renderProductGrid(); // Atualiza os botões na tela
        if (state.items[0] && state.items[1]) {
            renderComparison();
        } else {
            resultSection.style.display = 'none';
        }
    }

    // 5. Renderização Simplificada
    function parsePrice(priceStr) {
        if (!priceStr || typeof priceStr !== 'string') return 0;
        return parseFloat(priceStr.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    }

       function renderComparison() {
        const [p1, p2] = state.items;

        // NOVIDADE: Função inteligente para achar o preço real
        function getPrecoReal(produto) {
            // 1. Tenta o preço atual
            if (produto.precoAtual && typeof produto.precoAtual === 'string' && produto.precoAtual.includes('R$')) {
                return produto.precoAtual;
            }
            // 2. Tenta o preço riscado (anterior)
            if (produto.precoAnterior && typeof produto.precoAnterior === 'string' && produto.precoAnterior.includes('R$')) {
                return produto.precoAnterior;
            }
            // 3. Tenta o preço dentro do botão de compra
            if (produto.opcoesCompra && produto.opcoesCompra.length > 0 && produto.opcoesCompra[0].preco && produto.opcoesCompra[0].preco.includes('R$')) {
                return produto.opcoesCompra[0].preco;
            }
            // 4. Se não achar nada, avisa que está sob consulta
            return 'Sob consulta';
        }

        const priceStr1 = getPrecoReal(p1);
        const priceStr2 = getPrecoReal(p2);

        const price1 = parsePrice(priceStr1);
        const price2 = parsePrice(priceStr2);
        const score1 = p1.notaArthur || 0;
        const score2 = p2.notaArthur || 0;

        const winnerScore1 = score1 * 2 - (price1 / 10);
        const winnerScore2 = score2 * 2 - (price2 / 10);
        let winnerIndex = null;
        if (winnerScore1 > winnerScore2) winnerIndex = 0;
        else if (winnerScore2 > winnerScore1) winnerIndex = 1;

        const sameCategory = p1.categoriaKey === p2.categoriaKey;

        let tableHTML = `
            <div style="text-align: center; margin-bottom: 24px;">
                <button onclick="window.location.href='comparador.html'" class="btn btn--primary btn--small">Nova Comparação</button>
            </div>
            <div class="comp-table">
                <div class="comp-row comp-header">
                    <div class="comp-cell comp-label"></div>
                    <div class="comp-cell comp-product ${winnerIndex === 0 && sameCategory ? 'is-winner' : ''}">
                        ${winnerIndex === 0 && sameCategory ? '<span class="winner-badge">★ Vencedor</span>' : ''}
                        <img src="${p1.imagem}" alt="${p1.nome}">
                        <h3 title="${p1.nome}">${encurtarNome(p1.nome)}</h3>
                    </div>
                    <div class="comp-cell comp-product ${winnerIndex === 1 && sameCategory ? 'is-winner' : ''}">
                        ${winnerIndex === 1 && sameCategory ? '<span class="winner-badge">🏆 Vencedor</span>' : ''}
                        <img src="${p2.imagem}" alt="${p2.nome}">
                        <h3 title="${p2.nome}">${encurtarNome(p2.nome)}</h3>
                    </div>
                </div>
                <div class="comp-row">
                    <div class="comp-cell comp-label">Nota Arthur</div>
                    <div class="comp-cell ${score1 > score2 ? 'cell-win' : ''}">${score1}</div>
                    <div class="comp-cell ${score2 > score1 ? 'cell-win' : ''}">${score2}</div>
                </div>
                <div class="comp-row">
                    <div class="comp-cell comp-label">Preço</div>
                    <div class="comp-cell ${price1 < price2 && price1 > 0 ? 'cell-win' : ''}">${priceStr1}</div>
                    <div class="comp-cell ${price2 < price1 && price2 > 0 ? 'cell-win' : ''}">${priceStr2}</div>
                </div>
                <div class="comp-row comp-cta">
                    <div class="comp-cell comp-label"></div>
                    <div class="comp-cell"><a href="produto.html?id=${p1.id}" class="btn btn--primary btn--small">Ver análise</a></div>
                    <div class="comp-cell"><a href="produto.html?id=${p2.id}" class="btn btn--primary btn--small">Ver análise</a></div>
                </div>
            </div>
        `;

        resultTableContainer.innerHTML = tableHTML;
        renderVeredito(p1, p2, price1, price2, score1, score2, winnerIndex, sameCategory);
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }



    function renderVeredito(p1, p2, price1, price2, score1, score2, winnerIndex, sameCategory) {
        let texto = '';
        if (!sameCategory) {
            texto = `Aqui não existe um vencedor. Cada produto resolve uma necessidade diferente. A melhor escolha depende do uso que você pretende dar.`;
        } else {
            const barato = price1 < price2 ? p1 : p2;
            const melhorNota = score1 > score2 ? p1 : p2;
            if (winnerIndex !== null) {
                const winner = state.items[winnerIndex];
                const loser = state.items[winnerIndex === 0 ? 1 : 0];
                if (melhorNota.id === winner.id && barato.id === winner.id) {
                    texto = `Se eu tivesse que escolher apenas um, minha recomendação seria o <strong>${winner.nome}</strong>. Ele entrega um conjunto mais equilibrado entre qualidade, preço e experiência de uso.`;
                } else if (melhorNota.id === winner.id) {
                    texto = `O <strong>${winner.nome}</strong> faz mais sentido para quem aceita investir um pouco mais em troca de uma experiência superior. Já o <strong>${loser.nome}</strong> vale mais para quem quer economizar.`;
                } else {
                    texto = `O <strong>${winner.nome}</strong> entrega mais valor pelo preço, mas o <strong>${loser.nome}</strong> ainda leva a coroa na qualidade técnica. Se o orçamento está apertado, pode fechar o ${winner.nome} sem medo.`;
                }
            } else {
                texto = `Empate técnico! Os dois são tão parecidos em custo e qualidade que a escolha vai do seu gosto pessoal. Pode fechar o que estiver com o melhor frete na sua região.`;
            }
        }

        vereditoContainer.innerHTML = `
            <div class="veredito-arthur-box">
                <div class="veredito-arthur-box__icon">✦</div>
                <div class="veredito-arthur-box__content">
                    <span class="veredito-label">Veredito do Arthur</span>
                    <p>${texto}</p>
                </div>
            </div>
        `;
    }

    // Fecha o menu de categorias se clicar fora dele
    document.addEventListener('click', (e) => {
        if (!catGrid || !catToggle) return;
        
        // Se o clique não foi no botão do menu e nem dentro da lista, e a lista estiver aberta
        if (!catToggle.contains(e.target) && !catGrid.contains(e.target) && catGrid.style.display === 'flex') {
            catGrid.style.display = 'none';
            catToggle.classList.remove('open');
        }
    });


    // INIT
    initCategories();
    // Carrega todos os produtos assim que a página abre (Estado Padrão)
    showVisualProducts('all', 'Todos os Produtos', true);

    // Suporte a URL GET
    const params = new URLSearchParams(window.location.search);
    const p1Id = params.get('p1');
    const p2Id = params.get('p2');
    if (p1Id && p2Id) {
        const prod1 = produtos.find(p => p.id === parseInt(p1Id, 10));
        const prod2 = produtos.find(p => p.id === parseInt(p2Id, 10));
        if (prod1) { state.items[0] = prod1; state.currentCategory = prod1.categoriaKey; }
        if (prod2) { state.items[1] = prod2; state.currentCategory = prod2.categoriaKey; }
        if (prod1 || prod2) {
            const catName = (prod1 || prod2).categoria;
                    if (visualProdTitle) visualProdTitle.textContent = '';
            visualProductsBox.style.display = 'block';
            renderProductGrid();
            if (state.items[0] && state.items[1]) {
                renderComparison();
            }
        }
    }
});
// =========================================
// ARTHUR RECOMENDA - SCRIPT.JS
// =========================================
import { produtos } from './produtos.js';

document.addEventListener('DOMContentLoaded', () => {

    // 0. TEMA CLARO/ESCURO (LIGHT MODE)
    const themeToggle = document.getElementById('themeToggle');
    const iconSun = document.querySelector('.icon-sun');
    const iconMoon = document.querySelector('.icon-moon');

        // Verifica se já tem um tema salvo. Se não tiver, começa no CLARO.
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== 'dark') { // <--- A MÁGICA ESTÁ AQUI
        document.body.classList.add('light-theme');
        if(iconSun) iconSun.style.display = 'none';
        if(iconMoon) iconMoon.style.display = 'block';
    }

    // Função de clicar no botão
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');

            // Salva a escolha no navegador
            localStorage.setItem('theme', isLight ? 'light' : 'dark');

            // Troca os ícones
            if (iconSun && iconMoon) {
                iconSun.style.display = isLight ? 'none' : 'block';
                iconMoon.style.display = isLight ? 'block' : 'none';
            }
        });
    }

    
    // 1. MENU MOBILE
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isActive = mainNav.classList.toggle('active');
            menuToggle.classList.toggle('open', isActive);
            menuToggle.setAttribute('aria-expanded', isActive);
        });
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.classList.remove('open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // 2. PRODUTO VIRAL
    function renderizarProdutoViral() {
        const viralSection = document.getElementById('viral-section');
        if (!viralSection) return;
        let viral = produtos.find(p => p.viral === true) || [...produtos].sort((a, b) => b.notaArthur - a.notaArthur)[0];
        if (viral) {
            viralSection.innerHTML = `
                <div class="container">
                    <div class="viral-card">
                        <div class="viral-card__img-wrap">
                            <img src="${viral.imagem}" alt="${viral.nome}">
                            <span class="viral-badge">🔥 Em Alta</span>
                        </div>
                        <div class="viral-card__info">
                            <h2>${viral.nome}</h2>
                            <div class="viral-card__meta">
                                <span class="viral-card__score">Nota Arthur: ${viral.notaArthur}</span>
                                <span class="viral-card__price">${viral.precoAtual}</span>
                            </div>
                            <a href="produto.html?id=${viral.id}" class="btn btn--primary">Ver Análise</a>
                        </div>
                    </div>
                </div>`;
        }
    }

    // 2.5 AUTOMATIZAR DADOS ESTRUTURADOS (JSON-LD) PARA O GOOGLE
    function gerarJsonLdHome() {
        const jsonLdScript = document.getElementById('home-jsonld');
        if (!jsonLdScript) return;

        // Pega os 5 produtos com a maior nota Arthur no banco de dados
        const topProdutos = [...produtos].sort((a, b) => b.notaArthur - a.notaArthur).slice(0, 5);

        // Monta a estrutura que o Google lê
        const itemList = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": topProdutos.map((p, index) => {
                // Pega o melhor preço dentro do produto
                const melhorOp = p.opcoesCompra && p.opcoesCompra.length > 0 ? (p.opcoesCompra.find(op => op.destaque) || p.opcoesCompra[0]) : null;
                let price = "0.00";
                if (melhorOp && melhorOp.preco) {
                    price = parseFloat(melhorOp.preco.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
                }

                return {
                    "@type": "Product",
                    "position": index + 1,
                    "name": p.nome,
                    "image": p.imagem,
                    "description": p.veredito && p.veredito.contexto ? p.veredito.contexto : "Produto testado e aprovado por Arthur Recomenda.",
                    "brand": { "@type": "Brand", "name": "Arthur Recomenda" },
                    "offers": {
                        "@type": "Offer",
                        "url": melhorOp && melhorOp.link ? melhorOp.link : `https://arthurrecomenda.com.br/produto.html?id=${p.id}`,
                        "priceCurrency": "BRL",
                        "price": price.toFixed(2),
                        "availability": "https://schema.org/InStock"
                    }
                };
            })
        };

        // Injeta o JSON dentro da tag do HTML
        jsonLdScript.textContent = JSON.stringify(itemList);
    }

    // 2.6 ATUALIZAR DESTAQUE PRINCIPAL (HERO)
    function renderizarHeroDestaque() {
        const primeiroProduto = produtos[0];
        if (!primeiroProduto) return;

        const img = document.getElementById('hero-produto-img');
        if (img) img.src = primeiroProduto.imagem;
        
        const nome = document.getElementById('hero-produto-nome');
        if (nome) nome.innerText = primeiroProduto.nome;
        
        const nota = document.getElementById('hero-produto-nota');
        if (nota) nota.innerText = primeiroProduto.notaArthur;
        
        const preco = document.getElementById('hero-produto-preco');
        if (preco) preco.innerText = primeiroProduto.precoAtual;
        
        const link = document.getElementById('hero-produto-link');
        if (link) link.href = `produto.html?id=${primeiroProduto.id}`;
    }

    // 3. CATÁLOGO DINÂMICO (Renderiza categorias e carrosséis automaticamente)

            // Função inteligente para montar o visual do preço no Card
    function getPrecoHTML(produto) {
        // 1. Se o preço principal for válido (tiver R$), mostra ele normal
        if (produto.precoAtual && typeof produto.precoAtual === 'string' && produto.precoAtual.includes('R$')) {
            return `<p class="product-card__price">${produto.precoAtual}</p>`;
        }
        
        // 2. Se for "Sob consulta", procura o preço riscado ou do botão
        let precoReal = null;
        if (produto.precoAnterior && typeof produto.precoAnterior === 'string' && produto.precoAnterior.includes('R$')) {
            precoReal = produto.precoAnterior;
        } else if (produto.opcoesCompra && produto.opcoesCompra.length > 0 && produto.opcoesCompra[0].preco && produto.opcoesCompra[0].preco.includes('R$')) {
            precoReal = produto.opcoesCompra[0].preco;
        }

        // 3. Se achou um preço real, mostra riscado + "Consultar" em vermelho
        if (precoReal) {
            return `
                <div class="product-card__price-consult">
                    <span class="price-old"><s>${precoReal}</s></span>
                    <span class="price-consult-text">Ver desconto</span>
                </div>
            `;
        }

        // 4. Se não achou preço de jeito nenhum, mostra só o vermelho
        return `<p class="product-card__price-consult"><span class="price-consult-text">Consultar no site</span></p>`;
    }

    function renderizarCatalogoDinamico() {
        const catalogContainer = document.getElementById('catalogo-dinamico');
        if (!catalogContainer) return;

        // Extrai categorias únicas na ordem em que aparecem
        const categorias = [];
        const seen = new Set();
        produtos.forEach(p => {
            if (!seen.has(p.categoriaKey)) {
                seen.add(p.categoriaKey);
                categorias.push({ key: p.categoriaKey, name: p.categoria });
            }
        });

        // Gera o HTML de cada seção de carrossel
        let catalogHTML = '';
        categorias.forEach(cat => {
            catalogHTML += `
                <section class="catalog-section" id="cat-${cat.key}">
                    <div class="container">
                        <div class="catalog__header">
                            <h2>${cat.name}</h2>
                            <a href="categoria.html?cat=${encodeURIComponent(cat.key)}" class="catalog__link">Ver tudo</a>
                        </div>
                        <div class="catalog__nav-wrapper">
                            <button class="catalog__arrow catalog__arrow--left" data-target="row-${cat.key}" aria-label="Ver produtos anteriores">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <div class="catalog__row" id="row-${cat.key}" role="list"></div>
                            <button class="catalog__arrow catalog__arrow--right" data-target="row-${cat.key}" aria-label="Ver próximos produtos">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </div>
                </section>
            `;
        });

        catalogContainer.innerHTML = catalogHTML;

        // Preenche os carrosséis com os cards
        produtos.forEach(produto => {
            const row = document.getElementById(`row-${produto.categoriaKey}`);
            if (row) {
                const card = document.createElement('a');
                card.href = `produto.html?id=${produto.id}`;
                card.className = 'product-card';
                card.setAttribute('role', 'listitem');
                card.setAttribute('aria-label', `Ver análise de ${produto.nome}, preço ${produto.precoAtual}`);
                
                const socialProof = produto.avaliacaoMarketplace ? `
                    <div class="product-card__social">
                        <span class="stars">★ ${produto.avaliacaoMarketplace.estrelas}</span>
                        <span class="reviews">(${produto.avaliacaoMarketplace.total})</span>
                    </div>` : '';

                card.innerHTML = `
                    <div class="product-card__img-wrap">
                        <img src="${produto.imagem}" alt="${produto.nome}" class="product-card__img" width="400" height="500" loading="lazy">
                        <span class="product-card__badge product-card__badge--score">${produto.notaArthur}</span>
                        <span class="product-card__badge product-card__badge--status ${produto.statusClass}">${produto.statusRadar}</span>
                    </div>
                    <div class="product-card__info">
                        <h3 class="product-card__title">${produto.nome}</h3>
                        ${socialProof}
                       ${getPrecoHTML(produto)}
                    </div>`;
                row.appendChild(card);
            }
        });

        // Re-inicializa as setas dos carrosséis gerados
        inicializarSetasCarrossel();
    }

    renderizarProdutoViral();
    gerarJsonLdHome(); // <--- CHAMADA DA AUTOMAÇÃO DO GOOGLE ADICIONADA AQUI
    renderizarHeroDestaque(); // <--- CHAMADA DA NOVA FUNÇÃO ADICIONADA AQUI
    renderizarCatalogoDinamico();

    // 4. PÁGINA DE PRODUTO
    function inicializarPaginaProduto() {
        if (!document.body.classList.contains('produto-page-body')) return;
        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get('id'), 10);
        const produto = produtos.find(p => p.id === id) || produtos[0];
        const mainContent = document.querySelector('.produto-page');

        const setData = (selector, value, isHTML = false) => {
            const el = document.querySelector(`[data-js="${selector}"]`);
            if (el) { isHTML ? el.innerHTML = value : el.textContent = value; }
        };

        document.title = `${produto.nome} | Arthur Recomenda`;
        const imgEl = document.querySelector('[data-js="produto-imagem"]');
        if (imgEl) { imgEl.src = produto.imagem; imgEl.alt = produto.nome; }
        
        setData('produto-categoria', produto.categoria);
        setData('produto-nome', produto.nome);
        setData('produto-preco-atual', produto.precoAtual);
        setData('produto-nota', produto.notaArthur);
        setData('produto-status-radar', produto.statusRadar);

        if (produto.avaliacaoMarketplace) {
            const socialContainer = document.querySelector('[data-js="produto-social"]');
            if (socialContainer) {
                socialContainer.innerHTML = `<span class="stars">★ ${produto.avaliacaoMarketplace.estrelas}</span><span class="reviews">${produto.avaliacaoMarketplace.total} avaliações</span>`;
                socialContainer.style.display = 'flex';
            }
        }

        const melhorOpcao = produto.opcoesCompra.find(op => op.destaque) || produto.opcoesCompra[0];
        if (melhorOpcao) setData('produto-marketplace', `Encontrado na ${melhorOpcao.marketplace}`);

        if (produto.precoAnterior) {
            const pAnt = document.querySelector('[data-js="produto-preco-anterior"]');
            if (pAnt) { pAnt.textContent = produto.precoAnterior; pAnt.style.display = 'block'; }
        }
        if (produto.desconto) {
            const desc = document.querySelector('[data-js="produto-desconto"]');
            if (desc) { desc.textContent = produto.desconto; desc.style.display = 'inline-block'; }
        }

        if (produto.videoUrl) {
            const videoSection = document.querySelector('[data-js="video-section"]');
            const videoWrapper = document.querySelector('[data-js="video-wrapper"]');
            if (videoSection && videoWrapper) {
                videoWrapper.innerHTML = `<iframe width="100%" height="100%" src="${produto.videoUrl}" frameborder="0" allowfullscreen style="aspect-ratio: 16/9; border-radius: 12px;"></iframe>`;
                videoSection.style.display = 'block';
            }
        }

        setData('produto-contexto', `<strong>O Contexto</strong><p>${produto.veredito.contexto}</p>`, true);
        setData('produto-problema', `<strong>O Problema que resolve</strong><p>${produto.veredito.problema}</p>`, true);
        setData('produto-publico', `<strong>Para quem é</strong><p>${produto.veredito.publico}</p>`, true);

        const avaliacoes = { 'aval-custo': produto.avaliacao.custo, 'aval-qualidade': produto.avaliacao.qualidade, 'aval-praticidade': produto.avaliacao.praticidade, 'aval-durabilidade': produto.avaliacao.durabilidade, 'aval-inovacao': produto.avaliacao.inovacao };
        for (const [key, value] of Object.entries(avaliacoes)) {
            const bar = document.querySelector(`[data-js="${key}"]`);
            if (bar) bar.style.width = `${value}%`;
            const num = document.querySelector(`[data-js="${key}-num"]`);
            if (num) num.textContent = `${value}/100`;
        }

        const posList = document.querySelector('[data-js="pontos-positivos"]');
        const negList = document.querySelector('[data-js="pontos-negativos"]');
        if (posList) posList.innerHTML = produto.pontosPositivos.map(p => `<li>${p}</li>`).join('');
        if (negList) negList.innerHTML = produto.pontosNegativos.map(p => `<li>${p}</li>`).join('');

                // Função para criar o botão de compra
        function criarBotaoCompra(opcao) {
            const isDestaque = opcao.destaque;
            const btn = document.createElement('a');
            btn.href = opcao.link; 
            btn.target = "_blank"; 
            btn.rel = "noopener noreferrer";
            btn.className = `cta-opcao-btn ${isDestaque ? 'cta-opcao-btn--destaque' : 'cta-opcao-btn--secundaria'}`;
            const observacaoHTML = opcao.observacao ? `<small>${opcao.observacao}</small>` : '';
            btn.innerHTML = `<span class="cta-opcao-titulo"><strong>${isDestaque ? 'Comprar na ' + opcao.marketplace : opcao.marketplace}</strong>${observacaoHTML}</span><span class="cta-opcao-preco">${opcao.preco}</span>`;
            return btn;
        }

        // 1. Coloca os botões lá embaixo (Padrão)
        const opcoesLista = document.querySelector('[data-js="cta-opcoes-lista"]');
        if (opcoesLista) {
            opcoesLista.innerHTML = '';
            produto.opcoesCompra.forEach(opcao => opcoesLista.appendChild(criarBotaoCompra(opcao)));
        }

        // 2. Coloca os botões no TOPO (Novo)
        const opcoesListaTopo = document.querySelector('[data-js="cta-topo-lista"]');
        if (opcoesListaTopo) {
            opcoesListaTopo.innerHTML = '';
            produto.opcoesCompra.forEach(opcao => opcoesListaTopo.appendChild(criarBotaoCompra(opcao)));
        }

        setData('cta-preco', produto.precoAtual);
        const stickyBar = document.querySelector('[data-js="sticky-bar"]');
        const stickyLink = document.querySelector('[data-js="sticky-link"]');
        if (stickyBar && stickyLink && melhorOpcao) {
            stickyLink.href = melhorOpcao.link;
            if (window.innerWidth <= 767) stickyBar.style.display = 'flex';
        }
        setData('sticky-preco', produto.precoAtual);

        const jsonLdScript = document.getElementById('produto-jsonld');
        if (jsonLdScript) {
            const jsonLdData = { "@context": "https://schema.org/", "@type": "Product", "name": produto.nome, "image": produto.imagem, "description": produto.veredito.contexto, "brand": { "@type": "Brand", "name": "Arthur Recomenda" }, "offers": produto.opcoesCompra.map(op => ({ "@type": "Offer", "url": op.link, "priceCurrency": "BRL", "price": parseFloat(op.preco.replace(/[^\d,]/g, '').replace(',', '.')), "availability": "https://schema.org/InStock", "seller": { "@type": "Organization", "name": op.marketplace } })) };
            jsonLdScript.textContent = JSON.stringify(jsonLdData);
        }
        if (mainContent) mainContent.classList.remove('is-loading');
    }

    inicializarPaginaProduto();

    // 5. SETAS CARROSSEL
    function inicializarSetasCarrossel() {
        document.querySelectorAll('.catalog__arrow').forEach(arrow => {
            arrow.addEventListener('click', () => {
                const row = document.getElementById(arrow.getAttribute('data-target'));
                if (!row) return;
                row.scrollBy({ left: 440 * (arrow.classList.contains('catalog__arrow--left') ? -1 : 1), behavior: 'smooth' });
            });
        });
    }

    // 6. ANIMAÇÕES
    function inicializarMicroanimacoes() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    }
    inicializarMicroanimacoes();



    // 7. BOTÃO VOLTAR AO TOPO
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        // Quando rolar a tela mais que 400 pixels, mostra o botão
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('is-visible');
            } else {
                backToTopBtn.classList.remove('is-visible');
            }
        });

        // Quando clicar, sobe suavemente para o topo
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


});
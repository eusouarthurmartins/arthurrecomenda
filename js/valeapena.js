// =========================================
// ARTHUR RECOMENDA - LÓGICA DO QUIZ
// Arquitetura: ES6 Module (Isolado)
// =========================================

import { produtos } from './produtos.js';

document.addEventListener('DOMContentLoaded', () => {
    const quizPage = document.querySelector('.valeapena-page');
    if (!quizPage) return;

    const state = {
        orcamento: null,
        categoria: null,
        prioridade: null
    };

        // Mapeamento de valores dos botões para lógica
    const mapCategoria = {
        'Casa': 'casa',
        'Tecnologia': 'Tecnologia',
        'Organização': 'Organização',
        'Carro': 'carro',
        'Ferramentas': 'ferramentas',
        'Esporte': 'esporte',
        'Pets': 'pets',
        'Infantil': 'infantil',
        'Saude&Beleza': 'Saude & Beleza',
        'Influencer': 'influencer'
    };

        // 1. Capturar mudanças nos 3 Menus Suspensos (Selects)
    const selectOrcamento = document.getElementById('select-orcamento');
    const selectCategoria = document.getElementById('select-categoria');
    const selectPrioridade = document.getElementById('select-prioridade');

    if (selectOrcamento) {
        selectOrcamento.addEventListener('change', (e) => {
            state.orcamento = e.target.value;
            verificarRespostas();
        });
    }

    if (selectCategoria) {
        selectCategoria.addEventListener('change', (e) => {
            state.categoria = e.target.value;
            verificarRespostas();
        });
    }

    if (selectPrioridade) {
        selectPrioridade.addEventListener('change', (e) => {
            state.prioridade = e.target.value;
            verificarRespostas();
        });
    }

        // Função para verificar se todas as perguntas foram respondidas
    function verificarRespostas() {
        const btn = document.getElementById('ver-resultado-btn');
        if (!btn) return;

        // Se as 3 perguntas estiverem respondidas, tira o "disabled"
        if (state.orcamento && state.categoria && state.prioridade) {
            btn.disabled = false;
        } else {
            // Se faltar alguma, mantém bloqueado
            btn.disabled = true;
        }
    }

    // 2. Lógica de Filtro e Renderização
        const btnVerResultado = document.getElementById('ver-resultado-btn');
    if (btnVerResultado) {
        btnVerResultado.addEventListener('click', () => {
            const resultados = filtrarProdutos();
            renderizarResultados(resultados);
            
            // Mostra a área de resultados (que estava escondida)
            const resultSection = document.getElementById('resultados-section');
            if(resultSection) {
                resultSection.style.display = 'block';
                // Rola a tela suavemente até os resultados
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Função inteligente para achar o preço real do produto
    function getPrecoReal(produto) {
        if (produto.opcoesCompra && produto.opcoesCompra.length > 0) {
            const op = produto.opcoesCompra[0];
            if (op.preco && op.preco.includes('R$')) {
                const cleaned = op.preco.replace(/[^\d,]/g, '');
                return parseFloat(cleaned.replace(',', '.')) || 0;
            }
        }
        if (produto.precoAnterior && typeof produto.precoAnterior === 'string' && produto.precoAnterior.includes('R$')) {
            const cleaned = produto.precoAnterior.replace(/[^\d,]/g, '');
            return parseFloat(cleaned.replace(',', '.')) || 0;
        }
        if (produto.precoAtual && typeof produto.precoAtual === 'string' && produto.precoAtual.includes('R$')) {
            const cleaned = produto.precoAtual.replace(/[^\d,]/g, '');
            return parseFloat(cleaned.replace(',', '.')) || 0;
        }
        return 0;
    }

    function filtrarProdutos() {
        let pool = [...produtos];
        let finalResults = [];

        // Filtro ESTRICTO por Categoria
        const catKey = mapCategoria[state.categoria];
        let catFiltered = pool.filter(p => p.categoriaKey && p.categoriaKey.toLowerCase() === (catKey || '').toLowerCase());
        
        // Se a categoria escolhida não tiver NENHUM produto, retorna array vazio
        if (catFiltered.length === 0) {
            return []; 
        }

        // Filtro por Orçamento
        if (state.orcamento === 'ate50') {
            finalResults = catFiltered.filter(p => getPrecoReal(p) <= 50 && getPrecoReal(p) > 0);
        } else if (state.orcamento === '50a150') {
            finalResults = catFiltered.filter(p => getPrecoReal(p) > 50 && getPrecoReal(p) <= 150);
        } else if (state.orcamento === 'acima150') {
            finalResults = catFiltered.filter(p => getPrecoReal(p) > 150);
        }

        // Fallback de Preço: Se não achar nenhum produto na faixa de preço, 
        // mostra os da categoria pelo menos (para não ficar vazio)
        if (finalResults.length === 0) {
            finalResults = [...catFiltered];
        }

        // Ordenação por Prioridade
        if (state.prioridade === 'preco') {
            finalResults.sort((a, b) => getPrecoReal(a) - getPrecoReal(b));
        } else if (state.prioridade === 'qualidade') {
            finalResults.sort((a, b) => {
                const valA = (a.avaliacao && a.avaliacao.qualidade) ? a.avaliacao.qualidade : 0;
                const valB = (b.avaliacao && b.avaliacao.qualidade) ? b.avaliacao.qualidade : 0;
                return valB - valA || (b.notaArthur || 0) - (a.notaArthur || 0);
            });
        } else if (state.prioridade === 'custo') {
            finalResults.sort((a, b) => {
                const valA = (a.avaliacao && a.avaliacao.custo) ? a.avaliacao.custo : 0;
                const valB = (b.avaliacao && b.avaliacao.custo) ? b.avaliacao.custo : 0;
                return valB - valA || (b.notaArthur || 0) - (a.notaArthur || 0);
            });
        } else {
            finalResults.sort((a, b) => (b.notaArthur || 0) - (a.notaArthur || 0));
        }

        return finalResults;
    }

    function renderizarResultados(lista) {
        const container = document.getElementById('resultados-container');
        if (!container) return;

        container.innerHTML = '';

        if (!lista || lista.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhum produto encontrado nesta categoria no momento. Tente outra combinação!</p>';
            return;
        }

        lista.forEach(produto => {
            const card = document.createElement('div');
            card.className = 'quiz-result-card animate-on-scroll';
            
            const nome = produto.nome || 'Produto';
            const imagem = produto.imagem || 'https://via.placeholder.com/100';
            const nota = produto.notaArthur || 'N/A';
            const preco = produto.precoAtual || 'Preço indisponível';
            const contexto = (produto.veredito && produto.veredito.contexto) ? produto.veredito.contexto : 'Confira a análise completa deste produto no link abaixo.';
            
            card.innerHTML = `
                <div class="quiz-result-card__img-wrap">
                    <img src="${imagem}" alt="${nome}" class="quiz-result-card__img" width="100" height="100">
                    <span class="quiz-result-card__score">${nota}</span>
                </div>
                <div class="quiz-result-card__info">
                    <h3 class="quiz-result-card__title">${nome}</h3>
                    <p class="quiz-result-card__desc">${contexto}</p>
                    <div class="quiz-result-card__footer">
                        <span class="quiz-result-card__price">${preco}</span>
                        <a href="produto.html?id=${produto.id}" class="btn btn--primary btn--small">Ver Análise</a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        container.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    }
});
window.tailwind = {
    config: {
        theme: {
            extend: {
                colors: { primary: '#22C345', darkGray: '#333333' },
                fontFamily: { sans: ['Inter', 'sans-serif'] }
            }
        }
    }
};

const formataBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const categoriasSistema = [
    { id: 'cpu', nome: 'Processador' },
{ id: 'cooler', nome: 'CPU Cooler' },
{ id: 'placa-mae', nome: 'Placa-Mãe' },
{ id: 'memoria-ram', nome: 'Memória RAM' },
{ id: 'armazenamento', nome: 'Armazenamento' },
{ id: 'gpu', nome: 'Placa de Vídeo' },
{ id: 'gabinete', nome: 'Gabinete' },
{ id: 'fonte', nome: 'Fonte' }
];

window.extrairMenorPreco = function(precos) {
    if (!precos) return 0;
    let menor = Infinity;
    Object.values(precos).forEach(p => {
        const v = parseFloat(p.preco_avista);
        if (!isNaN(v) && v < menor) menor = v;
    });
        return menor === Infinity ? 0 : menor;
};

window.buscarTdpProfundo = function(obj) {
    if (!obj || typeof obj !== 'object') return 0;
    for (const [chave, valor] of Object.entries(obj)) {
        const kStr = chave.toLowerCase();
        if (kStr === 'tdp' || kStr === 'power' || kStr === 'consumo' || kStr === 'thermal_design_power') {
            if (typeof valor === 'number') return valor;
            if (typeof valor === 'string') {
                const match = valor.match(/\d+(\.\d+)?/);
                if (match) return parseFloat(match[0]);
            }
        }
        if (typeof valor === 'object') {
            const encontrado = window.buscarTdpProfundo(valor);
            if (encontrado > 0) return encontrado;
        }
    }
    return 0;
};

window.atualizarResumos = function(pcAtual) {
    let total = 0, count = 0, consumo = 60;

    Object.values(pcAtual).forEach(peca => {
        if (peca && peca.id) {
            count++;
            total += window.extrairMenorPreco(peca.precos);
            const valorTdpEncontrado = window.buscarTdpProfundo(peca.especificacoes) || window.buscarTdpProfundo(peca);
            consumo += valorTdpEncontrado;
        }
    });

    const valorFormatado = formataBRL.format(total);
    const tabelaTotal = document.getElementById('tabela-total-preco');
    if (tabelaTotal) tabelaTotal.innerText = valorFormatado;

    const sidebarTotal = document.getElementById('sidebar-total');
    if (sidebarTotal) sidebarTotal.innerText = valorFormatado;

    const sidebarCount = document.getElementById('sidebar-count');
    if (sidebarCount) sidebarCount.innerText = count;

    const estWattage = document.getElementById('est-wattage');
    if (estWattage) estWattage.innerHTML = `<i data-lucide="zap" class="w-4 h-4 text-yellow-300"></i> Consumo Est.: ${count > 0 ? consumo : '--'}W`;
};

window.renderizarOverview = function(pcAtual) {
    const tbody = document.getElementById('overview-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';

    categoriasSistema.forEach(cat => {
        const chaveInterna = cat.id === 'placa-mae' ? 'placaMae' : cat.id === 'memoria-ram' ? 'ram' : cat.id;
        const peca = pcAtual[chaveInterna];
        const tr = document.createElement('tr');

        if (peca && peca.id) {
            const preco = window.extrairMenorPreco(peca.precos);
            const imgUrl = peca.imagem || peca.imagem_url || peca.url_imagem;
            const imgHtml = imgUrl ? `<img src="${imgUrl}" class="w-10 h-10 flex-shrink-0 object-contain mix-blend-multiply">` : `<div class="w-10 h-10 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center border border-gray-200"><i data-lucide="image" class="w-5 h-5 text-gray-400"></i></div>`;

            tr.innerHTML = `
            <td class="font-bold text-gray-600 align-middle">${cat.nome}</td>
            <td class="font-medium text-gray-900 align-middle">
            <div class="flex items-center gap-3">
            ${imgHtml}
            <span class="leading-tight" title="${peca.nome}">${peca.nome}</span>
            </div>
            </td>
            <td class="font-bold text-gray-900 text-right align-middle whitespace-nowrap">${preco > 0 ? formataBRL.format(preco) : 'N/A'}</td>
            <td class="text-center align-middle">
            <button onclick="window.removerDaBuild('${cat.id}')" class="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded shadow-sm transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
            </td>`;
        } else {
            tr.innerHTML = `
            <td class="font-bold text-gray-600 align-middle">${cat.nome}</td>
            <td colspan="3" class="align-middle">
            <button onclick="window.irParaSelecao('${cat.id}')" class="btn-choose shadow-sm w-full md:w-auto justify-center py-2">
            <i data-lucide="plus" class="w-4 h-4"></i> Escolher ${cat.nome}
            </button>
            </td>`;
        }
        tbody.appendChild(tr);
    });

    window.atualizarResumos(pcAtual);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.desenharCardsNaTela = function(pecasLiberadas) {
    const tbody = document.getElementById('selection-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    pecasLiberadas.sort((a, b) => {
        const precoA = window.extrairMenorPreco(a.precos);
        const precoB = window.extrairMenorPreco(b.precos);
        return precoB - precoA;
    });

    pecasLiberadas.forEach(peca => {
        const preco = window.extrairMenorPreco(peca.precos);
        const imgUrl = peca.imagem || peca.imagem_url || peca.url_imagem;
        const imgHtml = imgUrl ? `<img src="${imgUrl}" class="w-16 h-16 flex-shrink-0 object-contain mx-auto mix-blend-multiply">` : `<div class="w-12 h-12 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center mx-auto border border-gray-200"><i data-lucide="image" class="w-6 h-6 text-gray-400"></i></div>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td class="text-center align-middle">${imgHtml}</td>
        <td class="font-medium text-gray-900 align-middle">
        <span class="leading-snug block" title="${peca.nome}">${peca.nome}</span>
        </td>
        <td class="text-right font-bold text-gray-900 whitespace-nowrap align-middle">${preco > 0 ? formataBRL.format(preco) : 'N/A'}</td>
        <td class="text-center align-middle">
        <button onclick="window.adicionarNaBuild('${peca.id}')" class="btn-add w-full shadow-sm py-2 px-4">Add</button>
        </td>`;
        tbody.appendChild(tr);
    });

    const qtdResultados = document.getElementById('qtd-resultados');
    if (qtdResultados) {
        qtdResultados.innerText = `${pecasLiberadas.length} Produtos Encontrados`;
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.renderizarDesempenhoFPS = function(resultadosFps, resolucaoDaTela = '1080p') {
    const container = document.getElementById('overview-fps-container');
    if (!container) return;

    if (!resultadosFps || resultadosFps.length === 0) {
        container.classList.add('hidden');
        container.innerHTML = '';
        return;
    }

    container.classList.remove('hidden');

    let html = `
    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
    <i data-lucide="gamepad-2" class="w-6 h-6 text-[#22C345]"></i>
    Desempenho (${resolucaoDaTela})
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
    `;

    resultadosFps.forEach(item => {
        const corTag = item.fps > 144 ? 'bg-[#22C345]' : (item.fps >= 60 ? 'bg-yellow-400 text-gray-900' : 'bg-red-500');
        const textColor = item.fps >= 60 && item.fps <= 144 ? 'text-gray-900' : 'text-white';

        html += `
        <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-[#22C345] transition-colors">
        <span class="text-gray-700 font-semibold text-sm truncate mr-2" title="${item.jogo}">${item.jogo}</span>
        <span class="font-bold px-3 py-1 rounded-full text-sm shadow-sm whitespace-nowrap ${corTag} ${textColor}">${item.fps} FPS</span>
        </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;

    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.irParaSelecao = (c) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('cat', c);
    window.location.search = urlParams.toString();
};

window.voltarParaOverview = () => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('cat');
    window.location.search = urlParams.toString();
};

window.adicionarNaBuild = (id) => {
    const urlParams = new URLSearchParams(window.location.search);
    const c = urlParams.get('cat');
    if(!c) return;
    urlParams.delete('cat');
    urlParams.set(c, id);
    window.location.search = urlParams.toString();
};

window.removerDaBuild = (c) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete(c);
    window.location.search = urlParams.toString();
};

document.addEventListener("DOMContentLoaded", function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const viewSelection = document.getElementById('view-selection');
    const viewOverview = document.getElementById('view-overview');
    const tituloPagina = document.getElementById('titulo-pagina');

    if (urlParams.get('cat')) {
        if (viewSelection) viewSelection.classList.remove('hidden');
    } else {
        if (viewOverview) viewOverview.classList.remove('hidden');

        const hasOutrosParametros = Array.from(urlParams.keys()).some(k => k !== 'cat');
        if (tituloPagina) {
            if (!hasOutrosParametros) {
                tituloPagina.innerText = "Sua Build Customizada";
            } else {
                tituloPagina.innerText = "Carregando suas peças...";
            }
        }
    }
});

document.addEventListener('buildCompartilhadaCarregada', () => {
    const tituloPagina = document.getElementById('titulo-pagina');
    if (tituloPagina) {
        tituloPagina.innerText = "Sua Build Customizada";
    }
});

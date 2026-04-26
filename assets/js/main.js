import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import FiltroCompatibilidade from './FiltroCompatibilidade.js';
import MotorHardware from './MotorHardware.js';
import CompartilhamentoBuild from './CompartilhamentoBuild.js';

const supabaseUrl = 'https://urubybwdrtimpcimvseu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydWJ5YndkcnRpbXBjaW12c2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMjY0ODQsImV4cCI6MjA5MTcwMjQ4NH0.-XqzkToeJc19sr1LfJn_-gUyB1B1GYnnojAiVR8JheE'; 
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const filtro = new FiltroCompatibilidade();
const motor = new MotorHardware(supabase); 
const compartilhamento = new CompartilhamentoBuild(filtro, supabase);

function extrairTermoInteligente(nomeCru, tipo) {
    if (!nomeCru) return "";
    const texto = nomeCru.toUpperCase();

    if (tipo === 'gpu') {
        const modelosGPU = [
            "RTX 4090", "RX 7900 XTX", "RTX 4080", "RX 7900 XT",
            "RTX 4070 TI", "RTX 3080", "RTX 4070", "RX 7800 XT",
            "RTX 3070", "RTX 4060 TI", "RX 6700 XT", "RTX 3060 TI",
            "RTX 4060", "RX 7600", "ARC A770", "RTX 3060",
            "RX 6600", "RTX 2060", "RTX 3050", "GTX 1660 SUPER",
            "GTX 1060"
        ];
        for (const mod of modelosGPU) {
            if (texto.includes(mod)) return mod;
        }
    } else if (tipo === 'cpu') {
        const modelosCPU = [
            "7800X3D", "14900K", "13900K", "14700K", "5800X3D",
            "13600K", "7600X", "13400F", "5600X", "12400F", "10400F", 
            "12100F", "9700K", "3600", "1600", "5600"
        ];
        for (const mod of modelosCPU) {
            if (texto.includes(mod)) return mod;
        }
    }
    
    return nomeCru; 
}

async function inicializarApp() {
    await compartilhamento.carregarBuildDaUrl();
    configurarPaginaPorCategoria(); 
}

function configurarPaginaPorCategoria() {
    const parametrosUrl = new URLSearchParams(window.location.search);
    const categoriaAtual = parametrosUrl.get('cat'); 

    if (!categoriaAtual) return;

    const titulosBonitos = {
        'cpu': 'Escolha seu Processador',
        'gpu': 'Escolha sua Placa de Vídeo',
        'placa-mae': 'Escolha sua Placa-Mãe',
        'memoria-ram': 'Escolha sua Memória RAM',
        'cooler': 'Escolha seu CPU Cooler',
        'armazenamento': 'Escolha seu Armazenamento',
        'gabinete': 'Escolha seu Gabinete',
        'fonte': 'Escolha sua Fonte'
    };
    
    const tituloH1 = document.getElementById('titulo-pagina');
    if (tituloH1) {
        tituloH1.innerText = titulosBonitos[categoriaAtual] || categoriaAtual;
    }

    aoDigitarPesquisa(categoriaAtual, '').then(pecasLiberadas => {
        if (typeof window.desenharCardsNaTela === 'function') {
            window.desenharCardsNaTela(pecasLiberadas); 
        }
    });

    const barraPesquisa = document.getElementById('input-pesquisa');
    if (barraPesquisa) {
        let debounceTimer;
        barraPesquisa.addEventListener('input', (evento) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const texto = evento.target.value;
                const resultados = await aoDigitarPesquisa(categoriaAtual, texto); 
                if (typeof window.desenharCardsNaTela === 'function') {
                    window.desenharCardsNaTela(resultados); 
                }
            }, 300);
        });
    }
}

export async function aoDigitarPesquisa(categoriaAtual, textoDigitado) {
    let query = supabase
        .from('componentes')
        .select('*')
        .eq('categoria', categoriaAtual)
        .not('precos', 'is', null)
        .neq('precos', '{}')
        .limit(1000); 
    
    if (textoDigitado && textoDigitado.trim() !== '') {
        query = query.ilike('nome', `%${textoDigitado}%`);
    }
    
    const { data, error } = await query;
    if (error || !data) return [];
    
    return filtro.filtrarCatalogo(categoriaAtual, data);
}

export function aoSelecionarPeca(categoria, objetoDaPeca) {
    filtro.setarPeca(categoria, objetoDaPeca);
}

export async function aoClicarAutoBuild(jogo, resolucao, fpsAlvo) {
    return await motor.autoBuildPorFps(jogo, resolucao, fpsAlvo);
}

export function aoClicarCompartilhar() {
    const link = compartilhamento.gerarLink();
    navigator.clipboard.writeText(link);
}

document.addEventListener('buildCompartilhadaCarregada', async (e) => {
    const pcAtual = e.detail.pcCarregado;
    
    const urlParams = new URLSearchParams(window.location.search);
    const resolucaoDaBuild = urlParams.get('res') || '1080p';
    
    if (typeof window.renderizarOverview === 'function') {
        window.renderizarOverview(pcAtual);
    }

    if (pcAtual.cpu && pcAtual.gpu) {
        const cpuCru = pcAtual.cpu.especificacoes?.modelo_base || pcAtual.cpu.nome;
        const gpuCru = pcAtual.gpu.especificacoes?.chipset || pcAtual.gpu.nome;
        
        const termoCpu = extrairTermoInteligente(cpuCru, 'cpu');
        const termoGpu = extrairTermoInteligente(gpuCru, 'gpu');
        
        const jogosTeste = [
            { busca: 'Cyberpunk', tela: 'Cyberpunk 2077' },
            { busca: 'Fortnite', tela: 'Fortnite' },
            { busca: 'Counter Strike', tela: 'Counter Strike 2' },
            { busca: 'Wukong', tela: 'Black Myth: Wukong' },
            { busca: 'Valorant', tela: 'Valorant' },
            { busca: 'Red Dead', tela: 'Red Dead Redemption 2' }
        ]; 
        
        const resultadosFps = [];
        let ocorreuErroBd = false;

        for (const jogo of jogosTeste) {
            const res = await motor.calcularFpsDaBuild(termoCpu, termoGpu, jogo.busca, resolucaoDaBuild);
            
            if (res && !res.erro && res.fps) {
                resultadosFps.push({ jogo: jogo.tela, fps: res.fps });
            } else {
                ocorreuErroBd = true;
                console.warn(`Aviso: FPS não encontrado no banco para ${termoCpu} + ${termoGpu} no jogo ${jogo.tela} em ${resolucaoDaBuild}.`);
            }
        }

        if (resultadosFps.length > 0) {
            if (typeof window.renderizarDesempenhoFPS === 'function') {
                window.renderizarDesempenhoFPS(resultadosFps, resolucaoDaBuild);
            }
        } else if (ocorreuErroBd) {
            const container = document.getElementById('overview-fps-container');
            if (container) {
                container.classList.remove('hidden');
                container.innerHTML = `
                    <div class="bg-red-50 p-4 rounded-lg shadow-sm border border-red-200">
                        <div class="text-sm text-red-500 text-center font-medium">
                            <i data-lucide="alert-circle" class="w-6 h-6 inline mx-auto mb-2 block"></i>
                            Aviso: FPS indisponível na base para [${termoCpu}] e [${termoGpu}] na resolução ${resolucaoDaBuild}.
                        </div>
                    </div>
                `;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }
    } else {
        if (typeof window.renderizarDesempenhoFPS === 'function') {
            window.renderizarDesempenhoFPS([]);
        }
    }
});

inicializarApp();
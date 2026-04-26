import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import MotorHardware from './MotorHardware.js';

const supabaseUrl = 'https://urubybwdrtimpcimvseu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydWJ5YndkcnRpbXBjaW12c2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMjY0ODQsImV4cCI6MjA5MTcwMjQ4NH0.-XqzkToeJc19sr1LfJn_-gUyB1B1GYnnojAiVR8JheE';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const motor = new MotorHardware(supabase);

const jogos = [
    { id: 'cs2', nome: 'Counter Strike 2', img: 'cs2_capa.webp' },
    { id: 'cyberpunk', nome: 'Cyberpunk 2077', img: 'cyberpunk_capa.webp' },
    { id: 'fortnite', nome: 'Fortnite', img: 'fortnite_capa.webp' },
    { id: 'reddead', nome: 'Red Dead Redemption 2', img: 'red_dead_capa.webp' },
    { id: 'valorant', nome: 'Valorant', img: 'valorant_capa.webp' },
    { id: 'wukong', nome: 'Black Myth: Wukong', img: 'wukong_capa.webp' }
];

let jogoSelecionado = null;

function atualizarIcones() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function selecionarJogo(el, nome) {
    document.querySelectorAll('.game-card').forEach(card => card.classList.remove('selected'));
    el.classList.add('selected');
    jogoSelecionado = nome;
}

async function gerarBuild() {
    const resolucao = document.getElementById('resolucao').value;
    const fpsAlvo = document.getElementById('fps-alvo').value;

    if (!jogoSelecionado || !fpsAlvo) {
        alert("Por favor, selecione um jogo e defina o FPS desejado.");
        return;
    }

    const btn = document.getElementById('btn-gerar');
    const originalContent = btn.innerHTML;
    
    btn.innerHTML = `<span>Consultando Engine...</span> <i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>`;
    btn.disabled = true;
    atualizarIcones();

    try {
        const build = await motor.autoBuildPorFps(jogoSelecionado, resolucao, parseInt(fpsAlvo));

        if (build.erro) {
            alert("Erro: " + build.erro);
            btn.innerHTML = originalContent;
            btn.disabled = false;
            atualizarIcones();
            return;
        }

        const params = new URLSearchParams();
        params.set('res', resolucao); 

        for (const [categoria, item] of Object.entries(build)) {
            const catUrl = categoria.replace('_', '-');
            if (item && item.id) params.set(catUrl, item.id);
        }

        window.location.href = `montagem.html?${params.toString()}`;

    } catch (error) {
        console.error(error);
        alert("Ocorreu um erro ao gerar a build.");
        btn.innerHTML = originalContent;
        btn.disabled = false;
        atualizarIcones();
    }
}

function inicializarPagina() {
    const container = document.getElementById('games-container');
    if (!container) return;

    jogos.forEach(jogo => {
        const div = document.createElement('div');
        div.className = 'game-card relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg transition-all';
        div.innerHTML = `
            <img src="../assets/img/${jogo.img}" alt="${jogo.nome}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent flex items-end p-4">
                <span class="text-white font-bold text-sm leading-tight">${jogo.nome}</span>
            </div>
        `;
        div.addEventListener('click', () => selecionarJogo(div, jogo.nome));
        container.appendChild(div);
    });

    const btnGerar = document.getElementById('btn-gerar');
    if (btnGerar) {
        btnGerar.addEventListener('click', gerarBuild);
    }

    atualizarIcones();
}

inicializarPagina();
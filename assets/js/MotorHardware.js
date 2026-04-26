import FiltroCompatibilidade from './FiltroCompatibilidade.js';

export default class MotorHardware {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    async calcularFpsDaBuild(termoCpu, termoGpu, jogoPesquisa, resolucao) {
        try {
            const [respostaCpu, respostaGpu] = await Promise.all([
                this.supabase
                    .from('cpu_fps_base')
                    .select('fps_maximo')
                    .ilike('modelo_base', `%${termoCpu}%`)
                    .ilike('jogo', `%${jogoPesquisa}%`)
                    .eq('resolucao', resolucao)
                    .limit(1),
                this.supabase
                    .from('gpu_fps_base')
                    .select('fps_maximo')
                    .ilike('chipset', `%${termoGpu}%`)
                    .ilike('jogo', `%${jogoPesquisa}%`)
                    .eq('resolucao', resolucao)
                    .limit(1)
            ]);

            const dadosCpu = respostaCpu.data && respostaCpu.data.length > 0 ? respostaCpu.data[0] : null;
            const dadosGpu = respostaGpu.data && respostaGpu.data.length > 0 ? respostaGpu.data[0] : null;

            if (respostaCpu.error || respostaGpu.error || !dadosCpu || !dadosGpu) {
                return { erro: "Hardware não mapeado na tabela de performance para este jogo." };
            }

            return { fps: Math.min(dadosCpu.fps_maximo, dadosGpu.fps_maximo) };

        } catch (erro) {
            return { erro: "Erro na consulta à base de dados." };
        }
    }

    async autoBuildPorFps(jogo, resolucao, fpsAlvo) {
            try {
                const { data, error } = await this.supabase.rpc('gerar_auto_build', {
                    p_jogo: jogo,
                    p_resolucao: resolucao,
                    p_fps_alvo: fpsAlvo
                });

                if (error) {
                    console.error("ERRO DO SUPABASE:", error);
                    return { erro: `Erro interno: ${error.message} \nDetalhes: ${error.details || 'Nenhum'}` };
                }

                if (data && data.erro) {
                    return { erro: data.erro };
                }

                return data;

            } catch (erro) {
                console.error("Erro no fetch:", erro);
                return { erro: "Erro inesperado ao processar a requisição de montagem." };
            }
        }
}
import FiltroCompatibilidade from './FiltroCompatibilidade.js';

export default class MotorHardware {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    async calcularFpsDaBuild(modeloCpu, chipsetGpu, jogo, resolucao) {
        try {
            const [respostaCpu, respostaGpu] = await Promise.all([
                this.supabase
                    .from('cpu_fps_base')
                    .select('fps_maximo')
                    .eq('modelo_base', modeloCpu)
                    .eq('jogo', jogo)
                    .eq('resolucao', resolucao)
                    .single(),
                this.supabase
                    .from('gpu_fps_base')
                    .select('fps_maximo')
                    .eq('chipset', chipsetGpu)
                    .eq('jogo', jogo)
                    .eq('resolucao', resolucao)
                    .single()
            ]);

            if (respostaCpu.error || respostaGpu.error || !respostaCpu.data || !respostaGpu.data) {
                return { erro: "Hardware não mapeado na tabela de performance." };
            }

            return { fps: Math.min(respostaCpu.data.fps_maximo, respostaGpu.data.fps_maximo) };

        } catch (erro) {
            return { erro: "Erro na consulta ao banco de dados." };
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
                return { erro: "Falha na comunicação com o servidor de Auto-Build." };
            }

            if (data && data.erro) {
                return { erro: data.erro };
            }

            return data;

        } catch (erro) {
            return { erro: "Erro inesperado ao processar a requisição de montagem." };
        }
    }
}
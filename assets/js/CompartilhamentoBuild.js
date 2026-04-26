export default class CompartilhamentoBuild {
    constructor(filtro, supabase) {
        this.filtro = filtro;
        this.supabase = supabase;
    }

    async carregarBuildDaUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        
        const categoriasParaCarregar = [
            { urlKey: 'cpu', internalKey: 'cpu' },
            { urlKey: 'gpu', internalKey: 'gpu' },
            { urlKey: 'placa-mae', internalKey: 'placaMae' },
            { urlKey: 'memoria-ram', internalKey: 'ram' },
            { urlKey: 'cooler', internalKey: 'cooler' },
            { urlKey: 'armazenamento', internalKey: 'armazenamento' },
            { urlKey: 'gabinete', internalKey: 'gabinete' },
            { urlKey: 'fonte', internalKey: 'fonte' }
        ];

        const promises = categoriasParaCarregar.map(async (cat) => {
            const id = urlParams.get(cat.urlKey);
            if (id && id !== 'null' && id !== 'undefined') {
                const { data, error } = await this.supabase
                    .from('componentes')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (data && !error) {
                    return { chave: cat.internalKey, peca: data };
                }
            }
            return null;
        });

        const resultados = await Promise.all(promises);
        
        resultados.forEach(res => {
            if (res) {
                this.filtro.pcAtual[res.chave] = res.peca;
            }
        });

        if (typeof this.filtro._reavaliarCompatibilidadeGlobal === 'function') {
            this.filtro._reavaliarCompatibilidadeGlobal();
        }

        document.dispatchEvent(new CustomEvent('buildCompartilhadaCarregada', {
            detail: { pcCarregado: this.filtro.pcAtual }
        }));
    }

    gerarLink() {
        const pc = this.filtro.pcAtual;
        const params = new URLSearchParams(window.location.search);
        
        const resolucaoAtual = params.get('res');
        params.forEach((value, key) => params.delete(key));
        if (resolucaoAtual) params.set('res', resolucaoAtual);
        
        if (pc.cpu) params.set('cpu', pc.cpu.id);
        if (pc.gpu) params.set('gpu', pc.gpu.id);
        if (pc.placaMae) params.set('placa-mae', pc.placaMae.id);
        if (pc.ram) params.set('memoria-ram', pc.ram.id);
        if (pc.cooler) params.set('cooler', pc.cooler.id);
        if (pc.armazenamento) params.set('armazenamento', pc.armazenamento.id);
        if (pc.gabinete) params.set('gabinete', pc.gabinete.id);
        if (pc.fonte) params.set('fonte', pc.fonte.id);

        return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    }
}
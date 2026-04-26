class CompartilhamentoBuild {
    constructor(gerenciadorCompatibilidade, supabase) {
        this.gerenciador = gerenciadorCompatibilidade;
        this.supabase = supabase;
    }

    gerarLink() {
        const urlParams = new URLSearchParams();
        const pc = this.gerenciador.pcAtual;

        for (const [categoria, peca] of Object.entries(pc)) {
            if (peca && peca.id) {
                urlParams.set(categoria, peca.id);
            }
        }

        const baseUrl = window.location.origin + window.location.pathname;
        const linkFinal = `${baseUrl}?${urlParams.toString()}`;
        
        return linkFinal;
    }

    async carregarBuildDaUrl() {
        const params = new URLSearchParams(window.location.search);
        const idsParaBuscar = [];

        for (const [categoria, id] of params.entries()) {
            idsParaBuscar.push(id);
        }

        if (idsParaBuscar.length === 0) return;

        const { data: pecas, error } = await this.supabase
            .from('componentes')
            .select('*')
            .in('id', idsParaBuscar);

        if (error) {
            return;
        }

        pecas.forEach(peca => {
            this.gerenciador.setarPeca(peca.categoria, peca);
        });
    }
}

export default CompartilhamentoBuild;
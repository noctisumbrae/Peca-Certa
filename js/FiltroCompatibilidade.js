class FiltroCompatibilidade {
    constructor() {
        this.pcAtual = {
            cpu: null,
            placaMae: null,
            ram: null,
            cooler: null,
            gpu: null,
            fonte: null,
            armazenamento: null,
            gabinete: null
        };
    }

    setarPeca(categoria, peca) {
        const chave = categoria === 'placa-mae' ? 'placaMae' : 
                      categoria === 'memoria-ram' ? 'ram' : categoria;
        
        if (this.pcAtual[chave] !== undefined) {
            this.pcAtual[chave] = peca;
            this._reavaliarCompatibilidadeGlobal();
        }
    }

    _removerPecaIncompativel(chave) {
        this.pcAtual[chave] = null;
        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('pecaRemovidaPorIncompatibilidade', { 
                detail: { categoriaAetada: chave } 
            }));
        }
    }

    _reavaliarCompatibilidadeGlobal() {
        if (this.pcAtual.placaMae && !this._validarPlacaMae(this.pcAtual.placaMae)) this._removerPecaIncompativel('placaMae');
        if (this.pcAtual.cpu && !this._validarCpu(this.pcAtual.cpu)) this._removerPecaIncompativel('cpu');
        if (this.pcAtual.ram && !this._validarRam(this.pcAtual.ram)) this._removerPecaIncompativel('ram');
        if (this.pcAtual.cooler && !this._validarCooler(this.pcAtual.cooler)) this._removerPecaIncompativel('cooler');
        if (this.pcAtual.gpu && !this._validarGpu(this.pcAtual.gpu)) this._removerPecaIncompativel('gpu');
        if (this.pcAtual.gabinete && !this._validarGabinete(this.pcAtual.gabinete)) this._removerPecaIncompativel('gabinete');
        if (this.pcAtual.fonte && !this._validarFonte(this.pcAtual.fonte)) this._removerPecaIncompativel('fonte');
    }

    filtrarCatalogo(categoria, listaDePecasDoBanco) {
        return listaDePecasDoBanco.filter(peca => {
            if (peca.categoria !== categoria) return false;

            switch (categoria) {
                case 'placa-mae': return this._validarPlacaMae(peca);
                case 'cpu':       return this._validarCpu(peca);
                case 'memoria-ram': return this._validarRam(peca);
                case 'cooler':    return this._validarCooler(peca);
                case 'fonte':     return this._validarFonte(peca);
                case 'gpu':       return this._validarGpu(peca);
                case 'gabinete':  return this._validarGabinete(peca);
                default:          return true;
            }
        });
    }

    _validarPlacaMae(placa) {
        const esp = placa.especificacoes;
        
        if (this.pcAtual.cpu) {
            const socketCpu = this.pcAtual.cpu.especificacoes?.socket;
            if (!socketCpu || esp?.socket !== socketCpu) return false;
        }
        
        if (this.pcAtual.ram) {
            const ramType = this.pcAtual.ram.especificacoes?.ram_type;
            if (!ramType || esp?.memory?.ram_type !== ramType) return false;
        }
        
        if (this.pcAtual.gabinete) {
            const formFactorsGabinete = this.pcAtual.gabinete.especificacoes?.supported_motherboard_form_factors || [];
            if (!esp?.form_factor || !formFactorsGabinete.includes(esp.form_factor)) return false;
        }
        
        return true;
    }

    _validarCpu(cpu) {
        const esp = cpu.especificacoes;
        
        if (this.pcAtual.placaMae) {
            const socketPlaca = this.pcAtual.placaMae.especificacoes?.socket;
            if (!socketPlaca || esp?.socket !== socketPlaca) return false;
        }
        
        if (this.pcAtual.cooler) {
            const socketsSuportados = this.pcAtual.cooler.especificacoes?.cpu_sockets || [];
            if (socketsSuportados.length === 0 || !esp?.socket || !socketsSuportados.includes(esp.socket)) return false;
        }
        
        return true;
    }

    _validarRam(ram) {
        if (this.pcAtual.placaMae) {
            const ramTypePlaca = this.pcAtual.placaMae.especificacoes?.memory?.ram_type;
            if (!ramTypePlaca || ram.especificacoes?.ram_type !== ramTypePlaca) return false;
        }
        return true;
    }

    _validarCooler(cooler) {
        const socketsSuportados = cooler.especificacoes?.cpu_sockets || [];
        
        if (this.pcAtual.cpu) {
            const socketCpu = this.pcAtual.cpu.especificacoes?.socket;
            if (!socketCpu || !socketsSuportados.includes(socketCpu)) return false;
        }

        if (this.pcAtual.placaMae) {
            const socketPlaca = this.pcAtual.placaMae.especificacoes?.socket;
            if (!socketPlaca || !socketsSuportados.includes(socketPlaca)) return false;
        }

        if (this.pcAtual.gabinete && cooler.especificacoes?.height) {
            const maxAlturaGabinete = this.pcAtual.gabinete.especificacoes?.max_cpu_cooler_height;
            if (maxAlturaGabinete && cooler.especificacoes.height > maxAlturaGabinete) return false;
        }
        
        return true;
    }

    _validarGpu(gpu) {
        if (this.pcAtual.gabinete && gpu.especificacoes?.length) {
            const maxComprimentoGabinete = this.pcAtual.gabinete.especificacoes?.max_video_card_length;
            if (maxComprimentoGabinete && gpu.especificacoes.length > maxComprimentoGabinete) return false;
        }
        return true;
    }

    _validarGabinete(gabinete) {
        const esp = gabinete.especificacoes;

        if (this.pcAtual.placaMae) {
            const formFactorPlaca = this.pcAtual.placaMae.especificacoes?.form_factor;
            const suportados = esp?.supported_motherboard_form_factors || [];
            if (!formFactorPlaca || !suportados.includes(formFactorPlaca)) return false;
        }

        if (this.pcAtual.gpu && this.pcAtual.gpu.especificacoes?.length) {
            const tamanhoGPU = this.pcAtual.gpu.especificacoes.length;
            if (esp?.max_video_card_length && tamanhoGPU > esp.max_video_card_length) return false;
        }

        if (this.pcAtual.cooler && this.pcAtual.cooler.especificacoes?.height) {
            const alturaCooler = this.pcAtual.cooler.especificacoes.height;
            if (esp?.max_cpu_cooler_height && alturaCooler > esp.max_cpu_cooler_height) return false;
        }

        return true;
    }

    _validarFonte(fonte) {
        let totalW = 60; 
        
        if (this.pcAtual.cpu) {
            totalW += (this.pcAtual.cpu.especificacoes?.tdp || 65);
        }
        if (this.pcAtual.gpu) {
            totalW += (this.pcAtual.gpu.especificacoes?.tdp || 350);
        }

        const margemSeguranca = totalW * 1.20; 
        const potenciaFonte = fonte.especificacoes?.wattage || 0;
        
        return potenciaFonte >= margemSeguranca;
    }
}

export default FiltroCompatibilidade;
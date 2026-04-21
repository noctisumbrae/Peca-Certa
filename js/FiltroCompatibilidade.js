class FiltroCompatibilidade {
    constructor() {
        // Estado global da máquina atual do usuário
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

    // Atualiza o estado da máquina quando o usuário escolhe ou remove uma peça
    setarPeca(categoria, peca) {
        // Normaliza o nome da categoria para a chave do objeto
        const chave = categoria === 'placa-mae' ? 'placaMae' : 
                      categoria === 'memoria-ram' ? 'ram' : categoria;
        
        if (this.pcAtual[chave] !== undefined) {
            this.pcAtual[chave] = peca;
        }
    }

    filtrarCatalogo(categoria, listaDePecasDoBanco) {
        return listaDePecasDoBanco.filter(peca => {
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
        
        // Regra 1: Bater socket com CPU já escolhida
        if (this.pcAtual.cpu && esp?.socket !== this.pcAtual.cpu.especificacoes?.socket) return false;
        
        // Regra 2: Bater tipo de memória (DDR4/DDR5) com RAM já escolhida
        if (this.pcAtual.ram && esp?.memory?.ram_type !== this.pcAtual.ram.especificacoes?.ram_type) return false;
        
        // Regra 3: Caber no gabinete já escolhido
        if (this.pcAtual.gabinete) {
            const formFactorsGabinete = this.pcAtual.gabinete.especificacoes?.supported_motherboard_form_factors || [];
            if (!formFactorsGabinete.includes(esp?.form_factor)) return false;
        }
        
        return true;
    }

    _validarCpu(cpu) {
        const esp = cpu.especificacoes;
        
        // Regra 1: Bater socket com Placa Mãe
        if (this.pcAtual.placaMae && esp?.socket !== this.pcAtual.placaMae.especificacoes?.socket) return false;
        
        // Regra 2: Ser suportado pelo Cooler já escolhido
        if (this.pcAtual.cooler) {
            const socketsSuportados = this.pcAtual.cooler.especificacoes?.cpu_sockets || [];
            if (socketsSuportados.length > 0 && !socketsSuportados.includes(esp?.socket)) return false;
        }
        
        return true;
    }

    _validarRam(ram) {
        // Regra 1: Bater tipo com Placa Mãe (DDR4/DDR5)
        if (this.pcAtual.placaMae && ram.especificacoes?.ram_type !== this.pcAtual.placaMae.especificacoes?.memory?.ram_type) {
            return false;
        }
        return true;
    }

    _validarCooler(cooler) {
        const socketsSuportados = cooler.especificacoes?.cpu_sockets || [];
        
        // Regra 1: Suportar a CPU escolhida
        if (this.pcAtual.cpu && !socketsSuportados.includes(this.pcAtual.cpu.especificacoes?.socket)) return false;
        
        // Regra 2: Suportar a Placa Mãe (se escolhida antes da CPU)
        if (this.pcAtual.placaMae && !socketsSuportados.includes(this.pcAtual.placaMae.especificacoes?.socket)) return false;

        // Regra 3: Caber no gabinete (Altura)
        if (this.pcAtual.gabinete && cooler.especificacoes?.height) {
            const maxAlturaGabinete = this.pcAtual.gabinete.especificacoes?.max_cpu_cooler_height;
            if (maxAlturaGabinete && cooler.especificacoes.height > maxAlturaGabinete) return false;
        }
        
        return true;
    }

    _validarGpu(gpu) {
        // Regra 1: Caber fisicamente no gabinete
        if (this.pcAtual.gabinete && gpu.especificacoes?.length) {
            const maxComprimentoGabinete = this.pcAtual.gabinete.especificacoes?.max_video_card_length;
            if (maxComprimentoGabinete && gpu.especificacoes.length > maxComprimentoGabinete) return false;
        }
        return true;
    }

    _validarGabinete(gabinete) {
        const esp = gabinete.especificacoes;

        // Regra 1: Comportar a Placa Mãe escolhida
        if (this.pcAtual.placaMae) {
            const formFactorPlaca = this.pcAtual.placaMae.especificacoes?.form_factor;
            const suportados = esp?.supported_motherboard_form_factors || [];
            if (formFactorPlaca && !suportados.includes(formFactorPlaca)) return false;
        }

        // Regra 2: Comportar o tamanho da GPU
        if (this.pcAtual.gpu && this.pcAtual.gpu.especificacoes?.length) {
            const tamanhoGPU = this.pcAtual.gpu.especificacoes.length;
            if (esp?.max_video_card_length && tamanhoGPU > esp.max_video_card_length) return false;
        }

        // Regra 3: Comportar a altura do Air Cooler
        if (this.pcAtual.cooler && this.pcAtual.cooler.especificacoes?.height) {
            const alturaCooler = this.pcAtual.cooler.especificacoes.height;
            if (esp?.max_cpu_cooler_height && alturaCooler > esp.max_cpu_cooler_height) return false;
        }

        return true;
    }

    _validarFonte(fonte) {
        // Regra 1: Cálculo Elétrico Seguro (TDP + Folga)
        let totalW = 60; // Consumo base placa-mãe/fans
        
        if (this.pcAtual.cpu) {
            totalW += (this.pcAtual.cpu.especificacoes?.specifications?.tdp || 65);
        }
        if (this.pcAtual.gpu) {
            totalW += (this.pcAtual.gpu.especificacoes?.tdp || 0);
        }

        const margemSeguranca = totalW * 1.20; // 20% de folga mínima
        const potenciaFonte = fonte.especificacoes?.wattage || 0;
        
        return potenciaFonte >= margemSeguranca;
    }
}

export default FiltroCompatibilidade;

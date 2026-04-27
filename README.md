<div align="center">

<img src="assets/img/logo_sem_fundo.webp" alt="Peça Certa Logo" width="300"/>

# Peça Certa

**Monte seu PC Gamer com compatibilidade garantida**

[![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-22C345?style=for-the-badge&logo=github)](https://buildcores.github.io/peca-certa)
[![License](https://img.shields.io/badge/license-MIT-22C345?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange?style=for-the-badge)](#)

</div>

---

## Sobre o Projeto

O **Peça Certa** é uma plataforma web brasileira para montagem e comparação de configurações de PC Gamer. O sistema permite selecionar componentes com **verificação de compatibilidade em tempo real**, visualizar **preços em R$ das principais lojas nacionais** e estimar o **desempenho em FPS** para os jogos mais populares.

Para quem não quer escolher peça por peça, o **Auto Build Gamer** faz isso automaticamente: basta informar o jogo, a resolução desejada e a meta de FPS que o sistema monta a build mais barata capaz de atingir esse desempenho.

### Funcionalidades

- ✅ **Montagem Manual** — seleção de componentes por categoria com filtro de compatibilidade em tempo real (socket CPU/MB, tipo de RAM, suporte do cooler, dimensões GPU/gabinete e potência da fonte)
- ✅ **Estimativa de Consumo** — cálculo do TDP total da build e validação da fonte de alimentação
- ✅ **Preço Total Atualizado** — soma automática do menor preço disponível entre as lojas indexadas
- ✅ **Estimativa de FPS** — desempenho estimado por par CPU+GPU em 6 jogos populares para 3 resoluções (1080p, 1440p, 4K)
- ✅ **Auto Build Gamer** — geração automática da build mais barata para atingir um FPS alvo em um jogo específico
- ✅ **Compartilhamento de Build** — URL pública que reproduz qualquer configuração montada

---

## Demonstração

| Montagem Manual | Auto Build Gamer |
|:---:|:---:|
| Escolha cada peça com compatibilidade garantida | Informe o jogo, resolução e FPS alvo |

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Front-end | HTML5, CSS3, JavaScript ES Modules (puro, sem framework) |
| Estilização | Tailwind CSS (CDN), Lucide Icons |
| Back-end / Banco de Dados | [Supabase](https://supabase.com) (PostgreSQL + REST API + RPC) |
| Hospedagem | GitHub Pages |

---

## Fontes de Dados

| Dado | Fonte | Método |
|------|-------|--------|
| Especificações técnicas dos componentes | [buildcores/buildcores-open-db](https://github.com/buildcores/buildcores-open-db) | Importação de JSON via script para o Supabase |
| Preços em lojas brasileiras | E-commerces nacionais de informática | Web scraping ético (respeito ao `robots.txt` e rate limiting) |
| Imagens dos componentes | DuckDuckGo Image Search | Script automatizado de busca e download por nome de produto |
| Benchmarks de FPS | Dados públicos de benchmark | Tabelas `cpu_fps_base` e `gpu_fps_base` no Supabase |

---

## Como Usar

O projeto é uma aplicação estática. Basta clonar o repositório e abrir o `index.html` em qualquer servidor local, ou acessar diretamente pelo [GitHub Pages](https://noctisumbrae.github.io/Peca-Certa/).

```bash
git clone https://github.com/seu-usuario/peca-certa.git
cd peca-certa
# Sirva com qualquer servidor estático, ex:
npx serve .
```

> **Nota:** o sistema realiza chamadas à API do Supabase. A chave `anon` já está embutida no código por ser de acesso público e somente leitura.

> O projeto utiliza **ES Modules** nativos. Não é suportado em browsers muito antigos.

---

## Roadmap

As melhorias abaixo estão planejadas para versões futuras do projeto:

### Base de Dados e Performance
- [ ] **Ampliar a base de benchmarks de FPS** — aumentar a cobertura de combinações CPU+GPU mapeadas, tornando as estimativas mais abrangentes e precisas
- [ ] **Incluir mais jogos** na base de dados de performance
- [ ] **Incluir mais peças** no catálogo de componentes

### Novas Funcionalidades
- [ ] **Qualidade gráfica ajustável** — permitir que o usuário selecione a qualidade de jogo (Baixo, Médio, Alto, Ultra) ao estimar ou definir o FPS alvo, além da resolução
- [ ] **Upload de benchmarks pela comunidade** — permitir que usuários enviem seus próprios resultados de benchmark (CPU, GPU, jogo, resolução, qualidade e FPS médio), enriquecendo e solidificando a base de dados de performance de forma colaborativa

---

Projeto desenvolvido para a disciplina de **Laboratório de Engenharia de Software** — FATEC Presidente Prudente, 5º termo (2026).

---

## Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

As especificações técnicas dos componentes são derivadas do projeto [buildcores/buildcores-open-db](https://github.com/buildcores/buildcores-open-db), licenciado abertamente pela comunidade BuildCores.

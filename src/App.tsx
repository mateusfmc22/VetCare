import Satisfacao from "./pages/Satisfacao.tsx";
import Incidentes from "./pages/Incidentes.tsx";
import Metas from "./pages/Metas.tsx";
import Financeiro from "./pages/Financeiro";
import Produtos from "./pages/Produtos";
import Orcamentos from "./pages/Orcamentos";
import Checklists from "./pages/Checklists";
import { useState } from "react";
import "./App.css";
import Chamados from "./pages/Chamados";
import Tarefas from "./pages/Tarefas";

type Pagina =
  | "inicio"
  | "chamados"
  | "tarefas"
  | "checklists"
  | "orcamentos"
  | "produtos"
  | "financeiro"
  | "satisfacao"
  | "incidentes"
  | "metas";

function App() {
  const [pagina, setPagina] = useState<Pagina>("inicio");

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icone">🐾</span>
          <div>
            <h2>VetCare</h2>
            <p>Gestão Veterinária</p>
          </div>
        </div>

        <p className="menu-titulo">MENU PRINCIPAL</p>

        <nav className="menu">
          <button
            className={pagina === "inicio" ? "ativo" : ""}
            onClick={() => setPagina("inicio")}
          >
            🏠︎ Painel Inicial
          </button>

          <button
            className={pagina === "chamados" ? "ativo" : ""}
            onClick={() => setPagina("chamados")}
          >
            ☎ Chamados
          </button>

          <button
            className={pagina === "tarefas" ? "ativo" : ""}
            onClick={() => setPagina("tarefas")}
          >
            ☑ Tarefas
          </button>

          <button
            className={pagina === "checklists" ? "ativo" : ""}
            onClick={() => setPagina("checklists")}
          >
            ▤ Checklists
          </button>
          <button
            className={pagina === "orcamentos" ? "ativo" : ""}
            onClick={() => setPagina("orcamentos")}
          >
            ◈ Orçamentos
          </button>

          <button
            className={pagina === "produtos" ? "ativo" : ""}
            onClick={() => setPagina("produtos")}
          >
            ▦ Produtos
          </button>

          <button
            className={pagina === "financeiro" ? "ativo" : ""}
            onClick={() => setPagina("financeiro")}
          >
            $ Financeiro
          </button>

          <button
            className={pagina === "incidentes" ? "ativo" : ""}
            onClick={() => setPagina("incidentes")}
          >
            ⚠ Incidentes
          </button>

          <button
            className={pagina === "metas" ? "ativo" : ""}
            onClick={() => setPagina("metas")}
          >
            ◎ Metas          
          </button>
          
          <button
            className={pagina === "satisfacao" ? "ativo" : ""}
            onClick={() => setPagina("satisfacao")}
          >
            ★ Pesquisa de Satisfação
          </button>
        </nav>

        <div className="sidebar-rodape">
          <p>VetCare © 2026</p>
          <span>Sistema de Gestão</span>
        </div>
      </aside>

      <main className="conteudo">
        <header className="topbar">
          <div>
            <span className="topbar-subtitulo">Plataforma de Gestão</span>
            <h1>
              {pagina === "inicio" && "Painel Inicial"}
              {pagina === "chamados" && "Central de Chamados"}
              {pagina === "tarefas" && "Controle de Tarefas"}
              {pagina === "checklists" && "Checklists de Qualidade"}
              {pagina === "orcamentos" && "Emissor de Orçamentos"}
              {pagina === "produtos" && "Gerenciamento de Produtos"}
              {pagina === "financeiro" && "Controle Financeiro"}        
              {pagina === "satisfacao" && "Pesquisa de Satisfação"}
              {pagina === "incidentes" && "Gestão de Incidentes"}
              {pagina === "metas" && "Acompanhamento de Metas"}
            </h1>
          </div>

          <div className="usuario">
            <div className="avatar">A</div>
            <span>Administrador</span>
          </div>
        </header>

        {pagina === "inicio" && (
          <section className="inicio-vetcare">

            {/* BANNER PRINCIPAL */}
            <div className="inicio-hero">
              <div className="inicio-hero-conteudo">
                <span className="inicio-etiqueta">
                  🐾 BEM-VINDO AO VETCARE
                </span>

                <h2>
                  Cuidar de quem você ama
                  é a nossa prioridade.
                </h2>

                <p>
                  O VetCare é uma plataforma dedicada à organização
                  e à qualidade dos serviços veterinários e de
                  estética animal. Unimos cuidado, tecnologia e
                  atenção para proporcionar uma experiência
                  mais segura e acolhedora.
                </p>

                <div className="inicio-hero-detalhes">
                  <span>✓ Cuidado responsável</span>
                  <span>✓ Organização</span>
                  <span>✓ Compromisso com a qualidade</span>
                </div>
              </div>

              <div className="inicio-hero-simbolo">
                <div className="inicio-circulo">
                  <span>🐾</span>
                </div>
              </div>
            </div>

            {/* APRESENTAÇÃO */}
            <div className="inicio-sobre">
              <div>
                <span className="inicio-subtitulo">
                  CONHEÇA NOSSA EMPRESA
                </span>

                <h2>Sobre o VetCare</h2>

                <p>
                  Acreditamos que cada animal merece um atendimento
                  cuidadoso, organizado e respeitoso.
                  Por isso, o VetCare foi desenvolvido para
                  auxiliar a gestão de clínicas veterinárias
                  e centros de estética animal.
                </p>

                <p>
                  Nossa proposta é oferecer ferramentas que
                  facilitem o acompanhamento dos atendimentos,
                  o controle de serviços e a comunicação
                  entre os profissionais responsáveis.
                </p>
              </div>

              <div className="inicio-sobre-destaque">
                <span>🐶</span>
                <h3>Mais cuidado, mais confiança.</h3>
                <p>
                  Cada atendimento importa. Cada pet merece
                  atenção especial.
                </p>
              </div>
            </div>

            {/* DIFERENCIAIS */}
            <div className="inicio-secao">
              <span className="inicio-subtitulo">
                NOSSOS DIFERENCIAIS
              </span>

              <h2>O que nos move todos os dias</h2>

              <div className="inicio-diferenciais">
                <article className="inicio-diferencial">
                  <div className="inicio-diferencial-icone">
                    ♥
                  </div>

                  <h3>Amor pelos animais</h3>

                  <p>
                    Valorizamos o bem-estar dos pets e o cuidado
                    em cada etapa do atendimento.
                  </p>
                </article>

                <article className="inicio-diferencial">
                  <div className="inicio-diferencial-icone">
                    ✦
                  </div>

                  <h3>Qualidade nos serviços</h3>

                  <p>
                    Incentivamos processos organizados,
                    avaliações e melhorias contínuas
                    na rotina da clínica.
                  </p>
                </article>

                <article className="inicio-diferencial">
                  <div className="inicio-diferencial-icone">
                    ✓
                  </div>

                  <h3>Gestão inteligente</h3>

                  <p>
                    Utilizamos tecnologia para simplificar
                    atividades e apoiar decisões mais
                    eficientes.
                  </p>
                </article>
              </div>
            </div>

            {/* MISSÃO, VISÃO E VALORES */}
            <div className="inicio-valores">
              <div className="inicio-valor">
                <span>01 / MISSÃO</span>
                <h3>Nossa missão</h3>
                <p>
                  Facilitar a gestão veterinária e contribuir
                  para serviços mais organizados, seguros
                  e acolhedores.
                </p>
              </div>

              <div className="inicio-valor">
                <span>02 / VISÃO</span>
                <h3>Nossa visão</h3>
                <p>
                  Ser uma solução de referência em organização
                  e melhoria de processos no segmento pet.
                </p>
              </div>

              <div className="inicio-valor">
                <span>03 / VALORES</span>
                <h3>Nossos valores</h3>
                <p>
                  Responsabilidade, respeito, transparência,
                  inovação e compromisso com o bem-estar animal.
                </p>
              </div>
            </div>

            {/* RODAPÉ */}
            <footer className="inicio-rodape">
              <span>🐾 VetCare</span>
              <p>
                Tecnologia e cuidado trabalhando juntos.
              </p>
              <small>© 2026 VetCare — Gestão Veterinária</small>
            </footer>

          </section>
          )}

        {pagina === "chamados" && (
          <Chamados abrirTarefas={() => setPagina("tarefas")} />
        )}

        {pagina === "tarefas" && (
          <Tarefas abrirChamados={() => setPagina("chamados")} />
        )}

        {pagina === "checklists" && <Checklists />}

        {pagina === "orcamentos" && <Orcamentos />}
        
        {pagina === "produtos" && <Produtos />}

        {pagina === "financeiro" && (
          <Financeiro key={pagina} />
        )}
        {pagina === "satisfacao" && <Satisfacao />}
        {pagina === "incidentes" && <Incidentes />}
        {pagina === "metas" && <Metas />}
      </main>
    </div>
  );
}

export default App;

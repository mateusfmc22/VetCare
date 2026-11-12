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
            ◫ Painel Inicial
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
            className={pagina === "satisfacao" ? "ativo" : ""}
            onClick={() => setPagina("satisfacao")}
          >
            ★ Pesquisa de Satisfação
          </button>

          <button
            className={pagina === "incidentes" ? "ativo" : ""}
            onClick={() => setPagina("incidentes")}
          >
            ⚠ Incidentes Operacionais
          </button>

          <button
            className={pagina === "metas" ? "ativo" : ""}
            onClick={() => setPagina("metas")}
          >
            ◎ Metas por Etapa
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
          <section>
            <div className="boas-vindas">
              <h2>Bem-vindo ao VetCare! 🐾</h2>
              <p>
                Gerencie sua clínica veterinária de forma
                simples, rápida e organizada.
              </p>
            </div>

            <div className="cards">
              <div className="card">
                <div className="card-icone">☎</div>
                <h3>Chamados</h3>
                <p>Gerencie solicitações e atendimentos.</p>
                <button onClick={() => setPagina("chamados")}>
                  Acessar módulo →
                </button>
              </div>

              <div className="card">
                <div className="card-icone">☑</div>
                <h3>Tarefas</h3>
                <p>Organize as demandas da equipe.</p>
                <button onClick={() => setPagina("tarefas")}>
                  Acessar módulo →
                </button>
              </div>

              <div className="card">
                <div className="card-icone">▤</div>
                <h3>Checklists</h3>
                <p>Acompanhe inspeções e verificações.</p>
                <button onClick={() => setPagina("checklists")}>
                  Acessar módulo →
                </button>
              </div>
            </div>
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

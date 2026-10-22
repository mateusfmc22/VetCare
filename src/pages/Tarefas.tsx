
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Prioridade } from "../types/Chamado";
import type { Tarefa, StatusTarefa } from "../types/Tarefa";
import "./Tarefas.css";

const CHAVE_TAREFAS = "vetcare-tarefas";

function carregarTarefas(): Tarefa[] {
  try {
    const dados = localStorage.getItem(CHAVE_TAREFAS);
    const lista = dados ? JSON.parse(dados) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

interface TarefasProps {
  abrirChamados: () => void;
}

function Tarefas({ abrirChamados }: TarefasProps) {
  const [tarefas, setTarefas] = useState<Tarefa[]>(carregarTarefas);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [prioridade, setPrioridade] = useState<Prioridade>("Baixa");

  const [pesquisa, setPesquisa] = useState("");
  const [filtro, setFiltro] =
    useState<"Todos" | StatusTarefa>("Todos");

  useEffect(() => {
    localStorage.setItem(CHAVE_TAREFAS, JSON.stringify(tarefas));
  }, [tarefas]);

  function cadastrarTarefa(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!titulo.trim() || !descricao.trim() || !responsavel.trim()) {
      alert("Preencha todos os campos!");
      return;
    }

    const novaTarefa: Tarefa = {
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      responsavel: responsavel.trim(),
      prioridade,
      status: "Pendente",
      dataCriacao: new Date().toLocaleString("pt-BR"),
    };

    setTarefas((anteriores) => [novaTarefa, ...anteriores]);

    setTitulo("");
    setDescricao("");
    setResponsavel("");
    setPrioridade("Baixa");
  }

  function atualizarTarefa(
    id: string,
    alteracoes: Partial<
      Pick<Tarefa, "status" | "prioridade" | "responsavel">
    >
  ) {
    setTarefas((anteriores) =>
      anteriores.map((tarefa) =>
        tarefa.id === id
          ? { ...tarefa, ...alteracoes }
          : tarefa
      )
    );
  }

  function excluirTarefa(id: string) {
    if (!window.confirm("Deseja excluir esta tarefa?")) {
      return;
    }

    setTarefas((anteriores) =>
      anteriores.filter((tarefa) => tarefa.id !== id)
    );
  }

  const pendentes = tarefas.filter(
    (tarefa) => tarefa.status === "Pendente"
  ).length;

  const andamento = tarefas.filter(
    (tarefa) => tarefa.status === "Em andamento"
  ).length;

  const concluidas = tarefas.filter(
    (tarefa) => tarefa.status === "Concluída"
  ).length;

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    const correspondeStatus =
      filtro === "Todos" || tarefa.status === filtro;

    const termo = pesquisa.toLocaleLowerCase("pt-BR");

    const correspondePesquisa = [
      tarefa.titulo,
      tarefa.descricao,
      tarefa.responsavel,
      tarefa.chamadoTitulo ?? "",
    ].some((texto) =>
      texto.toLocaleLowerCase("pt-BR").includes(termo)
    );

    return correspondeStatus && correspondePesquisa;
  });

  return (
    <section className="tarefas-modulo">
      <div className="tarefas-resumo">
        <div className="tarefas-resumo-card">
          <span>Total</span>
          <strong>{tarefas.length}</strong>
        </div>

        <div className="tarefas-resumo-card">
          <span>Pendentes</span>
          <strong>{pendentes}</strong>
        </div>

        <div className="tarefas-resumo-card">
          <span>Em andamento</span>
          <strong>{andamento}</strong>
        </div>

        <div className="tarefas-resumo-card">
          <span>Concluídas</span>
          <strong>{concluidas}</strong>
        </div>
      </div>

      <div className="tarefas-painel">
        <h2>Nova Tarefa</h2>
        <p>Organize as atividades da equipe veterinária.</p>

        <form className="tarefas-form" onSubmit={cadastrarTarefa}>
          <div className="tarefas-campo">
            <label htmlFor="tarefa-titulo">Título</label>
            <input
              id="tarefa-titulo"
              type="text"
              placeholder="Ex: Organizar estoque de medicamentos"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="tarefas-campo">
            <label htmlFor="tarefa-responsavel">
              Responsável
            </label>
            <input
              id="tarefa-responsavel"
              type="text"
              placeholder="Ex: Ana - Veterinária"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              required
            />
          </div>

          <div className="tarefas-campo">
            <label htmlFor="tarefa-prioridade">
              Prioridade
            </label>
            <select
              id="tarefa-prioridade"
              value={prioridade}
              onChange={(e) =>
                setPrioridade(e.target.value as Prioridade)
              }
            >
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>
          </div>

          <div className="tarefas-campo tarefas-campo-largo">
            <label htmlFor="tarefa-descricao">Descrição</label>
            <textarea
              id="tarefa-descricao"
              placeholder="Descreva o que precisa ser realizado..."
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>

          <button className="tarefas-botao-principal" type="submit">
            + Cadastrar Tarefa
          </button>
        </form>
      </div>

      <div className="tarefas-painel">
        <div className="tarefas-lista-topo">
          <div>
            <h2>Tarefas Cadastradas</h2>
            <p>Acompanhe e atualize as demandas da clínica.</p>
          </div>
        </div>

        <div className="tarefas-filtros">
          <input
            type="search"
            aria-label="Pesquisar tarefas"
            placeholder="Pesquisar tarefas..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />

          <select
            aria-label="Filtrar tarefas por status"
            value={filtro}
            onChange={(e) =>
              setFiltro(e.target.value as "Todos" | StatusTarefa)
            }
          >
            <option value="Todos">Todos os status</option>
            <option value="Pendente">Pendentes</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluída">Concluídas</option>
          </select>
        </div>

        {tarefasFiltradas.length === 0 ? (
          <div className="tarefas-vazio">
            <h3>Nenhuma tarefa encontrada</h3>
            <p>
              Cadastre uma nova tarefa ou altere os filtros.
            </p>
          </div>
        ) : (
          <div className="tarefas-lista">
            {tarefasFiltradas.map((tarefa) => (
              <article className="tarefa-item" key={tarefa.id}>
                <div className="tarefa-item-topo">
                  <div>
                    <h3>{tarefa.titulo}</h3>
                    <small>Criada em {tarefa.dataCriacao}</small>
                  </div>

                  <span
                    className={`tarefas-badge ${
                      tarefa.prioridade === "Alta"
                        ? "tarefas-alta"
                        : tarefa.prioridade === "Média"
                        ? "tarefas-media"
                        : "tarefas-baixa"
                    }`}
                  >
                    {tarefa.prioridade}
                  </span>
                </div>

                <p className="tarefa-descricao">
                  {tarefa.descricao}
                </p>

                {tarefa.chamadoId && (
                  <div className="tarefa-vinculo">
                    <span>
                      Chamado relacionado: {tarefa.chamadoTitulo}
                    </span>
                    <button
                      type="button"
                      onClick={abrirChamados}
                    >
                      Ver chamados →
                    </button>
                  </div>
                )}

                <div className="tarefa-controles">
                  <div className="tarefas-campo">
                    <label htmlFor={`resp-${tarefa.id}`}>
                      Responsável
                    </label>
                    <input
                      id={`resp-${tarefa.id}`}
                      value={tarefa.responsavel}
                      onChange={(e) =>
                        atualizarTarefa(tarefa.id, {
                          responsavel: e.target.value,
                        })
                      }
                      onBlur={(e) => {
                        if (!e.target.value.trim()) {
                          atualizarTarefa(tarefa.id, {
                            responsavel: "A definir",
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="tarefas-campo">
                    <label htmlFor={`prior-${tarefa.id}`}>
                      Prioridade
                    </label>
                    <select
                      id={`prior-${tarefa.id}`}
                      value={tarefa.prioridade}
                      onChange={(e) =>
                        atualizarTarefa(tarefa.id, {
                          prioridade: e.target.value as Prioridade,
                        })
                      }
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>

                  <div className="tarefas-campo">
                    <label htmlFor={`status-tarefa-${tarefa.id}`}>
                      Status
                    </label>
                    <select
                      id={`status-tarefa-${tarefa.id}`}
                      value={tarefa.status}
                      onChange={(e) =>
                        atualizarTarefa(tarefa.id, {
                          status: e.target.value as StatusTarefa,
                        })
                      }
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em andamento">
                        Em andamento
                      </option>
                      <option value="Concluída">Concluída</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  className="tarefa-excluir"
                  onClick={() => excluirTarefa(tarefa.id)}
                >
                  Excluir tarefa
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Tarefas;

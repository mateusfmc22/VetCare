
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Checklist } from "../types/Checklist";
import type { Tarefa } from "../types/Tarefa";
import "./Checklists.css";

const CHAVE_CHECKLISTS = "vetcare-checklists";
const CHAVE_TAREFAS = "vetcare-tarefas";

function carregarChecklists(): Checklist[] {
  try {
    const dados = localStorage.getItem(CHAVE_CHECKLISTS);
    const lista = dados ? JSON.parse(dados) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function carregarTarefas(): Tarefa[] {
  try {
    const dados = localStorage.getItem(CHAVE_TAREFAS);
    const lista = dados ? JSON.parse(dados) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function Checklists() {
  const [checklists, setChecklists] =
    useState<Checklist[]>(carregarChecklists);

  const [tarefas] = useState<Tarefa[]>(carregarTarefas);

  const [titulo, setTitulo] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [itensTexto, setItensTexto] = useState("");
  const [tarefaId, setTarefaId] = useState("");

  const [novosItens, setNovosItens] =
    useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem(
      CHAVE_CHECKLISTS,
      JSON.stringify(checklists)
    );
  }, [checklists]);

  function calcularProgresso(checklist: Checklist): number {
    const total = checklist.itens.length;

    if (total === 0) return 0;

    const concluidos = checklist.itens.filter(
      (item) => item.concluido
    ).length;

    return Math.round((concluidos / total) * 100);
  }

  function cadastrarChecklist(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const descricoes = itensTexto
      .split("\n")
      .map((texto) => texto.trim())
      .filter((texto) => texto.length > 0);

    if (!titulo.trim() || !responsavel.trim()) {
      alert("Preencha o título e o responsável!");
      return;
    }

    if (descricoes.length === 0) {
      alert("Adicione pelo menos um item de verificação!");
      return;
    }

    const tarefaSelecionada = tarefas.find(
      (tarefa) => tarefa.id === tarefaId
    );

    const novoChecklist: Checklist = {
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      responsavel: responsavel.trim(),
      dataCriacao: new Date().toLocaleString("pt-BR"),
      observacoes: "",
      itens: descricoes.map((descricao) => ({
        id: crypto.randomUUID(),
        descricao,
        concluido: false,
      })),
      tarefaId: tarefaSelecionada?.id,
      tarefaTitulo: tarefaSelecionada?.titulo,
    };

    setChecklists((anteriores) => [
      novoChecklist,
      ...anteriores,
    ]);

    setTitulo("");
    setResponsavel("");
    setItensTexto("");
    setTarefaId("");
  }

  function alternarItem(checklistId: string, itemId: string) {
    setChecklists((anteriores) =>
      anteriores.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              itens: checklist.itens.map((item) =>
                item.id === itemId
                  ? { ...item, concluido: !item.concluido }
                  : item
              ),
            }
          : checklist
      )
    );
  }

  function adicionarItem(checklistId: string) {
    const descricao = novosItens[checklistId]?.trim();

    if (!descricao) return;

    setChecklists((anteriores) =>
      anteriores.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              itens: [
                ...checklist.itens,
                {
                  id: crypto.randomUUID(),
                  descricao,
                  concluido: false,
                },
              ],
            }
          : checklist
      )
    );

    setNovosItens((anteriores) => ({
      ...anteriores,
      [checklistId]: "",
    }));
  }

  function removerItem(checklistId: string, itemId: string) {
    setChecklists((anteriores) =>
      anteriores.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              itens: checklist.itens.filter(
                (item) => item.id !== itemId
              ),
            }
          : checklist
      )
    );
  }

  function atualizarObservacoes(
    checklistId: string,
    observacoes: string
  ) {
    setChecklists((anteriores) =>
      anteriores.map((checklist) =>
        checklist.id === checklistId
          ? { ...checklist, observacoes }
          : checklist
      )
    );
  }

  function excluirChecklist(id: string) {
    if (!window.confirm("Deseja excluir esta inspeção?")) {
      return;
    }

    setChecklists((anteriores) =>
      anteriores.filter((checklist) => checklist.id !== id)
    );
  }

  const concluidos = checklists.filter(
    (checklist) => calcularProgresso(checklist) === 100
  ).length;

  const emAndamento = checklists.filter((checklist) => {
    const progresso = calcularProgresso(checklist);
    return progresso > 0 && progresso < 100;
  }).length;

  return (
    <section className="checklists-modulo">
      <div className="checklists-resumo">
        <div className="checklists-resumo-card">
          <span>Total de inspeções</span>
          <strong>{checklists.length}</strong>
        </div>

        <div className="checklists-resumo-card">
          <span>Em andamento</span>
          <strong>{emAndamento}</strong>
        </div>

        <div className="checklists-resumo-card">
          <span>Concluídas</span>
          <strong>{concluidos}</strong>
        </div>
      </div>

      <div className="checklists-painel">
        <h2>Nova Inspeção</h2>
        <p>Crie um roteiro de verificação para a clínica.</p>

        <form
          className="checklists-form"
          onSubmit={cadastrarChecklist}
        >
          <div className="checklists-campo">
            <label htmlFor="inspecao-titulo">
              Nome da inspeção
            </label>
            <input
              id="inspecao-titulo"
              placeholder="Ex: Inspeção da Sala Cirúrgica"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="checklists-campo">
            <label htmlFor="inspecao-responsavel">
              Responsável
            </label>
            <input
              id="inspecao-responsavel"
              placeholder="Ex: Dr. Carlos"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              required
            />
          </div>

          <div className="checklists-campo checklists-largo">
            <label htmlFor="inspecao-tarefa">
              Vincular a uma tarefa (opcional)
            </label>
            <select
              id="inspecao-tarefa"
              value={tarefaId}
              onChange={(e) => setTarefaId(e.target.value)}
            >
              <option value="">Sem tarefa vinculada</option>
              {tarefas.map((tarefa) => (
                <option key={tarefa.id} value={tarefa.id}>
                  {tarefa.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="checklists-campo checklists-largo">
            <label htmlFor="inspecao-itens">
              Itens de verificação (um por linha)
            </label>
            <textarea
              id="inspecao-itens"
              rows={6}
              placeholder={
                "Verificar os equipamentos\n" +
                "Conferir a limpeza\n" +
                "Verificar os materiais"
              }
              value={itensTexto}
              onChange={(e) => setItensTexto(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="checklists-botao-principal"
          >
            + Criar Inspeção
          </button>
        </form>
      </div>

      <div className="checklists-painel">
        <h2>Inspeções Cadastradas</h2>
        <p>Acompanhe o progresso de cada checklist.</p>

        {checklists.length === 0 ? (
          <div className="checklists-vazio">
            <h3>Nenhuma inspeção cadastrada</h3>
            <p>Crie sua primeira inspeção acima.</p>
          </div>
        ) : (
          <div className="checklists-lista">
            {checklists.map((checklist) => {
              const progresso = calcularProgresso(checklist);

              return (
                <article
                  className="checklist-card"
                  key={checklist.id}
                >
                  <div className="checklist-topo">
                    <div>
                      <h3>{checklist.titulo}</h3>
                      <small>
                        Responsável: {checklist.responsavel}
                      </small>
                      <small>
                        Criado em: {checklist.dataCriacao}
                      </small>
                    </div>

                    <span className="checklist-percentual">
                      {progresso}%
                    </span>
                  </div>

                  {checklist.tarefaTitulo && (
                    <div className="checklist-vinculo">
                      Tarefa relacionada: {checklist.tarefaTitulo}
                    </div>
                  )}

                  <div className="checklist-progresso">
                    <div className="checklist-progresso-info">
                      <span>Progresso da inspeção</span>
                      <strong>
                        {
                          checklist.itens.filter(
                            (item) => item.concluido
                          ).length
                        }{" "}
                        de {checklist.itens.length} itens
                      </strong>
                    </div>

                    <div
                      className="checklist-barra"
                      role="progressbar"
                      aria-label="Progresso da inspeção"
                      aria-valuenow={progresso}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="checklist-barra-preenchimento"
                        style={{ width: `${progresso}%` }}
                      />
                    </div>
                  </div>

                  <div className="checklist-itens">
                    <h4>Itens de verificação</h4>

                    {checklist.itens.map((item) => (
                      <div
                        className="checklist-item"
                        key={item.id}
                      >
                        <label>
                          <input
                            type="checkbox"
                            checked={item.concluido}
                            onChange={() =>
                              alternarItem(
                                checklist.id,
                                item.id
                              )
                            }
                          />
                          <span
                            className={
                              item.concluido
                                ? "checklist-item-concluido"
                                : ""
                            }
                          >
                            {item.descricao}
                          </span>
                        </label>

                        <button
                          type="button"
                          className="checklist-remover-item"
                          aria-label={`Remover ${item.descricao}`}
                          onClick={() =>
                            removerItem(checklist.id, item.id)
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="checklist-adicionar">
                    <input
                      aria-label="Novo item da inspeção"
                      placeholder="Adicionar outro item..."
                      value={novosItens[checklist.id] ?? ""}
                      onChange={(e) =>
                        setNovosItens((anteriores) => ({
                          ...anteriores,
                          [checklist.id]: e.target.value,
                        }))
                      }
                    />

                    <button
                      type="button"
                      onClick={() => adicionarItem(checklist.id)}
                    >
                      + Adicionar
                    </button>
                  </div>

                  <div className="checklists-campo checklist-observacoes">
                    <label htmlFor={`obs-${checklist.id}`}>
                      Observações da inspeção
                    </label>

                    <textarea
                      id={`obs-${checklist.id}`}
                      rows={3}
                      placeholder="Registre observações..."
                      value={checklist.observacoes}
                      onChange={(e) =>
                        atualizarObservacoes(
                          checklist.id,
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="checklist-rodape">
                    <span>
                      {progresso === 100
                        ? "Inspeção concluída"
                        : progresso > 0
                        ? "Inspeção em andamento"
                        : "Inspeção pendente"}
                    </span>

                    <button
                      type="button"
                      className="checklist-excluir"
                      onClick={() =>
                        excluirChecklist(checklist.id)
                      }
                    >
                      Excluir inspeção
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Checklists;

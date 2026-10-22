import type { Tarefa } from "../types/Tarefa";
import { useEffect, useState } from "react";
import type {
  Chamado,
  Prioridade,
  StatusChamado,
} from "../types/Chamado";

const CHAVE_STORAGE = "vetcare-chamados";

interface ChamadosProps {
  abrirTarefas: () => void;
}

function Chamados({ abrirTarefas }: ChamadosProps) {
  
  const [chamados, setChamados] = useState<Chamado[]>(() => {
  try {
      const dados = localStorage.getItem(CHAVE_STORAGE);
      return dados ? JSON.parse(dados) as Chamado[] : [];
  } catch {
      return [];
  }
  });
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [solicitante, setSolicitante] = useState("");
  const [prioridade, setPrioridade] =
    useState<Prioridade>("Baixa");

  const [novoAcompanhamento, setNovoAcompanhamento] =
    useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem(
      CHAVE_STORAGE,
      JSON.stringify(chamados)
    );
  }, [chamados]);

  function cadastrarChamado(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      !titulo.trim() ||
      !descricao.trim() ||
      !solicitante.trim()
    ) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const novoChamado: Chamado = {
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      solicitante: solicitante.trim(),
      prioridade,
      status: "Pendente",
      data: new Date().toLocaleString("pt-BR"),
      acompanhamentos: [],
    };

    setChamados((anteriores) => [
      novoChamado,
      ...anteriores,
    ]);

    setTitulo("");
    setDescricao("");
    setSolicitante("");
    setPrioridade("Baixa");
  }

  function alterarStatus(
    id: string,
    status: StatusChamado
  ) {
    setChamados((anteriores) =>
      anteriores.map((chamado) =>
        chamado.id === id
          ? { ...chamado, status }
          : chamado
      )
    );
  }

  function adicionarAcompanhamento(id: string) {
    const texto = novoAcompanhamento[id]?.trim();

    if (!texto) return;

    setChamados((anteriores) =>
      anteriores.map((chamado) =>
        chamado.id === id
          ? {
              ...chamado,
              acompanhamentos: [
                ...chamado.acompanhamentos,
                {
                  id: crypto.randomUUID(),
                  texto,
                  data: new Date().toLocaleString("pt-BR"),
                },
              ],
            }
          : chamado
      )
    );

    setNovoAcompanhamento((anterior) => ({
      ...anterior,
      [id]: "",
    }));
  }

  function excluirChamado(id: string) {
    if (!window.confirm("Deseja excluir este chamado?")) {
      return;
    }

    setChamados((anteriores) =>
      anteriores.filter((chamado) => chamado.id !== id)
    );
  }

  const pendentes = chamados.filter(
    (chamado) => chamado.status === "Pendente"
  ).length;

  const emAndamento = chamados.filter(
    (chamado) => chamado.status === "Em andamento"
  ).length;

  const concluidos = chamados.filter(
  (chamado) => chamado.status === "Concluído"
).length;

function gerarTarefa(chamado: Chamado) {
  try {
    const dados = localStorage.getItem("vetcare-tarefas");

    const lista = dados ? JSON.parse(dados) : [];

    const tarefasAtuais: Tarefa[] =
      Array.isArray(lista) ? lista : [];

    const novaTarefa: Tarefa = {
      id: crypto.randomUUID(),
      titulo: `Resolver: ${chamado.titulo}`,
      descricao: chamado.descricao,
      responsavel: "A definir",
      prioridade: chamado.prioridade,
      status: "Pendente",
      dataCriacao: new Date().toLocaleString("pt-BR"),
      chamadoId: chamado.id,
      chamadoTitulo: chamado.titulo,
    };

    localStorage.setItem(
      "vetcare-tarefas",
      JSON.stringify([novaTarefa, ...tarefasAtuais])
    );

    abrirTarefas();
  } catch {
    alert("Não foi possível criar a tarefa.");
  }
}


return (
  <section className="modulo-chamados">
      <div className="resumo-chamados">
        <div className="resumo-card">
          <span>Total de chamados</span>
          <strong>{chamados.length}</strong>
        </div>

        <div className="resumo-card">
          <span>Pendentes</span>
          <strong>{pendentes}</strong>
        </div>

        <div className="resumo-card">
          <span>Em andamento</span>
          <strong>{emAndamento}</strong>
        </div>

        <div className="resumo-card">
          <span>Concluídos</span>
          <strong>{concluidos}</strong>
        </div>
      </div>

      <div className="painel-formulario">
        <h2>Novo Chamado</h2>
        <p>Registre uma solicitação para a clínica.</p>

        <form onSubmit={cadastrarChamado}>
          <div className="campo">
            <label htmlFor="chamado-titulo">Título</label>
            <input
              id="chamado-titulo"
              type="text"
              placeholder="Ex: Equipamento com defeito"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="chamado-solicitante">
              Solicitante
            </label>
            <input
              id="chamado-solicitante"
              type="text"
              placeholder="Ex: Recepção"
              value={solicitante}
              onChange={(e) => setSolicitante(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="chamado-prioridade">
              Prioridade
            </label>
            <select
              id="chamado-prioridade"
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

          <div className="campo">
            <label htmlFor="chamado-descricao">
              Descrição
            </label>
            <textarea
              id="chamado-descricao"
              placeholder="Descreva a solicitação..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              rows={4}
            />
          </div>

          <button type="submit" className="botao-principal">
            + Cadastrar Chamado
          </button>
        </form>
      </div>

      <div className="lista-chamados">
        <h2>Chamados Cadastrados</h2>

        {chamados.length === 0 ? (
          <div className="estado-vazio">
            <p>Nenhum chamado cadastrado.</p>
            <span>
              Utilize o formulário acima para começar.
            </span>
          </div>
        ) : (
          <div className="chamados-grid">
            {chamados.map((chamado) => (
              <article
                key={chamado.id}
                className="chamado-card"
              >
                <div className="chamado-topo">
                  <h3>{chamado.titulo}</h3>
                  <span
                    className={`prioridade prioridade-${chamado.prioridade.toLowerCase()}`}
                  >
                    {chamado.prioridade}
                  </span>
                </div>

                <p className="chamado-descricao">
                  {chamado.descricao}
                </p>

                <div className="chamado-detalhes">
                  <span>
                    <strong>Solicitante:</strong>{" "}
                    {chamado.solicitante}
                  </span>
                  <span>
                    <strong>Criado em:</strong> {chamado.data}
                  </span>
                </div>

                <div className="campo">
                  <label htmlFor={`status-${chamado.id}`}>
                    Status
                  </label>
                  <select
                    id={`status-${chamado.id}`}
                    value={chamado.status}
                    onChange={(e) =>
                      alterarStatus(
                        chamado.id,
                        e.target.value as StatusChamado
                      )
                    }
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em andamento">
                      Em andamento
                    </option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>

                <button
                    type="button"
                    className="botao-gerar-tarefa"
                    onClick={() => gerarTarefa(chamado)}
                    >
                    + Criar tarefa vinculada
                </button>

                <div className="acompanhamentos">
                  <h4>Acompanhamento</h4>

                  {chamado.acompanhamentos.map((item) => (
                    <div
                      key={item.id}
                      className="acompanhamento-item"
                    >
                      <p>{item.texto}</p>
                      <small>{item.data}</small>
                    </div>
                  ))}

                  <textarea
                    aria-label="Nova observação"
                    placeholder="Adicionar observação..."
                    rows={2}
                    value={
                      novoAcompanhamento[chamado.id] ?? ""
                    }
                    onChange={(e) =>
                      setNovoAcompanhamento((anterior) => ({
                        ...anterior,
                        [chamado.id]: e.target.value,
                      }))
                    }
                  />

                  <button
                    type="button"
                    className="botao-secundario"
                    onClick={() =>
                      adicionarAcompanhamento(chamado.id)
                    }
                  >
                    Adicionar observação
                  </button>
                </div>

                <button
                  type="button"
                  className="botao-excluir"
                  onClick={() => excluirChamado(chamado.id)}
                >
                  Excluir chamado
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Chamados;

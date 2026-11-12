import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type TipoMeta =
  | "Tarefas"
  | "Atendimentos"
  | "Incidentes"
  | "Personalizada";

type Etapa = {
  id: string;
  descricao: string;
  concluida: boolean;
};

type Meta = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoMeta;
  objetivo: number;
  prazo: string;
  etapas: Etapa[];
  dataCriacao: string;
};

type Tarefa = {
  id: string;
  status: string;
};

type Incidente = {
  id: string;
  status: string;
};

type Orcamento = {
  id: number;
  status: string;
  sessoes?: number;
  realizadas?: number;
};

const CHAVE = "vetcare-metas";

function carregarLista<T>(chave: string): T[] {
  try {
    const dados = JSON.parse(
      localStorage.getItem(chave) || "[]"
    );

    return Array.isArray(dados) ? dados as T[] : [];
  } catch {
    return [];
  }
}

function Metas() {
  const [metas, setMetas] = useState<Meta[]>(
    () => carregarLista<Meta>(CHAVE)
  );

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<TipoMeta>("Tarefas");
  const [objetivo, setObjetivo] = useState(5);
  const [prazo, setPrazo] = useState("");

  const [etapaTexto, setEtapaTexto] = useState("");
  const [etapas, setEtapas] = useState<Etapa[]>([]);

  const [busca, setBusca] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(metas));
  }, [metas]);

  // Atualiza os indicadores quando a página recebe foco.
  useEffect(() => {
    function atualizar() {
      setAtualizacao((anterior) => anterior + 1);
    }

    window.addEventListener("focus", atualizar);
    window.addEventListener("storage", atualizar);

    return () => {
      window.removeEventListener("focus", atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);

  // Dados reais dos módulos anteriores.
  // A atualização força uma nova leitura do localStorage.
  void atualizacao;

  const tarefas = carregarLista<Tarefa>("vetcare-tarefas");
  const incidentes = carregarLista<Incidente>(
    "vetcare-incidentes"
  );
  const orcamentos = carregarLista<Orcamento>(
    "vetcare_orcamentos"
  );

  const tarefasConcluidas = tarefas.filter(
    (t) => t.status === "Concluída"
  ).length;

  const incidentesResolvidos = incidentes.filter(
    (i) => i.status === "Resolvido"
  ).length;

  const atendimentosRealizados = orcamentos
    .filter((o) => o.status === "Aprovado")
    .reduce(
      (total, o) => total + (o.realizadas ?? 0),
      0
    );

  function progresso(meta: Meta): number {
    if (meta.tipo === "Tarefas") {
      return tarefasConcluidas;
    }

    if (meta.tipo === "Incidentes") {
      return incidentesResolvidos;
    }

    if (meta.tipo === "Atendimentos") {
      return atendimentosRealizados;
    }

    return meta.etapas.filter(
      (etapa) => etapa.concluida
    ).length;
  }

  function percentual(meta: Meta): number {
    return Math.min(
      100,
      (progresso(meta) / meta.objetivo) * 100
    );
  }

  function adicionarEtapa() {
    if (!etapaTexto.trim()) return;

    setEtapas((anteriores) => [
      ...anteriores,
      {
        id: crypto.randomUUID(),
        descricao: etapaTexto.trim(),
        concluida: false,
      },
    ]);

    setEtapaTexto("");
  }

  function cadastrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!titulo.trim() || !descricao.trim() || !prazo) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (tipo === "Personalizada" && etapas.length === 0) {
      alert("Adicione pelo menos uma etapa à meta.");
      return;
    }

    if (
      tipo !== "Personalizada" &&
      (!Number.isInteger(objetivo) || objetivo <= 0)
    ) {
      alert("Informe um objetivo válido.");
      return;
    }

    const nova: Meta = {
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      tipo,
      objetivo:
        tipo === "Personalizada"
          ? etapas.length
          : objetivo,
      prazo,
      etapas:
        tipo === "Personalizada" ? [...etapas] : [],
      dataCriacao: new Date().toLocaleDateString("pt-BR"),
    };

    setMetas((anteriores) => [nova, ...anteriores]);

    setTitulo("");
    setDescricao("");
    setTipo("Tarefas");
    setObjetivo(5);
    setPrazo("");
    setEtapas([]);
    setEtapaTexto("");
  }

  function alternarEtapa(metaId: string, etapaId: string) {
    setMetas((anteriores) =>
      anteriores.map((meta) =>
        meta.id === metaId
          ? {
              ...meta,
              etapas: meta.etapas.map((etapa) =>
                etapa.id === etapaId
                  ? {
                      ...etapa,
                      concluida: !etapa.concluida,
                    }
                  : etapa
              ),
            }
          : meta
      )
    );
  }

  function excluir(id: string) {
    if (!window.confirm("Excluir esta meta?")) return;

    setMetas((anteriores) =>
      anteriores.filter((meta) => meta.id !== id)
    );
  }

  const filtradas = metas.filter((meta) =>
    `${meta.titulo} ${meta.descricao} ${meta.tipo}`
      .toLocaleLowerCase("pt-BR")
      .includes(busca.toLocaleLowerCase("pt-BR"))
  );

  const concluidas = metas.filter(
    (meta) => percentual(meta) >= 100
  ).length;

  const pendentes = metas.length - concluidas;

  return (
    <section className="metas-modulo">
      <div className="boas-vindas">
        <h2>Acompanhamento de Metas por Etapa</h2>
        <p>
          Monitore os objetivos da clínica e acompanhe
          resultados reais dos outros módulos.
        </p>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Total de metas</h3>
          <h2>{metas.length}</h2>
        </div>

        <div className="card">
          <h3>Concluídas</h3>
          <h2>{concluidas}</h2>
        </div>

        <div className="card">
          <h3>Pendentes</h3>
          <h2>{pendentes}</h2>
        </div>
      </div>

      <div className="card">
        <h3>Indicadores dos módulos integrados</h3>

        <div className="metas-indicadores">
          <p>
            Tarefas concluídas:{" "}
            <strong>{tarefasConcluidas}</strong>
          </p>

          <p>
            Sessões de atendimento realizadas:{" "}
            <strong>{atendimentosRealizados}</strong>
          </p>

          <p>
            Incidentes resolvidos:{" "}
            <strong>{incidentesResolvidos}</strong>
          </p>
        </div>

        <button
          type="button"
          className="metas-botao"
          onClick={() =>
            setAtualizacao((anterior) => anterior + 1)
          }
        >
          Atualizar indicadores
        </button>
      </div>

      <div className="card">
        <h3>Nova meta</h3>

        <form className="metas-form" onSubmit={cadastrar}>
          <label>
            Título da meta
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Realizar 20 banhos"
              required
            />
          </label>

          <label>
            Tipo de meta
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value as TipoMeta);
                setEtapas([]);
              }}
            >
              <option value="Tarefas">
                Conclusão de tarefas
              </option>
              <option value="Atendimentos">
                Sessões de banho e tosa
              </option>
              <option value="Incidentes">
                Resolução de incidentes
              </option>
              <option value="Personalizada">
                Meta por etapas
              </option>
            </select>
          </label>

          <label className="metas-largo">
            Descrição
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o objetivo..."
              required
            />
          </label>

          {tipo !== "Personalizada" && (
            <label>
              Quantidade desejada
              <input
                type="number"
                min="1"
                step="1"
                value={objetivo}
                onChange={(e) =>
                  setObjetivo(Number(e.target.value))
                }
                required
              />
            </label>
          )}

          <label>
            Prazo final
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              required
            />
          </label>

          {tipo === "Personalizada" && (
            <div className="metas-largo metas-etapas-form">
              <h3>Etapas da meta</h3>

              <div className="metas-etapa-linha">
                <input
                  value={etapaTexto}
                  onChange={(e) =>
                    setEtapaTexto(e.target.value)
                  }
                  placeholder="Descrição da etapa"
                />

                <button
                  type="button"
                  onClick={adicionarEtapa}
                >
                  + Adicionar etapa
                </button>
              </div>

              {etapas.map((etapa) => (
                <div key={etapa.id} className="metas-etapa">
                  <span>{etapa.descricao}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setEtapas((anteriores) =>
                        anteriores.filter(
                          (item) => item.id !== etapa.id
                        )
                      )
                    }
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="submit">
            + Cadastrar meta
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Metas cadastradas</h3>

        <input
          className="metas-busca"
          type="search"
          placeholder="Pesquisar metas..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        {filtradas.length === 0 ? (
          <p>Nenhuma meta encontrada.</p>
        ) : (
          <div className="metas-lista">
            {filtradas.map((meta) => {
              const realizado = progresso(meta);
              const porcentagem = percentual(meta);

              return (
                <article className="metas-item" key={meta.id}>
                  <h3>{meta.titulo}</h3>

                  <p>{meta.descricao}</p>
                  <p>Tipo: {meta.tipo}</p>
                  <p>
                    Prazo:{" "}
                    {meta.prazo.split("-").reverse().join("/")}
                  </p>

                  <div className="metas-progresso-topo">
                    <strong>
                      {Math.min(realizado, meta.objetivo)} de{" "}
                      {meta.objetivo}
                    </strong>
                    <strong>{porcentagem.toFixed(0)}%</strong>
                  </div>

                  <progress
                    value={porcentagem}
                    max={100}
                    className="metas-progresso"
                  />

                  <p>
                    {porcentagem >= 100
                      ? "✅ Meta concluída"
                      : "⏳ Meta em andamento"}
                  </p>

                  {meta.tipo === "Personalizada" &&
                    meta.etapas.map((etapa) => (
                      <label
                        className="metas-checkbox"
                        key={etapa.id}
                      >
                        <input
                          type="checkbox"
                          checked={etapa.concluida}
                          onChange={() =>
                            alternarEtapa(meta.id, etapa.id)
                          }
                        />
                        {etapa.descricao}
                      </label>
                    ))}

                  <button
                    type="button"
                    className="metas-botao"
                    onClick={() => excluir(meta.id)}
                  >
                    Excluir meta
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Metas;

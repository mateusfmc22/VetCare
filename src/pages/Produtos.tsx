
import { useEffect, useState } from "react";

type Produto = {
  id: number;
  nome: string;
  categoria: string;
  custo: number;
  preco: number;
};

function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("vetcare_produtos") || "[]"
      ) as Produto[];
    } catch {
      return [];
    }
  });

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("Higiene");
  const [custo, setCusto] = useState("");
  const [preco, setPreco] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "vetcare_produtos",
      JSON.stringify(produtos)
    );
  }, [produtos]);

  function cadastrar(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const custoNum = Number(custo);
    const precoNum = Number(preco);

    if (!nome.trim() || custoNum < 0 || precoNum <= 0 ||
        !Number.isFinite(custoNum) || !Number.isFinite(precoNum)) {
      alert("Preencha os dados corretamente.");
      return;
    }

    setProdutos((anteriores) => [
      ...anteriores,
      {
        id: Date.now(),
        nome: nome.trim(),
        categoria,
        custo: custoNum,
        preco: precoNum,
      },
    ]);

    setNome("");
    setCusto("");
    setPreco("");
  }

  const filtrados = produtos.filter((p) =>
    `${p.nome} ${p.categoria}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  const moeda = (valor: number) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <section>
      <div className="boas-vindas">
        <h2>Gerenciamento de Produtos e Catálogo</h2>
        <p>Cadastre produtos e acompanhe preços e margens.</p>
      </div>

      <div className="card">
        <h3>Novo produto</h3>
        <form onSubmit={cadastrar}>
          <input
            placeholder="Nome do produto"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option>Higiene</option>
            <option>Alimentação</option>
            <option>Acessórios</option>
            <option>Medicamentos</option>
          </select>

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Custo (R$)"
            value={custo}
            onChange={(e) => setCusto(e.target.value)}
            required
          />

          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Preço de venda (R$)"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
          />

          <button type="submit">Cadastrar produto</button>
        </form>
      </div>

      <div className="card">
        <h3>Catálogo de produtos</h3>
        <input
          placeholder="Pesquisar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        {filtrados.length === 0 ? (
          <p>Nenhum produto encontrado.</p>
        ) : (
          filtrados.map((produto) => {
            const lucro = produto.preco - produto.custo;
            const margem = (lucro / produto.preco) * 100;

            return (
              <div key={produto.id}>
                <h4>{produto.nome}</h4>
                <p>Categoria: {produto.categoria}</p>
                <p>Custo: {moeda(produto.custo)}</p>
                <p>Venda: {moeda(produto.preco)}</p>
                <p>Lucro bruto: {moeda(lucro)}</p>
                <p>Margem: {margem.toFixed(1)}%</p>
                <button
                  onClick={() =>
                    setProdutos((anteriores) =>
                      anteriores.filter(
                        (p) => p.id !== produto.id
                      )
                    )
                  }
                >
                  Excluir
                </button>
                <hr />
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default Produtos;

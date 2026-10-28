
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Produto = {
  id: number;
  nome: string;
  categoria: string;
  custo: number;
  preco: number;
};

type Movimentacao = {
  id: number;
  descricao: string;
  tipo: "Receita" | "Despesa";
  categoria: string;
  valor: number;
  data: string;
};

function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>(() => {
    try {
      const dados = JSON.parse(
        localStorage.getItem("vetcare_produtos") || "[]"
      );

      return Array.isArray(dados) ? dados as Produto[] : [];
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

  const moeda = (valor: number) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  function cadastrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const custoNum = Number(custo);
    const precoNum = Number(preco);

    if (
      !nome.trim() ||
      !Number.isFinite(custoNum) ||
      !Number.isFinite(precoNum) ||
      custoNum < 0 ||
      precoNum <= 0
    ) {
      alert("Preencha os dados corretamente!");
      return;
    }

    const novoProduto: Produto = {
      id: Date.now(),
      nome: nome.trim(),
      categoria,
      custo: custoNum,
      preco: precoNum,
    };

    setProdutos((anteriores) => [
      ...anteriores,
      novoProduto,
    ]);

    setNome("");
    setCategoria("Higiene");
    setCusto("");
    setPreco("");
  }

  function registrarVenda(produto: Produto) {
    const quantidadeTexto = window.prompt(
      `Quantas unidades de ${produto.nome} foram vendidas?`,
      "1"
    );

    if (quantidadeTexto === null) return;

    const quantidade = Number(quantidadeTexto);

    if (
      !Number.isInteger(quantidade) ||
      quantidade <= 0
    ) {
      alert("Informe uma quantidade válida.");
      return;
    }

    const total = produto.preco * quantidade;

    try {
      const dados = JSON.parse(
        localStorage.getItem("vetcare_financeiro") || "[]"
      );

      const movimentacoes: Movimentacao[] =
        Array.isArray(dados) ? dados as Movimentacao[] : [];

      const novaReceita: Movimentacao = {
        id: Date.now(),
        descricao: `Venda de ${quantidade}x ${produto.nome}`,
        tipo: "Receita",
        categoria: "Produtos",
        valor: total,
        data: new Date().toLocaleDateString("pt-BR"),
      };

      localStorage.setItem(
        "vetcare_financeiro",
        JSON.stringify([...movimentacoes, novaReceita])
      );

      window.dispatchEvent(
        new Event("vetcare:financeiro-atualizado")
      );

      alert(
        `Venda registrada com sucesso!\nTotal: ${moeda(total)}`
      );
    } catch (erro) {
      console.error("Erro ao registrar venda:", erro);
      alert("Não foi possível registrar a venda.");
    }
  }

  function excluirProduto(id: number) {
    if (!window.confirm("Deseja excluir este produto?")) {
      return;
    }

    setProdutos((anteriores) =>
      anteriores.filter((produto) => produto.id !== id)
    );
  }

  const produtosFiltrados = produtos.filter((produto) =>
    `${produto.nome} ${produto.categoria}`
      .toLocaleLowerCase("pt-BR")
      .includes(busca.toLocaleLowerCase("pt-BR"))
  );

  return (
    <section>
      <div className="boas-vindas">
        <h2>Gerenciamento de Produtos e Catálogo</h2>
        <p>
          Cadastre produtos, acompanhe preços, margens de lucro
          e registre vendas no financeiro.
        </p>
      </div>

      <div className="card">
        <h3>Novo produto</h3>

        <form onSubmit={cadastrar}>
          <input
            type="text"
            placeholder="Nome do produto"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="Higiene">Higiene</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Acessórios">Acessórios</option>
            <option value="Medicamentos">Medicamentos</option>
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

          <button type="submit">
            Cadastrar produto
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Catálogo de produtos</h3>

        <input
          type="search"
          placeholder="Pesquisar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        {produtosFiltrados.length === 0 ? (
          <p>Nenhum produto encontrado.</p>
        ) : (
          produtosFiltrados.map((produto) => {
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
                  type="button"
                  onClick={() => registrarVenda(produto)}
                >
                  Registrar venda
                </button>

                {" "}

                <button
                  type="button"
                  onClick={() => excluirProduto(produto.id)}
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

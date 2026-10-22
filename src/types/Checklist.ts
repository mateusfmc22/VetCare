
export interface ItemChecklist {
  id: string;
  descricao: string;
  concluido: boolean;
}

export interface Checklist {
  id: string;
  titulo: string;
  responsavel: string;
  dataCriacao: string;
  itens: ItemChecklist[];
  observacoes: string;
  tarefaId?: string;
  tarefaTitulo?: string;
}

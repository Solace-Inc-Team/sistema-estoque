export class ProdutosController {
  constructor(service) {
    this.service = service;
  }

  listar = (req, res) => {
    res.json(this.service.listar(req.valid.query));
  };

  categorias = (_req, res) => {
    res.json(this.service.categorias());
  };

  obter = (req, res) => {
    res.json(this.service.obter(req.valid.params.id));
  };

  criar = (req, res) => {
    res.status(201).json(this.service.criar(req.valid.body));
  };

  atualizar = (req, res) => {
    res.json(this.service.atualizar(req.valid.params.id, req.valid.body));
  };
}

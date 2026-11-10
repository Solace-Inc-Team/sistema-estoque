export class RelatoriosController {
  constructor(service) {
    this.service = service;
  }

  posicao = (_req, res) => {
    res.json(this.service.posicao());
  };

  abaixoMinimo = (_req, res) => {
    res.json(this.service.abaixoMinimo());
  };

  movimentacoes = (req, res) => {
    res.json(this.service.movimentacoes(req.valid.query));
  };
}

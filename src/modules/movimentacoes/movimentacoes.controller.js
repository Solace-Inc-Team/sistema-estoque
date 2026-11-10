export class MovimentacoesController {
  constructor(service) {
    this.service = service;
  }

  listar = (req, res) => {
    res.json(this.service.listar(req.valid.query));
  };

  registrar = (req, res) => {
    res.status(201).json(this.service.registrar(req.valid.body));
  };
}

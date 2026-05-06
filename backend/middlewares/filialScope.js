function requireFilialScope(req, res, next) {
  if (!req.user?.filial_id) {
    return res.status(403).json({ error: 'Usuário sem vínculo de filial' });
  }

  req.filialId = req.user.filial_id;
  return next();
}

module.exports = requireFilialScope;

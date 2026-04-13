export function artistMiddleware(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'artist') return res.status(403).json({ message: 'Artist access required' });
  next();
}

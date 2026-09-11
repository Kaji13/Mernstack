function validate(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    })

    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join('; ')
      const error = new Error(message || 'Validation failed')
      error.status = 400
      next(error)
      return
    }

    req.validated = parsed.data
    if (parsed.data.body) req.body = parsed.data.body
    if (parsed.data.params) req.params = { ...req.params, ...parsed.data.params }
    if (parsed.data.query) req.query = { ...req.query, ...parsed.data.query }
    next()
  }
}

module.exports = { validate }

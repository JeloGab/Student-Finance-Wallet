const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid input',
      message: result.error.errors[0].message
    })
  }
  req.body = result.data
  next()
}

module.exports = validate

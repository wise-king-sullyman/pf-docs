const { _PF_DOCS_OUTPUT_DIR } = global;

const getGeneratedRoutes = () => require(_PF_DOCS_OUTPUT_DIR);

const getFullScreenRoutes = () => {};

module.exports = {
  getGeneratedRoutes,
  getFullScreenRoutes
};

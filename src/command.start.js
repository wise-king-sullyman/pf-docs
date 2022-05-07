const { watchMD } = require('./markdown');

const commandStart = () => {
  watchMD();
};

module.exports = {
  commandStart
};

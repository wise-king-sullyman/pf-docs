module.exports = {
  getTitle: (title, prefix = 'PatternFly') => `${prefix}${title ? ` • ${title}` : ''}`
};

export const attachDocSearch = ({ algolia, inputSelector, timeout, env = process.env.NODE_ENV } = {}) => {
  if (window.docsearch) {
    return window.docsearch({
      inputSelector,
      autocompleteOptions: {
        hint: false,
        appendTo: `${inputSelector}-wrapper`
      },
      debug: env !== 'production',
      ...algolia
    });
  }
  setTimeout(() => attachDocSearch({ algolia, inputSelector, timeout }), timeout);
};

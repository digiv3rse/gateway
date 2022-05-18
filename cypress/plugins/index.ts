// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

const pluginConfig: Cypress.PluginConfig = (on) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  on('task', {
    log(message) {
      // eslint-disable-next-line no-console
      console.log(message);

      return null;
    },
    table(message) {
      // eslint-disable-next-line no-console
      console.table(message);

      return null;
    },
  });
};

export default pluginConfig;

'use strict';

// Read (and lead-form submit) actions the demo frontend needs without an API
// token. Granted to the public role at bootstrap so a fresh deploy renders
// content out of the box.
const PUBLIC_ACTIONS = [
  'api::article.article.find',
  'api::article.article.findOne',
  'api::author.author.find',
  'api::author.author.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
  'api::global.global.find',
  'api::page.page.find',
  'api::page.page.findOne',
  'api::product-feature.product-feature.find',
  'api::product-feature.product-feature.findOne',
  'api::lead-form-submission.lead-form-submission.create',
];

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    try {
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });
      if (!publicRole) return;

      for (const action of PUBLIC_ACTIONS) {
        const existing = await strapi
          .query('plugin::users-permissions.permission')
          .findOne({ where: { action, role: publicRole.id } });
        if (!existing) {
          await strapi
            .query('plugin::users-permissions.permission')
            .create({ data: { action, role: publicRole.id } });
        }
      }
    } catch (err) {
      strapi.log.warn(`Could not ensure public API permissions: ${err.message}`);
    }
  },
};

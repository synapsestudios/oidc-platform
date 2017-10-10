
exports.up = knex => {
  return knex.transaction(async trx => {
    const templates = await trx.select('*').from('SIP_templates');

    for (var i = 0; i < templates.length; i++) {
      const [ themeId ] = await trx('SIP_theme').returning('id').insert({name: `reset_password_theme_${i}`});

      await trx('SIP_client')
        .where('reset_password_template_id', templates[i].id)
        .update('theme_id', themeId);

      await trx('SIP_template').insert({theme_id: themeId, name: 'forgot-password', code: templates[i].template});
    }
  });
}

exports.down = () => { /* noop */ };

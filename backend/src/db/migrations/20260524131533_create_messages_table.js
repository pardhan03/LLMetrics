/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('messages', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));

    table
      .uuid('session_id')
      .notNullable()
      .references('id')
      .inTable('sessions')
      .onDelete('CASCADE');

    table.text('role').notNullable();

    table.text('content').notNullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['session_id']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('messages');
}
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('inference_logs', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));

    table
      .uuid('session_id')
      .references('id')
      .inTable('sessions');

    table
      .uuid('message_id')
      .references('id')
      .inTable('messages');

    table.text('provider').notNullable();

    table.text('model').notNullable();

    table.integer('prompt_tokens');

    table.integer('completion_tokens');

    table.integer('total_tokens');

    table.integer('latency_ms').notNullable();

    table.integer('ttft_ms');

    table.text('status').notNullable();

    table.text('error_code');

    table.text('error_message');

    table.text('input_preview');

    table.text('output_preview');

    table.boolean('is_streaming').defaultTo(false);

    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['session_id']);

    table.index(['created_at']);

    table.index(['provider', 'model']);

    table.index(['status']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('inference_logs');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('analytics_snapshots', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));

    table.timestamp('window_start').notNullable();

    table.timestamp('window_end').notNullable();

    table.text('provider');

    table.text('model');

    table.integer('total_requests').defaultTo(0);

    table.integer('error_count').defaultTo(0);

    table.decimal('avg_latency_ms');

    table.decimal('p95_latency_ms');

    table.bigInteger('total_tokens').defaultTo(0);

    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['window_start', 'window_end']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('analytics_snapshots');
}

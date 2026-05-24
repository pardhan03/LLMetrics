/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable('sessions', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

        table.text('title');

        table.text('provider').notNullable();

        table.text('model').notNullable();

        table
            .text('status')
            .notNullable()
            .defaultTo('active');

        table
            .boolean('is_streaming')
            .defaultTo(true);

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTableIfExists('sessions');
};

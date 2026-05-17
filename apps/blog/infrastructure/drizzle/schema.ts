// Mirrors the existing production database (created via the Prisma migrations).
// Table names, enum type names, and constraint/index/FK names are pinned to the
// values Prisma generated so a future `drizzle-kit pull` then `drizzle-kit
// generate` reports an empty diff (the schema-continuity safety gate for #255).
import { relations } from 'drizzle-orm';
import {
  foreignKey,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const typeEnum = pgEnum('Type', ['ARTICLE', 'PAGE']);

export const statusEnum = pgEnum('Status', [
  'IDEA',
  'DRAFT',
  'PREVIEW',
  'PUBLISHED',
  'ARCHIVED',
]);

export const categoryEnum = pgEnum('Category', [
  'ENGINEERING',
  'DESIGN',
  'DATA_SCIENCE',
  'LIFE_STYLE',
  'OTHER',
]);

export const authors = pgTable(
  'Author',
  {
    id: serial('id'),
    uuid: text('uuid').notNull(),
    name: text('name').notNull(),
    avatarUrl: text('avatarUrl'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
  },
  (table) => [
    primaryKey({ name: 'Author_pkey', columns: [table.id] }),
    uniqueIndex('Author_uuid_key').on(table.uuid),
  ]
);

export const posts = pgTable(
  'Post',
  {
    id: serial('id'),
    uuid: text('uuid').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    type: typeEnum('type').notNull().default('ARTICLE'),
    excerpt: text('excerpt').notNull(),
    imageUrl: text('imageUrl').notNull(),
    slug: text('slug').notNull(),
    status: statusEnum('status').notNull().default('DRAFT'),
    category: categoryEnum('category').notNull().default('OTHER'),
    tags: text('tags').array(),
    releaseDate: text('releaseDate').notNull(),
    revisionDate: text('revisionDate').notNull(),
    authorId: text('authorId').notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
  },
  (table) => [
    primaryKey({ name: 'Post_pkey', columns: [table.id] }),
    uniqueIndex('Post_uuid_key').on(table.uuid),
    foreignKey({
      name: 'Post_authorId_fkey',
      columns: [table.authorId],
      foreignColumns: [authors.uuid],
    })
      .onDelete('restrict')
      .onUpdate('cascade'),
  ]
);

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(authors, {
    fields: [posts.authorId],
    references: [authors.uuid],
  }),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  posts: many(posts),
}));

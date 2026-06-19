// Mirrors the existing production database (created via the Prisma migrations).
// Table names, enum type names, and constraint/index/FK names are pinned to the
// values Prisma generated so a future `drizzle-kit pull` then `drizzle-kit
// generate` reports an empty diff (the schema-continuity safety gate for #255).
import { relations } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  index,
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

// Auth tables owned by better-auth (see infrastructure/auth/auth.ts and
// specs/auth.md). Column shape follows better-auth's generated defaults; only
// the DB table names are PascalCased to match `Author` / `Post`.
export const users = pgTable('User', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const sessions = pgTable(
  'Session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [index('Session_userId_idx').on(table.userId)]
);

export const accounts = pgTable(
  'Account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('Account_userId_idx').on(table.userId)]
);

export const verifications = pgTable(
  'Verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('Verification_identifier_idx').on(table.identifier)]
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

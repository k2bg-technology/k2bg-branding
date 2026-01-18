# Post Specification

## Overview

The Post module manages blog articles throughout their entire lifecycle, from initial drafting to publication and eventual archival.

## Post Attributes

A post consists of the following information:

### Core Content

| Attribute | Description |
|-----------|-------------|
| Title | The headline of the article |
| Content | The main content of the article |
| Excerpt | A brief summary or abstract |
| Image | Featured image for the article |

### Classification

| Attribute | Description |
|-----------|-------------|
| Type | The kind of content (see [Content Types](#content-types)) |
| Category | The primary topic classification (see [Categories](#categories)) |
| Tags | Additional keywords for organization and search |

### Publication Information

| Attribute | Description |
|-----------|-------------|
| Slug | URL-friendly identifier for web access |
| Author | The person who wrote the article |
| Release Date | When the article becomes publicly available |
| Revision Date | When the article was last updated |

### System Information

| Attribute | Description |
|-----------|-------------|
| Identifier | Unique reference for the article |
| Status | Current state in the workflow (see [Workflow States](#workflow-states)) |
| Created | When the article was first created |
| Last Modified | When any change was last made |

## Content Types

Posts are classified into the following types:

| Type | Description |
|------|-------------|
| Article | Standard blog post with publication date, shown in article listings |
| Page | Static content page, not part of the blog feed (e.g., About, Contact) |

## Categories

Articles are organized into the following topic categories:

| Category | Description |
|----------|-------------|
| Engineering | Software development, programming, and technical topics |
| Design | UI/UX design, visual design, and creative topics |
| Data Science | Data analysis, machine learning, and statistics |
| Lifestyle | Personal experiences, productivity, and general interest |
| Other | Topics that don't fit into the above categories |

## Post Lifecycle

### Workflow States

Posts progress through the following states:

```
IDEA → DRAFT → PREVIEW → PUBLISHED → ARCHIVED
```

| State | Description | Public Visibility |
|-------|-------------|-------------------|
| Idea | Initial concept or notes; work has not yet begun | Not visible |
| Draft | Content is being written and edited | Not visible |
| Preview | Ready for internal review before publication | Not visible |
| Published | Live and accessible to the public | Visible |
| Archived | Removed from public view; preserved for historical purposes | Not visible |

### State Transitions

```
┌──────┐    ┌───────┐    ┌─────────┐    ┌───────────┐    ┌──────────┐
│ Idea │ →  │ Draft │ →  │ Preview │ →  │ Published │ →  │ Archived │
└──────┘    └───────┘    └─────────┘    └───────────┘    └──────────┘
                              │               ↑
                              └───────────────┘
                              (direct publish)
```

## Business Rules

### Publication Rules

1. **Release Date Requirement**
   - An article cannot be published if its release date is in the future
   - The release date must be today or earlier to publish

2. **One-Time Publication**
   - An article can only be published once
   - Re-publishing an already published article is not allowed

3. **Archived Articles Cannot Be Published**
   - Once an article is archived, it cannot be returned to published state

### Modification Rules

4. **Archived Articles Are Read-Only**
   - No changes can be made to an archived article
   - This includes content, metadata, and classification

5. **Date Consistency**
   - The revision date must always be on or after the release date
   - This ensures logical consistency in the article timeline

### Deletion

6. **Soft Deletion**
   - Articles are not permanently removed when deleted
   - Deleted articles can be restored if needed

## Allowed Operations

### Content Management

| Operation | Description | Restrictions |
|-----------|-------------|--------------|
| Update Content | Modify title, body, and excerpt | Not allowed for archived articles |
| Update Image | Change the featured image | Not allowed for archived articles |
| Update Slug | Change the URL identifier | Not allowed for archived articles |

### Classification Management

| Operation | Description | Restrictions |
|-----------|-------------|--------------|
| Update Category | Change the primary classification | Not allowed for archived articles |
| Update Tags | Modify the keyword tags | Not allowed for archived articles |

### Date Management

| Operation | Description | Restrictions |
|-----------|-------------|--------------|
| Update Dates | Change release and revision dates | Revision date must be ≥ release date; not allowed for archived articles |

### Lifecycle Management

| Operation | Description | Restrictions |
|-----------|-------------|--------------|
| Publish | Make the article publicly visible | Release date must not be in the future; cannot publish archived articles |
| Archive | Remove from public view permanently | Cannot archive an already archived article |
| Delete | Mark article as deleted | Can be performed on any article |
| Restore | Recover a deleted article | Can be performed on any deleted article |

## Data Persistence

The system provides the following data operations:

| Operation | Description |
|-----------|-------------|
| Retrieve by ID | Find a specific article using its unique identifier |
| Save | Store a new article or update an existing one |
| Remove | Permanently delete an article from the system |

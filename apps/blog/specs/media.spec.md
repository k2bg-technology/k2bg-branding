# Media Specification

## Overview

The Media module manages image and video assets used throughout the blog, including featured images, embedded content, and promotional materials.

## Media Attributes

A media item consists of the following information:

### Core Information

| Attribute | Description |
|-----------|-------------|
| Identifier | Unique reference for the media |
| Name | The display name of the media |

### Media Classification

| Attribute | Description |
|-----------|-------------|
| Type | The kind of media (see [Media Types](#media-types)) |

### Source Information

| Attribute | Description |
|-----------|-------------|
| Source File | Uploaded file for the media |
| Source URL | External URL for the media |
| Target URL | The destination link when media is clicked |

### Dimension Information

| Attribute | Description |
|-----------|-------------|
| Width | Width in pixels |
| Height | Height in pixels |

### Derived Properties (Image only)

| Attribute | Description |
|-----------|-------------|
| Extension | File extension derived from the source (e.g., .jpg, .png) |

## Media Types

Media items are classified into the following types:

| Type | Description |
|------|-------------|
| Image | Static image media (photos, graphics, banners) |
| Video | Video content |

## Business Rules

### Source Priority

1. **File Over URL**
   - When both an uploaded file and an external URL are provided, the uploaded file takes priority

## Data Persistence

The system provides the following data operations:

| Operation | Description |
|-----------|-------------|
| Retrieve All Image Sources | Get source URLs/files from all image media |
| Retrieve by ID | Find a specific media using its unique identifier |

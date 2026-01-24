# Affiliate Specification

## Overview

The Affiliate module manages affiliate links embedded in blog posts, including product promotions, banner advertisements, and text links. It supports multiple affiliate providers for the same product through a sub-provider relationship.

## Affiliate Attributes

An affiliate consists of the following information:

### Core Information

| Attribute | Description |
|-----------|-------------|
| Identifier | Unique reference for the affiliate |
| Name | The display name of the affiliate |
| Type | The kind of affiliate (see [Affiliate Types](#affiliate-types)) |
| Target URL | The destination link for the affiliate |
| Provider | The affiliate service provider |

### Image Information (Banner and Product only)

| Attribute | Description |
|-----------|-------------|
| Image Source URL | URL or file path of the affiliate image |
| Image Width | Width of the image in pixels |
| Image Height | Height of the image in pixels |

### Product-Specific Information

| Attribute | Description |
|-----------|-------------|
| Sub Providers | Related sub-provider identifiers for multi-provider listings |
| Image Provider | The source providing the product image |
| Provider Color | Display color associated with the provider |

### SubProvider-Specific Information

| Attribute | Description |
|-----------|-------------|
| Provider Color | Display color associated with the sub-provider |

## Affiliate Types

Affiliates are classified into the following types:

| Type | Description |
|------|-------------|
| Banner | Image-based advertisement with clickable banner |
| Product | Product promotion with image and multiple provider links |
| Text | Simple text-based affiliate link |
| SubProvider | Auxiliary provider linked to a Product affiliate |

## Providers

Affiliate providers are dynamically managed and include:

| Provider | Description |
|----------|-------------|
| Amazon | Amazon Associates affiliate program |
| Rakuten | Rakuten affiliate service |
| Yahoo! Shopping | Yahoo! Shopping affiliate program |
| a8net | A8.net affiliate network |

Additional providers can be added as needed.

## SubProvider Relationship

- A Product affiliate can have multiple SubProviders
- SubProviders enable promoting the same product across multiple affiliate services
- Each SubProvider maintains its own target URL and provider color

## Business Rules

### Validation Rules

1. **Core Fields Required**
   - All affiliates must have id, name, type, targetUrl, and provider

2. **Banner Requirements**
   - Must include imageSourceUrl, imageWidth, and imageHeight

3. **Product Requirements**
   - Must include providerColor, subProviders, imageProvider, imageSourceUrl, imageWidth, and imageHeight
   - subProviders must be an array of strings

4. **SubProvider Requirements**
   - Must include providerColor

### Image Source Priority

5. **File Over URL**
   - When both file upload and URL are provided, the uploaded file takes priority

## Data Persistence

The system provides the following data operations:

| Operation | Description |
|-----------|-------------|
| Retrieve All Image Sources | Get image source URLs from all Banner and Product affiliates |

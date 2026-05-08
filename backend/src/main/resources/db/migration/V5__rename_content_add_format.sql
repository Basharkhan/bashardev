ALTER TABLE blog_posts RENAME COLUMN content_markdown TO content;
ALTER TABLE blog_posts ADD COLUMN content_format VARCHAR(20) NOT NULL DEFAULT 'HTML';

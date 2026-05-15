CREATE TABLE blog_post_related_posts (
    blog_post_id BIGINT NOT NULL,
    related_post_id BIGINT NOT NULL,
    PRIMARY KEY (blog_post_id, related_post_id),
    CONSTRAINT fk_blog_post_related_posts_post
        FOREIGN KEY (blog_post_id)
        REFERENCES blog_posts (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_blog_post_related_posts_related
        FOREIGN KEY (related_post_id)
        REFERENCES blog_posts (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_blog_post_related_posts_not_self
        CHECK (blog_post_id <> related_post_id)
);

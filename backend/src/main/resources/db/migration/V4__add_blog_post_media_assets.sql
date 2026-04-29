CREATE TABLE blog_post_media_assets (
    blog_post_id BIGINT NOT NULL,
    media_asset_id BIGINT NOT NULL,
    PRIMARY KEY (blog_post_id, media_asset_id),
    CONSTRAINT fk_blog_post_media_assets_post
        FOREIGN KEY (blog_post_id)
        REFERENCES blog_posts (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_blog_post_media_assets_media
        FOREIGN KEY (media_asset_id)
        REFERENCES media_assets (id)
        ON DELETE RESTRICT
);

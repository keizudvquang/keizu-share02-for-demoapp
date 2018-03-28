CREATE TABLE IF NOT EXISTS tokens (
    userId           BIGSERIAL,
    externalUserId   TEXT,
    token            TEXT NOT NULL UNIQUE,
    created          TIMESTAMP DEFAULT now()
  );

CREATE TABLE IF NOT EXISTS wallet (
    userId       BIGINT,
    offerId      BIGINT
  );

CREATE TABLE IF NOT EXISTS wishlist (
    userId       BIGINT,
    productId    BIGINT
  );

CREATE TABLE IF NOT EXISTS picture (
    id           BIGSERIAL,
    public_id    TEXT,
    userId       BIGINT,
    url          TEXT,
    publishDate  timestamp default current_timestamp
  );

CREATE TABLE IF NOT EXISTS Faq__kav (
    id                      BIGSERIAL PRIMARY KEY,
    KnowledgeArticleId      TEXT,
    OwnerId                 TEXT,
    IsDeleted               TEXT,
    PublishStatus           TEXT,
    VersionNumber           double precision,
    IsLatestVersion         TEXT,
    IsVisibleInPkb          TEXT,
    IsVisibleInCsp          TEXT,
    IsVisibleInPrm          TEXT,
    CreatedDate             DATE,
    CreatedById             TEXT,
    LastModifiedDate        DATE,
    LastModifiedById        TEXT,
    SystemModstamp          DATE,
    Language                TEXT,
    Title                   TEXT,
    UrlName                 TEXT,
    ArchivedDate            DATE,
    ArchivedById            TEXT,
    Summary                 TEXT,
    ArticleNumber           TEXT,
    FirstPublishedDate      DATE,
    LastPublishedDate       DATE,
    ArticleArchivedById     TEXT,
    ArticleArchivedDate     DATE,
    ArticleCaseAttachCount  double precision,
    ArticleCreatedById      TEXT,
    ArticleCreatedDate      DATE,
    ArticleMasterLanguage   TEXT,
    ArticleTotalViewCount   double precision,
    SourceId                TEXT,
    ArticleType             TEXT,
    ArticleBody__c          TEXT
  );




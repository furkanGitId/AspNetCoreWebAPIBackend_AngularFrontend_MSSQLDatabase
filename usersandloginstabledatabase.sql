CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(120) NOT NULL
);

CREATE TABLE logins (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL,
    password NVARCHAR(255) NOT NULL
);

insert into logins(username,password) values('admin','admin')


CREATE PROCEDURE dbo.sp_get_all_users
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, name, email
    FROM dbo.users;
END

CREATE PROCEDURE dbo.sp_get_user_by_id
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, name, email
    FROM dbo.users
    WHERE id = @UserId;
END

CREATE PROCEDURE dbo.sp_create_user
    @Name NVARCHAR(200),
    @Email NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.users (name, email)
    VALUES (@Name, @Email);
END

CREATE PROCEDURE dbo.sp_update_user
    @UserId INT,
    @Name NVARCHAR(200),
    @Email NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.users
    SET name = @Name,
        email = @Email
    WHERE id = @UserId;

    -- Return the updated row (or nothing if id not found)
    SELECT id, name, email
    FROM dbo.users
    WHERE id = @UserId;
END

CREATE PROCEDURE dbo.sp_delete_user
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.users
    WHERE id = @UserId;

    -- Return a small status so caller knows if delete happened
    SELECT @@ROWCOUNT AS RowsAffected;
END


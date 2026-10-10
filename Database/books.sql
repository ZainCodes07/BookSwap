CREATE TABLE Books (
    BookID INT IDENTITY(1,1) PRIMARY KEY,
    SellerID INT NOT NULL,
    CategoryID INT NOT NULL,
    CourseID INT NULL,
    Title NVARCHAR(200) NOT NULL,
    Author NVARCHAR(150) NOT NULL,
    Description NVARCHAR(500) NULL,
    Price DECIMAL(10,2) NULL,
    BookCondition NVARCHAR(50) NOT NULL,
    ListingType NVARCHAR(20) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Available',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Books_Users
        FOREIGN KEY (SellerID) REFERENCES Users(UserID),

    CONSTRAINT FK_Books_Categories
        FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),

    CONSTRAINT FK_Books_Courses
        FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);
GO
CREATE TABLE Messages (
    MessageID INT IDENTITY(1,1) PRIMARY KEY,
    SenderID INT NOT NULL,
    ReceiverID INT NOT NULL,
    BookID INT NULL,
    MessageText NVARCHAR(1000) NOT NULL,
    SentAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    IsRead BIT NOT NULL DEFAULT 0,

    CONSTRAINT FK_Messages_Sender
        FOREIGN KEY (SenderID) REFERENCES Users(UserID),

    CONSTRAINT FK_Messages_Receiver
        FOREIGN KEY (ReceiverID) REFERENCES Users(UserID),

    CONSTRAINT FK_Messages_Book
        FOREIGN KEY (BookID) REFERENCES Books(BookID)
);
GO
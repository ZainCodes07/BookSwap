CREATE TABLE Transactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL UNIQUE,
    TransactionType NVARCHAR(20) NOT NULL,
    Amount DECIMAL(10,2) NULL,
    TransactionStatus NVARCHAR(30) NOT NULL DEFAULT 'Pending',
    TransactionDate DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Transactions_Order
        FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
);
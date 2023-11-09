db.runCommand(
    {
        createIndexes: "magneto.boards.access",
        indexes: [
            {
                key: {
                    "userId": 1,
                },
                name: "magneto_board_tags_access"
            }
        ]
    });
#!/bin/bash

# SQL files to be run
SQL_FILES=("SkibidiBook.sql" "category.sql" "book.sql" "book_cat.sql" "Userdump.sql")

# MySQL connection details
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=localhost
MYSQL_PASSWORD=root
MYSQL_DATABASE=skibidi_book

# Loop through the SQL files and run them
for SQL_FILE in "${SQL_FILES[@]}"
do
  echo "Running SQL file: $SQL_FILE"
  mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < "$SQL_FILE"
done
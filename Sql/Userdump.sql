-- Insert three users with the username 'ananta'
INSERT INTO user (email, password, is_admin, registration_date) VALUES
    ( 'ananta46@hotmail.co.th', '123', 0, NOW()),
    ( 'ananta4647@gmail.com', '123', 0, NOW()),
    ( 'admin@gmail.com', '123', 1, NOW());
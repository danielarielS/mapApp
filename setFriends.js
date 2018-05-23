INSERT INTO friendships (requester_id, receiver_id, status) VALUES
                        (2 , 1, 1) ,
                        (3 , 1, 1)  ,
                        (4 , 1, 1)   ,
                        (5 , 1, 1)    ,
                        (6 , 1, 1)    ,
                        (7 , 1, 3)    ,
                        (8 , 1, 3)    ,
                        (9 , 1, 3)    ,
                        (10 , 1, 3)  ;



UPDATE friendships
    SET  status = 1 WHERE
    requester_id = 1;

SELECT * FROM friendships; 

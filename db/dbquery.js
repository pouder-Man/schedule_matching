var db_init = require('./db_init');
var async = require("async");

module.exports.chkId = function (ID, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var query = "SELECT * FROM USERS WHERE userid=" + ID;
                console.log(query);
                statement.executeQuery(query,
                    function (err, resultset) {
                        if (err) {
                            console.log(err);
                            db_init.release(connObj, function () {
                            });
                            callback(false);
                        } else {
                            resultset.toObjArray(function (err, results) {
                                db_init.release(connObj, function (err) {
                                    callback(results);
                                });
                            });
                        }
                    });
            }
        });
    });
};

module.exports.signup = function (input, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var query = "INSERT INTO USERS VALUES(" + input.userinfo.userid + ",'"
                    + input.userinfo.userName + "','" + input.userinfo.password + "'," + input.userinfo.degree + ",'" + input.userinfo.major + "')";
                statement.executeUpdate(query,
                    function (err, count) {
                        if (err) {
                            callback(err);
                        } else {
                            //교수이름으로 count하며 for loop
                            // 6번
                            var count1 = 0;
                            var key = "";
                            var prof_name = Object.keys(input.classinfo.prof_time)
                            async.whilst(
                                function () {
                                    // 교수리스트의 key가 존재하면
                                    return (count1 < prof_name.length)
                                },
                                function (c1) {
                                    key = prof_name[count1]
                                    var count2 = 0;
                                    async.whilst(
                                        function () {
                                            return count2 < input.classinfo.prof_time[key].length
                                        },
                                        function (c2) {
                                            query = "INSERT INTO CLASS VALUES ('"
                                                + input.classinfo.classid[count1] + "','"
                                                + input.classinfo.classname[count1] + "','"
                                                + key + "','"
                                                + input.classinfo.prof_time[key][count2].day + "','"
                                                + input.classinfo.prof_time[key][count2].starttime + "','"
                                                + input.classinfo.prof_time[key][count2].endtime + "','"
                                                + input.classinfo.prof_time[key][count2].loc + "')";
                                            statement.executeUpdate(query,
                                                function (err, c3) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        query = "INSERT INTO USER_CLASS VALUES ("
                                                            + input.userinfo.userid + ",'"
                                                            + input.classinfo.classid[count1] + "','"
                                                            + input.classinfo.prof_time[key][count2].day + "')";
                                                        statement.executeUpdate(query,
                                                            function (err, c4) {
                                                                if (err) {
                                                                    console.log(err)
                                                                } else {
                                                                    console.log("insert complete");
                                                                    count2++;
                                                                    setTimeout(c2, 0);
                                                                }
                                                            }
                                                        );
                                                    }
                                                }
                                            );
                                        },
                                        function (err) {
                                            count1++;
                                            c1();
                                        }
                                    );
                                },
                                function (err) {
                                    db_init.release(connObj, function (err) {
                                        console.log("success!!");
                                        callback(count)
                                    });
                                }
                            );

                        }
                    });
            }
        });
    })
    ;
};
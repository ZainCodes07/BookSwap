const { sql, connectDB } = require("../config/db");

const Course = {

    // Get all courses
    getAllCourses: async () => {
        await connectDB();

        const result = await sql.query(`
            SELECT *
            FROM Courses
        `);

        return result.recordset;
    },


    // Get course by ID
    getCourseById: async (courseId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("CourseID", sql.Int, courseId);

        const result = await request.query(`
            SELECT *
            FROM Courses
            WHERE CourseID = @CourseID
        `);

        return result.recordset[0];
    },


    // Create new course
    createCourse: async (course) => {
        await connectDB();

        const request = new sql.Request();

        request.input(
            "CourseName",
            sql.NVarChar(150),
            course.CourseName
        );

        request.input(
            "CourseCode",
            sql.NVarChar(20),
            course.CourseCode
        );

        request.input(
            "Description",
            sql.NVarChar(255),
            course.Description || null
        );

        const result = await request.query(`
            INSERT INTO Courses
            (
                CourseName,
                CourseCode,
                Description
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @CourseName,
                @CourseCode,
                @Description
            )
        `);

        return result.recordset[0];
    },


    // Update course
    updateCourse: async (courseId, course) => {
        await connectDB();

        const request = new sql.Request();

        request.input("CourseID", sql.Int, courseId);

        request.input(
            "CourseName",
            sql.NVarChar(150),
            course.CourseName
        );

        request.input(
            "CourseCode",
            sql.NVarChar(20),
            course.CourseCode
        );

        request.input(
            "Description",
            sql.NVarChar(255),
            course.Description || null
        );

        const result = await request.query(`
            UPDATE Courses
            SET
                CourseName = @CourseName,
                CourseCode = @CourseCode,
                Description = @Description
            OUTPUT INSERTED.*
            WHERE CourseID = @CourseID
        `);

        return result.recordset[0];
    },


    // Delete course
    deleteCourse: async (courseId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("CourseID", sql.Int, courseId);

        const result = await request.query(`
            DELETE FROM Courses
            WHERE CourseID = @CourseID
        `);

        return result.rowsAffected[0];
    }

};

module.exports = Course;
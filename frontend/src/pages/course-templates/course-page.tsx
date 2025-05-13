import React, { useState, useEffect } from 'react';

interface Courses {
    _id: string;
    name: string;
    description: string;
    versions: {
        versionName: string;
        versionDetails: string;
    }
    instructors: string[];
}

function CoursePage(Course : Courses) {
    return (
        <div>
            <h1>{Course.name}</h1>
            <p>{Course.description}</p>

        </div>
    );
}
export default CoursePage;
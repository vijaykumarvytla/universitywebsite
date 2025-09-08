/*
  Comprehensive JavaScript file for the student and admin portal.  This
  module encapsulates all functionality required for authenticating
  users, managing course registration, attendance, assignments, library
  reservations, profile settings, and administrative tasks such as
  course and notice management.  All data is persisted in
  localStorage so the application works offline and without a
  back‑end.  Inspiration for these features comes from academic
  portals like VTOP that offer course registration, exam schedules,
  attendance tracking, library services and communication tools【36125880033441†L205-L247】【36125880033441†L218-L222】.
*/

(function() {
    /* ------------------------------------------------------------------
       Default data definitions
       These arrays define the initial content for courses, notices,
       assignments and books.  When the application first runs it
       populates localStorage with these values if they are not
       already present.  Administrators can modify courses and
       notices through the admin interface; book availability will
       change as students reserve books.
    */
    const defaultCourseCatalog = [
        { code: 'CS101', name: 'Introduction to Programming', credits: 3, schedule: { day: 'Monday', time: '09:00-10:00' } },
        { code: 'MA101', name: 'Calculus I', credits: 4, schedule: { day: 'Tuesday', time: '10:00-11:00' } },
        { code: 'PH101', name: 'Physics I', credits: 3, schedule: { day: 'Wednesday', time: '11:00-12:00' } },
        { code: 'EC101', name: 'Electronics Fundamentals', credits: 3, schedule: { day: 'Thursday', time: '14:00-15:00' } },
        { code: 'HS101', name: 'Humanities and Social Sciences', credits: 2, schedule: { day: 'Friday', time: '15:00-16:00' } },
        { code: 'CY101', name: 'Chemistry', credits: 3, schedule: { day: 'Monday', time: '14:00-15:00' } }
    ];

    const defaultNotices = [
        { title: 'Course Registration Opens', content: 'The registration window for the upcoming semester opens on September 10, 2025. Visit the Course Registration page to select your courses before the deadline.', date: 'September 1, 2025' },
        { title: 'Midterm Exam Schedule Released', content: 'The examination office has published the midterm exam timetable. You can view your personalized schedule under the Results page. Make sure to verify the dates and prepare accordingly.', date: 'August 30, 2025' },
        { title: 'Library Orientation', content: 'A library orientation session will be held on September 15, 2025 to introduce new students to library services, including book reservations and online resources. All students are encouraged to attend.', date: 'August 25, 2025' },
        { title: 'Hackathon Announcement', content: 'The Computer Science department is hosting a 24‑hour hackathon on campus from September 20–21, 2025. Teams can register via the departmental website. Prizes will be awarded to the top projects.', date: 'August 20, 2025' }
    ];

    // Define one assignment per course as an example.  Each assignment
    // has an id, a title and a due date.  Additional assignments can be
    // added here or via the admin panel if extended.
    const defaultAssignments = {
        // Default assignments for each course.  Assignments are now
        // persisted in localStorage so administrators can add or remove
        // them.  Each entry contains an id, a descriptive title and a
        // due date.  Additional fields such as description can be
        // appended if desired.
        'CS101': [ { id: 1, title: 'Programming Assignment 1', due: '2025-10-01' } ],
        'MA101': [ { id: 1, title: 'Calculus Homework 1', due: '2025-09-25' } ],
        'PH101': [ { id: 1, title: 'Physics Lab Report', due: '2025-10-05' } ],
        'EC101': [ { id: 1, title: 'Electronics Project Proposal', due: '2025-10-10' } ],
        'HS101': [ { id: 1, title: 'Essay on Social Sciences', due: '2025-09-30' } ],
        'CY101': [ { id: 1, title: 'Chemistry Lab Assignment', due: '2025-09-28' } ]
    };

    // Default events schedule.  Each event has a unique id, a
    // descriptive title, a date in YYYY‑MM‑DD format, an optional
    // time, a short description and a type.  These events populate
    // the calendar and notifications.  Administrators can create
    // additional events via the management pages.
    const defaultEvents = [
        { id: 1, title: 'Freshers Orientation', date: '2025-09-15', time: '10:00', description: 'Orientation program for new students.', type: 'Event' },
        { id: 2, title: 'Midterm Exams Begin', date: '2025-10-10', time: '09:00', description: 'Midterm examinations commence for all courses.', type: 'Exam' },
        { id: 3, title: 'Hackathon', date: '2025-09-20', time: '09:00', description: '24‑hour hackathon hosted by the CS department.', type: 'Event' }
    ];

    // Default to‑do tasks inspired by Indiana University’s onboarding
    // checklist.  Tasks are grouped into categories with an
    // identifier, a title and an initial status such as Completed,
    // Started, Needs review or Not started.  The task list page
    // provides an overview of what students must complete, similar
    // to the IU task list layout which groups tasks and displays
    // status badges【579199063798451†L156-L163】.
    const defaultTasks = {
        'Accounts': [
            { id: 1, title: 'Request a username', status: 'Completed' },
            { id: 2, title: 'Set up two‑factor authentication', status: 'Completed' },
            { id: 3, title: 'Verify your email address', status: 'Completed' }
        ],
        'Prepare for the semester': [
            { id: 4, title: 'Send transcripts', status: 'Completed' },
            { id: 5, title: 'Schedule meeting with advisor', status: 'Started' },
            { id: 6, title: 'Sign housing agreement', status: 'Needs review' },
            { id: 7, title: 'Review student resources', status: 'Not started' }
        ],
        'Health and wellness': [
            { id: 8, title: 'Review health and wellness policy', status: 'Needs review' }
        ]
    };

    // Initial catalogue of books.  Each book has a unique id, title,
    // author and availability flag.  Students can reserve available
    // books through the library page.
    const defaultBooks = [
        { id: 1, title: 'Introduction to Algorithms', author: 'Cormen et al.', available: true },
        { id: 2, title: 'Clean Code', author: 'Robert C. Martin', available: true },
        { id: 3, title: 'Calculus', author: 'James Stewart', available: true },
        { id: 4, title: 'University Physics', author: 'Young & Freedman', available: true },
        { id: 5, title: 'Digital Electronics', author: 'R.P. Jain', available: true },
        { id: 6, title: 'Philosophy: A Very Short Introduction', author: 'Edward Craig', available: true },
        { id: 7, title: 'Organic Chemistry', author: 'L.G. Wade', available: true },
        { id: 8, title: 'Modern History', author: 'Norman Lowe', available: true },
        { id: 9, title: 'Data Structures and Algorithms in Java', author: 'Goodrich et al.', available: true },
        { id: 10, title: 'Artificial Intelligence: A Modern Approach', author: 'Russell & Norvig', available: true }
    ];

    /* ------------------------------------------------------------------
       Initialization
       Populate localStorage with default data if not already present.
    */
    function initializeData() {
        if (!localStorage.getItem('courseCatalog')) {
            localStorage.setItem('courseCatalog', JSON.stringify(defaultCourseCatalog));
        }
        if (!localStorage.getItem('notices')) {
            localStorage.setItem('notices', JSON.stringify(defaultNotices));
        }
        if (!localStorage.getItem('bookCatalog')) {
            localStorage.setItem('bookCatalog', JSON.stringify(defaultBooks));
        }
        // Persist default assignments on first load.  If the
        // assignments key is missing, populate it with the default
        // structure defined above.  This allows administrators to add
        // new assignments without overwriting defaults on page
        // refresh.
        if (!localStorage.getItem('assignments')) {
            localStorage.setItem('assignments', JSON.stringify(defaultAssignments));
        }
        // Persist default events on first load.  Events are used for
        // the calendar and notifications modules.
        if (!localStorage.getItem('events')) {
            localStorage.setItem('events', JSON.stringify(defaultEvents));
        }
    }
    initializeData();

    /* ------------------------------------------------------------------
       Helper functions
    */
    function getCourseCatalog() {
        return JSON.parse(localStorage.getItem('courseCatalog')) || [];
    }
    function setCourseCatalog(catalog) {
        localStorage.setItem('courseCatalog', JSON.stringify(catalog));
    }
    function getNotices() {
        return JSON.parse(localStorage.getItem('notices')) || [];
    }
    function setNotices(notices) {
        localStorage.setItem('notices', JSON.stringify(notices));
    }
    function getBookCatalog() {
        return JSON.parse(localStorage.getItem('bookCatalog')) || [];
    }
    function setBookCatalog(books) {
        localStorage.setItem('bookCatalog', JSON.stringify(books));
    }

    // Retrieve the assignments object from localStorage.  Each key
    // corresponds to a course code and maps to an array of
    // assignments.  If no assignments are stored yet, the default
    // assignments will be returned.
    function getAssignments() {
        const stored = localStorage.getItem('assignments');
        return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(defaultAssignments));
    }
    // Persist the assignments object.  Use this when admins add or
    // delete assignments so students see the updated list.
    function setAssignments(assignments) {
        localStorage.setItem('assignments', JSON.stringify(assignments));
    }

    // Retrieve events from localStorage.  Returns an array of event
    // objects.  Events include university‑wide activities and
    // deadlines that appear in the calendar and notifications.
    function getEvents() {
        return JSON.parse(localStorage.getItem('events') || '[]');
    }
    // Persist events array to localStorage.
    function setEvents(events) {
        localStorage.setItem('events', JSON.stringify(events));
    }

    // Retrieve the global chat messages.  Messages are stored as an
    // array of objects containing the sender, timestamp and content.
    function getMessages() {
        return JSON.parse(localStorage.getItem('messages') || '[]');
    }
    // Persist global chat messages.
    function setMessages(messages) {
        localStorage.setItem('messages', JSON.stringify(messages));
    }

    // Retrieve notifications for a given username.  Notifications
    // contain a message string, a date and a flag indicating whether
    // the notification has been read.  Notifications are stored
    // separately per user to allow personal reminders.
    function getNotifications(username) {
        return JSON.parse(localStorage.getItem(`notifications_${username}`) || '[]');
    }
    // Persist notifications for a user.
    function setNotifications(username, notifications) {
        localStorage.setItem(`notifications_${username}`, JSON.stringify(notifications));
    }

    // Generate upcoming notifications for assignments and events.  This
    // function checks for assignments due within three days and
    // events occurring within seven days.  If a matching
    // notification does not already exist, it is added to the
    // user’s notification list.  This ensures users are reminded of
    // imminent deadlines without duplicates.
    function updateNotifications(username) {
        const notifications = getNotifications(username);
        const assignments = getAssignments();
        const now = new Date();
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        // Check assignment deadlines
        const registered = getRegisteredCourses(username);
        registered.forEach(code => {
            const assns = assignments[code] || [];
            assns.forEach(a => {
                const dueDate = new Date(a.due);
                const diff = dueDate - now;
                if (diff > 0 && diff <= threeDays) {
                    const message = `Assignment "${a.title}" for ${code} is due on ${a.due}.`;
                    // Avoid duplicate notifications
                    if (!notifications.some(n => n.message === message)) {
                        notifications.push({ message, date: now.toLocaleString(), read: false });
                    }
                }
            });
        });
        // Check upcoming events
        const events = getEvents();
        events.forEach(ev => {
            const eventDate = new Date(ev.date);
            const diff = eventDate - now;
            if (diff > 0 && diff <= sevenDays) {
                const message = `${ev.title} is happening on ${ev.date}${ev.time ? ' at ' + ev.time : ''}.`;
                if (!notifications.some(n => n.message === message)) {
                    notifications.push({ message, date: now.toLocaleString(), read: false });
                }
            }
        });
        setNotifications(username, notifications);
    }
    function getCurrentUsername() {
        return localStorage.getItem('username');
    }
    function getRole() {
        return localStorage.getItem('role');
    }
    function checkAuth() {
        if (localStorage.getItem('loggedIn') !== 'true') {
            window.location.href = 'login.html';
        }
    }
    function checkAdmin() {
        checkAuth();
        if (getRole() !== 'admin') {
            window.location.href = 'login.html';
        }
    }
    function checkStudent() {
        checkAuth();
        if (getRole() !== 'student') {
            window.location.href = 'login.html';
        }
    }
    // Add a student to the list of known students if not already present
    function addStudent(username) {
        let students = JSON.parse(localStorage.getItem('students') || '[]');
        if (!students.includes(username)) {
            students.push(username);
            localStorage.setItem('students', JSON.stringify(students));
        }
    }
    // Retrieve registered courses for a given user
    function getRegisteredCourses(username) {
        return JSON.parse(localStorage.getItem(`registeredCourses_${username}`) || '[]');
    }
    function setRegisteredCourses(username, courses) {
        localStorage.setItem(`registeredCourses_${username}`, JSON.stringify(courses));
    }
    // Retrieve assignment status map for a user
    function getAssignmentStatus(username) {
        return JSON.parse(localStorage.getItem(`assignments_${username}`) || '{}');
    }
    function setAssignmentStatus(username, status) {
        localStorage.setItem(`assignments_${username}`, JSON.stringify(status));
    }
    // Retrieve profile data for a user
    function getProfile(username) {
        return JSON.parse(localStorage.getItem(`profile_${username}`) || '{}');
    }
    function setProfile(username, profile) {
        localStorage.setItem(`profile_${username}`, JSON.stringify(profile));
    }
    // Retrieve reserved books list for a user
    function getReservedBooks(username) {
        return JSON.parse(localStorage.getItem(`reservedBooks_${username}`) || '[]');
    }
    function setReservedBooks(username, books) {
        localStorage.setItem(`reservedBooks_${username}`, JSON.stringify(books));
    }

    // ------------------------------------------------------------------
    // Task management
    // Retrieve the tasks object for a given user.  Tasks are grouped
    // by category, with each task containing an id, title and
    // status.  If no tasks exist for the user yet, null is returned.
    function getTasks(username) {
        const stored = localStorage.getItem(`tasks_${username}`);
        return stored ? JSON.parse(stored) : null;
    }
    // Persist the tasks object for a user.
    function setTasks(username, tasks) {
        localStorage.setItem(`tasks_${username}`, JSON.stringify(tasks));
    }
    // Initialize tasks for a new user by copying the default task
    // structure.  This is called when a student logs in for the
    // first time.  Existing task lists will not be overwritten.
    function initializeTasks(username) {
        if (!localStorage.getItem(`tasks_${username}`)) {
            // Deep copy to avoid referencing the defaultTasks object
            const tasksCopy = JSON.parse(JSON.stringify(defaultTasks));
            localStorage.setItem(`tasks_${username}`, JSON.stringify(tasksCopy));
        }
    }

    /* ------------------------------------------------------------------
       Authentication
       Handle login and logout
    */
    function login(event) {
        event.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const roleSelect = document.getElementById('role');
        const role = roleSelect ? roleSelect.value : 'student';
        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('role', role);
        if (role === 'student') {
            addStudent(username);
            // Initialize the student’s task list on first login
            initializeTasks(username);
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'admin_dashboard.html';
        }
    }
    function logout() {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        window.location.href = 'login.html';
    }

    /* ------------------------------------------------------------------
       Student Portal Functions
    */
    // Dashboard greeting
    function loadDashboard() {
        const username = getCurrentUsername() || 'Student';
        const display = document.getElementById('usernameDisplay');
        if (display) {
            display.textContent = username;
        }
    }

    // Course registration page
    function loadCourseList() {
        const container = document.getElementById('courseList');
        if (!container) return;
        const catalog = getCourseCatalog();
        let html = '<table class="course-table"><tr><th>Select</th><th>Course Code</th><th>Course Name</th><th>Credits</th><th>Schedule</th></tr>';
        catalog.forEach(course => {
            html += `<tr>
                <td><input type="checkbox" class="course-checkbox" value="${course.code}"></td>
                <td>${course.code}</td>
                <td>${course.name}</td>
                <td>${course.credits}</td>
                <td>${course.schedule.day} ${course.schedule.time}</td>
            </tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
    }
    function registerCourses() {
        const username = getCurrentUsername();
        if (!username) return;
        const checkboxes = document.querySelectorAll('.course-checkbox');
        const selected = [];
        checkboxes.forEach(cb => {
            if (cb.checked) {
                selected.push(cb.value);
            }
        });
        if (selected.length === 0) {
            alert('Please select at least one course to register.');
            return;
        }
        setRegisteredCourses(username, selected);
        alert('Courses registered successfully.');
        loadRegisteredCourses();
    }
    function loadRegisteredCourses() {
        const container = document.getElementById('registeredCourses');
        if (!container) return;
        const username = getCurrentUsername();
        if (!username) return;
        const registered = getRegisteredCourses(username);
        const catalog = getCourseCatalog();
        if (registered.length === 0) {
            container.innerHTML = '<p>No courses registered.</p>';
            return;
        }
        let html = '<ul>';
        registered.forEach(code => {
            const course = catalog.find(c => c.code === code);
            if (course) {
                html += `<li>${course.code} – ${course.name} (${course.schedule.day} ${course.schedule.time})</li>`;
            } else {
                html += `<li>${code}</li>`;
            }
        });
        html += '</ul>';
        container.innerHTML = html;
    }

    // Results page
    function generateGrade(code) {
        const grades = ['A', 'B', 'C', 'D', 'S'];
        const idx = Math.floor(Math.random() * grades.length);
        return grades[idx];
    }
    function loadResults() {
        const container = document.getElementById('resultsTable');
        if (!container) return;
        const username = getCurrentUsername();
        const registered = getRegisteredCourses(username);
        const catalog = getCourseCatalog();
        if (registered.length === 0) {
            container.innerHTML = '<p>No courses registered.</p>';
            return;
        }
        let html = '<table class="course-table"><tr><th>Course Code</th><th>Course Name</th><th>Grade</th></tr>';
        registered.forEach(code => {
            const course = catalog.find(c => c.code === code);
            if (course) {
                const grade = generateGrade(code);
                html += `<tr><td>${course.code}</td><td>${course.name}</td><td>${grade}</td></tr>`;
            }
        });
        html += '</table>';
        container.innerHTML = html;
    }

    // Timetable page
    function loadTimetable() {
        const container = document.getElementById('timetableContainer');
        if (!container) return;
        const username = getCurrentUsername();
        const registered = getRegisteredCourses(username);
        const catalog = getCourseCatalog();
        if (registered.length === 0) {
            container.innerHTML = '<p>No courses registered.</p>';
            return;
        }
        const times = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        let html = '<table class="timetable-table"><tr><th>Time</th>';
        days.forEach(day => {
            html += `<th>${day}</th>`;
        });
        html += '</tr>';
        times.forEach(time => {
            html += `<tr><td>${time}</td>`;
            days.forEach(day => {
                const course = catalog.find(c => c.schedule.day === day && c.schedule.time === time && registered.includes(c.code));
                if (course) {
                    html += `<td>${course.code}<br>${course.name}</td>`;
                } else {
                    html += '<td></td>';
                }
            });
            html += '</tr>';
        });
        html += '</table>';
        container.innerHTML = html;
    }

    // Notices page
    function loadNotices() {
        const container = document.getElementById('noticesContainer');
        // On the student notices page we didn’t wrap the notices in a
        // container div, so fall back to the main content if necessary.
        const target = container || document.querySelector('.content');
        const notices = getNotices();
        let html = '';
        notices.forEach(notice => {
            html += `<div class="notice">
                <h2>${notice.title}</h2>
                <p>${notice.content}</p>
                <span class="date">Posted: ${notice.date}</span>
            </div>`;
        });
        if (container) {
            container.innerHTML = html;
        } else {
            // When using the content element, only append the notices after
            // existing headings; this is used in the static notices page.
            const noticesDiv = document.createElement('div');
            noticesDiv.innerHTML = html;
            target.appendChild(noticesDiv);
        }
    }

    // Attendance page
    function loadAttendance() {
        const container = document.getElementById('attendanceTable');
        if (!container) return;
        const username = getCurrentUsername();
        const registered = getRegisteredCourses(username);
        const catalog = getCourseCatalog();
        if (registered.length === 0) {
            container.innerHTML = '<p>No courses registered.</p>';
            return;
        }
        let html = '<table class="course-table"><tr><th>Course Code</th><th>Course Name</th><th>Classes Attended</th><th>Total Classes</th><th>Attendance %</th></tr>';
        registered.forEach(code => {
            const course = catalog.find(c => c.code === code);
            if (course) {
                // Generate deterministic pseudo-random attendance based on username and code for consistency across refreshes
                const seed = hashCode(username + code);
                const total = 30;
                const attended = 20 + (seed % 11); // 20 to 30
                const percent = Math.round((attended / total) * 100);
                html += `<tr><td>${course.code}</td><td>${course.name}</td><td>${attended}</td><td>${total}</td><td>${percent}%</td></tr>`;
            }
        });
        html += '</table>';
        container.innerHTML = html;
    }
    // Simple string hash for deterministic pseudo-random numbers
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0;
        }
        return Math.abs(hash);
    }

    // Assignments page
    function loadAssignments() {
        const container = document.getElementById('assignmentsContainer');
        if (!container) return;
        const username = getCurrentUsername();
        const registered = getRegisteredCourses(username);
        const catalog = getCourseCatalog();
        if (registered.length === 0) {
            container.innerHTML = '<p>No courses registered.</p>';
            return;
        }
        const status = getAssignmentStatus(username);
        const assignments = getAssignments();
        let html = '';
        registered.forEach(code => {
            const course = catalog.find(c => c.code === code);
            const assns = assignments[code] || [];
            html += `<h2>${code} – ${course ? course.name : ''}</h2>`;
            if (assns.length === 0) {
                html += '<p>No assignments.</p>';
            } else {
                html += '<table class="course-table"><tr><th>Assignment</th><th>Due Date</th><th>Status</th><th>File</th><th>Action</th></tr>';
                assns.forEach(a => {
                    const key = `${code}_${a.id}`;
                    const record = status[key] || {};
                    const submitted = record.submitted;
                    const fileName = record.file || '';
                    html += `<tr>
                        <td>${a.title}</td>
                        <td>${a.due}</td>
                        <td>${submitted ? 'Submitted' : 'Not Submitted'}</td>
                        <td>${submitted && fileName ? fileName : (submitted ? 'N/A' : `<input type="file" id="file_${code}_${a.id}" />`)}</td>
                        <td>${submitted ? '' : `<button onclick="submitAssignment('${code}', ${a.id})">Submit</button>`}</td>
                    </tr>`;
                });
                html += '</table>';
            }
        });
        container.innerHTML = html;
    }
    function submitAssignment(code, id) {
        const username = getCurrentUsername();
        const fileInput = document.getElementById(`file_${code}_${id}`);
        let fileName = '';
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            fileName = fileInput.files[0].name;
        }
        const status = getAssignmentStatus(username);
        const key = `${code}_${id}`;
        status[key] = { submitted: true, file: fileName };
        setAssignmentStatus(username, status);
        // After submission, generate a notification about the submission
        const notifications = getNotifications(username);
        notifications.push({ message: `You submitted ${code} assignment ${id}.`, date: new Date().toLocaleString(), read: false });
        setNotifications(username, notifications);
        loadAssignments();
    }

    // Profile page
    function loadProfile() {
        const username = getCurrentUsername();
        const profile = getProfile(username);
        const emailInput = document.getElementById('profileEmail');
        const phoneInput = document.getElementById('profilePhone');
        if (emailInput && phoneInput) {
            emailInput.value = profile.email || '';
            phoneInput.value = profile.phone || '';
        }
    }
    function saveProfile(event) {
        event.preventDefault();
        const username = getCurrentUsername();
        const email = document.getElementById('profileEmail').value.trim();
        const phone = document.getElementById('profilePhone').value.trim();
        setProfile(username, { email, phone });
        alert('Profile saved successfully.');
    }

    // Library page
    function loadLibrary() {
        // Show all books initially
        renderLibraryResults(getBookCatalog());
        renderReservedBooks();
    }
    function searchBooks() {
        const query = document.getElementById('bookSearch').value.trim().toLowerCase();
        const books = getBookCatalog();
        const filtered = books.filter(b => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query));
        renderLibraryResults(filtered);
    }
    function renderLibraryResults(books) {
        const container = document.getElementById('libraryResults');
        const username = getCurrentUsername();
        const reserved = getReservedBooks(username);
        let html = '<table class="course-table"><tr><th>Title</th><th>Author</th><th>Status</th><th>Action</th></tr>';
        books.forEach(book => {
            const isReserved = reserved.includes(book.id);
            const status = book.available ? 'Available' : isReserved ? 'Reserved by you' : 'Unavailable';
            let action = '';
            if (book.available) {
                action = `<button onclick="reserveBook(${book.id})">Reserve</button>`;
            }
            html += `<tr><td>${book.title}</td><td>${book.author}</td><td>${status}</td><td>${action}</td></tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
    }
    function reserveBook(bookId) {
        const username = getCurrentUsername();
        const books = getBookCatalog();
        const book = books.find(b => b.id === bookId);
        if (!book || !book.available) return;
        book.available = false;
        setBookCatalog(books);
        const reserved = getReservedBooks(username);
        if (!reserved.includes(bookId)) {
            reserved.push(bookId);
            setReservedBooks(username, reserved);
        }
        loadLibrary();
    }
    function renderReservedBooks() {
        const container = document.getElementById('reservedBooks');
        const username = getCurrentUsername();
        const reserved = getReservedBooks(username);
        const books = getBookCatalog();
        if (reserved.length === 0) {
            container.innerHTML = '<p>You have no reserved books.</p>';
            return;
        }
        let html = '<ul>';
        reserved.forEach(id => {
            const book = books.find(b => b.id === id);
            if (book) {
                html += `<li>${book.title} by ${book.author}</li>`;
            }
        });
        html += '</ul>';
        container.innerHTML = html;
    }

    /* ------------------------------------------------------------------
       Extended Student Functionality
       Functions below implement advanced features such as a
       personalized calendar, messaging centre, notification panel,
       virtual assistant and analytics.  These functions build on the
       portal’s existing data and leverage localStorage for
       persistence.
    */

    // Calendar page – display upcoming events and assignment deadlines
    function loadCalendar() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;
        const username = getCurrentUsername();
        const events = getEvents();
        const assignments = getAssignments();
        const registered = getRegisteredCourses(username);
        // Build a unified list of items with a date property
        let items = [];
        // General events
        events.forEach(ev => {
            items.push({ date: ev.date, type: ev.type || 'Event', title: ev.title, description: ev.description, time: ev.time || '' });
        });
        // Assignment deadlines for the user
        registered.forEach(code => {
            const assns = assignments[code] || [];
            assns.forEach(a => {
                items.push({ date: a.due, type: 'Assignment', title: a.title, description: `Due for ${code}`, time: '' });
            });
        });
        // Sort items by date ascending
        items.sort((a, b) => new Date(a.date) - new Date(b.date));
        let html = '<table class="course-table"><tr><th>Date</th><th>Title</th><th>Type</th><th>Description</th></tr>';
        items.forEach(item => {
            html += `<tr><td>${item.date}${item.time ? ' ' + item.time : ''}</td><td>${item.title}</td><td>${item.type}</td><td>${item.description}</td></tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
    }

    // Messaging page – simple group chat for all users
    function loadMessaging() {
        const container = document.getElementById('messageList');
        if (!container) return;
        const messages = getMessages();
        let html = '';
        messages.forEach(msg => {
            html += `<div class="message"><strong>${msg.from}</strong> <span class="timestamp">${msg.time}</span><br>${msg.content}</div>`;
        });
        container.innerHTML = html;
    }
    function sendMessage() {
        const input = document.getElementById('messageInput');
        if (!input) return;
        const content = input.value.trim();
        if (content === '') return;
        const username = getCurrentUsername();
        const messages = getMessages();
        messages.push({ from: username, time: new Date().toLocaleString(), content });
        setMessages(messages);
        input.value = '';
        loadMessaging();
    }

    // Notifications page – show notifications and allow marking them
    function loadNotifications() {
        const container = document.getElementById('notificationsList');
        if (!container) return;
        const username = getCurrentUsername();
        updateNotifications(username);
        let notifications = getNotifications(username);
        if (notifications.length === 0) {
            container.innerHTML = '<p>No notifications.</p>';
            return;
        }
        let html = '<ul class="notification-list">';
        notifications.forEach((n, idx) => {
            const cls = n.read ? 'notification read' : 'notification';
            html += `<li class="${cls}"><span>${n.message}</span><br><small>${n.date}</small><button onclick="markNotificationRead(${idx})">Mark as read</button></li>`;
        });
        html += '</ul>';
        html += '<button onclick="clearNotifications()">Clear All</button>';
        container.innerHTML = html;
    }
    function markNotificationRead(index) {
        const username = getCurrentUsername();
        const notifications = getNotifications(username);
        if (notifications[index]) {
            notifications[index].read = true;
            setNotifications(username, notifications);
            loadNotifications();
        }
    }
    function clearNotifications() {
        const username = getCurrentUsername();
        setNotifications(username, []);
        loadNotifications();
    }

    // Tasks page – display a to‑do list grouped by category.  Each
    // task shows its title and current status with a colour‑coded
    // badge.  Students can change the status using a dropdown
    // selector.  Tasks mirror the IU task list layout which groups
    // items and indicates completion status【579199063798451†L156-L163】.
    function loadTasks() {
        const container = document.getElementById('taskList');
        if (!container) return;
        const username = getCurrentUsername();
        if (!username) return;
        const tasks = getTasks(username);
        if (!tasks) {
            container.innerHTML = '<p>No tasks available.</p>';
            return;
        }
        let html = '';
        Object.keys(tasks).forEach(cat => {
            const list = tasks[cat];
            html += `<h3>${cat}</h3>`;
            html += '<div class="task-group">';
            list.forEach(task => {
                const statusClass = task.status.replace(/\s+/g, '-').toLowerCase();
                html += `<div class="task"><span class="task-title">${task.title}</span>` +
                        `<span class="badge badge-${statusClass}">${task.status}</span>` +
                        `<select onchange="updateTaskStatus('${cat}', ${task.id}, this.value)">` +
                            ['Not started','Started','Needs review','Completed'].map(option => {
                                const sel = option === task.status ? 'selected' : '';
                                return `<option value="${option}" ${sel}>${option}</option>`;
                            }).join('') +
                        `</select></div>`;
            });
            html += '</div>';
        });
        container.innerHTML = html;
    }
    // Update the status of a single task and refresh the display
    function updateTaskStatus(category, id, newStatus) {
        const username = getCurrentUsername();
        const tasks = getTasks(username);
        if (!tasks || !tasks[category]) return;
        const task = tasks[category].find(t => t.id === id);
        if (task) {
            task.status = newStatus;
            setTasks(username, tasks);
            loadTasks();
        }
    }

    // Virtual assistant page – simple Q&A bot
    function loadAssistant() {
        // Display existing conversation if any
        const container = document.getElementById('assistantMessages');
        if (!container) return;
        container.innerHTML = ''; // clear previous
    }
    function sendAssistantQuery() {
        const input = document.getElementById('assistantInput');
        const container = document.getElementById('assistantMessages');
        if (!input || !container) return;
        const question = input.value.trim();
        if (question === '') return;
        const username = getCurrentUsername();
        // Display user message
        container.innerHTML += `<div class="message user"><strong>${username}</strong><br>${question}</div>`;
        input.value = '';
        // Generate assistant reply
        const reply = getAssistantResponse(question);
        container.innerHTML += `<div class="message bot"><strong>Assistant</strong><br>${reply}</div>`;
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
    // Determine an appropriate reply based on the question.  This
    // function uses simple keyword matching to provide answers about
    // courses, assignments, schedules and library usage.  More
    // sophisticated logic could be added, but this implementation
    // illustrates how an AI assistant might surface relevant
    // information【539043720439468†L80-L96】.
    function getAssistantResponse(question) {
        const q = question.toLowerCase();
        const username = getCurrentUsername();
        if (q.includes('next class') || q.includes('schedule')) {
            // Return the next upcoming class from the timetable
            const now = new Date();
            const registered = getRegisteredCourses(username);
            const catalog = getCourseCatalog();
            let nextClass = null;
            registered.forEach(code => {
                const course = catalog.find(c => c.code === code);
                if (!course) return;
                // Determine next occurrence of this class in the week
                const daysOfWeek = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
                const classDayIndex = daysOfWeek.indexOf(course.schedule.day.toLowerCase());
                // Compute the date of the next class
                const date = new Date();
                const diff = classDayIndex - date.getDay();
                const daysUntil = diff >= 0 ? diff : diff + 7;
                const classDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysUntil);
                // Combine date and time
                const [startHour, startMin] = course.schedule.time.split(':');
                classDate.setHours(parseInt(startHour, 10));
                classDate.setMinutes(parseInt(startMin, 10));
                if (!nextClass || classDate < nextClass.date) {
                    nextClass = { date: classDate, course: course.code + ' – ' + course.name };
                }
            });
            if (nextClass) {
                return `Your next class is ${nextClass.course} on ${nextClass.date.toLocaleString()}.`;
            }
            return 'You have no upcoming classes.';
        }
        if (q.includes('assignment') || q.includes('homework')) {
            // List upcoming assignments
            const assignments = getAssignments();
            const registered = getRegisteredCourses(username);
            let responses = [];
            registered.forEach(code => {
                const assns = assignments[code] || [];
                assns.forEach(a => {
                    responses.push(`${code}: ${a.title} due on ${a.due}`);
                });
            });
            if (responses.length > 0) {
                return 'Here are your assignments: ' + responses.join('; ');
            }
            return 'You have no assignments.';
        }
        if (q.includes('grade') || q.includes('results')) {
            // Provide a summary of the student’s grades
            const registered = getRegisteredCourses(username);
            const catalog = getCourseCatalog();
            if (registered.length === 0) return 'You have not registered for any courses yet.';
            let grades = [];
            registered.forEach(code => {
                const course = catalog.find(c => c.code === code);
                const grade = generateGrade(code);
                grades.push(`${code} (${course ? course.name : ''}): ${grade}`);
            });
            return 'Your current grades are: ' + grades.join('; ');
        }
        if (q.includes('library') || q.includes('book')) {
            // List reserved books
            const reserved = getReservedBooks(username);
            const books = getBookCatalog();
            if (reserved.length > 0) {
                const titles = reserved.map(id => {
                    const book = books.find(b => b.id === id);
                    return book ? book.title : '';
                });
                return 'You have reserved the following books: ' + titles.join(', ') + '.';
            }
            return 'You have no reserved books.';
        }
        if (q.includes('help') || q.includes('hello')) {
            return 'Hello! I can answer questions about your classes, assignments, grades and library reservations.';
        }
        return "I'm sorry, I didn't understand that. Please ask about your schedule, assignments, grades or library.";
    }

    // Analytics page – display simple performance metrics
    function loadAnalytics() {
        const container = document.getElementById('analyticsContainer');
        if (!container) return;
        const username = getCurrentUsername();
        const registered = getRegisteredCourses(username);
        const catalog = getCourseCatalog();
        // Attendance distribution
        let attendanceRows = '';
        registered.forEach(code => {
            const course = catalog.find(c => c.code === code);
            const seed = hashCode(username + code);
            const total = 30;
            const attended = 20 + (seed % 11);
            const percent = Math.round((attended / total) * 100);
            attendanceRows += `<tr><td>${code}</td><td>${course ? course.name : ''}</td><td>${percent}%</td><td><div class="bar" style="width:${percent}%"></div></td></tr>`;
        });
        // Assignment completion stats
        const assignments = getAssignments();
        const status = getAssignmentStatus(username);
        let totalAssignments = 0;
        let submittedCount = 0;
        registered.forEach(code => {
            const assns = assignments[code] || [];
            assns.forEach(a => {
                totalAssignments++;
                const key = `${code}_${a.id}`;
                if (status[key] && status[key].submitted) submittedCount++;
            });
        });
        const assignmentPercent = totalAssignments === 0 ? 0 : Math.round((submittedCount / totalAssignments) * 100);
        // Build HTML
        let html = '<h2>Attendance Overview</h2>';
        html += '<table class="course-table"><tr><th>Course</th><th>Name</th><th>Attendance %</th><th>Visual</th></tr>' + attendanceRows + '</table>';
        html += `<h2>Assignment Completion</h2><p>You have submitted ${submittedCount} out of ${totalAssignments} assignments (${assignmentPercent}%).</p>`;
        html += `<div class="bar-container"><div class="bar" style="width:${assignmentPercent}%"></div></div>`;
        container.innerHTML = html;
    }

    /* ------------------------------------------------------------------
       Administrative Extensions
       These functions give administrators the ability to manage
       assignments, events and library inventory.  Each management
       page calls the appropriate load function on page load.
    */
    function loadManageAssignments() {
        const container = document.getElementById('assignmentManagement');
        if (!container) return;
        const assignments = getAssignments();
        const catalog = getCourseCatalog();
        let html = '';
        // Form for adding a new assignment
        html += '<h2>Add Assignment</h2>';
        html += '<form id="addAssignmentForm" onsubmit="addAssignment(event)">' +
            '<label for="assignCourse">Course:</label>' +
            '<select id="assignCourse">' +
            catalog.map(c => `<option value="${c.code}">${c.code}</option>`).join('') +
            '</select>' +
            '<label for="assignTitle">Title:</label>' +
            '<input type="text" id="assignTitle" />' +
            '<label for="assignDue">Due Date:</label>' +
            '<input type="date" id="assignDue" />' +
            '<button type="submit">Add Assignment</button>' +
            '</form>';
        // Listing existing assignments
        html += '<h2>Existing Assignments</h2>';
        for (const code in assignments) {
            const assns = assignments[code];
            html += `<h3>${code}</h3>`;
            if (!assns || assns.length === 0) {
                html += '<p>No assignments.</p>';
            } else {
                html += '<table class="course-table"><tr><th>ID</th><th>Title</th><th>Due Date</th><th>Action</th></tr>';
                assns.forEach(a => {
                    html += `<tr><td>${a.id}</td><td>${a.title}</td><td>${a.due}</td><td><button onclick="deleteAssignment('${code}', ${a.id})">Delete</button></td></tr>`;
                });
                html += '</table>';
            }
        }
        container.innerHTML = html;
    }
    function addAssignment(event) {
        event.preventDefault();
        const code = document.getElementById('assignCourse').value;
        const title = document.getElementById('assignTitle').value.trim();
        const due = document.getElementById('assignDue').value;
        if (!code || !title || !due) {
            alert('Please fill in all fields.');
            return;
        }
        const assignments = getAssignments();
        const list = assignments[code] || [];
        const nextId = list.length > 0 ? Math.max(...list.map(a => a.id)) + 1 : 1;
        list.push({ id: nextId, title, due });
        assignments[code] = list;
        setAssignments(assignments);
        document.getElementById('addAssignmentForm').reset();
        loadManageAssignments();
    }
    function deleteAssignment(course, id) {
        const assignments = getAssignments();
        const list = assignments[course] || [];
        assignments[course] = list.filter(a => a.id !== id);
        setAssignments(assignments);
        loadManageAssignments();
    }

    function loadManageEvents() {
        const container = document.getElementById('eventManagement');
        if (!container) return;
        const events = getEvents();
        let html = '<h2>Add Event</h2>';
        html += '<form id="addEventForm" onsubmit="addEvent(event)">' +
            '<label for="eventTitle">Title:</label>' +
            '<input type="text" id="eventTitle" />' +
            '<label for="eventDate">Date:</label>' +
            '<input type="date" id="eventDate" />' +
            '<label for="eventTime">Time:</label>' +
            '<input type="time" id="eventTime" />' +
            '<label for="eventDescription">Description:</label>' +
            '<textarea id="eventDescription"></textarea>' +
            '<label for="eventType">Type:</label>' +
            '<input type="text" id="eventType" placeholder="e.g. Event, Exam" />' +
            '<button type="submit">Add Event</button>' +
            '</form>';
        html += '<h2>Existing Events</h2>';
        if (events.length === 0) {
            html += '<p>No events.</p>';
        } else {
            html += '<table class="course-table"><tr><th>ID</th><th>Title</th><th>Date</th><th>Time</th><th>Type</th><th>Description</th><th>Action</th></tr>';
            events.forEach(ev => {
                html += `<tr><td>${ev.id}</td><td>${ev.title}</td><td>${ev.date}</td><td>${ev.time || ''}</td><td>${ev.type}</td><td>${ev.description}</td><td><button onclick="deleteEvent(${ev.id})">Delete</button></td></tr>`;
            });
            html += '</table>';
        }
        container.innerHTML = html;
    }
    function addEvent(event) {
        event.preventDefault();
        const title = document.getElementById('eventTitle').value.trim();
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const description = document.getElementById('eventDescription').value.trim();
        const type = document.getElementById('eventType').value.trim() || 'Event';
        if (!title || !date) {
            alert('Please enter a title and date for the event.');
            return;
        }
        const events = getEvents();
        const nextId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
        events.push({ id: nextId, title, date, time, description, type });
        setEvents(events);
        document.getElementById('addEventForm').reset();
        loadManageEvents();
    }
    function deleteEvent(id) {
        let events = getEvents();
        events = events.filter(e => e.id !== id);
        setEvents(events);
        loadManageEvents();
    }

    function loadManageLibrary() {
        const container = document.getElementById('libraryManagement');
        if (!container) return;
        const books = getBookCatalog();
        let html = '<h2>Add Book</h2>';
        html += '<form id="addBookForm" onsubmit="addBook(event)">' +
            '<label for="bookTitle">Title:</label>' +
            '<input type="text" id="bookTitle" />' +
            '<label for="bookAuthor">Author:</label>' +
            '<input type="text" id="bookAuthor" />' +
            '<button type="submit">Add Book</button>' +
            '</form>';
        html += '<h2>Library Catalogue</h2>';
        if (books.length === 0) {
            html += '<p>No books available.</p>';
        } else {
            html += '<table class="course-table"><tr><th>ID</th><th>Title</th><th>Author</th><th>Available</th><th>Action</th></tr>';
            books.forEach(book => {
                html += `<tr><td>${book.id}</td><td>${book.title}</td><td>${book.author}</td><td>${book.available ? 'Yes' : 'No'}</td><td><button onclick="deleteBook(${book.id})">Delete</button></td></tr>`;
            });
            html += '</table>';
        }
        container.innerHTML = html;
    }
    function addBook(event) {
        event.preventDefault();
        const title = document.getElementById('bookTitle').value.trim();
        const author = document.getElementById('bookAuthor').value.trim();
        if (!title || !author) {
            alert('Please enter both title and author.');
            return;
        }
        const books = getBookCatalog();
        const nextId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
        books.push({ id: nextId, title, author, available: true });
        setBookCatalog(books);
        document.getElementById('addBookForm').reset();
        loadManageLibrary();
    }
    function deleteBook(id) {
        let books = getBookCatalog();
        books = books.filter(b => b.id !== id);
        setBookCatalog(books);
        loadManageLibrary();
    }

    /* ------------------------------------------------------------------
       Administrative Functions
    */
    function loadAdminDashboard() {
        const container = document.getElementById('adminSummary');
        if (!container) return;
        const courses = getCourseCatalog();
        const notices = getNotices();
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        let html = '<table class="course-table" style="max-width:500px"><tr><th>Item</th><th>Count</th></tr>';
        html += `<tr><td>Total Courses</td><td>${courses.length}</td></tr>`;
        html += `<tr><td>Total Notices</td><td>${notices.length}</td></tr>`;
        html += `<tr><td>Total Students</td><td>${students.length}</td></tr>`;
        html += '</table>';
        container.innerHTML = html;
    }
    function loadManageCourses() {
        const container = document.getElementById('courseManagement');
        if (!container) return;
        const catalog = getCourseCatalog();
        let html = '<table class="course-table"><tr><th>Code</th><th>Name</th><th>Credits</th><th>Schedule</th><th>Action</th></tr>';
        catalog.forEach(course => {
            html += `<tr><td>${course.code}</td><td>${course.name}</td><td>${course.credits}</td><td>${course.schedule.day} ${course.schedule.time}</td><td><button onclick="deleteCourse('${course.code}')">Delete</button></td></tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
    }
    function addCourse(event) {
        event.preventDefault();
        const code = document.getElementById('newCode').value.trim();
        const name = document.getElementById('newName').value.trim();
        const credits = parseInt(document.getElementById('newCredits').value.trim(), 10);
        const day = document.getElementById('newDay').value;
        const time = document.getElementById('newTime').value;
        if (!code || !name || !credits) {
            alert('Please fill in all course details.');
            return;
        }
        let catalog = getCourseCatalog();
        if (catalog.find(c => c.code === code)) {
            alert('A course with this code already exists.');
            return;
        }
        catalog.push({ code, name, credits, schedule: { day, time } });
        setCourseCatalog(catalog);
        // Reset form
        document.getElementById('addCourseForm').reset();
        loadManageCourses();
    }
    function deleteCourse(code) {
        let catalog = getCourseCatalog();
        catalog = catalog.filter(c => c.code !== code);
        setCourseCatalog(catalog);
        loadManageCourses();
    }
    function loadManageNotices() {
        const container = document.getElementById('noticeManagement');
        if (!container) return;
        const notices = getNotices();
        let html = '<table class="course-table"><tr><th>Title</th><th>Date</th><th>Content</th><th>Action</th></tr>';
        notices.forEach((notice, idx) => {
            html += `<tr><td>${notice.title}</td><td>${notice.date}</td><td>${notice.content}</td><td><button onclick="deleteNotice(${idx})">Delete</button></td></tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
    }
    function addNotice(event) {
        event.preventDefault();
        const title = document.getElementById('newNoticeTitle').value.trim();
        const content = document.getElementById('newNoticeContent').value.trim();
        if (!title || !content) {
            alert('Please enter a title and content for the notice.');
            return;
        }
        const date = new Date().toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric' });
        const notices = getNotices();
        notices.unshift({ title, content, date });
        setNotices(notices);
        document.getElementById('addNoticeForm').reset();
        loadManageNotices();
    }
    function deleteNotice(index) {
        let notices = getNotices();
        notices.splice(index, 1);
        setNotices(notices);
        loadManageNotices();
    }
    function loadViewStudents() {
        const container = document.getElementById('studentList');
        if (!container) return;
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const catalog = getCourseCatalog();
        if (students.length === 0) {
            container.innerHTML = '<p>No students have registered yet.</p>';
            return;
        }
        let html = '<table class="course-table"><tr><th>Student</th><th>Registered Courses</th></tr>';
        students.forEach(student => {
            const courses = getRegisteredCourses(student);
            let courseNames = '';
            if (courses.length === 0) {
                courseNames = 'None';
            } else {
                const names = courses.map(code => {
                    const course = catalog.find(c => c.code === code);
                    return course ? `${course.code} (${course.name})` : code;
                });
                courseNames = names.join(', ');
            }
            html += `<tr><td>${student}</td><td>${courseNames}</td></tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
    }

    /* ------------------------------------------------------------------
       Export functions to the global scope so they can be called from
       HTML event handlers.  Without this, functions defined inside the
       IIFE would not be accessible from inline onclick attributes.
    */
    window.checkAuth = checkAuth;
    window.checkAdmin = checkAdmin;
    window.checkStudent = checkStudent;
    window.login = login;
    window.logout = logout;
    window.loadDashboard = loadDashboard;
    window.loadCourseList = loadCourseList;
    window.registerCourses = registerCourses;
    window.loadRegisteredCourses = loadRegisteredCourses;
    window.loadResults = loadResults;
    window.loadTimetable = loadTimetable;
    window.loadNotices = loadNotices;
    window.loadAttendance = loadAttendance;
    window.loadAssignments = loadAssignments;
    window.submitAssignment = submitAssignment;
    window.loadProfile = loadProfile;
    window.saveProfile = saveProfile;
    window.loadLibrary = loadLibrary;
    window.searchBooks = searchBooks;
    window.reserveBook = reserveBook;
    window.loadAdminDashboard = loadAdminDashboard;
    window.loadManageCourses = loadManageCourses;
    window.addCourse = addCourse;
    window.deleteCourse = deleteCourse;
    window.loadManageNotices = loadManageNotices;
    window.addNotice = addNotice;
    window.deleteNotice = deleteNotice;
    window.loadViewStudents = loadViewStudents;

    // Export extended student functions
    window.loadCalendar = loadCalendar;
    window.loadMessaging = loadMessaging;
    window.sendMessage = sendMessage;
    window.loadNotifications = loadNotifications;
    window.markNotificationRead = markNotificationRead;
    window.clearNotifications = clearNotifications;
    window.loadAssistant = loadAssistant;
    window.sendAssistantQuery = sendAssistantQuery;
    window.loadAnalytics = loadAnalytics;

    // Export tasks functions
    window.loadTasks = loadTasks;
    window.updateTaskStatus = updateTaskStatus;

    // Export administrative extensions
    window.loadManageAssignments = loadManageAssignments;
    window.addAssignment = addAssignment;
    window.deleteAssignment = deleteAssignment;
    window.loadManageEvents = loadManageEvents;
    window.addEvent = addEvent;
    window.deleteEvent = deleteEvent;
    window.loadManageLibrary = loadManageLibrary;
    window.addBook = addBook;
    window.deleteBook = deleteBook;
    
    // ------------------------------------------------------------------
    // Side navigation toggler
    //
    // The portal now features a collapsible side navigation drawer
    // controlled by a hamburger icon in the top bar.  Defining this
    // function on the global window allows pages to toggle the
    // navigation without duplicating logic in every file.  It simply
    // toggles the `open` class on the element with id `sidenav`.
    window.toggleSidenav = function() {
        var nav = document.getElementById('sidenav');
        if (nav) {
            nav.classList.toggle('open');
        }
    };
})();
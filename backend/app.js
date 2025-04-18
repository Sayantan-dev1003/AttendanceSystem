import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createClient } from "@supabase/supabase-js";
import { exec } from "child_process";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase Connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, "dist")));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 🔹 Multer Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});
const upload = multer({ storage });

// Middleware for token verification
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ✅ User registration with Profile Photo Upload
app.post("/register", upload.array("profilePhotos"), async (req, res) => {
    try {
        const { name, email, phone, department, designation, password, employee_id } = req.body;

        // Create a new directory for the employee's profile photos
        const employeeDir = path.join(uploadDir, name);
        if (!fs.existsSync(employeeDir)) {
            fs.mkdirSync(employeeDir, { recursive: true }); // Ensure the directory is created
        }

        // Store uploaded file names
        const profilePhotos = req.files.map((file, index) => {
            const ext = path.extname(file.originalname);
            const newFileName = `${name}_${index}${ext}`;
            const newFilePath = path.join(employeeDir, newFileName);
            fs.renameSync(file.path, newFilePath);
            return newFileName;
        });

        // Check if user already exists
        const { data: existingUser, error: findError } = await supabase
            .from("users")
            .select("id")
            .or(`email.eq."${email}",phone.eq."${phone}"`);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "User  already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { error: insertError } = await supabase.from("users").insert([
            {
                employee_id: employee_id,
                name,
                email,
                phone,
                department,
                designation,
                profilePhoto: `{${profilePhotos.join(",")}}`,
                password: hashedPassword,
                created_at: new Date(),
            },
        ]);

        if (insertError) {
            return res.status(500).json({ error: "Failed to register user" });
        }

        // Generate JWT token
        const token = jwt.sign({ email, employee_id, designation }, process.env.JWT_SECRET);
        res.cookie("token", token, { httpOnly: true });

        // Pass designation to the frontend
        res.status(201).json({ message: "Registration Successful", designation: designation });

        // ✅ Trigger embeddings generation (keep this code AFTER successful registration)
        const scriptPath = path.join(__dirname, "../flaskServer/createEmbeddings.py");
        const uploadFolder = path.join(__dirname, "uploads", name);

        const command = `python "${scriptPath}" "${uploadFolder}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`[Embedding Error]: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`[Embedding stderr]: ${stderr}`);
            }
            console.log(`[Embeddings Log]: ${stdout}`);
        });
    } catch (error) {
        console.error("Error in registration", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Serve Uploaded Images
app.use("/uploads", express.static("uploads"));

// User login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user in Supabase
        const { data: users, error: findError } = await supabase
            .from("users")
            .select("id, email, password, designation") // Added designation to the select clause
            .eq("email", email)
            .limit(1);

        if (!users || users.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate token
        const token = jwt.sign({ email: user.email, userid: user.id, designation: user.designation }, process.env.JWT_SECRET); // Added designation to the token
        res.cookie("token", token, { httpOnly: true });

        res.status(200).json({ message: "Login Successful", designation: user.designation }); // Added designation to the response
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/user/name", authenticateToken, async (req, res) => {
    try {
        const { email } = req.user;

        const { data, error } = await supabase
            .from("users")
            .select("name")
            .eq("email", email)
            .limit(1);

        if (error) {
            console.error("Error fetching name:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ name: data[0].name });

    } catch (error) {
        console.error("Error fetching name:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get("/api/user/profilePhoto", authenticateToken, async (req, res) => {
    try {
        const { email } = req.user;
        const { data, error } = await supabase
            .from("users")
            .select("profilePhoto")
            .eq("email", email)
            .limit(1);

        if (error) {
            console.error("Error fetching profile photo:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!data || data.length === 0) {
            console.error("Profile photo not found for user:", email);
            return res.status(404).json({ error: "Profile photo not found" });
        }

        res.status(200).json({ profilePhoto: data[0].profilePhoto });
    } catch (error) {
        console.error("Error fetching profile photo:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/user", authenticateToken, async (req, res) => {
    try {
        const { email } = req.user;
        const { data, error } = await supabase
            .from("users")
            .select("name, employee_id, email, phone, department, designation, profilePhoto")
            .eq("email", email)
            .limit(1);

        if (error) {
            console.error("Error fetching user data:", error);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.status(200).json(data[0]);
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/updateProfilePhoto", authenticateToken, upload.single("profilePhoto"), async (req, res) => {
    try {
        const { email } = req.user;

        // Fetch user details to get the old profile photo
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("name, profilePhoto")
            .eq("email", email)
            .single();

        if (userError || !userData) {
            console.error("Error fetching user data:", userError);
            return res.status(404).json({ error: "User not found" });
        }

        const userName = userData.name;
        const oldPhoto = userData.profilePhoto;
        const uploadsDir = path.join(__dirname, "/uploads");

        // Delete old profile photo if it exists
        if (oldPhoto) {
            const oldPhotoPath = path.join(uploadsDir, oldPhoto);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        // Save new profile photo with the user's name
        const fileExtension = path.extname(req.file.originalname);
        const newPhotoName = `${userName}${fileExtension}`;
        const newPhotoPath = path.join(uploadsDir, newPhotoName);

        // Rename uploaded file
        fs.renameSync(req.file.path, newPhotoPath);

        // Update new photo name in Supabase
        const { error: updateError } = await supabase
            .from("users")
            .update({ profilePhoto: newPhotoName })
            .eq("email", email);

        if (updateError) {
            console.error("Error updating profile photo in database:", updateError);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(200).json({ message: "Profile photo updated successfully", profilePhoto: newPhotoName });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.patch("/api/users/update", authenticateToken, async (req, res) => {
    try {
        const { email } = req.user;
        const { name, phone, oldPassword, newPassword } = req.body;

        // Fetch user details
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("password")
            .eq("email", email)
            .single();

        if (userError || !userData) {
            console.error("Error fetching user data:", userError);
            return res.status(404).json({ error: "User not found" });
        }

        let updateFields = { name, phone };

        // If the user wants to change the password
        if (oldPassword && newPassword) {
            // Decrypt the stored password
            const isMatch = await bcrypt.compare(oldPassword, userData.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Old password is incorrect" });
            }

            // If old password is correct, update with new password
            updateFields.password = await hashPassword(newPassword);
        }

        // Update user details
        const { error: updateError } = await supabase
            .from("users")
            .update(updateFields)
            .eq("email", email);

        if (updateError) {
            console.error("Error updating user data:", updateError);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(200).json({ message: "User details updated successfully" });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

app.post("/mark-attendance", async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "User name is required" });
        }

        // Fetch correct employee_id from users table
        const { data: users, error: userError } = await supabase
            .from("users")
            .select("employee_id, name")
            .eq("name", name)
            .limit(1);

        if (userError) {
            console.error("Error fetching user:", userError);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!users || users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const employeeId = users[0].employee_id;
        if (!employeeId) {
            return res.status(400).json({ error: "Employee ID not found" });
        }

        const currentDate = new Date().toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }).split("/").reverse().join("-");
        const currentTime = new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour12: false });

        // Check if user has already checked in today
        const { data: attendance, error: attendanceError } = await supabase
            .from("attendance")
            .select("*")
            .eq("employee_id", employeeId)
            .eq("date", currentDate)
            .limit(1);

        if (attendanceError) {
            console.error("Error checking attendance:", attendanceError);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        let status = "Absent";
        if (currentTime >= "09:00:00" && currentTime <= "10:30:00") {
            status = "Present";
        } else if (currentTime > "10:30:00" && currentTime <= "14:30:00") {
            status = "Late";
        }

        if (attendance.length === 0) {
            // First check-in: Insert new attendance record
            const { error: insertError } = await supabase.from("attendance").insert([
                {
                    employee_id: employeeId,
                    date: currentDate,
                    check_in_time: currentTime,
                    check_out_time: null,
                    status: status,
                },
            ]);

            if (insertError) {
                console.error("Error inserting attendance:", insertError);
                return res.status(500).json({ error: "Failed to record attendance" });
            }

            return res.status(200).json({ message: "Check-in recorded successfully" });
        } else {
            // Already checked in: Update check-out time
            const { error: updateError } = await supabase
                .from("attendance")
                .update({ check_out_time: currentTime })
                .eq("employee_id", employeeId)
                .eq("date", currentDate);

            if (updateError) {
                console.error("Error updating check-out time:", updateError);
                return res.status(500).json({ error: "Failed to update check-out time" });
            }

            return res.status(200).json({ message: "Check-out recorded successfully" });
        }
    } catch (error) {
        console.error("Error in attendance route:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Marking absent for employees not present in attendance table for today's date after 2:30pm
async function markAbsentEmployees() {
    const currentDate = new Date().toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }).split("/").reverse().join("-");
    const currentTime = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });

    if (currentTime < "14:30:00") {
        console.log("It's before 2:30pm, not marking absent yet.");
        return;
    }

    // Fetching all users with a non-null employee_id from the "users" table
    const { data: users, error: userError } = await supabase
        .from("users")
        .select("employee_id")
        .not("employee_id", "is", null); // Corrected this line to fetch non-null employee_ids

    if (userError) {
        console.error("Error fetching users:", userError);
        return;
    }

    for (const user of users) {
        const { data: attendance, error: attendanceError } = await supabase
            .from("attendance")
            .select("*")
            .eq("employee_id", user.employee_id)
            .eq("date", currentDate)
            .limit(1);

        if (attendanceError) {
            console.error("Error checking attendance for employee ID:", user.employee_id, attendanceError);
            continue;
        }

        if (attendance.length === 0) {
            // Employee not found in attendance table for today, mark as Absent
            const { error: insertError } = await supabase.from("attendance").insert([
                {
                    employee_id: user.employee_id,
                    date: currentDate,
                    check_in_time: null,
                    check_out_time: null,
                    status: "Absent",
                },
            ]);

            if (insertError) {
                console.error("Error marking employee as Absent:", user.employee_id, insertError);
            }
        }
    }
}
// Get the current time in Kolkata/Asia
const currentTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).toLocaleTimeString('en-GB', { hour12: false });

// Call the function to mark absent employees only after 2:30pm
if (currentTime >= "14:30:00") {
    markAbsentEmployees();
}

app.get("/api/user/history", authenticateToken, async (req, res) => {
    try {
        const { email } = req.user;
        const { data, error } = await supabase
            .from("users")
            .select("employee_id")
            .eq("email", email)
            .limit(1);

        if (error) {
            console.error("Error fetching employee id:", error);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            const employeeId = data[0].employee_id;
            const { data: attendanceData, error: attendanceError } = await supabase
                .from("attendance")
                .select("*")
                .eq("employee_id", employeeId);

            if (attendanceError) {
                console.error("Error fetching attendance:", attendanceError);
                res.status(500).json({ error: "Internal Server Error" });
            } else {
                res.status(200).json(attendanceData);
            }
        }
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/user/attendance", authenticateToken, async (req, res) => {
    try {
        const { email } = req.user;
        const { data, error } = await supabase
            .from("users")
            .select("employee_id, name")
            .eq("email", email)
            .limit(1);

        if (error) {
            console.error("Error fetching employee id:", error);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            const employeeId = data[0].employee_id;
            const { data: attendanceData, error: attendanceError } = await supabase
                .from("attendance")
                .select("*")
                .eq("employee_id", employeeId);

            if (attendanceError) {
                console.error("Error fetching attendance:", attendanceError);
                res.status(500).json({ error: "Internal Server Error" });
            } else {
                res.status(200).json(attendanceData);
            }
        }
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/attendance", async (req, res) => {
    try {
        const { employee_id, name, department, designation, date } = req.query;

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];
        const selectedDate = date || today;

        let userQuery = supabase.from("users").select("employee_id, name, designation, department, profilePhoto");

        // Apply filters on users table first
        if (employee_id) userQuery = userQuery.eq("employee_id", employee_id);
        if (department) userQuery = userQuery.eq("department", department);
        if (designation) userQuery = userQuery.eq("designation", designation);
        if (name) userQuery = userQuery.ilike("name", `%${name}%`); // Case-insensitive search

        const { data: usersData, error: usersError } = await userQuery;

        if (usersError) {
            console.error("Error fetching users:", usersError);
            return res.status(500).json({ error: "Error fetching users data." });
        }

        // Get the employee IDs from the filtered users
        const employeeIds = usersData.map(user => user.employee_id);

        if (employeeIds.length === 0) {
            return res.status(200).json([]); // If no users match, return empty response
        }

        let attendanceQuery = supabase.from("attendance").select("*").eq("date", selectedDate).in("employee_id", employeeIds);

        const { data: attendanceData, error: attendanceError } = await attendanceQuery;

        if (attendanceError) {
            console.error("Error fetching attendance:", attendanceError);
            return res.status(500).json({ error: "Error fetching attendance records." });
        }

        if (!attendanceData || attendanceData.length === 0) {
            return res.status(200).json([]); // Return empty array if no records found
        }

        // Merge attendance data with user details
        const attendanceWithUserData = attendanceData.map(attendanceEntry => {
            const user = usersData.find(userEntry => userEntry.employee_id === attendanceEntry.employee_id);
            return { ...attendanceEntry, ...user };
        });

        res.status(200).json(attendanceWithUserData);
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/attendance/all", async (req, res) => {
    try {
        // Fetch all attendance records
        const { data: attendanceData, error: attendanceError } = await supabase
            .from("attendance")
            .select("*");

        if (attendanceError) {
            console.error("Error fetching attendance data:", attendanceError);
            return res.status(500).json({ error: "Error fetching attendance records." });
        }

        // If no records found, return an empty array
        if (!attendanceData || attendanceData.length === 0) {
            return res.status(200).json([]); // Return empty array if no records found
        }

        // Fetch user details for each attendance record
        const employeeIds = attendanceData.map(entry => entry.employee_id);
        const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("employee_id, name, department, designation")
            .in("employee_id", employeeIds);

        if (usersError) {
            console.error("Error fetching user data:", usersError);
            return res.status(500).json({ error: "Error fetching user details." });
        }

        // Merge attendance data with user details
        const attendanceWithUserData = attendanceData.map(attendanceEntry => {
            const user = usersData.find(userEntry => userEntry.employee_id === attendanceEntry.employee_id);
            return { ...attendanceEntry, ...user };
        });

        // Group data by date
        const groupedData = attendanceWithUserData.reduce((acc, entry) => {
            const entryDate = new Date(entry.date).toLocaleDateString(); // Format date as needed
            if (!acc[entryDate]) {
                acc[entryDate] = [];
            }
            acc[entryDate].push(entry);
            return acc;
        }, {});

        // Prepare the response
        res.status(200).json(groupedData);
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Add this endpoint to your existing Express server code
app.get("/api/attendance/employee/:employeeId", async (req, res) => {
    try {
        const { employeeId } = req.params;

        // Fetch attendance records for the specified employee
        const { data: attendanceData, error: attendanceError } = await supabase
            .from("attendance")
            .select("*")
            .eq("employee_id", employeeId);

        if (attendanceError) {
            console.error("Error fetching attendance data:", attendanceError);
            return res.status(500).json({ error: "Error fetching attendance records." });
        }

        // If no records found, return an empty array
        if (!attendanceData || attendanceData.length === 0) {
            return res.status(200).json([]); // Return empty array if no records found
        }

        // Fetch user details for the specified employee
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("name")
            .eq("employee_id", employeeId)
            .single();

        if (userError) {
            console.error("Error fetching user data:", userError);
            return res.status(500).json({ error: "Error fetching user details." });
        }

        // Prepare the response data
        const responseData = attendanceData.map(entry => ({
            employee_id: entry.employee_id,
            date: entry.date,
            check_in_time: entry.check_in_time,
            check_out_time: entry.check_out_time,
            status: entry.status,
        }));

        res.status(200).json({ name: userData.name, attendance: responseData });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/admin/attendance/:employeeId", async (req, res) => {
    try {
        const { data: attendanceData, error: attendanceError } = await supabase
            .from("attendance")
            .select("*")
            .eq("employee_id", req.params.employeeId);

        if (attendanceError) {
            console.error("Error fetching attendance:", attendanceError);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("name")
                .eq("employee_id", req.params.employeeId);

            if (userError) {
                console.error("Error fetching user data:", userError);
                res.status(500).json({ error: "Internal Server Error" });
            } else {
                const attendanceWithUserData = attendanceData.map(attendanceEntry => {
                    const user = userData[0];
                    return { ...attendanceEntry, name: user.name };
                });
                res.status(200).json(attendanceWithUserData);
            }
        }
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/bar/attendance", async (req, res) => {
    try {
        const { data: attendanceData, error: attendanceError } = await supabase
            .from("attendance")
            .select("check_in_time, check_out_time, status, employee_id, date");

        if (attendanceError) {
            console.error("Error fetching attendance:", attendanceError);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.status(200).json(attendanceData);
        }
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// User logout
app.post("/logout", (req, res) => {
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
    res.redirect("/");
});

// Catch-all route to serve the frontend
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start the server
app.listen(3000, () => console.log("Server started on port 3000"));

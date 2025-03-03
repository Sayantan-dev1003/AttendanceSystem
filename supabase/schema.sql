CREATE TABLE users (
    id SERIAL PRIMARY KEY,  
    employee_id VARCHAR(50) UNIQUE NOT NULL,      
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL, 
    phone VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    profilePhoto TEXT,            
    password TEXT NOT NULL,   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,  
    employee_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    check_in_time TIME NOT NULL,
    check_out_time TIME,
    status VARCHAR(10) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
    FOREIGN KEY (employee_id) REFERENCES users(employee_id) ON DELETE CASCADE
);
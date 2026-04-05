// User Model - Stores user data in JSON file
const fs = require('fs');
const path = require('path');

// Path to the JSON file
const dbPath = path.join(__dirname, '../database/users.json');

// Function to read all users from JSON file
const getAllUsers = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

// Function to write users to JSON file
const saveUsers = (users) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
};

// Function to find user by email
const findUserByEmail = (email) => {
  const users = getAllUsers();
  return users.find((user) => user.email === email);
};

// Function to find user by ID
const findUserById = (id) => {
  const users = getAllUsers();
  return users.find((user) => user.id === parseInt(id));
};

// Function to create a new user
const createUser = (userData) => {
  const users = getAllUsers();

  // Generate next ID
  const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;

  const newUser = {
    id: maxId + 1,
    name: userData.name,
    email: userData.email,
    password: userData.password, // Note: In production, never store plain passwords!
    userType: userData.userType, // 'student' or 'recruiter'
    resume: userData.resume || '',
    phone: userData.phone || '',
    companyName: userData.companyName || '',
    companyWebsite: userData.companyWebsite || '',
    createdAt: new Date().toISOString().split('T')[0],
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
};

// Function to update user
const updateUser = (id, updateData) => {
  const users = getAllUsers();
  const userIndex = users.findIndex((user) => user.id === parseInt(id));

  if (userIndex === -1) return null;

  users[userIndex] = {
    ...users[userIndex],
    ...updateData,
    id: users[userIndex].id, // Don't change ID
    email: users[userIndex].email, // Don't change email
  };

  saveUsers(users);
  return users[userIndex];
};

// Export all functions
module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  getAllUsers,
  saveUsers,
};

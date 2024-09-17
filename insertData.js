// const mongoose = require('mongoose');
// const User = require('./models/User'); // Adjust the path if necessary

// // Connect to MongoDB
// mongoose.connect('mongodb+srv://abdusshahid11399:3QppeRMJJ15VCkwE@cluster0.w3xas7k.mongodb.net/mydatabase2?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log('MongoDB connected');
//     // Insert data
//     insertUser();
//   })
//   .catch(err => console.log(err));

// const insertUser = async () => {
//   try {
//     const user = new User({
//       username: 'exampleUser',
//       password: 'examplePassword' // Make sure to hash the password in a real application
//     });

//     // Save user to the database
//     await user.save();
//     console.log('User inserted successfully');

//     // Close connection
//     mongoose.connection.close();
//   } catch (err) {
//     console.error('Error inserting user:', err);
//   }
// };

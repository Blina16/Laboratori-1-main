const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testStudents() {
  console.log('Testing Students CRUD...');
  try {
    // Create
    const studentData = {
      first_name: 'Test',
      last_name: 'Student',
      email: `test.student.${Date.now()}@example.com`
    };
    const createRes = await axios.post(`${API_URL}/students`, studentData);
    console.log('Create Student:', createRes.status === 201 ? 'PASS' : 'FAIL', createRes.data);
    const studentId = createRes.data.id;

    // Read
    const getRes = await axios.get(`${API_URL}/students`);
    console.log('Get Students:', getRes.status === 200 ? 'PASS' : 'FAIL', `Count: ${getRes.data.length}`);

    // Update
    const updateRes = await axios.put(`${API_URL}/students/${studentId}`, {
      first_name: 'Updated',
      last_name: 'Student',
      email: studentData.email
    });
    console.log('Update Student:', updateRes.status === 200 ? 'PASS' : 'FAIL', updateRes.data);

    // Delete
    const deleteRes = await axios.delete(`${API_URL}/students/${studentId}`);
    console.log('Delete Student:', deleteRes.status === 200 ? 'PASS' : 'FAIL');

  } catch (error) {
    console.error('Student CRUD Error:', error.response ? error.response.data : error.message);
  }
}

async function testTutors() {
  console.log('\nTesting Tutors CRUD...');
  try {
    // Create
    const tutorData = {
      name: 'Test',
      surname: 'Tutor',
      bio: 'A test tutor',
      rate: 50
    };
    const createRes = await axios.post(`${API_URL}/tutors`, tutorData);
    console.log('Create Tutor:', createRes.status === 201 ? 'PASS' : 'FAIL', createRes.data);
    const tutorId = createRes.data.id;

    // Read
    const getRes = await axios.get(`${API_URL}/tutors`);
    console.log('Get Tutors:', getRes.status === 200 ? 'PASS' : 'FAIL', `Count: ${getRes.data.length}`);

    // Update
    const updateRes = await axios.put(`${API_URL}/tutors/${tutorId}`, {
      name: 'Updated',
      surname: 'Tutor',
      bio: 'Updated bio',
      rate: 60
    });
    console.log('Update Tutor:', updateRes.status === 200 ? 'PASS' : 'FAIL', updateRes.data);

    // Delete
    const deleteRes = await axios.delete(`${API_URL}/tutors/${tutorId}`);
    console.log('Delete Tutor:', deleteRes.status === 200 ? 'PASS' : 'FAIL');

  } catch (error) {
    console.error('Tutor CRUD Error:', error.response ? error.response.data : error.message);
  }
}

async function run() {
  await testStudents();
  await testTutors();
}

run();

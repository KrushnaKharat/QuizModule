import React, { useEffect, useState } from "react";
import axios from "axios";

function Users({ token }) {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    courses: [],
  });

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState({
    id: null,
    name: "",
    email: "",
    courses: [],
  });

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const fetchUsers = () => {
    axios
      .get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data));
  };

  const fetchCourses = () => {
    axios
      .get("http://localhost:5000/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourses(res.data));
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5000/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => fetchUsers());
  };

  const handleAdd = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5000/api/auth/register", newUser).then(() => {
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "user",
        courses: [],
      });
      fetchUsers();
    });
  };

  // Multi-select handler for add
  const handleCourseSelect = (e) => {
    const options = Array.from(e.target.selectedOptions).map((opt) =>
      Number(opt.value)
    );
    setNewUser({ ...newUser, courses: options });
  };

  // Multi-select handler for edit
  const handleEditCourseSelect = (e) => {
    const options = Array.from(e.target.selectedOptions).map((opt) =>
      Number(opt.value)
    );
    setEditUser({ ...editUser, courses: options });
  };

  // Open edit modal and fetch user's courses
  const openEditModal = (user) => {
    axios
      .get(`http://localhost:5000/api/auth/users/${user.id}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setEditUser({
          id: user.id,
          name: user.name,
          email: user.email,
          courses: res.data.map((c) => Number(c.id)),
        });
        setEditModalOpen(true);
      });
  };

  // Handle edit submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    axios
      .put(
        `http://localhost:5000/api/auth/users/${editUser.id}`,
        {
          name: editUser.name,
          email: editUser.email,
          courses: editUser.courses,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setEditModalOpen(false);
        fetchUsers();
      });
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">All Users</h2>
      <form className="mb-4 flex gap-2" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="user">Student</option>
          <option value="admin">Admin</option>
        </select>
        <select
          multiple
          value={newUser.courses}
          onChange={handleCourseSelect}
          className="border p-2 rounded"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add User
        </button>
      </form>
      <table className="w-full bg-white rounded shadow mb-8">
        <thead>
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Courses</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.role}</td>
              <td className="p-2 border">
                <UserCourses userId={user.id} token={token} />
              </td>
              <td className="p-2 border flex gap-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => openEditModal(user)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(user.id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                value={editUser.name}
                onChange={(e) =>
                  setEditUser({ ...editUser, name: e.target.value })
                }
                className="border p-2 rounded"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
                className="border p-2 rounded"
                required
              />
              <select
                multiple
                value={editUser.courses}
                onChange={handleEditCourseSelect}
                className="border p-2 rounded"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component to show user's courses
function UserCourses({ userId, token }) {
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/auth/users/${userId}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourses(res.data));
  }, [userId, token]);
  return <span>{courses.map((c) => c.title).join(", ")}</span>;
}

export default Users;

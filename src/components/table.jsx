/*
========================================================
Firebase Realtime Database — Full CRUD Guide
========================================================

This file contains:

✔ Firebase CRUD
✔ Create
✔ Read (Realtime)
✔ Read (One Time)
✔ Update
✔ Delete
✔ Query
✔ Validation
✔ Snapshot
✔ Auto ID
✔ Table Edit
✔ Error Handling

All demonstrated together
*/

import { useEffect, useState } from "react";

// Firebase config
import { db } from "../firebase/config.js";

// Firebase database functions
import {
    ref,
    set,
    update,
    remove,
    push,
    onValue,
    get,
    child,
    query,
    orderByChild,
    equalTo,
    limitToFirst
} from "firebase/database";

function Table({ user }) {

    // Azerbaijan cities list
    const cities = [
        "Baku",
        "Ganja",
        "Sumgait",
        "Mingachevir",
        "Lankaran",
        "Shirvan",
        "Quba",
        "Shaki",
        "Qabala",
        "Khankendi"
    ];

    /*
    ========================================
    STATE
    ========================================
    */

    // Users from database
    const [users, setUsers] = useState({});

    // Form for creating new users
    const [form, setForm] = useState({
        name: "",
        age: "",
        city: ""
    });

    // Edit mode state
    const [editId, setEditId] = useState(null);

    const [editData, setEditData] = useState({
        name: "",
        age: "",
        city: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    /*
    ========================================
    READ (REALTIME)
    ========================================
    */

    useEffect(() => {

        const usersRef = ref(db, "users");

        // Realtime listening
        onValue(usersRef, (snapshot) => {

            const data = snapshot.val();
            setUsers(data || {});

        });

    }, []);

    /*
    ========================================
    CREATE
    ========================================
    */

    const handleCreate = () => {

        // Check if user is logged in
        if (!user) {
            alert("Please sign in with Google to add data");
            return;
        }

        // Form validation
        if (!form.name || !form.age || !form.city) {
            alert("Please fill all fields");
            return;
        }

        // Age validation (must be > 18)
        const age = Number(form.age);
        if (age < 18) {
            alert("Age must be greater than 18");
            return;
        }

        try {
            const usersRef = ref(db, "users");

            // Auto ID generation with push
            push(usersRef, {
                name: form.name,
                age: age,
                city: form.city,
                createdAt: Date.now(),
                createdBy: user.uid || null
            });

            // Clear form
            setForm({
                name: "",
                age: "",
                city: ""
            });
        } catch (error) {
            alert("ERROR: Failed to add data - " + (error.message || "Unknown error"));
            console.error("Create error:", error);
        }

    };

    /*
    ========================================
    UPDATE
    ========================================
    */

    const handleUpdate = (id) => {

        if (!user) {
            alert("Please sign in with Google to edit data");
            return;
        }

        // Age validation (must be > 18)
        const age = Number(editData.age);
        if (age <= 18) {
            alert("Age must be greater than 18");
            return;
        }

        try {
            const userRef = ref(db, `users/${id}`);

            update(userRef, {
                name: editData.name,
                age: age,
                city: editData.city,
                updatedAt: Date.now(),
                updatedBy: user.uid || null
            });

            setEditId(null);
            setEditData({ name: "", age: "", city: "" });
        } catch (error) {
            alert("ERROR: Failed to update data - " + (error.message || "Unknown error"));
            console.error("Update error:", error);
        }

    };

    /*
    ========================================
    DELETE
    ========================================
    */

    const handleDelete = (id) => {

        if (!user) {
            alert("Please sign in with Google to delete data");
            return;
        }

        if (window.confirm("Are you sure? This action cannot be undone.")) {
            try {
                const userRef = ref(db, `users/${id}`);
                remove(userRef);
            } catch (error) {
                alert("ERROR: Failed to delete data - " + (error.message || "Unknown error"));
                console.error("Delete error:", error);
            }
        }

    };

    /*
    ========================================
    EDIT MODE
    ========================================
    */

    const handleEdit = (id, userData) => {

        setEditId(id);

        setEditData({
            name: userData.name,
            age: userData.age,
            city: userData.city
        });

    };

    /*
    ========================================
    ONE TIME FETCH
    ========================================
    */

    const handleGetOnce = async () => {

        const snapshot = await get(ref(db, "users"));

        if (snapshot.exists()) {
            console.log("One time fetch:", snapshot.val());
        }

    };

    /*
    ========================================
    PAGINATION LOGIC
    ========================================
    */

    const userEntries = Object.entries(users);
    const totalPages = Math.ceil(userEntries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = userEntries.slice(startIndex, endIndex);

    /*
    ========================================
    QUERY (FILTER)
    ========================================
    */

    const handleQuery = () => {

        const q = query(
            ref(db, "users"),
            orderByChild("age"),
            equalTo(23)
        );

        onValue(q, (snapshot) => {

            console.log("Query result:", snapshot.val());

        });

    };

    /*
    ========================================
    LIMIT QUERY
    ========================================
    */

    const handleLimit = () => {

        const q = query(
            ref(db, "users"),
            limitToFirst(3)
        );

        onValue(q, (snapshot) => {
            console.log("Limit:", snapshot.val());
        });

    };

    /*
    ========================================
    UI
    ========================================
    */

    return (

        <div className="p-4">

            <h2 className="text-xl mb-3">Firebase Full CRUD {user ? "(Logged In)" : "(Login Required)"}</h2>

            {!user && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded mb-4">
                    <strong>Edit/Delete</strong> requires Google sign in!
                </div>
            )}

            {/* CREATE FORM */}

            <div className="space-x-2 mb-4">

                <input placeholder="Name" value={form.name}
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    } className="border p-1" />

                <input placeholder="Age (must be > 18)" value={form.age} type="number" min="18" max="100"
                    onChange={(e) => setForm({ ...form, age: e.target.value })} className="border p-1" />

                <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="border p-1" >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>

                <button onClick={handleCreate} disabled={!user}
                    className="bg-green-500 text-white p-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600">
                    Add
                </button>

            </div>

            {/* EXTRA BUTTONS */}

            <div className="space-x-2 mb-4">

                <button onClick={handleGetOnce} className="bg-blue-500 text-white p-1 hover:bg-blue-600">
                    One Time Fetch
                </button>

                <button onClick={handleQuery} className="bg-purple-500 text-white p-1 hover:bg-purple-600">
                    Query Age 23
                </button>

                <button onClick={handleLimit} className="bg-gray-500 text-white p-1 hover:bg-gray-600">
                    Limit 3
                </button>

            </div>

            {/* TABLE */}

            <table className="border w-full">
                <thead>
                    <tr>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Age</th>
                        <th className="border p-2">City</th>
                        <th className="border p-2">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {
                        paginatedUsers.map(([id, userData]) => (
                            <tr key={id}>
                                <td className="border p-2">
                                    {
                                        editId === id
                                            ? (
                                                <input
                                                    value={editData.name}
                                                    onChange={(e) =>
                                                        setEditData({
                                                            ...editData,
                                                            name: e.target.value
                                                        })
                                                    }
                                                    className="border p-1"
                                                />
                                            )
                                            : userData.name
                                    }
                                </td>

                                <td className="border p-2">
                                    {
                                        editId === id
                                            ? (
                                                <input
                                                    type="number"
                                                    min="19"
                                                    max="120"
                                                    value={editData.age}
                                                    onChange={(e) =>
                                                        setEditData({
                                                            ...editData,
                                                            age: e.target.value
                                                        })
                                                    }
                                                    className="border p-1"
                                                />
                                            )
                                            : userData.age
                                    }
                                </td>

                                <td className="border p-2">
                                    {
                                        editId === id
                                            ? (
                                                <select
                                                    value={editData.city}
                                                    onChange={(e) =>
                                                        setEditData({
                                                            ...editData,
                                                            city: e.target.value
                                                        })
                                                    }
                                                    className="border p-1"
                                                >
                                                    <option value="">Select</option>
                                                    {cities.map((city) => (
                                                        <option key={city} value={city}>
                                                            {city}
                                                        </option>
                                                    ))}
                                                </select>
                                            )
                                            : userData.city
                                    }
                                </td>

                                <td className="border p-2">
                                    {
                                        editId === id
                                            ? (
                                                <button
                                                    onClick={() => handleUpdate(id)}
                                                    className="bg-blue-500 text-white p-1 hover:bg-blue-600"
                                                >
                                                    Save
                                                </button>
                                            )
                                            : (
                                                <button
                                                    onClick={() => handleEdit(id, userData)}
                                                    disabled={!user}
                                                    className="bg-yellow-500 text-white p-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-600"
                                                >
                                                    Edit
                                                </button>
                                            )
                                    }
                                    {editId === id && (
                                        <button
                                            onClick={() => setEditId(null)}
                                            className="bg-gray-500 text-white p-1 ml-2 hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(id)} disabled={!user}
                                        className="bg-red-500 text-white p-1 ml-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

            {/* PAGINATION */}
            <div className="flex justify-center items-center gap-2 mt-4">
                <button onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    setEditId(null);
                }} disabled={currentPage === 1} className="bg-gray-500 text-white p-2 disabled:opacity-50 hover:bg-gray-600">
                    Previous
                </button>

                <span className="px-4 py-2">
                    Page {currentPage} / {totalPages}
                </span>

                <button onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    setEditId(null);
                }} disabled={currentPage === totalPages} className="bg-gray-500 text-white p-2 disabled:opacity-50 hover:bg-gray-600" >
                    Next
                </button>
            </div>
        </div>

    );

}

export default Table;

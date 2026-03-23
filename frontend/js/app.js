const API_URL = 'http://localhost:5001/api';

function getToken() {
    const user = JSON.parse(localStorage.getItem('bicycle_user'));
    return user ? user.token : null;
}

function getUser() {
    return JSON.parse(localStorage.getItem('bicycle_user'));
}

function logout() {
    localStorage.removeItem('bicycle_user');
    window.location.href = 'index.html';
}

function updateNavbar() {
    const navLinks = document.getElementById('nav-links');
    const user = getUser();
    
    if (user) {
        if(user.role === 'admin') {
            navLinks.innerHTML += `
                <li class="nav-item"><a class="nav-link fw-bold text-primary" href="admin.html">Admin Dashboard</a></li>
            `;
        }
        navLinks.innerHTML += `
            <li class="nav-item"><a class="nav-link" href="bookings.html">My Bookings</a></li>
            <li class="nav-item"><a class="nav-link text-danger fw-bold" href="#" onclick="logout()">Logout</a></li>
        `;
    } else {
        navLinks.innerHTML += `
            <li class="nav-item"><a class="nav-link btn btn-outline-primary ms-2 rounded-pill px-3 pb-1 pt-1 mt-1" href="login.html">Login</a></li>
        `;
    }
}

if (document.getElementById('nav-links')) {
    updateNavbar();
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('bicycle_user', JSON.stringify(data));
                window.location.href = data.role === 'admin' ? 'admin.html' : 'index.html';
            } else {
                errorDiv.textContent = data.message;
                errorDiv.classList.remove('d-none');
            }
        } catch (err) {
            errorDiv.textContent = 'Server error. Try again.';
            errorDiv.classList.remove('d-none');
        }
    });

    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const errorDiv = document.getElementById('reg-error');

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('bicycle_user', JSON.stringify(data));
                window.location.href = 'index.html';
            } else {
                errorDiv.textContent = data.message;
                errorDiv.classList.remove('d-none');
            }
        } catch (err) {
            errorDiv.textContent = 'Server error. Try again.';
            errorDiv.classList.remove('d-none');
        }
    });
}

async function fetchBicycles(search = '', type = '') {
    const container = document.getElementById('bicycles-container');
    const loading = document.getElementById('loading');
    if (!container) return;

    loading.classList.remove('d-none');
    container.innerHTML = '';

    try {
        let query = `${API_URL}/bicycles?`;
        if (search) query += `search=${encodeURIComponent(search)}&`;
        if (type) query += `type=${encodeURIComponent(type)}`;

        const res = await fetch(query);
        const bicycles = await res.json();
        loading.classList.add('d-none');

        if (bicycles.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-5">No bicycles found.</div>';
            return;
        }

        bicycles.forEach(bike => {
            const imgSrc = bike.image.startsWith('http') ? bike.image : 'http://localhost:5001' + bike.image;
            container.innerHTML += `
                <div class="col-md-4 col-sm-6 mb-4">
                    <div class="card bicycle-card h-100 shadow-sm border-0">
                        <img src="${imgSrc}" class="card-img-top bicycle-img" alt="${bike.name}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title fw-bold text-dark">${bike.name}</h5>
                            <p class="card-text text-muted mb-2"><span class="badge bg-secondary">${bike.type}</span></p>
                            <h4 class="text-primary fw-bold mt-2">$${bike.price} <small class="text-muted fs-6 fw-normal">/ day</small></h4>
                            <div class="mt-auto pt-3">
                                <a href="bicycle-details.html?id=${bike.id}" class="btn btn-outline-primary w-100 fw-bold">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        loading.classList.add('d-none');
        container.innerHTML = '<div class="col-12 text-danger text-center py-5">Failed to load bicycles. Check if server is running.</div>';
    }
}

async function fetchBicycleDetails() {
    const container = document.getElementById('details-container');
    const loading = document.getElementById('loading');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        container.innerHTML = '<div class="col-12 text-danger py-5 text-center">Invalid bicycle ID</div>';
        container.classList.remove('d-none');
        return;
    }

    loading.classList.remove('d-none');

    try {
        const res = await fetch(`${API_URL}/bicycles/${id}`);
        if (!res.ok) throw new Error('Not found');
        const bike = await res.json();
        loading.classList.add('d-none');

        const imgSrc = bike.image.startsWith('http') ? bike.image : 'http://localhost:5001' + bike.image;

        container.innerHTML = `
            <div class="col-md-6 p-0">
                <img src="${imgSrc}" class="img-fluid h-100 w-100 object-fit-cover" alt="${bike.name}" style="min-height: 400px;">
            </div>
            <div class="col-md-6 p-5 d-flex flex-column justify-content-center">
                <span class="badge bg-secondary align-self-start mb-3 fs-6">${bike.type}</span>
                <h2 class="fw-bold mb-3">${bike.name}</h2>
                <h3 class="text-primary fw-bold mb-4">$${bike.price} <span class="text-muted fs-5 fw-normal">/ day</span></h3>
                <p class="text-muted mb-4 lh-lg">Experience the ultimate ride with this top-quality ${bike.type.toLowerCase()} bicycle. Perfect for your next adventure or daily commute. Built with premium materials for maximum comfort and durability.</p>
                
                <div class="card bg-light border-0 p-4 mb-4 shadow-sm">
                    <h5 class="fw-bold mb-3">Rent this Bicycle</h5>
                    <form id="rent-form">
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-bold">Select Date</label>
                            <input type="date" class="form-control form-control-lg" id="rent-date" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold py-2">Book Now</button>
                    </form>
                    <div id="rent-msg" class="mt-3 text-center fw-bold d-none p-2 rounded"></div>
                </div>
            </div>
        `;
        container.classList.remove('d-none');

        document.getElementById('rent-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const date = document.getElementById('rent-date').value;
            const user = getUser();
            const msgDiv = document.getElementById('rent-msg');

            if (!user) {
                window.location.href = 'login.html';
                return;
            }

            try {
                const rentRes = await fetch(`${API_URL}/bookings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ bicycle_id: id, date })
                });

                const rentData = await rentRes.json();
                msgDiv.classList.remove('d-none', 'bg-danger', 'bg-success', 'text-white');

                if (rentRes.ok) {
                    msgDiv.textContent = 'Booking successful! Check your bookings.';
                    msgDiv.classList.add('bg-success', 'text-white');
                } else {
                    msgDiv.textContent = rentData.message;
                    msgDiv.classList.add('bg-danger', 'text-white');
                }
            } catch (err) {
                msgDiv.textContent = 'Server error.';
                msgDiv.classList.remove('d-none');
                msgDiv.classList.add('bg-danger', 'text-white');
            }
        });

    } catch (err) {
        loading.classList.add('d-none');
        container.innerHTML = '<div class="col-12 py-5 text-danger text-center fw-bold">Bicycle not found</div>';
        container.classList.remove('d-none');
    }
}

async function fetchMyBookings() {
    const tbody = document.getElementById('bookings-body');
    const loading = document.getElementById('loading');
    const msg = document.getElementById('bookings-message');
    const tableContainer = document.getElementById('bookings-table-container');
    if (!tbody) return;

    loading.classList.remove('d-none');
    tableContainer.classList.add('d-none');

    try {
        const res = await fetch(`${API_URL}/bookings/mybookings`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const bookings = await res.json();
        loading.classList.add('d-none');

        if (bookings.length === 0) {
            msg.classList.remove('d-none');
            return;
        }

        tableContainer.classList.remove('d-none');
        tbody.innerHTML = '';
        bookings.forEach(b => {
            const statusBadge = 
                b.status === 'pending' ? 'bg-warning text-dark' :
                b.status === 'approved' ? 'bg-success' :
                b.status === 'completed' ? 'bg-primary' : 'bg-danger';

            const formattedDate = new Date(b.date).toLocaleDateString();
            const imgSrc = b.bicycle_image.startsWith('http') ? b.bicycle_image : 'http://localhost:5001' + b.bicycle_image;

            tbody.innerHTML += `
                <tr class="align-middle">
                    <td><img src="${imgSrc}" alt="Bike" style="width: 80px; height: 50px; object-fit: cover; border-radius: 5px;" class="shadow-sm"></td>
                    <td class="fw-bold">${b.bicycle_name}</td>
                    <td>${formattedDate}</td>
                    <td class="text-primary fw-bold">$${b.price}</td>
                    <td><span class="badge ${statusBadge}">${b.status.toUpperCase()}</span></td>
                    <td class="text-center">
                        ${b.status === 'pending' ? `<button class= onclick=>Cancel</button>` : `<span class=>-</span>`}
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        loading.classList.add('d-none');
        msg.textContent = 'Error loading bookings.';
        msg.classList.remove('d-none');
        msg.classList.add('alert-danger');
    }
}

async function adminFetchBicycles() {
    const tbody = document.getElementById('admin-bicycles-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/bicycles`);
        const bicycles = await res.json();
        
        tbody.innerHTML = '';
        bicycles.forEach(b => {
            const imgSrc = b.image.startsWith('http') ? b.image : 'http://localhost:5001' + b.image;
            tbody.innerHTML += `
                <tr class="align-middle">
                    <td class="text-muted fw-bold">#${b.id}</td>
                    <td><img src="${imgSrc}" alt="Bike" style="width: 60px; height: 40px; object-fit: cover; border-radius:4px" class="shadow-sm"></td>
                    <td class="fw-bold">${b.name}</td>
                    <td><span class="badge bg-secondary">${b.type}</span></td>
                    <td class="text-primary fw-bold">$${b.price}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger fw-bold" onclick="deleteBicycle(${b.id})">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error(err);
    }
}

async function adminFetchBookings() {
    const tbody = document.getElementById('admin-bookings-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const bookings = await res.json();

        tbody.innerHTML = '';
        bookings.forEach(b => {
            const formattedDate = new Date(b.date).toLocaleDateString();
            tbody.innerHTML += `
                <tr class="align-middle">
                    <td class="text-muted fw-bold">#${b.id}</td>
                    <td><span class="fw-bold">${b.user_name}</span> <br><small class="text-muted">${b.user_email}</small></td>
                    <td class="fw-bold text-primary">${b.bicycle_name}</td>
                    <td>${formattedDate}</td>
                    <td>
                        <select class="form-select form-select-sm status-select shadow-sm" data-id="${b.id}">
                            <option value="pending" ${b.status==='pending'?'selected':''}>Pending</option>
                            <option value="approved" ${b.status==='approved'?'selected':''}>Approved</option>
                            <option value="rejected" ${b.status==='rejected'?'selected':''}>Rejected</option>
                            <option value="completed" ${b.status==='completed'?'selected':''}>Completed</option>
                        </select>
                    </td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger fw-bold" onclick="deleteBooking(${b.id}, 'admin')">Delete</button>
                    </td>
                </tr>
            `;
        });

        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const status = e.target.value;
                await updateBookingStatus(id, status);
            });
        });
    } catch (err) {
        console.error(err);
    }
}

async function updateBookingStatus(id, status) {
    try {
        await fetch(`${API_URL}/bookings/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ status })
        });
    } catch (err) {
        console.error(err);
    }
}

async function deleteBooking(id, role) {
    if (!confirm('Are you sure you want to delete/cancel this booking?')) return;
    try {
        await fetch(`${API_URL}/bookings/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (role === 'admin') adminFetchBookings();
        else fetchMyBookings();
    } catch (err) {
        console.error(err);
    }
}

async function deleteBicycle(id) {
    if (!confirm('Are you sure you want to delete this bicycle?')) return;
    try {
        await fetch(`${API_URL}/bicycles/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        adminFetchBicycles();
    } catch (err) {
        console.error(err);
    }
}

const addBicycleForm = document.getElementById('add-bicycle-form');
if (addBicycleForm) {
    addBicycleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('add-name').value;
        const type = document.getElementById('add-type').value;
        const price = document.getElementById('add-price').value;
        const image = document.getElementById('add-image').value;
        const errorDiv = document.getElementById('add-error');

        try {
            const res = await fetch(`${API_URL}/bicycles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ name, type, price, image })
            });

            if (res.ok) {
                document.querySelector('#addBicycleModal .btn-close').click();
                addBicycleForm.reset();
                errorDiv.classList.add('d-none');
                adminFetchBicycles();
            } else {
                const data = await res.json();
                errorDiv.textContent = data.message;
                errorDiv.classList.remove('d-none');
            }
        } catch (err) {
            errorDiv.textContent = 'Server error.';
            errorDiv.classList.remove('d-none');
        }
    });
}

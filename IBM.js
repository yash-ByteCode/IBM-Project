if (!window.__dnb_initialized) {
    window.__dnb_initialized = true;

    window.ADMIN_PASSWORD = window.ADMIN_PASSWORD || "admin123";
    window.isAdminAuthenticated = window.isAdminAuthenticated || false;
    window.deleteId = window.deleteId || null;

    window.notices = window.notices || JSON.parse(localStorage.getItem("secure_notices_db")) || [
        {
            id: 1,
            title: "Welcome to Digital Notice Board",
            content: "You can filter notices, search them or login as admin to manage content.",
            category: "general",
            timestamp: "Jan 09, 11:00 PM"
        }
    ];

    window.currentMode = window.currentMode || "user";

    function showToast(msg) {
        const t = document.getElementById("toast");
        if (!t) return;
        t.innerText = msg;
        t.classList.add("show");
        setTimeout(() => t.classList.remove("show"), 3000);
    }

    function saveData() {
        localStorage.setItem("secure_notices_db", JSON.stringify(window.notices));
    }

    function renderNotices() {
        const noticeList = document.getElementById("noticeList");
        if (!noticeList) return;

        const searchInput = document.getElementById('searchInput');
        const filterSelect = document.getElementById('filterSelect');
        const search = searchInput ? searchInput.value.toLowerCase() : '';
        const filter = filterSelect ? filterSelect.value : 'all';

        noticeList.innerHTML = '';

        const filtered = window.notices.filter(n => {
            const matchSearch = n.title.toLowerCase().includes(search) || n.content.toLowerCase().includes(search);
            const matchFilter = filter === 'all' || n.category === filter;
            return matchSearch && matchFilter;
        });

        filtered.forEach(n => {
            const div = document.createElement("div");
            div.className = `notice-card ${n.category}`;
            div.innerHTML = `
                <span class="badge badge-${n.category}">${n.category}</span>
                <h3>${n.title}</h3>
                <p>${n.content}</p>
                <div class="card-footer">
                    <span class="timestamp">${n.timestamp}</span>
                    ${window.currentMode === "admin" ? `<button onclick="editNotice(${n.id})">Edit</button><button onclick="openDeleteModal(${n.id})">Delete</button>` : ``}
                </div>`;
            noticeList.appendChild(div);
        });
    }

    function handleAdminNav() {
        if (window.isAdminAuthenticated) showView('admin');
        else openLogin();
    }

    function openLogin() {
        const m = document.getElementById("loginModal");
        if (!m) return;
        m.style.display = "flex";
        const p = document.getElementById("passwordInput");
        if (p) p.focus();
    }

    function closeLogin() {
        const m = document.getElementById("loginModal");
        if (!m) return;
        m.style.display = "none";
        const p = document.getElementById("passwordInput");
        if (p) p.value = "";
    }

    function verifyPassword() {
        const input = document.getElementById("passwordInput");
        if (!input) return;
        if (input.value === window.ADMIN_PASSWORD) {
            window.isAdminAuthenticated = true;
            closeLogin();
            showView("admin");
            showToast("🔓 Login Successful");
        } else {
            showToast("❌ Wrong Password");
        }
    }

    function logoutAdmin() {
        window.isAdminAuthenticated = false;
        showView('user');
        showToast('🔒 Logged Out');
    }

    function showView(mode) {
        window.currentMode = mode;
        const userBtn = document.getElementById("userNavBtn");
        const adminBtn = document.getElementById("adminNavBtn");
        const adminPanel = document.getElementById("adminPanel");
        if (userBtn) userBtn.classList.toggle("active", mode === "user");
        if (adminBtn) adminBtn.classList.toggle("active", mode === "admin");
        if (adminPanel) adminPanel.style.display = mode === "admin" ? "block" : "none";
        renderNotices();
    }

    function handleNoticeSubmit() {
        if (!window.isAdminAuthenticated) return showToast("🔒 Login required");

        const titleEl = document.getElementById('titleInput');
        const contentEl = document.getElementById('contentInput');
        const categoryEl = document.getElementById('categoryInput');
        const editEl = document.getElementById('editId');
        if (!titleEl || !contentEl || !categoryEl) return;

        const title = titleEl.value.trim();
        const content = contentEl.value.trim();
        const category = categoryEl.value;
        const editId = editEl ? editEl.value : '';

        if (!title || !content) return showToast("⚠️ Fill all fields");

        if (editId) {
            const i = window.notices.findIndex(n => n.id == editId);
            if (i !== -1) {
                window.notices[i] = { ...window.notices[i], title, content, category };
                showToast("✅ Updated");
            }
        } else {
            window.notices.unshift({
                id: Date.now(),
                title,
                content,
                category,
                timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            });
            showToast("🚀 Published");
        }

        saveData();
        resetForm();
        renderNotices();
    }

    function editNotice(id) {
        const n = window.notices.find(item => item.id === id);
        if (!n) return;
        const editEl = document.getElementById('editId');
        const titleEl = document.getElementById('titleInput');
        const contentEl = document.getElementById('contentInput');
        const categoryEl = document.getElementById('categoryInput');
        const formTitle = document.getElementById('formTitle');
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        if (editEl) editEl.value = n.id;
        if (titleEl) titleEl.value = n.title;
        if (contentEl) contentEl.value = n.content;
        if (categoryEl) categoryEl.value = n.category;
        if (formTitle) formTitle.innerText = "Modify Announcement";
        if (submitBtn) submitBtn.innerText = "Save Changes";
        if (cancelBtn) cancelBtn.style.display = 'block';
    }

    function openDeleteModal(id) {
        window.deleteId = id;
        const confirmModal = document.getElementById('confirmModal');
        if (confirmModal) confirmModal.style.display = 'flex';
    }

    function closeDeleteModal() {
        const confirmModal = document.getElementById('confirmModal');
        if (confirmModal) confirmModal.style.display = 'none';
        window.deleteId = null;
    }

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            if (window.deleteId) {
                window.notices = window.notices.filter(n => n.id !== window.deleteId);
                saveData();
                renderNotices();
                closeDeleteModal();
                showToast('🗑️ Deleted');
            }
        };
    }

    function resetForm() {
        const editEl = document.getElementById('editId');
        const titleEl = document.getElementById('titleInput');
        const contentEl = document.getElementById('contentInput');
        const formTitle = document.getElementById('formTitle');
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        if (editEl) editEl.value = '';
        if (titleEl) titleEl.value = '';
        if (contentEl) contentEl.value = '';
        if (formTitle) formTitle.innerText = 'Create Announcement';
        if (submitBtn) submitBtn.innerText = '🚀 Publish';
        if (cancelBtn) cancelBtn.style.display = 'none';
    }

    // expose functions to window for inline onclick handlers
    window.handleAdminNav = handleAdminNav;
    window.openLogin = openLogin;
    window.closeLogin = closeLogin;
    window.verifyPassword = verifyPassword;
    window.logoutAdmin = logoutAdmin;
    window.showView = showView;
    window.toggleTheme = function() {
        const body = document.body;
        const isLight = body.getAttribute('data-theme') === 'light';
        body.setAttribute('data-theme', isLight ? 'dark' : 'light');
    };
    window.handleNoticeSubmit = handleNoticeSubmit;
    window.editNotice = editNotice;
    window.openDeleteModal = openDeleteModal;
    window.closeDeleteModal = closeDeleteModal;
    window.resetForm = resetForm;
    window.renderNotices = renderNotices;



    // event listeners
    document.addEventListener('DOMContentLoaded', () => renderNotices());
}
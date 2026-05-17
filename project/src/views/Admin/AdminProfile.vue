<template>
  <div class="admin-profile-page">

    <!-- HEADER -->
    <div class="profile-header">

      <div class="profile-left">

        <img
          src="https://i.pravatar.cc/300"
          class="avatar"
          alt="Admin"
        />

        <div>

          <h1>
            {{ admin.name }}
          </h1>

          <p>
            {{ admin.role }}
          </p>

          <span class="status">
            Active Account
          </span>

        </div>

      </div>

      <button
        v-if="!isEditing"
        class="edit-btn"
        @click="startEdit"
      >
        Edit Profile
      </button>

    </div>

    <!-- MAIN -->
    <div class="main-grid">

      <!-- PROFILE CARD -->
      <div class="card">

        <div class="card-header">
          <h2>Profile Information</h2>
        </div>

        <!-- VIEW MODE -->
        <div v-if="!isEditing">

          <div class="info-item">
            <label>Full Name</label>
            <p>{{ admin.name }}</p>
          </div>

          <div class="info-item">
            <label>Email</label>
            <p>{{ admin.email }}</p>
          </div>

          <div class="info-item">
            <label>Phone</label>
            <p>{{ admin.phone }}</p>
          </div>

          <div class="info-item">
            <label>Address</label>
            <p>{{ admin.address }}</p>
          </div>

        </div>

        <!-- EDIT MODE -->
        <form
          v-else
          @submit.prevent="saveProfile"
        >

          <div class="form-group">

            <label>Name</label>

            <input
              id="name"
              name="name"
              v-model="form.name"
              type="text"
              required
            />

          </div>

          <div class="form-group">

            <label>Email</label>

            <input
              id="email"
              name="email"
              v-model="form.email"
              type="email"
              required
            />

          </div>

          <div class="form-group">

            <label>Phone</label>

            <input
              id="phone"
              name="phone"
              v-model="form.phone"
              type="text"
              required
            />

          </div>

          <div class="form-group">

            <label>Address</label>

            <input
              id="address"
              name="address"
              v-model="form.address"
              type="text"
            />

          </div>

          <div class="form-group">

            <label>New Password</label>

            <input
              id="password"
              name="password"
              v-model="form.password"
              type="password"
              placeholder="••••••••"
            />

          </div>

          <div class="button-group">

            <button
              type="submit"
              class="save-btn"
            >
              Save Changes
            </button>

            <button
              type="button"
              class="cancel-btn"
              @click="cancelEdit"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

      <!-- STATS -->
      <div class="stats-column">

        <div class="stats-card">
          <h3>Total Users</h3>
          <p>1,248</p>
        </div>

        <div class="stats-card">
          <h3>Total Orders</h3>
          <p>564</p>
        </div>

        <div class="stats-card">
          <h3>Revenue</h3>
          <p>$12,450</p>
        </div>

        <div class="stats-card">
          <h3>Providers</h3>
          <p>42</p>
        </div>

      </div>

    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminProfile",

  data() {
    return {

      isEditing: false,

      admin: {
        id: null,
        name: "",
        email: "",
        phone: "",
        role: "",
        address: "",
        avatar: "",
      },

      form: {
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
      },

      stats: {
        totalUsers: 0,
        totalOrders: 0,
        totalProviders: 0,
        revenue: 0,
      },

      loading: false,
      errorMessage: "",
    };
  },

  computed: {

    currentUser() {
      return JSON.parse(
        localStorage.getItem("user")
      );
    },

    token() {
      return localStorage.getItem("token");
    },

  },

  async mounted() {

    await this.fetchAdminProfile();

    await this.fetchDashboardStats();

  },

  methods: {

    /*
    |--------------------------------------------------------------------------
    | FETCH ADMIN PROFILE
    |--------------------------------------------------------------------------
    */

    async fetchAdminProfile() {

      this.loading = true;

      try {

        /*
        |--------------------------------------------------
        | IF USER STORED IN LOCAL STORAGE
        |--------------------------------------------------
        */

        if (this.currentUser) {

          this.admin = {
            id: this.currentUser.id,
            name: this.currentUser.name,
            email: this.currentUser.email,
            phone: this.currentUser.phone,
            role: this.currentUser.role,
            address:
              this.currentUser.address ||
              "Phnom Penh, Cambodia",

            avatar:
              this.currentUser.avatar ||
              "https://i.pravatar.cc/300",
          };

        }

        /*
        |--------------------------------------------------
        | OPTIONAL API FETCH
        |--------------------------------------------------
        */

        const response = await axios.get(
          `http://localhost:3000/users/${this.admin.id}`,
          {
            headers: {
              Authorization:
                `Bearer ${this.token}`,
            },
          }
        );

        const user = response.data;

        this.admin = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address:
            user.address ||
            "Phnom Penh, Cambodia",

          avatar:
            user.avatar ||
            "https://i.pravatar.cc/300",
        };

      } catch (error) {

        console.error(error);

        this.errorMessage =
          error.response?.data?.message ||
          "Failed to load profile.";

      } finally {

        this.loading = false;
      }
    },

    /*
    |--------------------------------------------------------------------------
    | FETCH DASHBOARD STATS
    |--------------------------------------------------------------------------
    */

    async fetchDashboardStats() {

      try {

        const response = await axios.get(
          "http://localhost:3000/dashboard/stats",
          {
            headers: {
              Authorization:
                `Bearer ${this.token}`,
            },
          }
        );

        this.stats = response.data;

      } catch (error) {

        console.error(error);

      }
    },

    /*
    |--------------------------------------------------------------------------
    | START EDIT
    |--------------------------------------------------------------------------
    */

    startEdit() {

      this.form.name = this.admin.name;
      this.form.email = this.admin.email;
      this.form.phone = this.admin.phone;
      this.form.address = this.admin.address;
      this.form.password = "";

      this.isEditing = true;
    },

    /*
    |--------------------------------------------------------------------------
    | CANCEL EDIT
    |--------------------------------------------------------------------------
    */

    cancelEdit() {

      this.isEditing = false;
    },

    /*
    |--------------------------------------------------------------------------
    | SAVE PROFILE
    |--------------------------------------------------------------------------
    */

    async saveProfile() {

      try {

        const payload = {
          name: this.form.name,
          email: this.form.email,
          phone: this.form.phone,
          address: this.form.address,
        };

        /*
        |----------------------------------------
        | ADD PASSWORD ONLY IF FILLED
        |----------------------------------------
        */

        if (this.form.password) {

          payload.password =
            this.form.password;
        }

        const response = await axios.put(

          `http://localhost:3000/users/${this.admin.id}`,

          payload,

          {
            headers: {
              Authorization:
                `Bearer ${this.token}`,
            },
          }

        );

        /*
        |----------------------------------------
        | UPDATE ADMIN STATE
        |----------------------------------------
        */

        this.admin = {
          ...this.admin,
          ...response.data,
        };

        /*
        |----------------------------------------
        | UPDATE LOCAL STORAGE
        |----------------------------------------
        */

        localStorage.setItem(
          "user",
          JSON.stringify(this.admin)
        );

        this.isEditing = false;

        alert(
          "Profile updated successfully!"
        );

      } catch (error) {

        console.error(error);

        alert(
          error.response?.data?.message ||
          "Failed to update profile."
        );
      }
    },

    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    logout() {

      localStorage.removeItem("token");

      localStorage.removeItem("user");

      this.$router.push("/login");
    },

  },
};
</script>

<style scoped>

*{
  box-sizing:border-box;
}

.admin-profile-page{
  min-height:100vh;
  padding:30px;
  background:#f3f6fb;
  font-family:Arial,sans-serif;
}

/* HEADER */

.profile-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:35px;
  border-radius:24px;
  background:linear-gradient(
    135deg,
    #166534,
    #15803d
  );
  color:white;
  margin-bottom:30px;
}

.profile-left{
  display:flex;
  align-items:center;
  gap:22px;
}

.avatar{
  width:120px;
  height:120px;
  border-radius:50%;
  object-fit:cover;
  border:5px solid rgba(255,255,255,0.25);
}

.profile-left h1{
  margin:0;
  font-size:34px;
}

.profile-left p{
  margin-top:8px;
  opacity:0.9;
}

.status{
  display:inline-block;
  margin-top:14px;
  padding:6px 14px;
  border-radius:999px;
  background:rgba(255,255,255,0.15);
  font-size:13px;
}

/* BUTTONS */

.edit-btn,
.save-btn,
.cancel-btn{
  border:none;
  border-radius:12px;
  padding:13px 20px;
  font-weight:600;
  cursor:pointer;
  transition:0.2s;
}

.edit-btn{
  background:white;
  color:#166534;
}

.save-btn{
  background:#166534;
  color:white;
}

.cancel-btn{
  background:#e5e7eb;
}

.edit-btn:hover,
.save-btn:hover,
.cancel-btn:hover{
  transform:translateY(-1px);
}

/* GRID */

.main-grid{
  display:grid;
  grid-template-columns:2fr 1fr;
  gap:25px;
}

/* CARD */

.card{
  background:white;
  border-radius:22px;
  padding:30px;
  box-shadow:0 4px 14px rgba(0,0,0,0.05);
}

.card-header{
  margin-bottom:25px;
}

.card-header h2{
  margin:0;
  font-size:24px;
}

/* INFO */

.info-item{
  padding:18px 0;
  border-bottom:1px solid #f1f1f1;
}

.info-item:last-child{
  border-bottom:none;
}

.info-item label{
  display:block;
  font-size:14px;
  color:#6b7280;
  margin-bottom:6px;
}

.info-item p{
  margin:0;
  font-size:17px;
  font-weight:600;
  color:#111827;
}

/* FORM */

.form-group{
  display:flex;
  flex-direction:column;
  margin-bottom:20px;
}

.form-group label{
  margin-bottom:8px;
  font-size:14px;
  color:#374151;
}

.form-group input{
  padding:14px;
  border:1px solid #d1d5db;
  border-radius:12px;
  font-size:15px;
  outline:none;
  transition:0.2s;
}

.form-group input:focus{
  border-color:#166534;
  box-shadow:0 0 0 4px rgba(22,101,52,0.12);
}

.button-group{
  display:flex;
  gap:14px;
  margin-top:10px;
}

/* STATS */

.stats-column{
  display:flex;
  flex-direction:column;
  gap:20px;
}

.stats-card{
  background:white;
  padding:25px;
  border-radius:22px;
  box-shadow:0 4px 14px rgba(0,0,0,0.05);
}

.stats-card h3{
  margin:0;
  font-size:14px;
  color:#6b7280;
}

.stats-card p{
  margin-top:14px;
  font-size:30px;
  font-weight:bold;
  color:#166534;
}

/* MOBILE */

@media(max-width:900px){

  .main-grid{
    grid-template-columns:1fr;
  }

  .profile-header{
    flex-direction:column;
    gap:20px;
    text-align:center;
  }

  .profile-left{
    flex-direction:column;
  }
}

@media(max-width:600px){

  .admin-profile-page{
    padding:16px;
  }

  .card{
    padding:22px;
  }

  .button-group{
    flex-direction:column;
  }

  .edit-btn,
  .save-btn,
  .cancel-btn{
    width:100%;
  }
}

</style>